import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Sparkles,
  ExternalLink,
  Users,
  DollarSign,
  HeartHandshake,
} from 'lucide-react';
import { Language } from '../types';

interface ShareModalProps {
  language: Language;
  onClose: () => void;
  onOpenGemModal: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  language,
  onClose,
  onOpenGemModal,
}) => {
  const isEs = language === 'es';
  const [copiedLink, setCopiedLink] = useState(false);

  // Use the public shared URL or window.location.href
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-jmegat4zxszntdwax44apn-174281418069.us-east5.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {isEs ? '100% Gratuito • Sin Facturación' : '100% Free • Zero Billing'}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEs ? 'Comparte PathAI con Amigos y Colegas' : 'Share PathAI with Friends & Teams'}
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

        {/* 100% Free Guarantee Banner */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isEs
                ? 'Garantía Gratuita para ti y tus usuarios (Cero costos / No Billing)'
                : 'Free Forever Guarantee for You and Your Users (Zero Billing)'}
            </span>
          </div>
          <ul className="text-xs text-emerald-900/90 dark:text-emerald-200/90 space-y-1.5 pl-6 list-disc">
            <li>
              <strong>{isEs ? 'Para ti (el creador):' : 'For you (the creator):'}</strong>{' '}
              {isEs
                ? 'El motor de currículo corre con lógica cliente y recursos abiertos verificados. No incurres en cargos de facturación por compartir el enlace.'
                : 'The curriculum engine runs client-side with verified open resources. You incur zero API billing charges when sharing the link.'}
            </li>
            <li>
              <strong>{isEs ? 'Para quien lo recibe:' : 'For your recipients:'}</strong>{' '}
              {isEs
                ? 'No requiere tarjeta de crédito, registro obligatorio ni pagos. Todos los cursos, videos y guías recomendados en la tabla son 100% gratuitos y públicos.'
                : 'No credit card, no forced account paywalls, and no subscription needed. All recommended guides, video courses, and interactive sandboxes in the table are 100% free and open.'}
            </li>
          </ul>
        </div>

        {/* Share Link Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>{isEs ? 'Enlace Directo de la Aplicación:' : 'Direct Shareable App Link:'}</span>
            <span className="text-[11px] text-slate-500 font-normal">
              {isEs ? 'Listo para enviar por WhatsApp, Slack, Teams o Email' : 'Ready for WhatsApp, Slack, Teams, or Email'}
            </span>
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <Globe className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 text-xs bg-transparent text-slate-800 dark:text-slate-200 font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEs ? '¡Copiado!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Copiar Enlace' : 'Copy Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2 Ways to Share */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>{isEs ? 'Opción A: Compartir como Web App' : 'Option A: Share as Web App'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isEs
                ? 'Comparte el enlace de la web directamente. Cualquier persona puede hacer el test de diagnóstico ("Set the Bar") y generar su tabla personalizada gratis en segundos.'
                : 'Share this web link directly. Anyone can take the "Set the Bar" diagnostic quiz and generate their tailored curriculum table in seconds for free.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>{isEs ? 'Opción B: Compartir como Google Gem' : 'Option B: Share as Google Gem'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isEs
                ? 'Copia el System Prompt en Google Gemini. Puedes crear un Gem gratuito y compartir el Gem con tus colegas para que interactúen directo en su cuenta de Gemini.'
                : 'Copy our tested System Prompt into Google Gemini to build a custom Gem, then share the Gem link directly within Google Workspace / Gemini for free.'}
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenGemModal();
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{isEs ? 'Ver Prompt del Gem' : 'View Gem Prompt'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {isEs ? 'Cerrar' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
