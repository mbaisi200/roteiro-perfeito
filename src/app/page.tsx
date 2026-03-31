'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Compass,
  Plane,
  Sparkles,
  Sun,
  Moon,
  Utensils,
  Camera,
  Mountain,
  ShoppingBag,
  Wine,
  Palmtree,
  Clock,
  ArrowRight,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Wallet,
  Map,
  Star,
  Navigation,
  Coffee,
  Sunset,
  Heart,
  Info,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useToast,
} from '@/hooks/use-toast';

// Types
interface Atividade {
  horario: string;
  nome: string;
  descricao: string;
  duracao: string;
  dica?: string;
}

interface Restaurante {
  nome: string;
  tipo: string;
  faixaPreco: string;
  sugestao: string;
}

interface ItinerarioDia {
  dia: number;
  titulo: string;
  data?: string;
  manha: Atividade[];
  almoco: Restaurante;
  tarde: Atividade[];
  jantar: Restaurante;
  noite: Atividade[];
}

interface OrcamentoDetalhado {
  hospedagem: string;
  alimentacao: string;
  transporte: string;
  passeios: string;
  total: string;
}

interface RoteiroCompleto {
  destino: string;
  resumo: string;
  dias: ItinerarioDia[];
  orcamentoDetalhado: OrcamentoDetalhado;
  dicas: string[];
}

const INTERESSES_OPTIONS = [
  { id: 'praia', label: 'Praia', icon: Palmtree },
  { id: 'cultura', label: 'Cultura/História', icon: Landmark },
  { id: 'gastronomia', label: 'Gastronomia', icon: Utensils },
  { id: 'aventura', label: 'Aventura', icon: Mountain },
  { id: 'natureza', label: 'Natureza', icon: Compass },
  { id: 'compras', label: 'Compras', icon: ShoppingBag },
  { id: 'nocturna', label: 'Vida Noturna', icon: Wine },
  { id: 'fotografia', label: 'Fotografia', icon: Camera },
] as const;

function Landmark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/></svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function LoadingSkeleton({ loadingMessage }: { loadingMessage?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 p-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Compass className="w-12 h-12 text-white" />
        </div>
      </motion.div>
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-amber-700">
          Planejando sua viagem...
        </h2>
        <p className="text-muted-foreground max-w-md">
          {loadingMessage || 'Estamos criando um roteiro personalizado para você.'}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          A geração pode levar de 20 a 60 segundos dependendo do destino e número de dias.
        </p>
      </div>
      <div className="w-full max-w-2xl space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AtividadeCard({ atividade, index }: { atividade: Atividade; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-3 p-3 rounded-lg bg-gradient-to-r from-white to-orange-50/50 border border-orange-100/50"
    >
      <div className="flex flex-col items-center">
        <div className="w-14 text-center">
          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
            {atividade.horario}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          {atividade.duracao}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-foreground leading-tight">
          {atividade.nome}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {atividade.descricao}
        </p>
        {atividade.dica && (
          <div className="flex items-start gap-1.5 mt-2 text-xs text-teal-700 bg-teal-50 px-2 py-1 rounded-md">
            <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{atividade.dica}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RestauranteCard({ restaurante, tipo }: { restaurante: Restaurante; tipo: string }) {
  const Icon = tipo === 'almoco' ? Sun : Moon;
  const bgColor = tipo === 'almoco' ? 'from-orange-50 to-amber-50' : 'from-slate-50 to-indigo-50/30';
  const borderColor = tipo === 'almoco' ? 'border-orange-200/60' : 'border-slate-200/60';
  const iconColor = tipo === 'almoco' ? 'text-orange-500' : 'text-indigo-500';
  const labelColor = tipo === 'almoco' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-xl bg-gradient-to-br ${bgColor} border ${borderColor}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${labelColor}`}>
          {tipo === 'almoco' ? 'Almoço' : 'Jantar'}
        </span>
      </div>
      <h4 className="font-bold text-sm">{restaurante.nome}</h4>
      <div className="flex items-center gap-2 mt-1">
        <Badge variant="secondary" className="text-[10px]">
          {restaurante.tipo}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {restaurante.faixaPreco}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-2 italic">
        &quot;{restaurante.sugestao}&quot;
      </p>
    </motion.div>
  );
}

function DiaCard({ dia, totalDias }: { dia: ItinerarioDia; totalDias: number }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-orange-100 shadow-md hover:shadow-lg transition-shadow">
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg font-bold text-white">{dia.dia}</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{dia.titulo}</h3>
                {dia.data && (
                  <p className="text-white/80 text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {dia.data}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                Dia {dia.dia} de {totalDias}
              </Badge>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-white/80" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/80" />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-4 space-y-5">
                {/* Manhã */}
                {dia.manha && dia.manha.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-sm text-amber-700">Manhã</h4>
                    </div>
                    <div className="space-y-2">
                      {dia.manha.map((atividade, idx) => (
                        <AtividadeCard key={idx} atividade={atividade} index={idx} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Almoço */}
                {dia.almoco && (
                  <RestauranteCard restaurante={dia.almoco} tipo="almoco" />
                )}

                {/* Tarde */}
                {dia.tarde && dia.tarde.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                        <Sunset className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-sm text-orange-700">Tarde</h4>
                    </div>
                    <div className="space-y-2">
                      {dia.tarde.map((atividade, idx) => (
                        <AtividadeCard key={idx} atividade={atividade} index={idx} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Jantar */}
                {dia.jantar && (
                  <RestauranteCard restaurante={dia.jantar} tipo="jantar" />
                )}

                {/* Noite */}
                {dia.noite && dia.noite.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <Moon className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                      <h4 className="font-semibold text-sm text-slate-700">Noite</h4>
                    </div>
                    <div className="space-y-2">
                      {dia.noite.map((atividade, idx) => (
                        <AtividadeCard key={idx} atividade={atividade} index={idx} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const [destino, setDestino] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [viajantes, setViajantes] = useState('2');
  const [interesses, setInteresses] = useState<string[]>([]);
  const [estiloViagem, setEstiloViagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roteiro, setRoteiro] = useState<RoteiroCompleto | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleInteresse = useCallback((id: string) => {
    setInteresses((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destino || !dataInicio || !dataFim || !orcamento || !viajantes || interesses.length === 0 || !estiloViagem) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }
    if (new Date(dataFim) < new Date(dataInicio)) {
      toast({ title: 'Datas inválidas', description: 'Data de fim deve ser posterior ao início.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setRoteiro(null);
    setError(null);

    const msgs = [
      'Pesquisando destinos incríveis...',
      'Encontrando os melhores passeios...',
      'Selecionando restaurantes imperdíveis...',
      'Calculando rotas e transporte...',
      'Preparando dicas exclusivas...',
      'A IA está criando seu roteiro...',
    ];
    let mi = 0;
    setLoadingMessage(msgs[0]);
    const msgTimer = setInterval(() => { mi = (mi + 1) % msgs.length; setLoadingMessage(msgs[mi]); }, 3500);

    try {
      const interessesLabels = interesses.map((id) => INTERESSES_OPTIONS.find((o) => o.id === id)?.label).filter(Boolean).join(', ');

      // Step 1: POST — returns instantly with jobId
      const postRes = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destino, dataInicio, dataFim, orcamento, viajantes, interesses: interessesLabels, estiloViagem }),
      });

      if (!postRes.ok) {
        const err = await postRes.json().catch(() => ({ error: 'Erro de conexão.' }));
        throw new Error(err.error || 'Erro ao iniciar.');
      }

      const { jobId } = await postRes.json();
      if (!jobId) throw new Error('Erro ao iniciar geração.');

      // Step 2: Poll using setTimeout chain (no setInterval = no loop risk)
      let consecutiveErrors = 0;
      const MAX_POLL = 40; // 40 * 3s = 2 min

      const poll = async (attempt: number): Promise<void> => {
        if (attempt > MAX_POLL) {
          clearInterval(msgTimer);
          setIsLoading(false);
          setError('A geração demorou muito. Tente novamente.');
          toast({ title: 'Tempo esgotado', description: 'Tente novamente.', variant: 'destructive' });
          return;
        }

        try {
          const res = await fetch(`/api/generate-itinerary?id=${jobId}`);
          if (!res.ok) {
            consecutiveErrors++;
            if (consecutiveErrors >= 3) {
              clearInterval(msgTimer);
              setIsLoading(false);
              setError('Servidor indisponível. Recarregue a página.');
              toast({ title: 'Sem conexão', description: 'Recarregue a página.', variant: 'destructive' });
              return;
            }
            setTimeout(() => poll(attempt + 1), 3000);
            return;
          }

          const data = await res.json();
          consecutiveErrors = 0;

          if (data.status === 'completed' && data.itinerary) {
            clearInterval(msgTimer);
            setIsLoading(false);
            setRoteiro(data.itinerary as RoteiroCompleto);
            toast({ title: 'Roteiro criado! ✈️', description: `Roteiro para ${destino} pronto!` });
          } else if (data.status === 'failed') {
            clearInterval(msgTimer);
            setIsLoading(false);
            setError(data.error || 'Erro ao gerar roteiro.');
            toast({ title: 'Erro', description: data.error || 'Tente novamente.', variant: 'destructive' });
          } else {
            // still processing
            setTimeout(() => poll(attempt + 1), 3000);
          }
        } catch {
          consecutiveErrors++;
          if (consecutiveErrors >= 3) {
            clearInterval(msgTimer);
            setIsLoading(false);
            setError('Erro de conexão. Recarregue a página.');
            toast({ title: 'Sem conexão', description: 'Recarregue a página.', variant: 'destructive' });
            return;
          }
          setTimeout(() => poll(attempt + 1), 3000);
        }
      };

      // Start polling chain
      poll(1);

    } catch (error: unknown) {
      clearInterval(msgTimer);
      setIsLoading(false);
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    }
  };

  const handleReset = () => {
    setDestino('');
    setDataInicio('');
    setDataFim('');
    setOrcamento('');
    setViajantes('2');
    setInteresses([]);
    setEstiloViagem('');
    setRoteiro(null);
    setError(null);
  };

  const handleExportPDF = useCallback(() => {
    if (!roteiro) return;
    toast({ title: 'Gerando PDF...', description: 'Seu roteiro está sendo exportado.' });

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const checkPage = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // Title
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('RoteiroPerfeito', margin, 18);
    doc.setFontSize(12);
    doc.text(`Roteiro de Viagem - ${roteiro.destino}`, margin, 28);
    doc.setFontSize(9);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, 35);
    y = 50;

    // Summary
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(roteiro.resumo || '', contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 8;

    // Badges info
    doc.setFontSize(9);
    doc.setTextColor(120, 53, 15);
    doc.text(`${roteiro.dias?.length ?? 0} dias  |  ${viajantes} viajante(s)  |  ${orcamento}`, margin, y);
    y += 10;

    // Separator
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Days
    roteiro.dias?.forEach((dia) => {
      checkPage(40);
      // Day header
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Dia ${dia.dia}: ${dia.titulo}${dia.data ? ` - ${dia.data}` : ''}`, margin + 4, y + 7);
      doc.setFont('helvetica', 'normal');
      y += 14;

      // Helper to render activities
      const renderActivities = (label: string, atividades: typeof dia.manha) => {
        if (!atividades || atividades.length === 0) return;
        checkPage(20);
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin + 3, y + 4.5);
        doc.setFont('helvetica', 'normal');
        y += 8;

        atividades.forEach((atv) => {
          checkPage(16);
          doc.setTextColor(55, 65, 81);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`${atv.horario} - ${atv.nome}`, margin + 4, y + 4);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(107, 114, 128);
          const descLines = doc.splitTextToSize(atv.descricao || '', contentWidth - 12);
          doc.text(descLines, margin + 4, y + 8);
          y += descLines.length * 3.5 + 3;
          if (atv.dica) {
            checkPage(10);
            doc.setTextColor(5, 150, 105);
            doc.setFontSize(8);
            const dicaLines = doc.splitTextToSize(`Dica: ${atv.dica}`, contentWidth - 12);
            doc.text(dicaLines, margin + 6, y + 3);
            y += dicaLines.length * 3.5 + 2;
          }
          y += 1;
        });
        y += 3;
      };

      renderActivities('Manhã', dia.manha);

      // Lunch
      if (dia.almoco) {
        checkPage(16);
        doc.setFillColor(255, 237, 213);
        doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
        doc.setTextColor(154, 52, 18);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`Almoço - ${dia.almoco.nome}`, margin + 3, y + 4.5);
        doc.setFont('helvetica', 'normal');
        y += 8;
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`${dia.almoco.tipo} | ${dia.almoco.faixaPreco}`, margin + 4, y + 3);
        y += 4;
        const almSug = doc.splitTextToSize(`Sugestão: ${dia.almoco.sugestao}`, contentWidth - 12);
        doc.text(almSug, margin + 4, y + 3);
        y += almSug.length * 3.5 + 4;
      }

      renderActivities('Tarde', dia.tarde);

      // Dinner
      if (dia.jantar) {
        checkPage(16);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`Jantar - ${dia.jantar.nome}`, margin + 3, y + 4.5);
        doc.setFont('helvetica', 'normal');
        y += 8;
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`${dia.jantar.tipo} | ${dia.jantar.faixaPreco}`, margin + 4, y + 3);
        y += 4;
        const jantSug = doc.splitTextToSize(`Sugestão: ${dia.jantar.sugestao}`, contentWidth - 12);
        doc.text(jantSug, margin + 4, y + 3);
        y += jantSug.length * 3.5 + 4;
      }

      renderActivities('Noite', dia.noite);
      y += 5;
    });

    // Budget
    checkPage(50);
    doc.setFillColor(217, 119, 6);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Orçamento Detalhado', margin + 4, y + 5.5);
    doc.setFont('helvetica', 'normal');
    y += 12;

    const orc = roteiro.orcamentoDetalhado;
    if (orc) {
      const budgetItems = [
        { label: 'Hospedagem', value: orc.hospedagem },
        { label: 'Alimentação', value: orc.alimentacao },
        { label: 'Transporte', value: orc.transporte },
        { label: 'Passeios', value: orc.passeios },
      ];
      doc.setFontSize(9);
      budgetItems.forEach((item) => {
        doc.setTextColor(107, 114, 128);
        doc.text(item.label, margin + 4, y + 3);
        doc.setTextColor(55, 65, 81);
        doc.text(item.value || '', pageWidth - margin - 4, y + 3, { align: 'right' });
        y += 6;
      });
      // Total
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Estimado', margin + 4, y + 5.5);
      doc.text(orc.total || '', pageWidth - margin - 4, y + 5.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 14;
    }

    // Tips
    checkPage(40);
    doc.setFillColor(217, 119, 6);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Dicas Importantes', margin + 4, y + 5.5);
    doc.setFont('helvetica', 'normal');
    y += 12;

    doc.setFontSize(9);
    roteiro.dicas?.forEach((dica, i) => {
      checkPage(10);
      doc.setFillColor(254, 243, 199);
      doc.circle(margin + 4, y + 2, 2, 'F');
      doc.setTextColor(55, 65, 81);
      const dicaLines = doc.splitTextToSize(`${dica}`, contentWidth - 14);
      doc.text(dicaLines, margin + 10, y + 4);
      y += dicaLines.length * 3.5 + 4;
    });

    // Footer on each page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `RoteiroPerfeito - Gerado por Inteligência Artificial | Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }

    doc.save(`roteiro-${roteiro.destino.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    toast({ title: 'PDF exportado!', description: `Roteiro de ${roteiro.destino} salvo com sucesso.` });
  }, [roteiro, viajantes, orcamento, toast]);

  // Form State
  const showForm = !roteiro && !isLoading && !error;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-teal-50/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-teal-500" />
        <div className="absolute inset-0 bg-[url('/hero-travel.png')] bg-cover bg-center mix-blend-overlay opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-5 py-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-white/90 text-sm font-medium">
                Powered by Inteligência Artificial
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
              Roteiro
              <span className="block bg-gradient-to-r from-amber-200 to-teal-200 bg-clip-text text-transparent">
                Perfeito
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/85 max-w-2xl mx-auto font-light leading-relaxed">
              Seu guia inteligente de viagens. Crie roteiros personalizados
              em segundos com sugestões de passeios, restaurantes e dicas exclusivas.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              {[
                { icon: Plane, text: 'Roteiros Personalizados' },
                { icon: Star, text: 'Sugestões de Restaurantes' },
                { icon: Lightbulb, text: 'Dicas Práticas' },
                { icon: Wallet, text: 'Orçamento Detalhado' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-white/80 text-sm"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 80L48 74.7C96 69 192 59 288 53.3C384 48 480 48 576 53.3C672 59 768 69 864 69.3C960 69 1056 59 1152 48C1248 37 1344 27 1392 21.3L1440 16V80H0Z"
              fill="rgb(255, 251, 235)"
            />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {/* Form Section */}
          {/* Error State */}
          {error && !isLoading && !roteiro && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <Card className="border-red-200 bg-red-50/50 max-w-lg mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Ops! Algo deu errado
                  </CardTitle>
                  <CardDescription className="text-red-600/80">
                    {error}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => { setError(null); }}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Voltar ao formulário
                  </Button>
                  <Button
                    onClick={() => {
                      setError(null);
                      handleSubmit(new Event('submit') as React.FormEvent);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground">
                  Planeje sua próxima aventura
                </h2>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                  Preencha os detalhes abaixo e deixe nossa IA criar o roteiro perfeito para você
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6"
                >
                  {/* Destino */}
                  <motion.div variants={fadeUp}>
                    <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-amber-600" />
                          </div>
                          Para onde vamos?
                        </CardTitle>
                        <CardDescription>Digite a cidade ou país do seu destino dos sonhos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Ex: Rio de Janeiro, Paris, Tóquio..."
                            value={destino}
                            onChange={(e) => setDestino(e.target.value)}
                            className="pl-10 h-12"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Datas e Orçamento */}
                  <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
                    <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-orange-600" />
                          </div>
                          Datas da Viagem
                        </CardTitle>
                        <CardDescription>Período da sua viagem</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dataInicio" className="text-sm">
                            <Navigation className="w-3 h-3 inline mr-1" />
                            Data de Ida
                          </Label>
                          <Input
                            id="dataInicio"
                            type="date"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dataFim" className="text-sm">
                            <Navigation className="w-3 h-3 inline mr-1" />
                            Data de Volta
                          </Label>
                          <Input
                            id="dataFim"
                            type="date"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className="h-12"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid gap-6">
                      <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                            </div>
                            Orçamento
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Select value={orcamento} onValueChange={setOrcamento}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Selecione o orçamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Econômico (até R$2.000)">
                                💰 Econômico (até R$2.000)
                              </SelectItem>
                              <SelectItem value="Moderado (R$2.000-R$5.000)">
                                💵 Moderado (R$2.000-R$5.000)
                              </SelectItem>
                              <SelectItem value="Confortável (R$5.000-R$10.000)">
                                💳 Confortável (R$5.000-R$10.000)
                              </SelectItem>
                              <SelectItem value="Luxo (acima de R$10.000)">
                                💎 Luxo (acima de R$10.000)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>

                      <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                              <Users className="w-4 h-4 text-teal-600" />
                            </div>
                            Viajantes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-full"
                              onClick={() =>
                                setViajantes((prev) =>
                                  Math.max(1, parseInt(prev) - 1).toString()
                                )
                              }
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={viajantes}
                              onChange={(e) => setViajantes(e.target.value)}
                              className="h-10 w-20 text-center"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-full"
                              onClick={() =>
                                setViajantes((prev) =>
                                  Math.min(10, parseInt(prev) + 1).toString()
                                )
                              }
                            >
                              +
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              {parseInt(viajantes) === 1
                                ? 'pessoa'
                                : 'pessoas'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>

                  {/* Interesses */}
                  <motion.div variants={fadeUp}>
                    <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                            <Heart className="w-4 h-4 text-rose-600" />
                          </div>
                          Seus Interesses
                        </CardTitle>
                        <CardDescription>
                          Selecione os temas que mais combinam com você ({interesses.length} selecionado{interesses.length !== 1 ? 's' : ''})
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {INTERESSES_OPTIONS.map((option) => {
                            const isSelected = interesses.includes(option.id);
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => toggleInteresse(option.id)}
                                className={`
                                  flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer
                                  ${
                                    isSelected
                                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                                      : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20'
                                  }
                                `}
                              >
                                <div
                                  className={`
                                    w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                                    ${
                                      isSelected
                                        ? 'bg-amber-200 text-amber-700'
                                        : 'bg-background text-muted-foreground'
                                    }
                                  `}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span
                                  className={`text-sm font-medium ${
                                    isSelected ? 'text-amber-700' : 'text-muted-foreground'
                                  }`}
                                >
                                  {option.label}
                                </span>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-auto"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </motion.div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Estilo de Viagem */}
                  <motion.div variants={fadeUp}>
                    <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                            <Compass className="w-4 h-4 text-violet-600" />
                          </div>
                          Estilo de Viagem
                        </CardTitle>
                        <CardDescription>Como você prefere aproveitar o destino</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            {
                              value: 'Relaxado',
                              label: 'Relaxado',
                              icon: Sunset,
                              desc: 'Menos atividades, mais tempo livre',
                              emoji: '🌴',
                            },
                            {
                              value: 'Moderado',
                              label: 'Moderado',
                              icon: Map,
                              desc: 'Equilíbrio entre passeios e descanso',
                              emoji: '🗺️',
                            },
                            {
                              value: 'Intenso',
                              label: 'Intenso',
                              icon: Clock,
                              desc: 'Máximo de atividades e experiências',
                              emoji: '⚡',
                            },
                          ].map((option) => {
                            const isSelected = estiloViagem === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setEstiloViagem(option.value)}
                                className={`
                                  p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
                                  ${
                                    isSelected
                                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                                      : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{option.emoji}</span>
                                  <span
                                    className={`font-semibold ${
                                      isSelected ? 'text-amber-700' : 'text-foreground'
                                    }`}
                                  >
                                    {option.label}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {option.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={fadeUp} className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Gerar Meu Roteiro Perfeito
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton loadingMessage={loadingMessage} />
            </motion.div>
          )}

          {/* Results Section */}
          {roteiro && !isLoading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Result Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 text-sm">
                  <Plane className="w-4 h-4 mr-1" />
                  Roteiro Gerado com Sucesso
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {roteiro.destino}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                  {roteiro.resumo}
                </p>

                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {roteiro.dias?.length ?? 0} {roteiro.dias?.length === 1 ? 'dia' : 'dias'}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Users className="w-3 h-3 mr-1" />
                    {viajantes} viajante{parseInt(viajantes) > 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {orcamento}
                  </Badge>
                </div>
              </motion.div>

              {/* Tabs: Itinerário / Orçamento / Dicas */}
              <Tabs defaultValue="itinerario" className="w-full">
                <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 h-12">
                  <TabsTrigger value="itinerario" className="text-sm">
                    <Map className="w-4 h-4 mr-1" />
                    Itinerário
                  </TabsTrigger>
                  <TabsTrigger value="orcamento" className="text-sm">
                    <Wallet className="w-4 h-4 mr-1" />
                    Orçamento
                  </TabsTrigger>
                  <TabsTrigger value="dicas" className="text-sm">
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Dicas
                  </TabsTrigger>
                </TabsList>

                {/* Itinerary Tab */}
                <TabsContent value="itinerario" className="mt-6">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    {roteiro.dias?.map((dia, index) => (
                      <DiaCard
                        key={index}
                        dia={dia}
                        totalDias={roteiro.dias?.length ?? 0}
                      />
                    ))}
                  </motion.div>
                </TabsContent>

                {/* Budget Tab */}
                <TabsContent value="orcamento" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-orange-100 shadow-md">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                          </div>
                          Estimativa de Orçamento
                        </CardTitle>
                        <CardDescription>
                          Valores estimados para {viajantes} viajante{parseInt(viajantes) > 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              label: 'Hospedagem',
                              value: roteiro.orcamentoDetalhado?.hospedagem,
                              icon: Moon,
                              color: 'text-violet-600',
                              bg: 'bg-violet-100',
                            },
                            {
                              label: 'Alimentação',
                              value: roteiro.orcamentoDetalhado?.alimentacao,
                              icon: Utensils,
                              color: 'text-orange-600',
                              bg: 'bg-orange-100',
                            },
                            {
                              label: 'Transporte',
                              value: roteiro.orcamentoDetalhado?.transporte,
                              icon: Navigation,
                              color: 'text-teal-600',
                              bg: 'bg-teal-100',
                            },
                            {
                              label: 'Passeios',
                              value: roteiro.orcamentoDetalhado?.passeios,
                              icon: Camera,
                              color: 'text-amber-600',
                              bg: 'bg-amber-100',
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                                  <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <span className="font-medium">{item.label}</span>
                              </div>
                              <span className="font-semibold text-sm">
                                {item.value}
                              </span>
                            </div>
                          ))}

                          <Separator className="my-4" />

                          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-lg">Total Estimado</span>
                            </div>
                            <span className="font-bold text-lg">
                              {roteiro.orcamentoDetalhado?.total}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Tips Tab */}
                <TabsContent value="dicas" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-orange-100 shadow-md">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                          </div>
                          Dicas Importantes
                        </CardTitle>
                        <CardDescription>
                          Informações úteis para sua viagem a {roteiro.destino}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {roteiro.dicas?.map((dica, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-white border border-amber-100/50"
                            >
                              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-amber-700">
                                  {i + 1}
                                </span>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">
                                {dica}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-8"
              >
                <Button
                  onClick={handleExportPDF}
                  size="lg"
                  className="h-14 text-base bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="h-14 text-base border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Gerar Novo Roteiro
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Compass className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-foreground">RoteiroPerfeito</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Roteiros gerados por inteligência artificial. Verifique informações importantes antes de viajar.
          </p>
        </div>
      </footer>
    </div>
  );
}
