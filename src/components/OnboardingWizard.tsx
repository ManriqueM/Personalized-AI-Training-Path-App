import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Video,
  FileText,
  Terminal,
  Layers,
  Code,
  Megaphone,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Scale,
  Zap,
  HelpCircle,
  Clock,
  Target,
  Award,
} from 'lucide-react';
import { FormatPreference, KnowledgeLevel, Language, UserPreferences } from '../types';

interface OnboardingWizardProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSubmit: (preferences: UserPreferences) => void;
  onOpenDiagnostic: () => void;
  diagnosticResult?: UserPreferences['diagnosticResult'];
  isGenerating?: boolean;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  language,
  onLanguageChange,
  onSubmit,
  onOpenDiagnostic,
  diagnosticResult,
  isGenerating = false,
}) => {
  const isEs = language === 'es';

  // Step state (0: Language & Domain, 1: Format & Time, 2: Knowledge Level & Goal)
  const [step, setStep] = useState(0);

  // Form states
  const [area, setArea] = useState('general_productivity');
  const [customArea, setCustomArea] = useState('');
  const [formatPreference, setFormatPreference] = useState<FormatPreference>('all');
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>(
    diagnosticResult?.recommendedLevel || 'beginner'
  );
  const [timeCommitment, setTimeCommitment] = useState('3-5 hours/week');
  const [specificGoal, setSpecificGoal] = useState('');

  // If diagnosticResult arrives, update level
  React.useEffect(() => {
    if (diagnosticResult?.recommendedLevel) {
      setKnowledgeLevel(diagnosticResult.recommendedLevel);
    }
  }, [diagnosticResult]);

  const domainOptions = [
    {
      id: 'general_productivity',
      label: isEs ? 'Productividad Diaria y Asistente Personal' : 'Everyday Productivity & Personal AI Assistant',
      desc: isEs ? 'Redacción de correos, resúmenes de reuniones, gestión de tareas y primeros pasos con ChatGPT/Gemini.' : 'Email drafting, meeting summaries, task automation, and general everyday workflows.',
      icon: Zap,
    },
    {
      id: 'software_dev',
      label: isEs ? 'Desarrollo de Software e Ingeniería' : 'Software Engineering & Development',
      desc: isEs ? 'Asistentes de código, pruebas unitarias, refactorización, Gemini API, Function Calling y Agentes.' : 'AI coding assistants, unit tests, refactoring, Gemini API, Tool Calling & Autonomous Agents.',
      icon: Code,
    },
    {
      id: 'marketing_content',
      label: isEs ? 'Marketing, Redes y Estrategia de Contenidos' : 'Marketing, Content Strategy & Copywriting',
      desc: isEs ? 'Tono de marca, briefs SEO, copys publicitarios, buyer personas y prompts visuales.' : 'Brand voice consistency, SEO content briefs, ad copy variants, buyer personas & visual prompts.',
      icon: Megaphone,
    },
    {
      id: 'business_ops',
      label: isEs ? 'Operaciones de Negocio y Finanzas' : 'Business Operations & Management',
      desc: isEs ? 'Análisis de hojas de cálculo, resúmenes ejecutivos, análisis FODA y creación de Gems de equipo.' : 'Spreadsheet synthesis, executive memos, KPI analysis, and reusable custom team Gems.',
      icon: Briefcase,
    },
    {
      id: 'education_teaching',
      label: isEs ? 'Educación, Docencia y Pedagogía' : 'Education, Teaching & Academic',
      desc: isEs ? 'Diseño de rúbricas, planes de clase personalizados y tutoría socrática para alumnos.' : 'Lesson planning, interactive rubric generators, and Socratic questioning prompts.',
      icon: GraduationCap,
    },
    {
      id: 'healthcare_science',
      label: isEs ? 'Salud, Ciencia e Investigación' : 'Healthcare, Science & Research',
      desc: isEs ? 'Revisión bibliográfica, síntesis de papers, extracción de datos y bioinformática.' : 'Paper synthesis, literature reviews, clinical summarization, and data extraction.',
      icon: HeartPulse,
    },
    {
      id: 'legal_finance',
      label: isEs ? 'Legal, Riesgo y Cumplimiento' : 'Legal, Compliance & Contract Review',
      desc: isEs ? 'Análisis comparativo de cláusulas, resúmenes de normativas y detección de riesgos.' : 'Clause comparison, policy auditing, and regulatory summarization.',
      icon: Scale,
    },
  ];

  const formatOptions: { id: FormatPreference; label: string; labelEs: string; desc: string; descEs: string; icon: any }[] = [
    {
      id: 'all',
      label: 'Balanced Mix (Recommended)',
      labelEs: 'Mezcla Equilibrada (Recomendado)',
      desc: 'Combination of short videos, documentation guides, and interactive exercises.',
      descEs: 'Combina videos cortos, guías escritas y ejercicios prácticos.',
      icon: Layers,
    },
    {
      id: 'video',
      label: 'Video Masterclasses',
      labelEs: 'Videos y Clases Visuales',
      desc: 'YouTube masterclasses, visual breakdowns (Andrej Karpathy, DotCSV, 3Blue1Brown).',
      descEs: 'Clases en video en YouTube, animaciones visuales (DotCSV, Karpathy, Platzi).',
      icon: Video,
    },
    {
      id: 'text',
      label: 'Reading & Official Docs',
      labelEs: 'Lectura y Documentación Oficial',
      desc: 'Concise written guides, reference cheatsheets (PromptingGuide.ai, LearnPrompting).',
      descEs: 'Guías escritas concisas, manuales de referencia (LearnPrompting, PromptingGuide).',
      icon: FileText,
    },
    {
      id: 'interactive',
      label: 'Interactive Labs & Playgrounds',
      labelEs: 'Laboratorios y Práctica Interactiva',
      desc: 'Direct hands-on in Google AI Studio, Jupyter/Colab notebooks, prompt sandboxes.',
      descEs: 'Práctica directa en Google AI Studio, Colab notebooks y sandboxes de prompts.',
      icon: Terminal,
    },
  ];

  const levelOptions: { id: KnowledgeLevel; title: string; titleEs: string; desc: string; descEs: string }[] = [
    {
      id: 'beginner',
      title: 'Tier 1: Absolute Beginner ("What is a prompt?")',
      titleEs: 'Nivel 1: Principiante Total ("¿Qué es un prompt?")',
      desc: 'New to ChatGPT/Gemini/Claude. Needs clear guidance on prompt structure, conversation flow, and basic terminology.',
      descEs: 'Nuevo en herramientas de IA. Necesita entender qué es un prompt, roles y cómo escribir instrucciones claras sin frustración.',
    },
    {
      id: 'intermediate',
      title: 'Tier 2: Applied Practitioner',
      titleEs: 'Nivel 2: Practicante Aplicado',
      desc: 'Uses AI regularly. Wants to master Few-Shot prompting, avoid hallucinations, system instructions, and JSON schemas.',
      descEs: 'Usa IA con frecuencia. Quiere dominar Few-Shot, Cadenas de Pensamiento, esquemas JSON y evitar alucinaciones.',
    },
    {
      id: 'advanced',
      title: 'Tier 3: Technical Builder / Engineer',
      titleEs: 'Nivel 3: Desarrollador & Constructor',
      desc: 'Knows coding. Wants to learn RAG (Retrieval-Augmented Generation), vector databases, embeddings, and Function Calling.',
      descEs: 'Tiene conocimientos de código. Quiere aprender RAG, bases de datos vectoriales, embeddings y Tool Calling.',
    },
    {
      id: 'expert',
      title: 'Tier 4: AI Systems Architect',
      titleEs: 'Nivel 4: Arquitecto de Sistemas IA',
      desc: 'Advanced ML workflows: model fine-tuning, multi-agent evaluation, latency vs reasoning budget optimization.',
      descEs: 'Arquitectura avanzada: fine-tuning, frameworks multi-agente, evaluación de modelos y optimización de latencia.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      language,
      area,
      customArea: customArea.trim() || undefined,
      formatPreference,
      knowledgeLevel,
      timeCommitment,
      specificGoal: specificGoal.trim() || undefined,
      diagnosticResult,
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* Hero Intro */}
      <div className="text-center mb-8 sm:mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{isEs ? 'Ruta de Aprendizaje Adaptativa' : 'Personalized AI Learning Path'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isEs ? 'Construye tu Ruta de Aprendizaje de IA a Medida' : 'Design Your Personalized AI Learning Path'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          {isEs
            ? 'Responde 3 preguntas clave. Adaptaremos los mejores recursos de aprendizaje (videos, guías o laboratorios en inglés o español) en una tabla concisa y accionable.'
            : 'Answer 3 key questions. We adapt verified learning resources (videos, docs, or interactive labs in English or Spanish) into a concise, actionable roadmap table.'}
        </p>

        {/* Stepper indicators */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[0, 1, 2].map((sIndex) => (
            <button
              key={sIndex}
              onClick={() => setStep(sIndex)}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === sIndex
                  ? 'w-8 bg-indigo-600'
                  : step > sIndex
                  ? 'w-4 bg-indigo-400 dark:bg-indigo-700'
                  : 'w-4 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* STEP 0: LANGUAGE & DOMAIN */}
        {step === 0 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                1. {isEs ? '¿En qué idioma prefieres los recursos?' : 'Language Preference for Resources & Content'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    language === 'en'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold">English</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      DeepLearning.AI, Karpathy, fast.ai, PromptingGuide
                    </div>
                  </div>
                  {language === 'en' && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => onLanguageChange('es')}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    language === 'es'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold">Español</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      DotCSV, Platzi, Midudev, Google Cloud en Español
                    </div>
                  </div>
                  {language === 'es' && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              </div>
            </div>

            {/* Target Area / Professional Field */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                2. {isEs ? '¿En qué área trabajas o quieres aprender a aplicar la IA?' : 'What area or field do you work in or want to learn about?'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {domainOptions.map((item) => {
                  const Icon = item.icon;
                  const isSelected = area === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setArea(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {item.label}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom area option */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder={
                    isEs
                      ? 'O especifica otra profesión o rol (ej. Arquitectura, Recursos Humanos, Periodismo...)'
                      : 'Or specify custom industry/role (e.g., Architecture, Human Resources, Journalism...)'
                  }
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01]"
              >
                <span>{isEs ? 'Continuar: Formato y Tiempo' : 'Next: Formats & Schedule'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: FORMAT & SCHEDULE */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Format preference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                3. {isEs ? '¿Prefieres videos, documentos o laboratorios interactivos?' : 'Do you prefer videos, documents, or interactive labs?'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formatOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formatPreference === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormatPreference(opt.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {isEs ? opt.labelEs : opt.label}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                          {isEs ? opt.descEs : opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Commitment */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                4. {isEs ? '¿Cuánto tiempo puedes dedicar a la semana?' : 'How much time can you commit per week?'}
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: '1-2 hours/week', label: isEs ? '1-2 h / semana' : '1-2 hrs / week', sub: isEs ? 'Píldoras rápidas' : 'Microlearning' },
                  { id: '3-5 hours/week', label: isEs ? '3-5 h / semana' : '3-5 hrs / week', sub: isEs ? 'Ritmo recomendado' : 'Recommended' },
                  { id: '6+ hours/week', label: isEs ? '6+ h / semana' : '6+ hrs / week', sub: isEs ? 'Acelerado intensivo' : 'Intensive deep dive' },
                ].map((tc) => (
                  <button
                    key={tc.id}
                    type="button"
                    onClick={() => setTimeCommitment(tc.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      timeCommitment === tc.id
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                    <div className="text-xs font-bold">{tc.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{tc.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isEs ? 'Atrás' : 'Back'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01]"
              >
                <span>{isEs ? 'Continuar: Nivel y Diagnóstico' : 'Next: Knowledge Level & Diagnostic'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: KNOWLEDGE LEVEL & "SET THE BAR" */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Setting the bar banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {isEs ? '¿Quieres fijar tu nivel con un test rápido?' : 'Unsure of your starting level? "Set the Bar"'}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {diagnosticResult
                      ? isEs
                        ? `Diagnóstico completado: ${diagnosticResult.recommendedLevel.toUpperCase()} (${diagnosticResult.score}%)`
                        : `Diagnostic result applied: ${diagnosticResult.recommendedLevel.toUpperCase()} (${diagnosticResult.score}%)`
                      : isEs
                      ? '4 preguntas de 90 segundos que evalúan tus nociones y calibran tu ruta automáticamente.'
                      : 'Take a 4-question 90-second test to scientifically calibrate your starting tier.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenDiagnostic}
                className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                {diagnosticResult
                  ? isEs
                    ? 'Repetir Test'
                    : 'Retake Test'
                  : isEs
                  ? 'Hacer Test (90s)'
                  : 'Take Diagnostic (90s)'}
              </button>
            </div>

            {/* Knowledge Level Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                5. {isEs ? 'O selecciona manualmente tu nivel actual:' : 'Or manually select your starting level:'}
              </label>
              <div className="space-y-2.5">
                {levelOptions.map((lvl) => {
                  const isSelected = knowledgeLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setKnowledgeLevel(lvl.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {isEs ? lvl.titleEs : lvl.title}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                          {isEs ? lvl.descEs : lvl.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="p-1 rounded-full bg-indigo-600 text-white shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific goal input */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isEs ? '¿Tienes un objetivo específico? (Opcional)' : 'Any specific goal or project in mind? (Optional)'}</span>
              </label>
              <input
                type="text"
                placeholder={
                  isEs
                    ? 'Ej: Automatizar mis reportes semanales, entender cómo programar con Gemini API, aprender RAG...'
                    : 'E.g., Automate client proposals, build a custom knowledge-base bot, master prompt engineering...'
                }
                value={specificGoal}
                onChange={(e) => setSpecificGoal(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Navigation & Submit */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isEs ? 'Atrás' : 'Back'}</span>
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>
                  {isGenerating
                    ? isEs
                      ? 'Generando tu Ruta Personalizada...'
                      : 'Generating Personalized Path...'
                    : isEs
                    ? 'Generar Mi Ruta de Aprendizaje'
                    : 'Generate My Learning Path'}
                </span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
