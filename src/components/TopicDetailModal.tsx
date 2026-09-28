import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  ExternalLink,
  Lightbulb,
  BookOpen,
  Video,
  FileText,
  Play,
} from 'lucide-react';
import { Language, RoadmapItem } from '../types';

interface TopicDetailModalProps {
  item: RoadmapItem | null;
  language: Language;
  onClose: () => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  item,
  language,
  onClose,
}) => {
  if (!item) return null;

  const isEs = language === 'es';
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleAskTutor = async (customQ?: string) => {
    const qToSend = customQ || question;
    setLoading(true);
    setTutorResponse(null);

    try {
      const res = await fetch('/api/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: item.topic,
          conceptSummary: item.conceptSummary,
          userQuestion: qToSend,
          language,
        }),
      });

      const data = await res.json();
      if (data.explanation) {
        setTutorResponse(data.explanation);
      } else {
        setTutorResponse(
          isEs
            ? 'No pudimos conectar con el tutor en este momento. Inténtalo de nuevo o revisa el recurso recomendado.'
            : 'Unable to connect to AI tutor. Please check the recommended resource link.'
        );
      }
    } catch (err) {
      setTutorResponse(
        isEs
          ? 'Error de conexión. Puedes probar la tarea práctica directamente en Gemini o ChatGPT.'
          : 'Connection error. You can try the actionable task directly in Gemini or ChatGPT.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTask = () => {
    navigator.clipboard.writeText(item.actionableTask);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const sampleQuestions = isEs
    ? [
        '¿Cómo aplico este concepto si nunca antes he usado IA?',
        'Dame un ejemplo de prompt "Antes vs Después" para mi trabajo.',
        '¿Cuáles son los 3 errores más comunes que debo evitar?',
      ]
    : [
        'How do I apply this if I am completely new to AI?',
        'Give me a "Before vs After" prompt example for my daily tasks.',
        'What are the 3 most common mistakes to avoid here?',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {item.phase}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                {item.format} • {item.duration}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {item.topic}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concept & Resource summary */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isEs ? 'Concepto Clave' : 'Key Concept'}</span>
            </h4>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {item.conceptSummary}
            </p>
          </div>

          {/* Actionable Prompt */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-indigo-500" />
                <span>{isEs ? 'Reto / Prompt para Probar' : 'Challenge / Prompt to Test'}</span>
              </span>
              <button
                onClick={handleCopyTask}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isEs ? '¡Copiado!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isEs ? 'Copiar Prompt' : 'Copy Prompt'}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/60 leading-relaxed">
              {item.actionableTask}
            </p>
          </div>

          {/* REPUTABLE LEARNING MEDIA SECTION: YOUTUBE & ARTICLES */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isEs ? 'Recursos de Aprendizaje' : 'Learning Resources'}</span>
              </h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                {isEs ? '100% Gratis' : '100% Free'}
              </span>
            </div>

            {/* YouTube Video Card */}
            {item.videoResource && (
              <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md">
                      <Video className="w-3 h-3 text-rose-600" />
                      YouTube • {item.videoResource.channel}
                    </span>
                    {item.videoResource.duration && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.videoResource.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {item.videoResource.title}
                  </p>
                </div>
                <a
                  href={item.videoResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isEs ? 'Ver en YouTube' : 'Watch Video'}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>
              </div>
            )}

            {/* Reputable Article / Documentation Card */}
            {item.articleResource && (
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md">
                      <FileText className="w-3 h-3 text-blue-600" />
                      {isEs ? 'Artículo / Documentación' : 'Article / Documentation'} • {item.articleResource.publication}
                    </span>
                    {item.articleResource.readingTime && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.articleResource.readingTime}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {item.articleResource.title}
                  </p>
                </div>
                <a
                  href={item.articleResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{isEs ? 'Leer Artículo' : 'Read Article'}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>
              </div>
            )}

            {/* Primary Resource link if different */}
            {(!item.videoResource || item.resourceUrl !== item.videoResource.url) &&
              (!item.articleResource || item.resourceUrl !== item.articleResource.url) && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs">
                  <div>
                    <span className="text-slate-500">{isEs ? 'Recurso Principal:' : 'Primary Resource:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white ml-1.5">{item.resourceName}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({item.platform})</span>
                  </div>
                  <a
                    href={item.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{isEs ? 'Abrir Enlace' : 'Open Link'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
          </div>
        </div>

        {/* AI Tutor Deep Dive Section */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEs ? 'Tutor IA Interactivo' : 'Interactive AI Tutor'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isEs
                  ? 'Haz una pregunta sobre este tema o pídele que adapte el prompt a tu caso.'
                  : 'Ask any question about this topic or request custom prompt refinement.'}
              </p>
            </div>
          </div>

          {/* Quick prompt buttons */}
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((qText, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(qText);
                  handleAskTutor(qText);
                }}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              >
                {qText}
              </button>
            ))}
          </div>

          {/* Input & Ask button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAskTutor()}
              placeholder={isEs ? 'Escribe tu pregunta o duda...' : 'Type your question for the tutor...'}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleAskTutor()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isEs ? 'Preguntar' : 'Ask'}</span>
            </button>
          </div>

          {/* Tutor Response Box */}
          {tutorResponse && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed animate-fadeIn">
              {tutorResponse}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
