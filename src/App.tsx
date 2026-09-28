/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DiagnosticQuiz } from './components/DiagnosticQuiz';
import { RoadmapTable } from './components/RoadmapTable';
import { TopicDetailModal } from './components/TopicDetailModal';
import { Language, RoadmapItem, UserPreferences } from './types';
import { generateFullRoadmap, buildPersonalizedRoadmap, enrichRoadmapItemsWithReputableSources } from './services/roadmapGenerator';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [roadmapTitle, setRoadmapTitle] = useState<string>('');
  const [roadmapSummary, setRoadmapSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals
  const [showDiagnosticQuiz, setShowDiagnosticQuiz] = useState(false);
  const [activeTopicDetail, setActiveTopicDetail] = useState<RoadmapItem | null>(null);

  // Diagnostic result state
  const [diagnosticResult, setDiagnosticResult] = useState<UserPreferences['diagnosticResult'] | undefined>();

  // Restore saved roadmap & preferences from localStorage if exists
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('pathai_language') as Language;
      if (savedLang === 'en' || savedLang === 'es') {
        setLanguage(savedLang);
      }

      const savedPrefs = localStorage.getItem('pathai_preferences');
      const savedItems = localStorage.getItem('pathai_roadmap');
      const savedTitle = localStorage.getItem('pathai_roadmap_title');
      const savedSummary = localStorage.getItem('pathai_roadmap_summary');

      if (savedPrefs && savedItems) {
        setPreferences(JSON.parse(savedPrefs));
        setRoadmapItems(JSON.parse(savedItems));
        if (savedTitle) setRoadmapTitle(savedTitle);
        if (savedSummary) setRoadmapSummary(savedSummary);
      }
    } catch (e) {
      console.error('Failed to load saved state from localStorage:', e);
    }
  }, []);

  // Update language handler
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('pathai_language', lang);

    // If a roadmap is already generated, regenerate with new language
    if (preferences && roadmapItems.length > 0) {
      const updatedPrefs = { ...preferences, language: lang };
      setPreferences(updatedPrefs);
      const generated = generateFullRoadmap(updatedPrefs);
      // preserve completed status
      const completedSet = new Set(roadmapItems.filter((i) => i.completed).map((i) => i.id));
      const merged = generated.items.map((item) => ({
        ...item,
        completed: completedSet.has(item.id),
      }));
      setRoadmapItems(merged);
      setRoadmapTitle(generated.roadmapTitle);
      setRoadmapSummary(generated.summary);
      localStorage.setItem('pathai_preferences', JSON.stringify(updatedPrefs));
      localStorage.setItem('pathai_roadmap', JSON.stringify(merged));
      localStorage.setItem('pathai_roadmap_title', generated.roadmapTitle);
      localStorage.setItem('pathai_roadmap_summary', generated.summary);
    }
  };

  // Toggle item complete status
  const handleToggleComplete = (itemId: string) => {
    setRoadmapItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      localStorage.setItem('pathai_roadmap', JSON.stringify(updated));
      return updated;
    });
  };

  // Generate roadmap handler
  const handleGenerateRoadmap = async (prefs: UserPreferences) => {
    setIsGenerating(true);
    setPreferences(prefs);

    try {
      // First attempt to call server-side Gemini API
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      const data = await res.json();

      let itemsToUse: RoadmapItem[] = [];
      let titleToUse = '';
      let summaryToUse = '';

      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        const rawItems = data.items.map((it: any, index: number) => ({
          ...it,
          id: it.id || `step-${index + 1}`,
          completed: false,
        }));
        itemsToUse = enrichRoadmapItemsWithReputableSources(rawItems, prefs.language);
        titleToUse = data.roadmapTitle || '';
        summaryToUse = data.summary || '';
      } else {
        // High-quality deterministic dynamic fallback
        const fallback = generateFullRoadmap(prefs);
        itemsToUse = fallback.items;
        titleToUse = fallback.roadmapTitle;
        summaryToUse = fallback.summary;
      }

      setRoadmapItems(itemsToUse);
      setRoadmapTitle(titleToUse);
      setRoadmapSummary(summaryToUse);
      localStorage.setItem('pathai_preferences', JSON.stringify(prefs));
      localStorage.setItem('pathai_roadmap', JSON.stringify(itemsToUse));
      localStorage.setItem('pathai_roadmap_title', titleToUse);
      localStorage.setItem('pathai_roadmap_summary', summaryToUse);
    } catch (err) {
      console.warn('API error, building from curated engine:', err);
      const fallback = generateFullRoadmap(prefs);
      setRoadmapItems(fallback.items);
      setRoadmapTitle(fallback.roadmapTitle);
      setRoadmapSummary(fallback.summary);
      localStorage.setItem('pathai_preferences', JSON.stringify(prefs));
      localStorage.setItem('pathai_roadmap', JSON.stringify(fallback.items));
      localStorage.setItem('pathai_roadmap_title', fallback.roadmapTitle);
      localStorage.setItem('pathai_roadmap_summary', fallback.summary);
    } finally {
      setIsGenerating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset handler
  const handleReset = () => {
    if (
      window.confirm(
        language === 'es'
          ? '¿Deseas reiniciar y crear una nueva ruta de aprendizaje?'
          : 'Do you want to reset and design a new learning path?'
      )
    ) {
      setPreferences(null);
      setRoadmapItems([]);
      setRoadmapTitle('');
      setRoadmapSummary('');
      setDiagnosticResult(undefined);
      localStorage.removeItem('pathai_preferences');
      localStorage.removeItem('pathai_roadmap');
      localStorage.removeItem('pathai_roadmap_title');
      localStorage.removeItem('pathai_roadmap_summary');
    }
  };

  // Diagnostic Quiz completion
  const handleDiagnosticComplete = (result: NonNullable<UserPreferences['diagnosticResult']>) => {
    setDiagnosticResult(result);
    setShowDiagnosticQuiz(false);
  };

  const completedCount = roadmapItems.filter((i) => i.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        hasRoadmap={roadmapItems.length > 0}
        onReset={handleReset}
        completedCount={completedCount}
        totalCount={roadmapItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {showDiagnosticQuiz ? (
          <div className="py-10 px-4">
            <DiagnosticQuiz
              language={language}
              onComplete={handleDiagnosticComplete}
              onCancel={() => setShowDiagnosticQuiz(false)}
            />
          </div>
        ) : roadmapItems.length > 0 && preferences ? (
          <RoadmapTable
            items={roadmapItems}
            preferences={preferences}
            roadmapTitle={roadmapTitle}
            roadmapSummary={roadmapSummary}
            onToggleComplete={handleToggleComplete}
            onOpenTopicDetail={(item) => setActiveTopicDetail(item)}
            onReset={handleReset}
          />
        ) : (
          <OnboardingWizard
            language={language}
            onLanguageChange={handleLanguageChange}
            onSubmit={handleGenerateRoadmap}
            onOpenDiagnostic={() => setShowDiagnosticQuiz(true)}
            diagnosticResult={diagnosticResult}
            isGenerating={isGenerating}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            PathAI • {language === 'es' ? 'Creador de Rutas de IA Adaptativas' : 'Personalized AI Learning Path Builder'}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDiagnosticQuiz(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              {language === 'es' ? 'Test de Diagnóstico ("Set the Bar")' : 'Diagnostic Check ("Set the Bar")'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeTopicDetail && (
        <TopicDetailModal
          item={activeTopicDetail}
          language={language}
          onClose={() => setActiveTopicDetail(null)}
        />
      )}
    </div>
  );
}
