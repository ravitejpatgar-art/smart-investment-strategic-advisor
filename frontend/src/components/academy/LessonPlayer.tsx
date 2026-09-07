import React, { useState, useRef, useEffect } from 'react';
import type { InvestmentLesson, SupportedAcademyLanguage } from '../../types/investmentAcademy';
import { academyProgress } from '../../services/academyProgress';
import { getNextLesson, getRelatedLessons } from '../../data/investmentAcademyLessons';
import { LessonTranscript } from './LessonTranscript';
import { LessonQuiz } from './LessonQuiz';
import { AcademyDisclaimer } from './AcademyDisclaimer';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Bot,
  ArrowRight,
  BookOpen,
  Globe
} from 'lucide-react';

interface LanguageOption {
  code: SupportedAcademyLanguage;
  label: string;
  native: string;
}

const ACADEMY_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

interface LessonPlayerProps {
  lesson: InvestmentLesson;
  onBack: () => void;
  onSelectLesson: (lesson: InvestmentLesson) => void;
  onAskVestIQ?: (query: string) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onBack,
  onSelectLesson,
  onAskVestIQ,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedAcademyLanguage>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lesson.durationSeconds);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync completion state and mark lesson as last opened
  useEffect(() => {
    setIsCompleted(academyProgress.isLessonCompleted(lesson.id));
    academyProgress.setLastLesson(lesson.id);
    setCurrentTime(0);
    setIsPlaying(false);
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson.id, selectedLanguage]);

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    } else {
      // In placeholder mode, simulate playback
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleToggleComplete = () => {
    if (isCompleted) {
      academyProgress.unmarkLessonComplete(lesson.id);
      setIsCompleted(false);
    } else {
      academyProgress.markLessonComplete(lesson.id);
      setIsCompleted(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const nextLesson = getNextLesson(lesson.id);
  const relatedLessons = getRelatedLessons(lesson);

  const handleAskVestIQ = () => {
    if (onAskVestIQ) {
      onAskVestIQ(lesson.vestiqPrompt);
    }
  };

  const localizedContent = lesson.languages?.[selectedLanguage];

  const activeVideoUrl = selectedLanguage === 'en'
    ? lesson.videoUrl
    : localizedContent?.videoUrl;

  const activeThumbnailUrl = selectedLanguage === 'en'
    ? lesson.thumbnailUrl
    : localizedContent?.thumbnailUrl;

  const activeCaptionUrl = selectedLanguage === 'en'
    ? lesson.videoUrl?.replace(/\.mp4$/i, '.vtt')
    : localizedContent?.captionUrl;

  const activeTranscript = (selectedLanguage === 'en' ? lesson.transcript : localizedContent?.transcript) || lesson.transcript;
  const activeTakeaway = (selectedLanguage === 'en' ? lesson.keyTakeaway : localizedContent?.keyTakeaway) || lesson.keyTakeaway;

  const currentLangObj = ACADEMY_LANGUAGES.find((l) => l.code === selectedLanguage) || ACADEMY_LANGUAGES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Navigation & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Academy</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span className="text-[11px] font-semibold text-[#64748B]">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedAcademyLanguage)}
              className="text-xs font-bold text-[#0F172A] bg-transparent border-none focus:outline-none cursor-pointer pr-1"
              aria-label="Select Lesson Language"
            >
              {ACADEMY_LANGUAGES.map((lang) => {
                const available = lang.code === 'en' || !!lesson.languages?.[lang.code]?.videoUrl;
                return (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.label}){available ? '' : ' — Coming soon'}
                  </option>
                );
              })}
            </select>
          </div>

          <span className="text-xs font-mono font-bold text-[#64748B] bg-slate-100 px-2 py-1 rounded-md">
            Lesson {lesson.number < 10 ? `0${lesson.number}` : lesson.number} / 12
          </span>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
            {lesson.category}
          </span>
        </div>
      </div>

      {/* Lesson Title & Summary Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight mb-1.5">
          {lesson.title}
        </h1>
        <p className="text-sm text-[#475569] leading-relaxed">
          {lesson.description}
        </p>
      </div>

      {/* ================================================================
          VIDEO PLAYER CONTAINER
      ================================================================ */}
      <div className="relative w-full rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg overflow-hidden flex flex-col">
        {activeVideoUrl ? (
          /* Actual Video Player */
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            <video
              key={`${lesson.id}-${selectedLanguage}`}
              ref={videoRef}
              src={activeVideoUrl}
              poster={activeThumbnailUrl}
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
              onEnded={() => {
                setIsPlaying(false);
                if (!isCompleted) {
                  academyProgress.markLessonComplete(lesson.id);
                  setIsCompleted(true);
                }
              }}
              className="w-full h-full object-contain"
            >
              {activeCaptionUrl && (
                <track
                  kind="captions"
                  src={activeCaptionUrl}
                  srcLang={selectedLanguage}
                  label={currentLangObj.label}
                  default
                />
              )}
            </video>
          </div>
        ) : (
          /* High-Fidelity Clean Video Placeholder / Translation Coming Soon */
          <div className="relative aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex flex-col items-center justify-center text-center p-6 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex flex-col items-center max-w-md">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sky-400 mb-4 shadow-xl">
                <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {currentLangObj.native} ({currentLangObj.label}) Translation in Production
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                {lesson.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 mb-4">
                Narration and video for {currentLangObj.native} are coming soon. You can switch to English to watch the master AI video or explore the concept outline below.
              </p>

              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className="px-4 py-2 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Switch to English Video (2+ min)</span>
              </button>
            </div>
          </div>
        )}

        {/* Video Control Bar */}
        <div className="px-4 py-3 bg-slate-900/95 border-t border-slate-800 text-white flex flex-col gap-2">
          {/* Progress Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
              aria-label="Video seek bar"
            />
            <span className="text-[11px] font-mono text-slate-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-1.5 rounded-md hover:bg-slate-800 text-white transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <div className="hidden sm:flex items-center gap-1 text-xs">
                {[1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                      playbackRate === speed
                        ? 'bg-sky-500 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleComplete}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCompleted ? '✓ Completed' : 'Mark Lesson Complete'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          LESSON INFORMATION & LEARNING POINTS
      ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* What You'll Learn */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0EA5E9]" />
              What You'll Learn
            </h3>
            <ul className="space-y-2.5 text-sm text-[#334155]">
              {lesson.learningPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] shrink-0 mt-2" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Takeaway */}
          <div className="bg-gradient-to-r from-teal-50/70 to-sky-50/70 rounded-xl border border-teal-200/80 p-5">
            <div className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Key Takeaway
            </div>
            <p className="text-sm sm:text-base font-semibold text-[#0F172A] leading-snug">
              "{activeTakeaway}"
            </p>
          </div>

          {/* Full Educational Transcript */}
          <LessonTranscript
            transcript={activeTranscript}
            durationSeconds={lesson.durationSeconds}
            languageLabel={`${currentLangObj.native} (${currentLangObj.label})`}
          />

          {/* Interactive Quiz */}
          <LessonQuiz
            lessonId={lesson.id}
            quiz={lesson.quiz}
            onQuizComplete={(score, total) => {
              if (score >= total && !isCompleted) {
                academyProgress.markLessonComplete(lesson.id);
                setIsCompleted(true);
              }
            }}
          />
        </div>

        {/* Sidebar Actions (1 col) */}
        <div className="space-y-6">
          {/* Ask VestIQ Action Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5E9] uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              VestIQ AI Tutor
            </div>
            <h4 className="text-sm font-bold text-[#0F172A]">
              Have questions about this lesson?
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Ask VestIQ to explain {lesson.title.toLowerCase()} with personalized analogies or rupee examples.
            </p>

            <button
              type="button"
              onClick={handleAskVestIQ}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Ask VestIQ About This</span>
            </button>
            <div className="text-[10px] text-slate-400 italic text-center">
              Suggested query: "{lesson.vestiqPrompt}"
            </div>
          </div>

          {/* Next Lesson Card */}
          {nextLesson && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Next in Sequence</span>
              <div className="space-y-1">
                <div className="text-xs text-teal-600 font-semibold">Lesson {nextLesson.number < 10 ? `0${nextLesson.number}` : nextLesson.number}</div>
                <h4 className="text-sm font-bold text-[#0F172A]">{nextLesson.title}</h4>
                <p className="text-xs text-[#64748B] line-clamp-2">{nextLesson.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectLesson(nextLesson)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Continue to Next Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Related Lessons */}
          {relatedLessons.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Related Topics</span>
              <div className="space-y-2">
                {relatedLessons.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectLesson(rel)}
                    className="w-full text-left p-2.5 rounded-lg border border-[#F1F5F9] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">
                        {rel.title}
                      </div>
                      <div className="text-[11px] text-[#64748B]">{rel.category}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0EA5E9] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <AcademyDisclaimer />
        </div>
      </div>
    </div>
  );
};
