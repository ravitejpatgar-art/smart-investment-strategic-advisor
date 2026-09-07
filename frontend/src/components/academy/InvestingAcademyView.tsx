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
  Sparkles,
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

  // Filter lessons by category
  const filteredLessons = selectedCategory === 'ALL'
    ? INVESTMENT_LESSONS
    : INVESTMENT_LESSONS.filter((l) => l.category === selectedCategory);

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
      <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen">
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-[#F8F9FA] min-h-screen max-w-7xl mx-auto">
      {/* ================================================================
          HERO HEADER SECTION
      ================================================================ */}
      <div className="relative rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-6 sm:p-8 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-sky-100/50 to-teal-100/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
              <span>SmartVest Academy • Beginner Course</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Investing for Beginners
            </h1>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              Learn investing in simple 1–2 minute lessons. Understand what stocks, ETFs, mutual funds, SIPs, and compounding mean for your financial future.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#64748B] font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600" />
                12 High-Yield Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                Interactive Quizzes & AI Transcripts
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
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
      </div>

      {/* ================================================================
          CONTINUE LEARNING BANNER
      ================================================================ */}
      {!isCourseComplete && continueLesson && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] uppercase tracking-wider text-sky-400 font-bold">Continue Learning</span>
                <span className="text-xs text-slate-400">• Lesson {continueLesson.number < 10 ? `0${continueLesson.number}` : continueLesson.number}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {continueLesson.title}
              </h2>
              <p className="text-xs text-slate-300 line-clamp-1">
                {continueLesson.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSelectLesson(continueLesson)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Lesson</span>
          </button>
        </div>
      )}

      {isCourseComplete && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Course Completed</span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                You've mastered all 12 investing fundamentals!
              </h2>
              <p className="text-xs text-emerald-100">
                You are ready to explore real market tools, stock screeners, and multi-asset portfolios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => academyProgress.resetProgress()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>
      )}

      {/* ================================================================
          LEARNING PATH & CATEGORY FILTER
      ================================================================ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
              Curated Learning Path
            </h2>
            <p className="text-xs text-[#64748B]">
              Step-by-step sequential curriculum designed for first-time investors.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
              }`}
            >
              All Topics (12)
            </button>
            {ACADEMY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredLessons.map((lesson) => {
            const isCompleted = completedIds.includes(lesson.id);
            const isInProgress = lastLessonId === lesson.id && !isCompleted;

            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={isCompleted}
                isInProgress={isInProgress}
                onSelectLesson={handleSelectLesson}
              />
            );
          })}
        </div>
      </div>

      {/* Global Academy Disclaimer */}
      <div className="pt-4">
        <AcademyDisclaimer />
      </div>
    </div>
  );
};
