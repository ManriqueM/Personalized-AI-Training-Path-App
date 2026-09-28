import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Award, RotateCcw, Sparkles } from 'lucide-react';
import { diagnosticQuestions } from '../data/diagnosticQuestions';
import { KnowledgeLevel, Language } from '../types';

interface DiagnosticQuizProps {
  language: Language;
  onComplete: (result: {
    recommendedLevel: KnowledgeLevel;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    summary: string;
  }) => void;
  onCancel: () => void;
}

export const DiagnosticQuiz: React.FC<DiagnosticQuizProps> = ({
  language,
  onComplete,
  onCancel,
}) => {
  const isEs = language === 'es';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = diagnosticQuestions[currentIndex];
  const totalQuestions = diagnosticQuestions.length;

  const handleSelectOption = (optionId: string) => {
    if (showExplanation) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Compute final score and recommended tier
  const calculateResult = () => {
    let totalScore = 0;
    let accurateCount = 0;

    diagnosticQuestions.forEach((q) => {
      const selectedId = selectedAnswers[q.id];
      const opt = q.options.find((o) => o.id === selectedId);
      if (opt) {
        totalScore += opt.levelScore;
        if (opt.isTechnicallyAccurate) {
          accurateCount++;
        }
      }
    });

    const averageLevel = totalScore / totalQuestions;
    let recommendedLevel: KnowledgeLevel = 'beginner';
    let summary = '';

    if (averageLevel >= 3.2 && accurateCount >= 3) {
      recommendedLevel = 'advanced';
      summary = isEs
        ? 'Excelente nivel técnico. Tienes fundamentos sólidos en prompts, RAG y arquitectura de LLMs. Tu ruta se enfocará en optimización avanzada, llamadas a funciones y agentes.'
        : 'Outstanding technical grounding. You understand prompts, RAG, and LLM architecture. Your path will emphasize advanced orchestration, function calling, and agent workflows.';
    } else if (averageLevel >= 2.0 && accurateCount >= 2) {
      recommendedLevel = 'intermediate';
      summary = isEs
        ? 'Nivel intermedio práctico. Usas herramientas de IA pero te beneficiarás enormemente de dominar Few-Shot, Chain-of-Thought, esquemas JSON y reducción de alucinaciones.'
        : 'Practical intermediate user. You use AI frequently, but will gain massive leverage by mastering few-shot exemplars, Chain-of-Thought, structured outputs, and guardrails.';
    } else {
      recommendedLevel = 'beginner';
      summary = isEs
        ? 'Punto de partida ideal para principiantes. Empezaremos desde cero absoluto: qué es un prompt, cómo estructurar instrucciones y cómo sacarle provecho a ChatGPT y Gemini sin complicaciones.'
        : 'Ideal foundational starting point. We will start from scratch: understanding prompts, crafting direct instructions, and avoiding common pitfalls in tools like Gemini and ChatGPT.';
    }

    const percentage = Math.round((accurateCount / totalQuestions) * 100);

    return {
      recommendedLevel,
      score: percentage,
      correctAnswers: accurateCount,
      totalQuestions,
      summary,
    };
  };

  if (isFinished) {
    const result = calculateResult();
    const levelLabels: Record<KnowledgeLevel, { en: string; es: string; color: string }> = {
      beginner: { en: 'Tier 1: AI Explorer (Beginner)', es: 'Nivel 1: Explorador de IA (Principiante)', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200' },
      intermediate: { en: 'Tier 2: Applied Practitioner (Intermediate)', es: 'Nivel 2: Practicante Aplicado (Intermedio)', color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border-violet-200' },
      advanced: { en: 'Tier 3: AI Builder & Engineer (Advanced)', es: 'Nivel 3: Desarrollador & Arquitecto (Avanzado)', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200' },
      expert: { en: 'Tier 4: Systems Architect', es: 'Nivel 4: Arquitecto de Sistemas', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200' },
    };

    const currentBadge = levelLabels[result.recommendedLevel];

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {isEs ? 'Diagnóstico Completado' : 'Diagnostic Complete'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {isEs ? 'Tu Nivel de IA Diagnosticado' : 'Your Assessed AI Starting Bar'}
            </h2>
          </div>

          <div className={`inline-block px-4 py-2 rounded-xl border font-bold text-sm ${currentBadge.color}`}>
            {isEs ? currentBadge.es : currentBadge.en}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            {result.summary}
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto py-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">{isEs ? 'Aciertos' : 'Accurate Answers'}</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {result.correctAnswers} / {result.totalQuestions}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">{isEs ? 'Puntaje de Retención' : 'Proficiency Score'}</span>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {result.score}%
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSelectedAnswers({});
                setCurrentIndex(0);
                setShowExplanation(false);
                setIsFinished(false);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {isEs ? 'Repetir Test' : 'Retake Diagnostic'}
            </button>
            <button
              onClick={() => onComplete(result)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4" />
              {isEs ? 'Aplicar a mi Ruta de Aprendizaje' : 'Apply to My Learning Path'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedOptId = selectedAnswers[currentQ.id];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {isEs ? 'Evaluación de Diagnóstico: Fija tu Barra' : 'Diagnostic Check: Set Your Bar'}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {currentQ.concept}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {currentIndex + 1} / {totalQuestions}
          </span>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2"
          >
            {isEs ? 'Omitir' : 'Skip'}
          </button>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
          {isEs ? currentQ.questionEs : currentQ.question}
        </h4>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOptId === opt.id;
          let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/60';

          if (showExplanation) {
            if (isSelected) {
              btnStyle = opt.isTechnicallyAccurate
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                : 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100';
            } else if (opt.isTechnicallyAccurate) {
              btnStyle = 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200';
            } else {
              btnStyle = 'opacity-60 border-slate-200 dark:border-slate-800';
            }
          } else if (isSelected) {
            btnStyle = 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40';
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start justify-between gap-3 ${btnStyle}`}
            >
              <span className="flex-1 font-medium leading-relaxed">
                {isEs ? opt.textEs : opt.text}
              </span>
              {showExplanation && (
                <span className="shrink-0 mt-0.5">
                  {opt.isTechnicallyAccurate ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-amber-500" />
                  ) : null}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 space-y-1 mb-6 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold">
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isEs ? 'Por qué importa este concepto:' : 'Why this concept matters:'}</span>
          </div>
          <p className="leading-relaxed">
            {isEs ? currentQ.explanationEs : currentQ.explanation}
          </p>
        </div>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {isEs ? 'Salir de la prueba' : 'Exit test'}
        </button>

        {showExplanation && (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
          >
            <span>
              {currentIndex < totalQuestions - 1
                ? isEs
                  ? 'Siguiente Pregunta'
                  : 'Next Question'
                : isEs
                ? 'Ver Resultados'
                : 'See Results'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
