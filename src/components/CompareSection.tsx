/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Applicant, QualificationMetrics } from '../types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Scale, SlidersHorizontal, Plus, AlertCircle, Trash2, ArrowUpRight, Zap, RefreshCw, X, Check, ArrowLeftRight, ChevronDown, Sparkles, TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, ArrowLeft, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompareSectionProps {
  applicants: Applicant[];
  isDarkMode?: boolean;
  onViewProfile?: (id: string) => void;
}

// -------------------------------------------------------------
// COMPACT MOCK DATA FOR OFICIAL DE CRÉDITOS
// -------------------------------------------------------------
const CREDIT_MOCK_NAMES = [
  { id: 'ale-ruiz', name: 'Alejandro Ruiz', role: 'Oficial de Créditos Senior (Finanzas)', exp: 12, sal: '$9,500 USD/mes', technical: 96, problemSolving: 92, cultureFit: 94 },
  { id: 'gab-men', name: 'Gabriela Mendoza', role: 'Oficial de Créditos Microfinanzas', exp: 8, sal: '$8,800 USD/mes', technical: 94, problemSolving: 90, cultureFit: 88 },
  { id: 'san-vil', name: 'Sandra Villamil', role: 'Oficial de Créditos Pymes', exp: 10, sal: '$9,000 USD/mes', technical: 91, problemSolving: 89, cultureFit: 90 },
  { id: 'luc-ber', name: 'Lucía Bermúdez', role: 'Coordinadora de Riesgo Crediticio', exp: 7, sal: '$8,500 USD/mes', technical: 89, problemSolving: 88, cultureFit: 84 },
  { id: 'car-gut', name: 'Carlos Gutiérrez', role: 'Oficial de Créditos Corporativos', exp: 9, sal: '$8,200 USD/mes', technical: 85, problemSolving: 82, cultureFit: 86 },
  { id: 'dan-veg', name: 'Danilo Vega', role: 'Oficial de Créditos Agroindustriales', exp: 6, sal: '$7,800 USD/mes', technical: 84, problemSolving: 85, cultureFit: 88 },
  { id: 'mar-ort', name: 'Marcela Ortiz', role: 'Oficial de Créditos Senior Consumo', exp: 8, sal: '$8,000 USD/mes', technical: 82, problemSolving: 85, cultureFit: 92 },
  { id: 'pat-ala', name: 'Patricia Alarcón', role: 'Oficial Junior de Créditos PYME', exp: 5, sal: '$7,500 USD/mes', technical: 78, problemSolving: 80, cultureFit: 84 },
  { id: 'est-roj', name: 'Esteban Rojas', role: 'Analista de Créditos Junior', exp: 6, sal: '$7,200 USD/mes', technical: 75, problemSolving: 78, cultureFit: 80 },
  { id: 'rob-fra', name: 'Roberto Franco', role: 'Oficial de Créditos Recuperaciones', exp: 10, sal: '$8,500 USD/mes', technical: 68, problemSolving: 72, cultureFit: 72 },
  { id: 'mau-per', name: 'Mauricio Peralta', role: 'Analista de Crédito Consumo', exp: 4, sal: '$6,800 USD/mes', technical: 65, problemSolving: 70, cultureFit: 78 },
  { id: 'cam-tor', name: 'Camila Torres', role: 'Asistente de Créditos Micro PYME', exp: 3, sal: '$6,200 USD/mes', technical: 63, problemSolving: 65, cultureFit: 84 }
];

const CREDIT_MOCK_APPLICANTS: Applicant[] = CREDIT_MOCK_NAMES.map((n, i) => ({
  id: n.id,
  name: n.name,
  email: `${n.id.replace('-', '.')}@coop-credito.com`,
  phone: `+591 7${60 + i} 43210`,
  agency: i % 2 === 0 ? 'Nexus Talent' : 'Apex Careers',
  role: n.role,
  status: i < 4 ? 'Shortlisted' : (i < 8 ? 'Interviewing' : 'Screening'),
  metrics: {
    technical: n.technical,
    communication: 80 + (i % 3) * 5,
    leadership: 70 + (i % 4) * 6,
    cultureFit: n.cultureFit,
    experience: n.exp * 8,
    problemSolving: n.problemSolving
  },
  skills: ['Análisis de Riesgo', 'Evaluación', 'PYME'],
  resumeSummary: `Especialista en crédito y finanzas con ${n.exp} años de experiencia. Especialidad en gestión de carteras activas, colocación y control de mora de consumo y PYME.`,
  notes: '',
  avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 32154)}?auto=format&fit=crop&q=80&w=150`,
  experienceYears: n.exp,
  education: 'Licenciatura en Ingeniería Financiera / Finanzas',
  expectedSalary: n.sal,
  timeline: [],
  updatedAt: new Date().toISOString()
}));

const CREDIT_EVAL_PILLS: Record<string, Record<string, { risk: 'Alto' | 'Medio' | 'Bajo'; detail: string }>> = {
  'ale-ruiz': {
    dim1: { risk: 'Bajo', detail: '12 años administrando portafolios corporativos de hasta $15M con excelente salud.' },
    dim2: { risk: 'Bajo', detail: 'Superó las metas anuales entre 105% y 112% consecutivamente desde 2021.' },
    dim3: { risk: 'Bajo', detail: 'Incrementó de forma orgánica la cartera activa en un 22% interanual.' },
    dim4: { risk: 'Bajo', detail: 'Sobresaliente análisis cuantitativo de estados financieros y flujos proyectados.' },
    dim5: { risk: 'Bajo', detail: 'Mantuvo índice de mora (NPL) por debajo del 1.2% de forma consistente.' },
    dim6: { risk: 'Bajo', detail: 'Domina tableros BI y KPIs financieros semanales con alta precisión analítica.' },
    dim7: { risk: 'Bajo', detail: 'Lideró un equipo de 8 oficiales junior con metas del 100% cumplidas.' }
  },
  'gab-men': {
    dim1: { risk: 'Bajo', detail: 'Especialista en PYMEs agrícolas; cartera activa de 240 cuentas con baja mora.' },
    dim2: { risk: 'Bajo', detail: '98% de meta alcanzada en 2025 bajo condiciones complejas de mercado.' },
    dim3: { risk: 'Bajo', detail: 'Captó 55 nuevos clientes empresariales en el último periodo.' },
    dim4: { risk: 'Bajo', detail: 'Precisión milimétrica en cálculo de EBITDA y ratios de endeudamiento.' },
    dim5: { risk: 'Bajo', detail: 'Índice de mora histórico excelente de 1.5% en portafolios de consumo.' },
    dim6: { risk: 'Bajo', detail: 'Monitoreo automatizado de rentabilidad por cliente, optimizando la productividad.' },
    dim7: { risk: 'Medio', detail: 'Supervisó analistas de crédito de apoyo; formación técnica.' }
  },
  'san-vil': {
    dim1: { risk: 'Bajo', detail: 'Lidera actualmente cartera comercial de $8M con cero siniestros reportados.' },
    dim2: { risk: 'Bajo', detail: 'Consonante con metas corporativas; 108% de efectividad de desembolsos.' },
    dim3: { risk: 'Medio', detail: 'Incremento comercial del 10%; se mantuvo estable bajo volatilidad.' },
    dim4: { risk: 'Bajo', detail: 'Modelos predictivos de capacidad de pago aplicados con rigor técnico.' },
    dim5: { risk: 'Bajo', detail: 'Cero cartera vencida a más de 90 días; controles preventivos diarios.' },
    dim6: { risk: 'Bajo', detail: 'Toma de decisiones guiada por análisis de KPIs en tiempo real.' },
    dim7: { risk: 'Bajo', detail: 'Mentora de nuevos oficiales comerciales; incrementó la retención de personal.' }
  },
  'luc-ber': {
    dim1: { risk: 'Bajo', detail: 'Cartera actual de $12M en corporativos con rentabilidad neta del 18%.' },
    dim2: { risk: 'Bajo', detail: 'Alcanzó el 115% de colocación de cartera de crédito sindicado.' },
    dim3: { risk: 'Bajo', detail: 'Logró un crecimiento de cartera del 30% gracias a alianzas estratégicas.' },
    dim4: { risk: 'Bajo', detail: 'Especialista en estructuración de líneas de crédito multiactivos de alta complejidad.' },
    dim5: { risk: 'Bajo', detail: 'Efectividad de recuperación del 98.5% en créditos corporativos.' },
    dim6: { risk: 'Bajo', detail: 'Desarrolló indicador interno de rentabilidad de activos.' },
    dim7: { risk: 'Bajo', detail: 'Gerente interina con 15 personas a cargo; resultados impecables.' }
  },
  'car-gut': {
    dim1: { risk: 'Medio', detail: 'Experiencia sólida en banca corporativa, pero con transiciones frecuentes.' },
    dim2: { risk: 'Bajo', detail: 'Logró colocaciones récord de $4.5M en menos de 9 meses.' },
    dim3: { risk: 'Medio', detail: 'Crecimiento del 12% en volumen, alta dependencia de 3 grandes clientes.' },
    dim4: { risk: 'Bajo', detail: 'Analista crediticio sumamente riguroso, reduce provisiones.' },
    dim5: { risk: 'Medio', detail: 'Mora actual en 3.1%, dentro del límite pero con tendencia alcista.' },
    dim6: { risk: 'Bajo', detail: 'Uso avanzado de dashboards para detectar alertas tempranas de desviación.' },
    dim7: { risk: 'Medio', detail: 'Coordinó equipos en sucursales regionales de manera intermitente.' }
  },
  'dan-veg': {
    dim1: { risk: 'Bajo', detail: 'Administró cartera de $10M en sector manufactura con alta retención.' },
    dim2: { risk: 'Bajo', detail: '110% de meta comercial de colocación en sector servicios en 2025.' },
    dim3: { risk: 'Medio', detail: 'Crecimiento moderado del 8% enfocado en reestructuraciones eficaces.' },
    dim4: { risk: 'Medio', detail: 'Análisis de capacidad robusto, requiere afilar en créditos de gran escala.' },
    dim5: { risk: 'Bajo', detail: 'Mora controlada en 1.8% en sector agroindustrial.' },
    dim6: { risk: 'Bajo', detail: 'Sólido control de captaciones ligadas a desembolsos para balancear liquidez.' },
    dim7: { risk: 'Bajo', detail: 'Dirige equipo de 5 personas con rotación nula en 3 años.' }
  },
  'mar-ort': {
    dim1: { risk: 'Bajo', detail: 'Sólida base en microfinanzas; lideró portafolios de consumo con éxito.' },
    dim2: { risk: 'Medio', detail: 'Variación estacional: promedia el 92% de cumplimiento trimestral.' },
    dim3: { risk: 'Bajo', detail: 'Logró penetración de mercado de un 15% adicional en zona norte.' },
    dim4: { risk: 'Bajo', detail: 'Excelente estructuración de garantías reales y análisis de estrés financiero.' },
    dim5: { risk: 'Bajo', detail: 'Gestión proactiva que recuperó $450k en créditos previamente castigados.' },
    dim6: { risk: 'Medio', detail: 'Reportes estructurados mensuales; se beneficiaría de mayor frecuencia.' },
    dim7: { risk: 'Bajo', detail: 'Dirigió el comité de créditos de la sucursal con alto consenso.' }
  },
  'pat-ala': {
    dim1: { risk: 'Medio', detail: 'Enfoque principal en préstamos personales, requiere adaptación para corporativos.' },
    dim2: { risk: 'Bajo', detail: 'Cumplimiento sostenido del 104% en metas de crédito comercial.' },
    dim3: { risk: 'Bajo', detail: 'Incrementó la base de clientes PYME un 25% mediante referidos.' },
    dim4: { risk: 'Bajo', detail: 'Firme apego a las políticas de riesgo vigentes; dictámenes impecables.' },
    dim5: { risk: 'Medio', detail: 'Mora de 2.8% en cartera comercial, requiere seguimiento estrecho.' },
    dim6: { risk: 'Bajo', detail: 'Productividad comercial por encima del promedio de la sucursal.' },
    dim7: { risk: 'Medio', detail: 'Coordinó mesa de validación de garantías, capacidad de liderazgo sólida.' }
  },
  'est-roj': {
    dim1: { risk: 'Medio', detail: 'Cartera estable de $4M PYME, pero crecimiento lento en los últimos 2 años.' },
    dim2: { risk: 'Alto', detail: 'Cumplimiento del 82% debido a contracción de sector asignado.' },
    dim3: { risk: 'Bajo', detail: 'Apertura de 40 nuevas líneas de crédito comercial corporativo.' },
    dim4: { risk: 'Bajo', detail: 'Capacidad de análisis financiero avanzada de balances y pérdidas.' },
    dim5: { risk: 'Medio', detail: 'Mora en 2.5%; requiere optimizar estrategia de cobranza temprana.' },
    dim6: { risk: 'Bajo', detail: 'Monitoreo de indicadores de captación y reciprocidad.' },
    dim7: { risk: 'Medio', detail: 'Liderazgo de proyectos específicos; requiere más experiencia de mando.' }
  },
  'rob-fra': {
    dim1: { risk: 'Alto', detail: 'Cartera anterior mostró un incremento del 5% en créditos vencidos.' },
    dim2: { risk: 'Medio', detail: 'Nivel aceptable (94%) en metas de colocación de microcréditos.' },
    dim3: { risk: 'Bajo', detail: 'Exitoso plan de fidelización que aumentó el ticket promedio en 18%.' },
    dim4: { risk: 'Alto', detail: 'Reportes anteriores mostraron dos créditos aprobados con deudas.' },
    dim5: { risk: 'Alto', detail: 'Mora de 4.8% debido a deficiente acompañamiento post-desembolso.' },
    dim6: { risk: 'Medio', detail: 'Enfoque parcial en desembolsos, descuidando el balance de rentabilidad.' },
    dim7: { risk: 'Alto', detail: 'Reportes de clima laboral denotan fricciones en la gestión de personas.' }
  }
};

const PROCESSES_MAP = [
  {
    id: 'proc-oficial',
    title: 'Oficial de Créditos',
    department: 'Gerencia Financiera / Riesgo',
    isHighlighted: true,
    description: 'Evaluación y control de carteras PYME y corporativas, colocación de líneas mercantiles, auditoría de mora comercial y análisis de riesgo estructurado.',
    dimensions: [
      { id: 'dim1', name: 'Gestión y administración de cartera (clientes empresariales, PYME)' },
      { id: 'dim2', name: 'Meta de colocación alcanzada' },
      { id: 'dim3', name: 'Incremento de cartera o crecimiento comercial' },
      { id: 'dim4', name: 'Gestión de cartera y riesgo crediticio: evaluación crediticia, análisis de capacidad de pago' },
      { id: 'dim5', name: 'Meta de recuperación y/o mora' },
      { id: 'dim6', name: 'Monitorear indicadores de desempeño comercial (desembolsos, cartera activa, mora, captaciones, rentabilidad y productividad)' },
      { id: 'dim7', name: 'Supervisión de equipos' }
    ]
  },
  {
    id: 'proc-frontend',
    title: 'Arquitectura Frontend Lead',
    department: 'Ingeniería Web',
    isHighlighted: false,
    description: 'Desarrollo de microestados interactivos, sistemas de diseño visualmente impactantes, animaciones Core Web Vitals en React.',
    dimensions: [
      { id: 'dim1', name: 'Alineación con sistemas de diseño y Figma tokens' },
      { id: 'dim2', name: 'Metas de entrega técnica de Core Web Vitals e inputs fluidos' },
      { id: 'dim3', name: 'Crecimiento comercial o reducción de deuda técnica en JSX' },
      { id: 'dim4', name: 'Análisis de estres de pruebas y performance con bundles pesados' },
      { id: 'dim5', name: 'Control de mora en parches o cuellos de botella de renderizado' },
      { id: 'dim6', name: 'Monitoreo de interfaces y animaciones de alta escala' },
      { id: 'dim7', name: 'Mentoría técnica y liderazgo de ingenieros de UI' }
    ]
  }
];

export default function CompareSection({ applicants, isDarkMode = true, onViewProfile }: CompareSectionProps) {
  // Mode selection: 'matrix' (Primary weight-based grid) vs 'radar' (Face-to-face Radar)
  const [activeModuleMode, setActiveModuleMode] = useState<'matrix' | 'radar'>('matrix');

  // Processes selection
  const [activeProcessId, setActiveProcessId] = useState<string>('proc-oficial');
  const activeProcess = useMemo(() => {
    return PROCESSES_MAP.find(p => p.id === activeProcessId) || PROCESSES_MAP[0];
  }, [activeProcessId]);

  // Dual mode radar selectors
  const [candidateAId, setCandidateAId] = useState<string>(applicants[0]?.id || 'app-001');
  const [candidateBId, setCandidateBId] = useState<string>(applicants[1]?.id || 'app-002');

  // Interactive custom Weights
  const [weights, setWeights] = useState({
    tech: 40,
    experience: 35,
    problemSolving: 25,
    cultureFit: 20,
    leadership: 15
  });

  // Manual selections
  const [manuallyAddedIds, setManuallyAddedIds] = useState<string[]>([]);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Quick close toast
  const triggerToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Compile active candidates for selected process
  const processApplicants = useMemo(() => {
    if (activeProcessId === 'proc-oficial') {
      return CREDIT_MOCK_APPLICANTS;
    } else {
      // adapt system applicants to the list
      return applicants;
    }
  }, [activeProcessId, applicants]);

  // Compute calculated scores for each candidate
  const candidatesWithDynamicScores = useMemo(() => {
    const sumW = weights.tech + weights.experience + weights.problemSolving + weights.cultureFit + weights.leadership;
    const denominator = sumW === 0 ? 1 : sumW;

    return processApplicants.map(app => {
      // Map experience to a 1-100 metric
      const expMetric = Math.min(100, Math.max(30, app.experienceYears * 7 + 15));
      const calculatedScore = (
        app.metrics.technical * weights.tech +
        expMetric * weights.experience +
        app.metrics.problemSolving * weights.problemSolving +
        app.metrics.cultureFit * weights.cultureFit +
        app.metrics.leadership * weights.leadership
      ) / denominator;

      return {
        ...app,
        dynamicScore: Math.round(calculatedScore)
      };
    });
  }, [processApplicants, weights]);

  // Automatic Top 10 sorted list
  const top10Candidates = useMemo(() => {
    // Sort all candidates descending
    const sorted = [...candidatesWithDynamicScores].sort((a, b) => b.dynamicScore - a.dynamicScore);
    return sorted.slice(0, 10);
  }, [candidatesWithDynamicScores]);

  // Non-top 10 candidates (for manual adding)
  const remainingCandidatesOptions = useMemo(() => {
    const top10Ids = new Set(top10Candidates.map(c => c.id));
    return candidatesWithDynamicScores.filter(c => !top10Ids.has(c.id) && !manuallyAddedIds.includes(c.id));
  }, [candidatesWithDynamicScores, top10Candidates, manuallyAddedIds]);

  // Combine top 10 and manual candidates in active columns
  const activeColumns = useMemo(() => {
    const result = [...top10Candidates];
    
    // Append manually added if they are not already in the list
    manuallyAddedIds.forEach(id => {
      const match = candidatesWithDynamicScores.find(c => c.id === id);
      if (match && !result.some(r => r.id === id)) {
        result.push(match);
      }
    });

    // Re-sort columns based on calculated scores
    return result.sort((a, b) => b.dynamicScore - a.dynamicScore);
  }, [top10Candidates, manuallyAddedIds, candidatesWithDynamicScores]);

  // Helper to dynamically check table container horizontal scroll bounds
  const checkScroll = () => {
    const el = tableScrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = tableScrollRef.current;
    if (el) {
      checkScroll();
      // Wait slightly for any animations to settle
      const timer = setTimeout(checkScroll, 120);
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        clearTimeout(timer);
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [activeColumns, activeModuleMode]);

  // Handlers for manual additions
  const handleAddManualCandidate = (candidateId: string) => {
    const candidate = candidatesWithDynamicScores.find(c => c.id === candidateId);
    if (candidate) {
      setManuallyAddedIds(prev => [...prev, candidateId]);
      triggerToast(`📋 Sincronizado: ${candidate.name} agregado manualmente a la matriz de auditoría técnica.`);
    }
  };

  const handleRemoveManualCandidate = (candidateId: string) => {
    setManuallyAddedIds(prev => prev.filter(id => id !== candidateId));
  };

  // Grid background colors for Risk level cells
  const getRiskStyle = (risk: 'Alto' | 'Medio' | 'Bajo') => {
    switch (risk) {
      case 'Bajo':
        return {
          bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
          border: isDarkMode ? 'border-emerald-500/25' : 'border-emerald-100',
          text: isDarkMode ? 'text-emerald-400' : 'text-emerald-700',
          pill: 'bg-emerald-500/20 text-emerald-300'
        };
      case 'Medio':
        return {
          bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
          border: isDarkMode ? 'border-amber-500/25' : 'border-amber-100',
          text: isDarkMode ? 'text-amber-400' : 'text-amber-700',
          pill: 'bg-amber-500/20 text-amber-300'
        };
      case 'Alto':
        return {
          bg: isDarkMode ? 'bg-rose-500/10' : 'bg-rose-50',
          border: isDarkMode ? 'border-rose-500/25' : 'border-rose-100',
          text: isDarkMode ? 'text-rose-400' : 'text-rose-700',
          pill: 'bg-rose-500/20 text-rose-300'
        };
    }
  };

  // Overlapping radar helper
  const oldRadarData = useMemo(() => {
    const candidateA = applicants.find(a => a.id === candidateAId) || CREDIT_MOCK_APPLICANTS[0];
    const candidateB = applicants.find(a => a.id === candidateBId) || CREDIT_MOCK_APPLICANTS[1];
    if (!candidateA || !candidateB) return [];
    return [
      { subject: 'Técnico', A: candidateA.metrics.technical, B: candidateB.metrics.technical },
      { subject: 'Comunicación', A: candidateA.metrics.communication, B: candidateB.metrics.communication },
      { subject: 'Liderazgo', A: candidateA.metrics.leadership, B: candidateB.metrics.leadership },
      { subject: 'Ajuste Cultural', A: candidateA.metrics.cultureFit, B: candidateB.metrics.cultureFit },
      { subject: 'Experiencia', A: candidateA.metrics.experience, B: candidateB.metrics.experience },
      { subject: 'Resolución Prov.', A: candidateA.metrics.problemSolving, B: candidateB.metrics.problemSolving },
    ];
  }, [applicants, candidateAId, candidateBId]);

  // Dynamic risk helper for columns
  const fetchRiskAndDetail = (candidateId: string, dimId: string) => {
    if (activeProcessId === 'proc-oficial' && CREDIT_EVAL_PILLS[candidateId]) {
      return CREDIT_EVAL_PILLS[candidateId][dimId] || { risk: 'Medio', detail: 'Evaluación de control estándar bajo revisión operativa.' };
    }
    // dynamic fallback calculation to support standard applicants
    const hash = (candidateId.charCodeAt(0) || 0) + (dimId.charCodeAt(3) || 5);
    const mockRisks: ('Bajo' | 'Medio' | 'Alto')[] = ['Bajo', 'Medio', 'Bajo', 'Medio', 'Alto'];
    const r = mockRisks[hash % mockRisks.length];
    const details = [
      'Trayectoria probada con bajo nivel de incidencias operativas destacable.',
      'Sujeto a controles estándar del departamento financiero trimestrales.',
      'Presenta alineación teórica fuerte; pendiente validación práctica de campo KPI.',
      'Requiere inducción inicial para homologación de flujos de capacidad de pago.'
    ];
    return {
      risk: r,
      detail: details[hash % details.length]
    };
  };

  return (
    <div className={`relative backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(10,15,30,0.4)]' 
        : 'bg-white/70 border-slate-200/60 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
    }`}>

      {/* FLOATING STATUS TOAST */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-[100] max-w-sm p-4 rounded-xl border shadow-xl bg-slate-900 border-indigo-500/30 text-white font-mono text-xs flex gap-3 items-start"
          >
            <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Notificación Táctica</p>
              <p className="text-slate-300 mt-0.5">{toastNotification}</p>
            </div>
            <button onClick={() => setToastNotification(null)} className="ml-auto text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION WITH DUAL MODE SWITCH */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b ${
        isDarkMode ? 'border-white/10' : 'border-[#AAB9C2]/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : 'bg-[#00b0d8]/10 border-[#00b0d8]/30 text-[#004a8f]'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-semibold tracking-wide flex items-center flex-wrap gap-2 ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
              Matriz Comparativa de Talentos
              <span className={`text-[9px] uppercase font-mono font-semibold px-2 py-0.5 rounded-md border ${
                isDarkMode ? 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300' : 'bg-[#00b0d8]/10 border-[#00b0d8]/30 text-[#005baa]'
              }`}>
                Puntajes & Análisis de Riesgo
              </span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-[#647786]'}`}>
              Evaluación tridimensional cruzada de factores de riesgo, ponderación inteligente 1-100 y sincronización automática.
            </p>
          </div>
        </div>

        {/* MODAL TABS TOGGLE */}
        <div className={`flex p-0.5 rounded-xl border self-start lg:self-center ${
          isDarkMode ? 'bg-slate-900/60 border-white/5' : 'bg-slate-100 border-[#AAB9C2]/40'
        }`}>
          <button
            onClick={() => setActiveModuleMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeModuleMode === 'matrix'
                ? isDarkMode ? 'bg-indigo-500 text-white shadow-md' : 'bg-[#004a8f] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Matriz de Alineación
          </button>
          <button
            onClick={() => setActiveModuleMode('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeModuleMode === 'radar'
                ? isDarkMode ? 'bg-indigo-500 text-white shadow-md' : 'bg-[#004a8f] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Radar Cara a Cara
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: INTERACTIVE SELECTION MATRIX & WEIGHT COMPILER */}
        {activeModuleMode === 'matrix' && (
          <motion.div
            key="matrix-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 1. PROCESS SELECTOR ROW CARDS */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2 tracking-wider">
                Seleccione el Proceso a Evaluar:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROCESSES_MAP.map(p => {
                  const isSel = p.id === activeProcessId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProcessId(p.id);
                        setManuallyAddedIds([]);
                        triggerToast(`📂 Proceso cambiado: ${p.title}. Cargando dimensiones específicas de la posición.`);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group cursor-pointer ${
                        isSel 
                          ? isDarkMode 
                            ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                            : 'bg-[#004a8f]/5 border-[#004a8f]/40 shadow-sm'
                          : isDarkMode 
                            ? 'bg-white/5 hover:bg-white/10 border-white/5'
                            : 'bg-white border-slate-200/60 hover:bg-slate-50'
                      }`}
                    >
                      {isSel && (
                        <span className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${isDarkMode ? 'bg-indigo-500' : 'bg-[#004a8f]'}`} />
                      )}
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold ${isSel ? isDarkMode ? 'text-indigo-400' : 'text-[#004a8f]' : isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          {p.title}
                        </p>
                        {p.isHighlighted && (
                          <span className="text-[7.5px] font-mono leading-none tracking-wide bg-pink-500/20 text-pink-300 px-1 py-0.5 rounded border border-pink-500/20 uppercase font-semibold">
                            Modelo Oficial
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.department}</p>
                      <p className="text-[10px] leading-relaxed text-slate-500 line-clamp-2 mt-1.5 font-sans">
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. DYNAMIC INPUTS WEIGHTS SLIDERS */}
            <div className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/40 border-white/5' : 'bg-white border-[#AAB9C2]/40 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(170,185,194,0.3)' }}>
                <span className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-[#647786]'}`}>
                  <SlidersHorizontal className={`w-3.5 h-3.5 ${isDarkMode ? 'text-cyan-400' : 'text-[#004a8f]'}`} /> Ponderación Dinámica de Fuentes (Métricas 1-100)
                </span>
                <button 
                  onClick={() => setWeights({ tech: 40, experience: 30, problemSolving: 20, cultureFit: 15, leadership: 15 })}
                  className="text-[9px] font-mono text-slate-500 hover:text-slate-300 underline cursor-pointer"
                  title="Restablecer ponderaciones biométricas predeterminadas"
                >
                  Valores Base
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { id: 'tech', label: 'Conocimiento Técnico', color: 'accent-cyan-450 accent-[#00b0d8]', val: weights.tech, setter: (v: number) => setWeights(p => ({ ...p, tech: v })) },
                  { id: 'experience', label: 'Historial de Experiencia', color: 'accent-indigo-400 accent-[#004a8f]', val: weights.experience, setter: (v: number) => setWeights(p => ({ ...p, experience: v })) },
                  { id: 'problemSolving', label: 'Resolución de Problemas', color: 'accent-purple-400', val: weights.problemSolving, setter: (v: number) => setWeights(p => ({ ...p, problemSolving: v })) },
                  { id: 'cultureFit', label: 'Ajuste Cultural', color: 'accent-pink-400', val: weights.cultureFit, setter: (v: number) => setWeights(p => ({ ...p, cultureFit: v })) },
                  { id: 'leadership', label: 'Instinto de Liderazgo', color: 'accent-emerald-400 accent-[#00AB4E]', val: weights.leadership, setter: (v: number) => setWeights(p => ({ ...p, leadership: v })) },
                ].map(item => (
                  <div key={item.id} className={`space-y-1 p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase text-slate-400">
                      <span className="truncate max-w-[85px]" title={item.label}>{item.label}</span>
                      <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.val}x</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.val}
                      onChange={(e) => item.setter(parseInt(e.target.value))}
                      className={`w-full h-1 rounded-lg cursor-pointer ${item.color}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MULTI-COLUMN COMPARATIVE SCORE MATRIX */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="leading-tight">
                  <h4 className={`text-xs font-mono font-semibold uppercase flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
                    Tabla Táctica de Resultados de Reclutamiento ({activeColumns.length} Perfiles Activos)
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Las columnas se reordenan automáticamente en tiempo real basándose en la fluctuación de los puntajes calculados.
                  </p>
                </div>

                {/* MANUAL ADDTION BUTTON SELECTOR */}
                <div className="relative group">
                  <button className="px-3 py-1.5 rounded-lg text-[10px] font-mono bg-[#004a8f] hover:bg-[#005baa] text-white flex items-center gap-1.5 shadow-md font-semibold cursor-pointer transition-colors border border-[#004a8f]/20">
                    <Plus className="w-3.5 h-3.5" /> Agregar manual a la tabla
                  </button>
                  
                  {/* Absolute Dropdown list of remaining candidates */}
                  <div className={`absolute right-0 top-full mt-1.5 w-64 rounded-xl shadow-2xl border hidden group-hover:block hover:block z-50 ${isDarkMode ? 'bg-slate-950 border-white/10 text-slate-300' : 'bg-white border-[#AAB9C2] text-slate-700 shadow-lg'}`}>
                    <div className={`p-2 border-b ${isDarkMode ? 'border-white/5 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Candidatos Fuera del Top 10</p>
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                      {remainingCandidatesOptions.length === 0 ? (
                        <p className="text-[10px] font-mono text-slate-600 p-3 text-center">Todos están cargados o no hay disponibles.</p>
                      ) : (
                        remainingCandidatesOptions.map(cand => (
                          <button
                            key={cand.id}
                            onClick={() => handleAddManualCandidate(cand.id)}
                            className={`w-full text-left p-1.5 rounded-lg text-[10px] font-sans flex items-center gap-2 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'}`}
                          >
                            <img src={cand.avatarUrl} alt="" className="w-5 h-5 rounded-md object-cover border border-[#AAB9C2]/30" />
                            <div className="truncate">
                              <p className="font-semibold">{cand.name}</p>
                              <p className="text-[8.5px] font-mono text-slate-500">{cand.dynamicScore}% • {cand.expectedSalary}</p>
                            </div>
                            <span className="ml-auto text-[8px] bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded">Añadir</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BAR CHART OVERVIEW PREVIEW */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-white border-[#AAB9C2]/35 shadow-sm'} h-44`}>
                <p className="text-[9px] font-mono uppercase text-slate-500 mb-2">Desempeño Comparado de Puntuación Táctica</p>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={activeColumns} margin={{ top: 0, bottom: 0, left: -20, right: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: isDarkMode ? '#64748b' : '#647786', fontSize: 8, fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: isDarkMode ? '#64748b' : '#647786', fontSize: 8 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: isDarkMode ? '#090e1a' : '#ffffff', 
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#AAB9C2', 
                        borderRadius: 8 
                      }}
                      labelStyle={{ color: isDarkMode ? '#94a3b8' : '#004a8f', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}
                      itemStyle={{ color: '#005baa', fontSize: 10 }}
                    />
                    <Bar 
                      dataKey="dynamicScore" 
                      fill="url(#indigoCyanGrad)" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                    <defs>
                      <linearGradient id="indigoCyanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#004a8f" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#00b0d8" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* MATRIX SCROLLABLE OUTER */}
              <div className="relative group/table">
                {/* Horizontal scroll controller navigation buttons */}
                <AnimatePresence>
                  {showLeftArrow && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        if (tableScrollRef.current) {
                          tableScrollRef.current.scrollBy({ left: -250, behavior: 'smooth' });
                        }
                      }}
                      className={`absolute left-4 top-[175px] -translate-y-1/2 z-40 p-2.5 rounded-full border shadow-xl hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-900/95 border-cyan-500/30 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400/50' 
                          : 'bg-white/95 border-[#AAB9C2] text-[#004a8f] shadow-lg hover:bg-slate-50 hover:border-[#004a8f]'
                      }`}
                      title="Desplazar perfiles a la izquierda"
                    >
                      <ArrowLeft className="w-5 h-5 pointer-events-none" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showRightArrow && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        if (tableScrollRef.current) {
                          tableScrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
                        }
                      }}
                      className={`absolute right-4 top-[175px] -translate-y-1/2 z-40 p-2.5 rounded-full border shadow-xl hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-900/95 border-cyan-500/30 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400/50' 
                          : 'bg-white/95 border-[#AAB9C2] text-[#004a8f] shadow-lg hover:bg-slate-50 hover:border-[#004a8f]'
                      }`}
                      title="Desplazar perfiles a la derecha"
                    >
                      <ArrowRight className="w-5 h-5 pointer-events-none" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <div 
                  ref={tableScrollRef}
                  className={`overflow-auto rounded-xl border shadow-lg mask-scrollbar transition-all duration-300 max-h-[640px] ${
                    isDarkMode ? 'border-white/10 bg-slate-950/40' : 'border-[#AAB9C2]/45 bg-white'
                  }`}
                >
                  <table className="w-full border-collapse text-left text-xs min-w-[900px] relative">
                    {/* Column Group Headers */}
                    <thead>
                      <tr style={{ height: '142px' }} className={`border-b ${isDarkMode ? 'bg-slate-950/80 border-white/5 text-slate-400' : 'bg-slate-50 border-[#AAB9C2]/30 text-[#647786]'}`}>
                        <th className={`p-4 uppercase font-mono text-[10px] w-72 leading-tight sticky top-0 left-0 z-30 transition-all duration-300 ${
                          isDarkMode ? 'bg-[#0c1322] border-white/5' : 'bg-slate-100 border-[#AAB9C2]/30'
                        }`}>
                          Criterios & Metas
                        </th>
                        {activeColumns.map((cand, i) => (
                          <th 
                            key={cand.id} 
                            className={`p-2.5 text-center border-l relative sticky top-0 z-20 transition-all duration-300 ${
                              isDarkMode ? 'border-white/5 bg-[#090e1a]' : 'border-[#AAB9C2]/25 bg-white'
                            }`}
                          >
                            <div 
                              onClick={() => onViewProfile?.(cand.id)}
                              title="Ver Perfil Completo"
                              className="relative p-3.5 rounded-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col items-center overflow-hidden w-full select-none"
                            >
                              {/* Sliding gradient outline glow behind on group hover */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#004a8f] via-[#00b0d8] to-[#005baa] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 p-[1.5px] bg-[length:200%_auto] animate-gradient-slow">
                                <div className={`w-full h-full rounded-[10px] ${isDarkMode ? 'bg-[#0c1322]' : 'bg-white'}`} />
                              </div>
                              
                              {/* Subtle shadow glow on select / hover */}
                              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_4px_25px_rgba(0,176,216,0.18)] -z-20 pointer-events-none" />

                              {/* Score dynamic Badge */}
                              <span className="text-[10px] font-mono font-bold text-white bg-gradient-to-r from-[#004a8f] via-[#005baa] to-[#00b0d8] px-2.5 py-0.5 rounded-full shadow-md z-10 border border-white/20">
                                Rank #{i+1} • {cand.dynamicScore} pts
                              </span>

                              {/* Avatar */}
                              <img 
                                src={cand.avatarUrl} 
                                alt={cand.name} 
                                className={`w-12 h-12 rounded-xl object-cover border shadow-sm mt-3 mb-1.5 transition-all duration-300 group-hover:scale-105 ${
                                  isDarkMode ? 'border-white/20 bg-slate-800' : 'border-[#AAB9C2]/45 bg-slate-100'
                                }`}
                              />

                              <p className={`font-semibold tracking-wide text-xs truncate max-w-[150px] transition-colors duration-300 ${
                                isDarkMode ? 'text-white group-hover:text-cyan-400' : 'text-[#004a8f] group-hover:text-[#005baa]'
                              }`}>
                                {cand.name}
                              </p>
                              <p className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-tight truncate max-w-[150px]">
                                {cand.role}
                              </p>

                              {/* Check if is manual candidate to show option to remove */}
                              {manuallyAddedIds.includes(cand.id) ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveManualCandidate(cand.id);
                                  }}
                                  className="mt-1.5 text-[8.5px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-0.5 cursor-pointer z-10"
                                  title="Quitar este candidato de la visualización actual"
                                >
                                  <Trash2 className="w-3 h-3" /> Quitar Manual
                                </button>
                              ) : (
                                <span className="text-[8px] font-mono text-slate-500 uppercase mt-1">Automatizado</span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* STATS SECTION: COMPREHENSIVE OVERVIEW ROW */}
                      <tr className="border-b border-slate-200/40 dark:border-white/5">
                        <td className={`p-4 font-bold font-mono text-[9px] uppercase tracking-wide sticky left-0 z-10 border-r transition-all duration-300 ${
                          isDarkMode ? 'bg-[#0c1322] border-white/5' : 'bg-slate-100 border-[#AAB9C2]/20'
                        }`}>
                          <div className={`flex items-center gap-2 border-l-2 pl-2.5 ${isDarkMode ? 'border-cyan-400 text-cyan-400' : 'border-[#004a8f] text-[#004a8f]'}`}>
                            Aptitud General
                          </div>
                        </td>
                        {activeColumns.map((cand) => (
                          <td 
                            key={cand.id} 
                            className={`p-3.5 text-center border-l transition-all duration-300 ${
                              isDarkMode ? 'border-white/5 bg-[#090e1a]' : 'border-[#AAB9C2]/20 bg-slate-50'
                            }`}
                          >
                            <div className={`p-3 rounded-xl border space-y-1.5 font-mono text-[10px] text-left transition-all duration-300 ${
                              isDarkMode 
                                ? 'bg-slate-900/30 border-white/5 shadow-inner' 
                                : 'bg-white/90 border-[#AAB9C2]/25 shadow-[0_2px_8px_rgba(0,74,143,0.03)]'
                            }`}>
                              <p className="flex justify-between items-center gap-1.5">
                                <span className="text-slate-500">Exp. Laboral:</span> 
                                <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-[#004a8f]'}`}>{cand.experienceYears} Años</span>
                              </p>
                              <p className="flex justify-between items-center gap-1.5">
                                <span className="text-slate-500">Sueldo Requerido:</span> 
                                <span className={`font-bold truncate max-w-[100px] ${isDarkMode ? 'text-slate-200' : 'text-[#004a8f]'}`}>{cand.expectedSalary}</span>
                              </p>
                              <p className="flex justify-between items-center gap-1.5">
                                <span className="text-slate-500">Ajuste Cultural:</span> 
                                <span className={`font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>{cand.metrics.cultureFit}%</span>
                              </p>
                              <p className="flex justify-between items-center gap-1.5">
                                <span className="text-slate-500">Resolución Prob.:</span> 
                                <span className={`font-bold ${isDarkMode ? 'text-cyan-400' : 'text-[#00b0d8]'}`}>{cand.metrics.problemSolving}%</span>
                              </p>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* DYNAMIC POSITION ROWS BASED ON ACTIVE PROCESS */}
                      {activeProcess.dimensions.map((dim, idx) => {
                        return (
                          <tr 
                            key={dim.id} 
                            className={`border-b transition-colors ${
                              idx % 2 === 0 
                                ? isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50/20' 
                                : ''
                            } ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-[#AAB9C2]/20 hover:bg-slate-50'}`}
                          >
                            {/* Row dimension description - STICKY LEFT-0 */}
                            <td className={`p-4 font-medium leading-relaxed max-w-[280px] sticky left-0 z-10 border-r transition-all duration-300 ${
                              isDarkMode 
                                ? idx % 2 === 0 ? 'bg-[#0c1322] border-white/5' : 'bg-slate-950 border-white/5'
                                : idx % 2 === 0 ? 'bg-slate-50 border-[#AAB9C2]/20 text-slate-800' : 'bg-white border-[#AAB9C2]/20 text-slate-800'
                            }`}>
                              <div className="flex gap-2">
                                <span className="text-[10px] font-mono text-slate-500 mt-0.5">{idx + 1}.</span>
                                <div className="leading-normal">
                                  <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{dim.name}</p>
                                </div>
                              </div>
                            </td>

                            {/* Candidate rating and clarification detail cells */}
                            {activeColumns.map((cand) => {
                              const evalObj = fetchRiskAndDetail(cand.id, dim.id);
                              const styleObj = getRiskStyle(evalObj.risk);

                              return (
                                <td 
                                  key={cand.id} 
                                  className={`p-4 text-center border-l uppercase font-mono max-w-[210px] align-top ${isDarkMode ? 'border-white/5' : 'border-[#AAB9C2]/20'}`}
                                >
                                  <div className="flex flex-col items-center text-left normal-case tracking-normal">
                                    {/* Soft glowing Pill status */}
                                    <span className={`text-[8.5px] font-mono leading-none px-2 py-1 rounded border mb-2 font-bold ${styleObj.bg} ${styleObj.border} ${styleObj.text}`}>
                                      {evalObj.risk} Riesgo
                                    </span>

                                    {/* Clarifying qualitative detail text */}
                                    <p className={`text-[10px] font-sans leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                      {evalObj.detail}
                                    </p>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: ORIGINAL RADAR FOCUS COMPARISON FEATURE */}
        {activeModuleMode === 'radar' && (
          <motion.div
            key="radar-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Selectors grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-[#647786]'}`}>Candidato Alfa</label>
                <select
                  id="compare-candidate-a-select"
                  value={candidateAId}
                  onChange={(e) => setCandidateAId(e.target.value)}
                  className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer appearance-none transition-colors border ${
                    isDarkMode 
                      ? 'text-cyan-300 bg-slate-950/45 border-cyan-500/20 focus:border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.05)]' 
                      : 'text-[#004a8f] bg-white border-[#AAB9C2] focus:border-[#004a8f] shadow-sm font-semibold'
                  }`}
                >
                  {processApplicants.map(app => (
                    <option 
                      key={app.id} 
                      value={app.id} 
                      disabled={app.id === candidateBId}
                      className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}
                    >
                      {app.name} ({app.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-[#647786]'}`}>Candidato Beta</label>
                <select
                  id="compare-candidate-b-select"
                  value={candidateBId}
                  onChange={(e) => setCandidateBId(e.target.value)}
                  className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer appearance-none transition-colors border ${
                    isDarkMode 
                      ? 'text-pink-300 bg-slate-950/45 border-pink-500/20 focus:border-pink-400/50 shadow-[0_0_12px_rgba(244,63,94,0.05)]' 
                      : 'text-[#00AB4E] bg-white border-[#AAB9C2] focus:border-[#00AB4E] shadow-sm font-semibold'
                  }`}
                >
                  {processApplicants.map(app => (
                    <option 
                      key={app.id} 
                      value={app.id} 
                      disabled={app.id === candidateAId}
                      className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-850 text-slate-800"}
                    >
                      {app.name} ({app.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Radar overlapping charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 h-[20rem] flex flex-col justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={oldRadarData}>
                    <PolarGrid stroke={isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 9, fontFamily: 'monospace' }} 
                    />
                    <PolarRadiusAxis 
                      angle={45} 
                      domain={[0, 100]} 
                      tick={{ fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 7 }} 
                    />
                    <Radar
                      name="Alfa"
                      dataKey="A"
                      stroke={isDarkMode ? "#06b6d4" : "#004a8f"}
                      fill={isDarkMode ? "rgba(6, 182, 212, 0.12)" : "rgba(0, 74, 143, 0.1)"}
                      fillOpacity={0.5}
                    />
                    <Radar
                      name="Beta"
                      dataKey="B"
                      stroke={isDarkMode ? "#ec4899" : "#00AB4E"}
                      fill={isDarkMode ? "rgba(236, 72, 153, 0.12)" : "rgba(0, 171, 78, 0.1)"}
                      fillOpacity={0.5}
                    />
                    <Legend tick={{ fill: isDarkMode ? '#64748b' : '#647786', fontSize: 9 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Stat rows for face to face compare */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className={`grid grid-cols-3 text-center text-[10px] font-mono pb-2 border-b ${
                  isDarkMode ? 'border-white/10 text-slate-400' : 'border-[#AAB9C2]/40 text-[#647786]'
                }`}>
                  <span>METRICAS ANALÍTICAS</span>
                  <span className={`${isDarkMode ? 'text-cyan-400' : 'text-[#004a8f]'} font-bold truncate`}>Alfa</span>
                  <span className={`${isDarkMode ? 'text-pink-400' : 'text-[#00AB4E]'} font-bold truncate`}>Beta</span>
                </div>

                {[
                  { label: 'Habilidad Técnico-Operativa', key: 'technical' },
                  { label: 'Resolución de Problemas', key: 'problemSolving' },
                  { label: 'Estilo de Comunicación', key: 'communication' },
                  { label: 'Instinto de Liderazgo', key: 'leadership' },
                  { label: 'Ajuste Cultural Activo', key: 'cultureFit' },
                ].map(row => {
                  const valA = (processApplicants.find(a => a.id === candidateAId) || processApplicants[0])?.metrics[row.key as keyof QualificationMetrics] || 0;
                  const valB = (processApplicants.find(a => a.id === candidateBId) || processApplicants[1])?.metrics[row.key as keyof QualificationMetrics] || 0;
                  const isAGreater = valA >= valB;
                  const isBGreater = valB >= valA;
                  return (
                    <div key={row.key} className={`grid grid-cols-3 items-center text-center py-1.5 border-b last:border-0 rounded-lg px-2 transition-colors ${
                      isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <span className={`text-[11px] font-medium text-left ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{row.label}</span>
                      <span className={`text-xs font-mono font-bold ${
                        isAGreater 
                          ? isDarkMode ? 'text-cyan-400 font-extrabold' : 'text-[#004a8f] font-extrabold' 
                          : 'text-slate-500'
                      }`}>{valA}%</span>
                      <span className={`text-xs font-mono font-bold ${
                        isBGreater 
                          ? isDarkMode ? 'text-pink-400 font-extrabold' : 'text-[#00AB4E] font-extrabold' 
                          : 'text-slate-500'
                      }`}>{valB}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
