/**
 * SMARTVEST ACADEMY — TYPES
 * Isolated data types for Beginner Investing Academy.
 */

export type InvestmentLessonCategory =
  | 'Fundamentals'
  | 'Investment Products'
  | 'Investing Strategy'
  | 'India Investing'
  | 'Core Principles';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
}

export type SupportedAcademyLanguage =
  | 'en'
  | 'hi'
  | 'kn'
  | 'te'
  | 'ta'
  | 'ml'
  | 'mr'
  | 'bn';

export interface LocalizedLessonContent {
  videoUrl?: string;
  thumbnailUrl?: string;
  captionUrl?: string;
  transcript: string;
  keyTakeaway?: string;
}

export interface InvestmentLesson {
  id: string;
  number: number;
  title: string;
  category: InvestmentLessonCategory;
  level: 'Beginner';
  durationSeconds: number;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  aiVideoPrompt?: string;
  transcript: string;
  learningPoints: string[];
  keyTakeaway: string;
  quiz: QuizQuestion[];
  relatedLessons: string[];
  vestiqPrompt: string;
  languages?: Partial<Record<SupportedAcademyLanguage, LocalizedLessonContent>>;
}

export type LessonCompletionStatus = 'not_started' | 'in_progress' | 'completed';

export interface AcademyProgressState {
  completedLessonIds: string[];
  lastLessonId: string | null;
  quizScores: Record<string, number>; // lessonId -> number of correct answers
}
