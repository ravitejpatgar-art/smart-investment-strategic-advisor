/**
 * SMARTVEST ACADEMY — PROGRESS SERVICE
 * Manages lesson completion, quiz scores, and in-progress learning state.
 * Fully isolated with localStorage persistence and fallback in-memory cache.
 */

import type { AcademyProgressState } from '../types/investmentAcademy';
import { INVESTMENT_LESSONS } from '../data/investmentAcademyLessons';

const PROGRESS_STORAGE_KEY = 'smartvest_academy_progress_v1';

let inMemoryState: AcademyProgressState = {
  completedLessonIds: [],
  lastLessonId: null,
  quizScores: {},
};

type ProgressListener = (state: AcademyProgressState) => void;
const listeners: Set<ProgressListener> = new Set();

function loadState(): AcademyProgressState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        inMemoryState = {
          completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
          lastLessonId: typeof parsed.lastLessonId === 'string' ? parsed.lastLessonId : null,
          quizScores: typeof parsed.quizScores === 'object' && parsed.quizScores !== null ? parsed.quizScores : {},
        };
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return inMemoryState;
}

function saveState(state: AcademyProgressState): void {
  inMemoryState = state;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Ignore storage write error
  }
  notifyListeners();
}

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener({ ...inMemoryState });
    } catch {
      // Ignore listener error
    }
  });
}

export const academyProgress = {
  getProgress(): AcademyProgressState {
    return loadState();
  },

  isLessonCompleted(lessonId: string): boolean {
    const state = loadState();
    return state.completedLessonIds.includes(lessonId);
  },

  markLessonComplete(lessonId: string): AcademyProgressState {
    const state = loadState();
    if (!state.completedLessonIds.includes(lessonId)) {
      state.completedLessonIds.push(lessonId);
    }
    state.lastLessonId = lessonId;
    saveState(state);
    return state;
  },

  unmarkLessonComplete(lessonId: string): AcademyProgressState {
    const state = loadState();
    state.completedLessonIds = state.completedLessonIds.filter((id) => id !== lessonId);
    saveState(state);
    return state;
  },

  setLastLesson(lessonId: string): void {
    const state = loadState();
    state.lastLessonId = lessonId;
    saveState(state);
  },

  saveQuizScore(lessonId: string, score: number): void {
    const state = loadState();
    state.quizScores[lessonId] = score;
    saveState(state);
  },

  getQuizScore(lessonId: string): number | undefined {
    const state = loadState();
    return state.quizScores[lessonId];
  },

  getCompletedCount(): number {
    const state = loadState();
    return state.completedLessonIds.length;
  },

  getTotalCount(): number {
    return INVESTMENT_LESSONS.length;
  },

  getProgressPercentage(): number {
    const completed = this.getCompletedCount();
    const total = this.getTotalCount();
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  getNextUnfinishedLessonId(): string | null {
    const state = loadState();
    const unfinished = INVESTMENT_LESSONS.find(
      (lesson) => !state.completedLessonIds.includes(lesson.id)
    );
    return unfinished ? unfinished.id : null;
  },

  resetProgress(): void {
    saveState({
      completedLessonIds: [],
      lastLessonId: null,
      quizScores: {},
    });
  },

  subscribe(listener: ProgressListener): () => void {
    listeners.add(listener);
    // Initial emission
    listener(loadState());
    return () => {
      listeners.delete(listener);
    };
  },
};
