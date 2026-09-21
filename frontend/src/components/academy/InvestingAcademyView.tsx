import React, { useState, useEffect } from 'react';
import type { InvestmentLesson, InvestmentLessonCategory } from '../../types/investmentAcademy';
import {
  INVESTMENT_LESSONS,
  ACADEMY_CATEGORIES,
  getLessonById
} from '../../data/investmentAcademyLessons';
import { academyProgress } from '../../services/academyProgress';
import { LessonCard } from './LessonCard';
import { LessonPlayer } from './LessonPlayer';
import { LessonProgress } from './LessonProgress';
import { AcademyDisclaimer } from './AcademyDisclaimer';
import {
  GraduationCap,
  FileText,
  Play,
  BookOpen,
  Award,
  RotateCcw
} from 'lucide-react';

interface InvestingAcademyViewProps {
  onOpenVestIQWithQuery?: (query: string) => void;
}

export const InvestingAcademyView: React.FC<InvestingAcademyViewProps> = ({
  onOpenVestIQWithQuery,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<InvestmentLesson | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InvestmentLessonCategory | 'ALL'>('ALL');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [lastLessonId, setLastLessonId] = useState<string | null>(null);

  // Subscribe to progress updates
  useEffect(() => {
    const unsub = academyProgress.subscribe((state) => {
      setCompletedIds([...state.completedLessonIds]);
      setLastLessonId(state.lastLessonId);
    });
    return () => unsub();
  }, []);

  const completedCount = completedIds.length;
  const totalLessons = INVESTMENT_LESSONS.length;
  const isCourseComplete = completedCount === totalLessons && totalLessons > 0;

  // Next unfinished lesson to continue
  const nextUnfinishedId = academyProgress.getNextUnfinishedLessonId();
  const continueLesson = (lastLessonId && getLessonById(lastLessonId)) || (nextUnfinishedId && getLessonById(nextUnfinishedId)) || INVESTMENT_LESSONS[0];

  const handleSelectLesson = (lesson: InvestmentLesson) => {
    setSelectedLesson(lesson);
  };

  const handleBackToDashboard = () => {
    setSelectedLesson(null);
  };

  const handleAskVestIQ = (promptText: string) => {
    if (onOpenVestIQWithQuery) {
      onOpenVestIQWithQuery(promptText);
    }
  };

  // If a specific lesson is active, render the dedicated player view
  if (selectedLesson) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <LessonPlayer
          lesson={selectedLesson}
          onBack={handleBackToDashboard}
          onSelectLesson={handleSelectLesson}
          onAskVestIQ={handleAskVestIQ}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 min-h-screen max-w-7xl mx-auto">
      {/* ================================================================
          HERO HEADER SECTION
      ================================================================ */}
      <section className="financial-section-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>SmartVest Academy • Beginner Course</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              Investing for Beginners
            </h1>

            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              Learn investing in simple 1–2 minute lessons. Understand what stocks, ETFs, mutual funds, SIPs, and compounding mean for your financial future.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)] font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
                12 High-Yield Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[var(--color-accent)]" />
                Interactive Quizzes & Transcripts
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                Self-Paced Progress
              </span>
            </div>
          </div>

          {/* Quick Stats / Progress Summary */}
          <div className="w-full md:w-80 shrink-0">
            <LessonProgress
              completedCount={completedCount}
              totalCount={totalLessons}
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          CONTINUE LEARNING BANNER
      ================================================================ */}
      {/* ================================================================
          CONTINUE LEARNING HIGHLIGHT STRIP
      ================================================================ */}
      {!isCourseComplete && continueLesson && (
        <section className="financial-section-card-interactive p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] shrink-0">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-bold">Continue Learning</span>
                <span className="text-xs text-[var(--color-text-muted)]">• Lesson {continueLesson.number < 10 ? `0${continueLesson.number}` : continueLesson.number}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] leading-snug">
                {continueLesson.title}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                {continueLesson.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSelectLesson(continueLesson)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] text-xs font-semibold transition-all shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume Lesson</span>
          </button>
        </section>
      )}

      {isCourseComplete && (
        <section className="financial-section-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Course Completed</span>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
                You've mastered all 12 investing fundamentals!
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                You are ready to explore real market tools, stock screeners, and multi-asset portfolios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => academyProgress.resetProgress()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-soft)] hover:bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </section>
      )}

      {/* ================================================================
          CURRICULUM & MODULES
      ================================================================ */}
      <section className="financial-section-card p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--color-border-subtle)]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-bold block">
              Curriculum
            </span>
            <h2 className="text-lg font-extrabold text-[var(--color-text-primary)] tracking-tight">
              Sequential Learning Tracks
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)]'
                  : 'bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              All Topics (12)
            </button>
            {ACADEMY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)]'
                    : 'bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Curriculum Modules */}
        <div className="space-y-10">
          {(selectedCategory === 'ALL' ? ACADEMY_CATEGORIES : ACADEMY_CATEGORIES.filter(c => c.id === selectedCategory)).map((cat, modIdx) => {
            const moduleLessons = INVESTMENT_LESSONS.filter(l => l.category === cat.id);
            if (moduleLessons.length === 0) return null;
            const moduleCompleted = moduleLessons.filter(l => completedIds.includes(l.id)).length;
            const moduleTotal = moduleLessons.length;
            const modulePct = moduleTotal > 0 ? Math.round((moduleCompleted / moduleTotal) * 100) : 0;
            const modNum = (modIdx + 1) < 10 ? `0${modIdx + 1}` : `${modIdx + 1}`;

            return (
              <div key={cat.id} className="space-y-1">
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2 border-b border-[var(--color-border-subtle)]">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent)]">
                      Module {modNum}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
                      {cat.label === 'Products' ? 'Investment Products & Funds' : cat.label === 'Strategy' ? 'Portfolio Construction & Strategy' : cat.label === 'India' ? 'Indian Markets & Regulatory Framework' : cat.label === 'Principles' ? 'Core Compounding Principles' : cat.label}
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-[var(--color-text-muted)]">
                    {moduleTotal} lessons • <span className={modulePct === 100 ? 'text-emerald-600 font-bold' : ''}>{modulePct}% complete</span>
                  </div>
                </div>

                {/* Lesson Rows */}
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {moduleLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isCompleted={completedIds.includes(lesson.id)}
                      isInProgress={lastLessonId === lesson.id && !completedIds.includes(lesson.id)}
                      onSelectLesson={handleSelectLesson}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global Academy Disclaimer */}
      <div className="pt-4">
        <AcademyDisclaimer />
      </div>
    </div>
  );
};
