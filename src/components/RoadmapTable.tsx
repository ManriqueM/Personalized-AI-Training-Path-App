import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Search,
  Filter,
  Video,
  FileText,
  Terminal,
  Layers,
  GraduationCap,
  Sparkles,
  Download,
  Info,
  Play,
  X,
} from 'lucide-react';
import { Language, RoadmapItem, UserPreferences } from '../types';

interface RoadmapTableProps {
  items: RoadmapItem[];
  preferences: UserPreferences;
  roadmapTitle?: string;
  roadmapSummary?: string;
  onToggleComplete: (id: string) => void;
  onOpenTopicDetail: (item: RoadmapItem) => void;
  onReset: () => void;
}

export const RoadmapTable: React.FC<RoadmapTableProps> = ({
  items,
  preferences,
  roadmapTitle,
  roadmapSummary,
  onToggleComplete,
  onOpenTopicDetail,
  onReset,
}) => {
  const isEs = preferences.language === 'es';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [tableCopied, setTableCopied] = useState(false);

  // Extract unique phases
  const phases = Array.from(new Set(items.map((i) => i.phase)));

  // Filter items
  const filteredItems = items.filter((item) => {
    if (hideCompleted && item.completed) return false;
    if (selectedFormat !== 'all' && item.format.toLowerCase() !== selectedFormat.toLowerCase()) return false;
    if (selectedPhase !== 'all' && item.phase !== selectedPhase) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = item.topic.toLowerCase().includes(q);
      const matchConcept = item.conceptSummary.toLowerCase().includes(q);
      const matchResource = item.resourceName.toLowerCase().includes(q);
      const matchPlatform = item.platform.toLowerCase().includes(q);
      const matchVideo = item.videoResource?.channel?.toLowerCase().includes(q) || item.videoResource?.title?.toLowerCase().includes(q);
      const matchArticle = item.articleResource?.publication?.toLowerCase().includes(q) || item.articleResource?.title?.toLowerCase().includes(q);
      if (!matchTopic && !matchConcept && !matchResource && !matchPlatform && !matchVideo && !matchArticle) return false;
    }
    return true;
  });

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleCopyTask = (taskId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTaskId(taskId);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  const handleCopyMarkdownTable = () => {
    let md = `### ${isEs ? 'Ruta de Aprendizaje de IA Personalizada' : 'Personalized AI Learning Path'} (${preferences.customArea || preferences.area} - ${preferences.knowledgeLevel})\n\n`;
    md += `| ${isEs ? 'Estado' : 'Status'} | ${isEs ? 'Fase' : 'Phase'} | ${isEs ? 'Tema y Concepto Clave' : 'Topic & Key Concept'} | ${isEs ? 'Formato' : 'Format'} | ${isEs ? 'Recursos & Fuentes Reputadas' : 'Resources & Reputable Sources'} | ${isEs ? 'Tiempo Est.' : 'Est. Time'} | ${isEs ? 'Reto / Prompt Práctico' : 'Actionable Challenge / Prompt'} |\n`;
    md += `| :---: | :--- | :--- | :--- | :--- | :---: | :--- |\n`;

    items.forEach((item) => {
      const status = item.completed ? '✅' : '⏳';
      let cleanResource = `[${item.resourceName}](${item.resourceUrl})`;
      if (item.videoResource) {
        cleanResource += ` <br/>▶ [YouTube (${item.videoResource.channel})](${item.videoResource.url})`;
      }
      if (item.articleResource) {
        cleanResource += ` <br/>📄 [Article (${item.articleResource.publication})](${item.articleResource.url})`;
      }
      const cleanTask = item.actionableTask.replace(/\|/g, '\\|');
      md += `| ${status} | ${item.phase} | **${item.topic}**: ${item.conceptSummary} | ${item.format} (${item.platform}) | ${cleanResource} | ${item.duration} | ${cleanTask} |\n`;
    });

    navigator.clipboard.writeText(md);
    setTableCopied(true);
    setTimeout(() => setTableCopied(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = [
      'Phase',
      'Topic',
      'Concept Summary',
      'Format',
      'Platform',
      'Primary Resource',
      'Resource URL',
      'YouTube Video Title',
      'YouTube Channel',
      'YouTube URL',
      'Article Title',
      'Article Publication',
      'Article URL',
      'Est Time',
      'Actionable Task',
      'Status',
    ];
    const rows = items.map((i) => [
      `"${i.phase.replace(/"/g, '""')}"`,
      `"${i.topic.replace(/"/g, '""')}"`,
      `"${i.conceptSummary.replace(/"/g, '""')}"`,
      `"${i.format}"`,
      `"${i.platform.replace(/"/g, '""')}"`,
      `"${i.resourceName.replace(/"/g, '""')}"`,
      `"${i.resourceUrl}"`,
      `"${(i.videoResource?.title || '').replace(/"/g, '""')}"`,
      `"${(i.videoResource?.channel || '').replace(/"/g, '""')}"`,
      `"${i.videoResource?.url || ''}"`,
      `"${(i.articleResource?.title || '').replace(/"/g, '""')}"`,
      `"${(i.articleResource?.publication || '').replace(/"/g, '""')}"`,
      `"${i.articleResource?.url || ''}"`,
      `"${i.duration}"`,
      `"${i.actionableTask.replace(/"/g, '""')}"`,
      `"${i.completed ? 'Completed' : 'Pending'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ai_learning_path_${preferences.knowledgeLevel}_${preferences.area}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-500" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'interactive':
        return <Terminal className="w-3.5 h-3.5 text-emerald-500" />;
      case 'course':
        return <GraduationCap className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {isEs ? 'Ruta de Aprendizaje Personalizada' : 'Personalized AI Learning Path'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold capitalize">
                {preferences.customArea || preferences.area.replace('_', ' ')}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 font-semibold capitalize">
                {preferences.knowledgeLevel} Level
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold capitalize">
                {preferences.formatPreference === 'video'
                  ? '🎥 Videos'
                  : preferences.formatPreference === 'text'
                  ? (isEs ? '📄 Lecturas' : '📄 Reading')
                  : preferences.formatPreference === 'interactive'
                  ? (isEs ? '💻 Laboratorios' : '💻 Hands-on Labs')
                  : (isEs ? '⚡ Mezcla Equilibrada' : '⚡ Balanced Mix')}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
                ⏱ {preferences.timeCommitment}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {roadmapTitle ||
                (isEs
                  ? `Plan de Aprendizaje de IA: ${preferences.customArea || preferences.area}`
                  : `AI Curriculum: ${preferences.customArea || preferences.area.replace('_', ' ')}`)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {roadmapSummary ||
                (isEs
                  ? 'Currículo optimizado con canales de YouTube reputados, documentación oficial y ejercicios prácticos.'
                  : 'Concise curriculum prioritized on reputable YouTube channels, authoritative documentation, and practical exercises.')}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {preferences.specificGoal && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold">{isEs ? '🎯 Objetivo Clave:' : '🎯 Target Milestone:'}</span>
                  <span>{preferences.specificGoal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl min-w-[140px]">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>{isEs ? 'Progreso' : 'Progress'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 text-center">
                {completedCount} / {items.length} {isEs ? 'pasos listos' : 'steps completed'}
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2">
              <button
                onClick={handleCopyMarkdownTable}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isEs ? 'Copiar tabla completa en formato Markdown' : 'Copy entire table as Markdown'}
              >
                {tableCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{tableCopied ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar Tabla' : 'Copy Table')}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isEs ? 'Exportar a CSV para Excel o Google Sheets' : 'Export to CSV'}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isEs ? 'Descargar CSV' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar por tema, canal (Karpathy, DotCSV...), o concepto...'
                : 'Search by topic, channel (Karpathy, DotCSV...), or concept...'
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format selector */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedFormat('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedFormat === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isEs ? 'Todos' : 'All'}
            </button>
            <button
              onClick={() => setSelectedFormat('video')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                selectedFormat === 'video'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-rose-500'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => setSelectedFormat('document')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                selectedFormat === 'document'
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-blue-500'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>{isEs ? 'Lecturas' : 'Docs'}</span>
            </button>
          </div>

          {/* Phase selector */}
          {phases.length > 1 && (
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">{isEs ? 'Todas las Fases' : 'All Phases'}</option>
              {phases.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}

          {/* Hide completed toggle */}
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              hideCompleted
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {isEs ? 'Ocultar completados' : 'Hide completed'}
          </button>
        </div>
      </div>

      {/* DESKTOP ROADMAP TABLE */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-10 text-center">✓</th>
                <th className="py-3 px-4 w-44">{isEs ? 'Fase' : 'Phase'}</th>
                <th className="py-3 px-4 min-w-[220px]">{isEs ? 'Tema & Concepto Clave' : 'Topic & Key Concept'}</th>
                <th className="py-3 px-3 w-28">{isEs ? 'Formato' : 'Format'}</th>
                <th className="py-3 px-4 min-w-[240px]">{isEs ? 'Recursos & Fuentes Reputadas' : 'Resources & Reputable Links'}</th>
                <th className="py-3 px-3 w-20 text-center">{isEs ? 'Tiempo' : 'Est. Time'}</th>
                <th className="py-3 px-4 min-w-[260px]">{isEs ? 'Reto / Prompt Práctico' : 'Actionable Challenge / Prompt'}</th>
                <th className="py-3 px-3 w-16 text-center">{isEs ? 'Tutor' : 'Tutor'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    {isEs
                      ? 'No hay temas que coincidan con los filtros aplicados.'
                      : 'No topics match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isDone = !!item.completed;
                  return (
                    <tr
                      key={item.id}
                      className={`group transition-colors ${
                        isDone
                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center align-top">
                        <button
                          onClick={() => onToggleComplete(item.id)}
                          className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mt-0.5 cursor-pointer"
                          title={isDone ? (isEs ? 'Marcar como pendiente' : 'Mark as pending') : (isEs ? 'Marcar como completado' : 'Mark as complete')}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      </td>

                      {/* Phase */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="inline-block text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {item.phase}
                        </span>
                      </td>

                      {/* Topic & Concept */}
                      <td className="py-3.5 px-4 align-top">
                        <div className={`font-bold text-slate-900 dark:text-white leading-snug ${isDone ? 'line-through text-slate-400' : ''}`}>
                          {item.topic}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {item.conceptSummary}
                        </p>
                      </td>

                      {/* Format & Platform */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          {getFormatIcon(item.format)}
                          <span>{item.format}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate max-w-[120px]">
                          {item.platform}
                        </span>
                      </td>

                      {/* Free Resource & Reputable Links */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          {/* Primary Resource Link */}
                          <a
                            href={item.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline leading-snug"
                          >
                            <span>{item.resourceName}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                          </a>

                          {/* YouTube Video Badge */}
                          {item.videoResource && (
                            <div>
                              <a
                                href={item.videoResource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-[10px] font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 transition-colors shadow-2xs"
                                title={`${item.videoResource.channel}: ${item.videoResource.title}`}
                              >
                                <Video className="w-3 h-3 text-rose-600 shrink-0" />
                                <span className="truncate max-w-[150px]">YouTube: {item.videoResource.channel}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            </div>
                          )}

                          {/* Authoritative Article Badge */}
                          {item.articleResource && (
                            <div>
                              <a
                                href={item.articleResource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 transition-colors shadow-2xs"
                                title={`${item.articleResource.publication}: ${item.articleResource.title}`}
                              >
                                <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                                <span className="truncate max-w-[150px]">Doc: {item.articleResource.publication}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-3 align-top text-center">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {item.duration}
                        </span>
                      </td>

                      {/* Actionable Task / Prompt */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-mono relative group/task">
                          {item.actionableTask}
                          <button
                            onClick={() => handleCopyTask(item.id, item.actionableTask)}
                            className="mt-2 flex items-center gap-1 text-[10px] font-sans font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                            title={isEs ? 'Copiar prompt al portapapeles' : 'Copy prompt to clipboard'}
                          >
                            {copiedTaskId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-600">{isEs ? 'Copiado' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{isEs ? 'Copiar Prompt' : 'Copy Prompt'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Tutor Deep Dive */}
                      <td className="py-3.5 px-3 align-top text-center">
                        <button
                          onClick={() => onOpenTopicDetail(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer"
                          title={isEs ? 'Abrir tutor IA para este tema' : 'Open AI tutor for this topic'}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isEs ? 'Tutor' : 'Tutor'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE & TABLET CARD VIEW */}
      <div className="lg:hidden space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
            {isEs ? 'No hay temas que coincidan con los filtros.' : 'No topics match the selected filters.'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isDone = !!item.completed;
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                  isDone ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/10' : ''
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className="text-slate-400 hover:text-emerald-500 cursor-pointer"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {item.phase}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {item.duration}
                  </span>
                </div>

                {/* Topic Title & Concept */}
                <div>
                  <h3 className={`text-base font-bold text-slate-900 dark:text-white ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {item.topic}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.conceptSummary}
                  </p>
                </div>

                {/* Resource Links & Reputable Badges */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      {getFormatIcon(item.format)}
                      <span>{item.format} • {item.platform}</span>
                    </div>
                  </div>

                  {/* Primary Link */}
                  <a
                    href={item.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{item.resourceName}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>

                  {/* Reputable Links container */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    {item.videoResource && (
                      <a
                        href={item.videoResource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-[11px] font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                      >
                        <Video className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>YouTube ({item.videoResource.channel})</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}

                    {item.articleResource && (
                      <a
                        href={item.articleResource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60"
                      >
                        <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Doc ({item.articleResource.publication})</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Task / Prompt */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isEs ? 'Reto / Prompt Práctico' : 'Actionable Practice Prompt'}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                    {item.actionableTask}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleCopyTask(item.id, item.actionableTask)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                    >
                      {copiedTaskId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600">{isEs ? 'Copiado' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isEs ? 'Copiar Prompt' : 'Copy Prompt'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onOpenTopicDetail(item)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isEs ? 'Preguntar a Tutor IA' : 'AI Tutor'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
