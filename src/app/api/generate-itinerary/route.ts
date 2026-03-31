import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

export const maxDuration = 120;

function repairJSON(raw: string): string {
  let s = raw;

  // Remove markdown code blocks
  const codeBlockMatch = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    s = codeBlockMatch[1];
  } else {
    if (s.startsWith("```json")) s = s.slice(7);
    else if (s.startsWith("```")) s = s.slice(3);
    if (s.endsWith("```")) s = s.slice(0, -3);
  }
  s = s.trim();

  // Fix unquoted time values: ":20:00" or ": 20:00" -> ":"20:00""
  s = s.replace(/:\s*(\d{1,2}:\d{2})([\s,}\]])/g, ':"$1"$2');
  // Fix unquoted duration values: ":2h" or ":1.5h" -> ":"2h""
  s = s.replace(/:\s*(\d+(?:\.\d+)?h)([\s,}\]])/g, ':"$1"$2');

  // Remove single-line comments
  s = s.replace(/\/\/.*$/gm, "");
  // Remove multi-line comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");

  // Replace single quotes with double quotes
  s = s.replace(/(?<=[\[\{,:\s])'|'(?=[\]\},:\s])/g, '"');

  // Fix trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");
  // Fix missing commas between elements
  s = s.replace(/\}\s*\{/g, "},{");
  s = s.replace(/\]\s*\{/g, "],{");
  s = s.replace(/\}\s*\[/g, "},[");

  // Fix unescaped newlines inside strings
  let result = "";
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { result += ch; escape = false; continue; }
    if (ch === "\\") { result += ch; escape = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString && (ch === "\n" || ch === "\r")) { result += "\\n"; continue; }
    result += ch;
  }

  return result;
}

function tryParse(raw: string): unknown {
  // Attempt 1: Direct parse
  try { return JSON.parse(raw); } catch {}

  // Attempt 2: Repair + parse
  try {
    return JSON.parse(repairJSON(raw));
  } catch {}

  // Attempt 3: Extract outermost JSON object with depth tracking, then repair
  try {
    let depth = 0;
    let start = -1;
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (raw[i] === "}") {
        depth--;
        if (depth === 0 && start !== -1) {
          return JSON.parse(repairJSON(raw.substring(start, i + 1)));
        }
      }
    }
  } catch {}

  // Attempt 4: Aggressive cleanup
  try {
    let cleaned = raw.replace(/[\x00-\x1F\x7F]/g, (m) =>
      (m === "\n" || m === "\r" || m === "\t") ? " " : ""
    );
    return JSON.parse(repairJSON(cleaned));
  } catch {}

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destino, dataInicio, dataFim, orcamento, viajantes, interesses, estiloViagem } = body;

    if (!destino || !dataInicio || !dataFim || !orcamento || !viajantes || !interesses || !estiloViagem) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    const zai = await ZAI.create();

    const systemPrompt = `Você é um planejador de viagens. Responda APENAS com JSON válido puro, sem markdown, sem texto extra.
FORMATO (siga EXATAMENTE, sem adicionar campos extras, use aspas em TODOS os valores de texto):
{"destino":"nome","resumo":"parágrafo curto","dias":[{"dia":1,"titulo":"Título","data":"DD/MM/YYYY","manha":[{"horario":"08:00","nome":"Nome","descricao":"Texto curto","duracao":"2h"}],"almoco":{"nome":"Restaurante","tipo":"Tipo","faixaPreco":"R$X","sugestao":"Prato"},"tarde":[{"horario":"14:00","nome":"Nome","descricao":"Texto curto","duracao":"2h"}],"jantar":{"nome":"Restaurante","tipo":"Tipo","faixaPreco":"R$X","sugestao":"Prato"},"noite":[{"horario":"20:00","nome":"Nome","descricao":"Texto curto","duracao":"2h"}]}],"orcamentoDetalhado":{"hospedagem":"valor","alimentacao":"valor","transporte":"valor","passeios":"valor","total":"valor"},"dicas":["dica1","dica2","dica3","dica4","dica5"]}`;

    const start = new Date(dataInicio);
    const end = new Date(dataFim);
    const numDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const userPrompt = `Roteiro para ${destino}, ${dataInicio} a ${dataFim} (${numDays} dias). Orçamento: ${orcamento} para ${viajantes} viajante(s). Interesses: ${interesses}. Estilo: ${estiloViagem}. IMPORTANTE: Use aspas duplas em TODOS os valores de string, inclusive horarios como "20:00" e durações como "2h". Apenas JSON puro.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const messageContent = completion.choices[0]?.message?.content;
    if (!messageContent) {
      return NextResponse.json({ error: "Não foi possível gerar o roteiro. Tente novamente." }, { status: 500 });
    }

    // Try to parse with local repair
    let itinerary = tryParse(messageContent) as Record<string, unknown> | null;

    // FALLBACK: If local repair fails, ask the AI to fix its own JSON
    if (!itinerary) {
      console.error("Local JSON repair failed, asking AI to fix...");
      try {
        const fixCompletion = await zai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "Você é um reparador de JSON. O JSON abaixo está com erros de formatação. Corrija TODOS os erros e retorne APENAS o JSON válido, sem markdown, sem explicação, sem texto adicional. IMPORTANTE: Todos os valores de texto devem estar entre aspas duplas. Valores como horarios (ex: \"20:00\") e durações (ex: \"2h\") devem estar entre aspas."
            },
            {
              role: "user",
              content: `Corrija este JSON e retorne APENAS o JSON corrigido:\n\n${messageContent}`
            },
          ],
          temperature: 0,
          max_tokens: 4096,
        });

        const fixedContent = fixCompletion.choices[0]?.message?.content;
        if (fixedContent) {
          itinerary = tryParse(fixedContent) as Record<string, unknown> | null;
          if (itinerary) {
            console.log("AI fix succeeded!");
          }
        }
      } catch (fixError) {
        console.error("AI fix also failed:", fixError);
      }
    }

    if (!itinerary) {
      return NextResponse.json(
        { error: "Não foi possível processar a resposta da IA. Tente novamente." },
        { status: 500 }
      );
    }

    if (!itinerary.dias || !Array.isArray(itinerary.dias) || itinerary.dias.length === 0) {
      return NextResponse.json(
        { error: "O roteiro gerado está incompleto. Tente novamente." },
        { status: 500 }
      );
    }

    // Save to database (non-blocking)
    db.itinerario.create({
      data: {
        destino,
        dataInicio,
        dataFim,
        orcamento,
        viajantes: parseInt(viajantes),
        interesses,
        estiloViagem,
        roteiro: JSON.stringify(itinerary),
      },
    }).catch((err: unknown) => console.error("DB save error:", err));

    return NextResponse.json(itinerary);
  } catch (error: unknown) {
    console.error("Error generating itinerary:", error);
    const message = error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json({ error: `Erro ao gerar roteiro: ${message}` }, { status: 500 });
  }
}

export async function GET() {
  try {
    const itinerarios = await db.itinerario.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
    return NextResponse.json(itinerarios);
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json({ error: "Erro ao buscar roteiros" }, { status: 500 });
  }
}
