export type Language = 'en' | 'es';

export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type FormatPreference = 'all' | 'video' | 'text' | 'interactive';

export interface UserPreferences {
  language: Language;
  area: string;
  customArea?: string;
  formatPreference: FormatPreference;
  knowledgeLevel: KnowledgeLevel;
  timeCommitment: string; // e.g. "1-2 hours/week", "3-5 hours/week", "6+ hours/week"
  specificGoal?: string;
  diagnosticResult?: {
    score: number; // 0 - 100
    totalQuestions: number;
    correctAnswers: number;
    recommendedLevel: KnowledgeLevel;
    summary: string;
  };
}

export interface RoadmapItem {
  id: string;
  phase: string;
  phaseOrder: number;
  topic: string;
  conceptSummary: string;
  format: 'Video' | 'Document' | 'Interactive' | 'Course';
  resourceName: string;
  resourceUrl: string;
  isFree: boolean;
  platform: string;
  duration: string;
  actionableTask: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  language: Language | 'both';
  completed?: boolean;
  notes?: string;
  videoResource?: {
    title: string;
    url: string;
    channel: string;
    duration?: string;
  };
  articleResource?: {
    title: string;
    url: string;
    publication: string;
    readingTime?: string;
  };
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  questionEs: string;
  concept: string;
  options: {
    id: string;
    text: string;
    textEs: string;
    levelScore: number; // 1 (beginner) to 4 (expert)
    isTechnicallyAccurate: boolean;
  }[];
  explanation: string;
  explanationEs: string;
}

export interface CuratedResource {
  id: string;
  title: string;
  titleEs?: string;
  url: string;
  platform: string;
  format: 'Video' | 'Document' | 'Interactive' | 'Course';
  difficulty: KnowledgeLevel;
  language: Language | 'both';
  tags: string[];
  description: string;
  descriptionEs: string;
  duration: string;
}
