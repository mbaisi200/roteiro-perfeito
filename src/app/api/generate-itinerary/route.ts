import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

export const maxDuration = 120;

function extractJSON(raw: string): string {
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  let s = raw.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  return s.trim();
}

function repairJSON(raw: string): string {
  let s = raw;
  s = s.replace(/\/\/.*$/gm, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/:\s*(?<!")(\d{1,2}:\d{2})(?!"\s*[,}\]\s])([\s,}\]])/g, ':"$1"$2');
  s = s.replace(/:\s*(?<!")(\d+(?:\.\d+)?(?:h|min)\b)(?!"\s*[,\]}])([\s,}\]])/gi, ':"$1"$2');
  s = s.replace(/(?<=[\[\{,:\s])'|'(?=[\]\},:\s])/g, '"');
  s = s.replace(/,\s*([}\]])/g, "$1");
  s = s.replace(/\}\s*\{/g, "},{");
  s = s.replace(/\]\s*\{/g, "],{");
  s = s.replace(/\}\s*\[/g, "},[");
  let result = "", inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (esc) { result += ch; esc = false; continue; }
    if (ch === "\\") { result += ch; esc = true; continue; }
    if (ch === '"') { inStr = !inStr; result += ch; continue; }
    if (inStr && (ch === "\n" || ch === "\r")) { result += "\\n"; continue; }
    result += ch;
  }
  return result;
}

function tryParse(raw: string): unknown {
  for (const a of [raw, extractJSON(raw), repairJSON(raw), repairJSON(extractJSON(raw))]) {
    try { const p = JSON.parse(a); if (p && typeof p === "object") return p; } catch {}
  }
  const i = raw.indexOf("{"), j = raw.lastIndexOf("}");
  if (i !== -1 && j > i) {
    const e = raw.substring(i, j + 1);
    for (const r of [e, repairJSON(e)]) { try { const p = JSON.parse(r); if (p && typeof p === "object") return p; } catch {} }
  }
  try {
    let f = raw.replace(/:(\s*)(?!")([A-Za-zÀ-ÿ][^",}\]\n\r]{0,80}?)(\s*[,}\]])/g, (_, w, v, e) => /^-?\d+(\.\d+)?$/.test(v.trim()) ? _ : `${w}"${v.trim()}"${e}`);
    const p = JSON.parse(repairJSON(f)); if (p && typeof p === "object") return p;
  } catch {}
  return null;
}

const SYS = `Você é um planejador de viagens. Gere APENAS JSON válido puro, sem markdown.
Regras: use aspas duplas, horários como "08:00", durações como "2h", sem vírgulas extras.
Formato: {"destino":"...","resumo":"...","dias":[{"dia":1,"titulo":"...","data":"DD/MM/YYYY","manha":[{"horario":"08:00","nome":"...","descricao":"...","duracao":"2h"}],"almoco":{"nome":"...","tipo":"...","faixaPreco":"...","sugestao":"..."},"tarde":[{"horario":"14:00","nome":"...","descricao":"...","duracao":"2h"}],"jantar":{"nome":"...","tipo":"...","faixaPreco":"...","sugestao":"..."},"noite":[{"horario":"20:00","nome":"...","descricao":"...","duracao":"2h"}]}],"orcamentoDetalhado":{"hospedagem":"...","alimentacao":"...","transporte":"...","passeios":"...","total":"..."},"dicas":["...","...","...","...","..."]}`;

// POST: Create job and start background generation (returns instantly)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destino, dataInicio, dataFim, orcamento, viajantes, interesses, estiloViagem } = body;
    if (!destino || !dataInicio || !dataFim || !orcamento || !viajantes || !interesses || !estiloViagem) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const record = await db.itinerario.create({
      data: { destino, dataInicio, dataFim, orcamento, viajantes: parseInt(viajantes), interesses, estiloViagem, roteiro: "", status: "processing" },
    });

    // Fire and forget — generation runs in background
    generate(record.id, { destino, dataInicio, dataFim, orcamento, viajantes: parseInt(viajantes), interesses, estiloViagem });

    return NextResponse.json({ jobId: record.id, status: "processing" });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro" }, { status: 500 });
  }
}

// GET: Poll status by jobId
export async function GET(request: NextRequest) {
  const jobId = new URL(request.url).searchParams.get("id");
  if (!jobId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const record = await db.itinerario.findUnique({ where: { id: jobId } });
  if (!record) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (record.status === "completed") {
    return NextResponse.json({ jobId: record.id, status: "completed", itinerary: JSON.parse(record.roteiro) });
  }
  if (record.status === "failed") {
    return NextResponse.json({ jobId: record.id, status: "failed", error: record.erro || "Erro ao gerar." });
  }
  return NextResponse.json({ jobId: record.id, status: "processing" });
}

async function generate(jobId: string, params: { destino: string; dataInicio: string; dataFim: string; orcamento: string; viajantes: number; interesses: string; estiloViagem: string }) {
  try {
    const { destino, dataInicio, dataFim, orcamento, viajantes, interesses, estiloViagem } = params;
    const zai = await ZAI.create();
    const numDays = Math.ceil(Math.abs(new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / 86400000) + 1;
    const prompt = `Roteiro para ${destino}, ${dataInicio} a ${dataFim} (${numDays} dias). Orçamento: ${orcamento}. Viajantes: ${viajantes}. Interesses: ${interesses}. Estilo: ${estiloViagem}.`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const retry = attempt === 2 ? `IMPORTANTE: JSON puro, sem markdown. Aspas duplas. Horários: "08:00". Durações: "2h".\n\n${prompt}` : prompt;
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 55000));
        const completion = await Promise.race([
          zai.chat.completions.create({ messages: [{ role: "system", content: SYS }, { role: "user", content: retry }], temperature: attempt === 2 ? 0.1 : 0.3, max_tokens: 4096 }),
          timeout,
        ]);
        const content = completion.choices[0]?.message?.content;
        if (!content) continue;

        const itinerary = tryParse(content);
        if (!itinerary || typeof itinerary !== "object") continue;
        const data = itinerary as Record<string, unknown>;
        if (!data.dias || !Array.isArray(data.dias) || data.dias.length === 0) continue;

        await db.itinerario.update({ where: { id: jobId }, data: { status: "completed", roteiro: JSON.stringify(data) } });
        return;
      } catch {}
    }
    await db.itinerario.update({ where: { id: jobId }, data: { status: "failed", erro: "IA não conseguiu gerar um roteiro válido." } });
  } catch {
    await db.itinerario.update({ where: { id: jobId }, data: { status: "failed", erro: "Erro interno do servidor." } }).catch(() => {});
  }
}
