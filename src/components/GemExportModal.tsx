import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, ExternalLink, FileCode, CheckCircle2 } from 'lucide-react';
import { GEM_SYSTEM_INSTRUCTIONS, GEM_STARTER_PROMPTS } from '../data/gemTemplate';
import { Language } from '../types';

interface GemExportModalProps {
  language: Language;
  onClose: () => void;
}

export const GemExportModal: React.FC<GemExportModalProps> = ({
  language,
  onClose,
}) => {
  const isEs = language === 'es';
  const [copiedInstructions, setCopiedInstructions] = useState(false);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);

  const handleCopyInstructions = () => {
    navigator.clipboard.writeText(GEM_SYSTEM_INSTRUCTIONS);
    setCopiedInstructions(true);
    setTimeout(() => setCopiedInstructions(false), 2000);
  };

  const handleCopyPrompt = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Google Gemini Gem
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEs ? 'Crear tu Propio Gem en Google Gemini' : 'Create Your Custom Gem in Google Gemini'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Setup Guide */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {isEs ? 'Cómo instalarlo en 3 sencillos pasos:' : 'How to install this in Google Gemini in 3 simple steps:'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                {isEs ? 'Paso 1' : 'Step 1'}
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                {isEs
                  ? 'Abre gemini.google.com y haz clic en "Gem Manager" (o Administrador de Gems) en la barra lateral.'
                  : 'Open gemini.google.com and click "Gem Manager" in the sidebar.'}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                {isEs ? 'Paso 2' : 'Step 2'}
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                {isEs
                  ? 'Haz clic en "Nuevo Gem", ponle el nombre "PathAI" y pega las Instrucciones de abajo.'
                  : 'Click "New Gem", name it "PathAI", and paste the System Instructions below.'}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                {isEs ? 'Paso 3' : 'Step 3'}
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                {isEs
                  ? 'Guarda el Gem. ¡Listo! Preguntará nivel, formato, área e idioma y dará la tabla.'
                  : 'Save your Gem. It will automatically interview users and produce adaptive roadmaps in tables!'}
              </p>
            </div>
          </div>
        </div>

        {/* System Instructions Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>{isEs ? 'Instrucciones del Sistema para el Gem (System Prompt)' : 'Gem System Instructions (Copy & Paste)'}</span>
            </label>
            <button
              onClick={handleCopyInstructions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              {copiedInstructions ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEs ? '¡Copiado!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Copiar Instrucciones' : 'Copy Instructions'}</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono max-h-64 overflow-y-auto leading-relaxed border border-slate-800 whitespace-pre-wrap">
            {GEM_SYSTEM_INSTRUCTIONS}
          </pre>
        </div>

        {/* Starter Prompts */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {isEs ? 'Prompts Iniciales Sugeridos (Starter Prompts):' : 'Suggested Gem Starter Prompts:'}
          </label>
          <div className="space-y-2">
            {GEM_STARTER_PROMPTS.map((promptText, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 font-medium">"{promptText}"</span>
                <button
                  onClick={() => handleCopyPrompt(idx, promptText)}
                  className="shrink-0 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"
                  title={isEs ? 'Copiar prompt' : 'Copy prompt'}
                >
                  {copiedPromptIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <a
            href="https://gemini.google.com/gems"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>{isEs ? 'Ir a Administrador de Gems en Google Gemini' : 'Go to Google Gemini Gem Manager'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
