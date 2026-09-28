import React, { useState, useRef, useEffect } from 'react';
import type {
  InvestmentLesson,
  SupportedAcademyLanguage,
  LessonScene,
} from '../../types/investmentAcademy';
import { academyProgress } from '../../services/academyProgress';
import { getNextLesson, getRelatedLessons } from '../../data/investmentAcademyLessons';
import { LessonVisualCanvas } from './LessonVisualCanvas';
import { LessonTranscript } from './LessonTranscript';
import { LessonSources } from './LessonSources';
import { LessonQuiz } from './LessonQuiz';
import { AcademyDisclaimer } from './AcademyDisclaimer';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Globe,
  Subtitles,
  Sparkles,
  Video,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { VestiqMark } from '../common/VestiqLogo';

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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(lesson.duration || lesson.durationSeconds || 150);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'visual' | 'video'>('visual');
  const [videoError, setVideoError] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Synchronize completion state and mark lesson as last opened
  useEffect(() => {
    setIsCompleted(academyProgress.isLessonCompleted(lesson.id));
    academyProgress.setLastLesson(lesson.id);
    setCurrentTime(0);
    setIsPlaying(false);
    setVideoError(false);
    setDuration(lesson.duration || lesson.durationSeconds || 150);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson.id, selectedLanguage]);

  // Resolve localized content
  const localizedContent = lesson.languages?.[selectedLanguage];

  const activeVideoUrl =
    selectedLanguage === 'en'
      ? lesson.videoUrl
      : localizedContent?.videoUrl;

  const activeThumbnailUrl =
    selectedLanguage === 'en'
      ? lesson.thumbnailUrl || lesson.thumbnail
      : localizedContent?.thumbnailUrl || lesson.thumbnailUrl;

  const activeCaptionUrl =
    selectedLanguage === 'en'
      ? lesson.subtitleUrl || lesson.videoUrl?.replace(/\.mp4$/i, '.vtt')
      : localizedContent?.captionUrl || localizedContent?.subtitleUrl;

  const activeTranscript =
    (selectedLanguage === 'en' ? lesson.transcript : localizedContent?.transcript) ||
    lesson.transcript;

  const activeTakeaways =
    lesson.keyTakeaways && lesson.keyTakeaways.length > 0
      ? lesson.keyTakeaways
      : [localizedContent?.keyTakeaway || lesson.keyTakeaway];

  // Resolve localized scenes if available, otherwise default to master scenes
  const scenes: LessonScene[] =
    localizedContent?.scenes && localizedContent.scenes.length > 0
      ? localizedContent.scenes
      : lesson.scenes && lesson.scenes.length > 0
      ? lesson.scenes
      : [];

  // Active scene determination
  const activeSceneIndex = scenes.findIndex(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  );
  const activeScene: LessonScene =
    activeSceneIndex >= 0
      ? scenes[activeSceneIndex]
      : scenes[scenes.length - 1] || {
          sceneId: 'default-scene',
          startTime: 0,
          endTime: duration,
          title: lesson.title,
          narration: lesson.description,
          visualType: 'presenter',
          onScreenText: {
            headline: lesson.title,
            subheadline: lesson.description,
          },
        };

  // Automated playback simulation for Interactive Visual Canvas mode or when video is absent/errored
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && (viewMode === 'visual' || videoError || !activeVideoUrl)) {
      const stepMs = 250;
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + (stepMs / 1000) * playbackRate;
          if (next >= duration) {
            setIsPlaying(false);
            if (!isCompleted) {
              academyProgress.markLessonComplete(lesson.id);
              setIsCompleted(true);
            }
            return duration;
          }
          return next;
        });
      }, stepMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, viewMode, videoError, activeVideoUrl, duration, playbackRate, isCompleted, lesson.id]);

  const handleTogglePlay = () => {
    if (viewMode === 'video' && videoRef.current && !videoError) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setVideoError(true);
          setViewMode('visual');
        });
      }
    }
    setIsPlaying(!isPlaying);
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

  const handleSeek = (timeSec: number) => {
    const clamped = Math.max(0, Math.min(duration, timeSec));
    setCurrentTime(clamped);
    if (videoRef.current && !videoError) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleSceneClick = (scene: LessonScene) => {
    handleSeek(scene.startTime);
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

  const currentLangObj =
    ACADEMY_LANGUAGES.find((l) => l.code === selectedLanguage) || ACADEMY_LANGUAGES[0];

  return (
    <div data-testid="lesson-player" className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ── Top Header Navigation & Language Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          data-testid="back-to-academy-button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs transition-colors w-fit cursor-pointer"
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
              data-testid="language-selector"
              className="text-xs font-bold text-[#0F172A] bg-transparent border-none focus:outline-none cursor-pointer pr-1"
              aria-label="Select Lesson Language"
            >
              {ACADEMY_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.label})
                </option>
              ))}
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

      {/* ── Lesson Title & Summary Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
            {lesson.difficulty || lesson.level || 'Beginner'} Level
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            • {Math.ceil(duration / 60)} Minutes • {scenes.length} Visual Scenes
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
          {lesson.description}
        </p>
      </div>

      {/* ================================================================
          VIDEO & VISUAL TEACHING PLAYER CONTAINER
      ================================================================ */}
      <div className="relative w-full rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Top Player Status Bar: Mode Switcher & Scene Indicator */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Scene {activeSceneIndex + 1} of {scenes.length}:
            </span>
            <span className="text-sky-400 font-medium truncate max-w-[200px] sm:max-w-xs">
              {activeScene.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle Button */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                data-testid="toggle-visual-mode"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  viewMode === 'visual'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Teaching Visuals</span>
                <span className="sm:hidden">Visual</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeVideoUrl) {
                    setViewMode('video');
                  }
                }}
                data-testid="toggle-video-mode"
                disabled={!activeVideoUrl || videoError}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  viewMode === 'video'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
                title={activeVideoUrl ? 'Switch to Video Feed' : 'Video feed coming soon'}
              >
                <Video className="w-3 h-3" />
                <span className="hidden sm:inline">Presenter Video</span>
                <span className="sm:hidden">Video</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Screen Stage: Interactive Visual Canvas OR Native Video ── */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          {viewMode === 'visual' || videoError || !activeVideoUrl ? (
            /* Visual-First Interactive Canvas Component */
            <LessonVisualCanvas
              scene={activeScene}
              currentTime={currentTime}
              showCaptions={showCaptions}
            />
          ) : (
            /* Native HTML5 Video Player */
            <div className="relative w-full h-full">
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
                onError={() => {
                  // Graceful fallback to visual canvas if video fails
                  setVideoError(true);
                  setViewMode('visual');
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
                    default={showCaptions}
                  />
                )}
              </video>

              {/* In-Video Captions Overlay if enabled */}
              {showCaptions && activeScene.narration && (
                <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-center text-xs sm:text-sm text-white border border-white/10 shadow-lg pointer-events-none">
                  "{activeScene.narration}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Scene Progress Timeline Bar (Clickable Segments) ── */}
        <div
          data-testid="scene-progress-bar"
          className="px-4 py-2 bg-slate-900 border-t border-slate-800/80 flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 font-sans font-semibold text-slate-300">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Scene Timeline:
            </span>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Segmented Timeline */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 w-full">
            {scenes.map((sc, idx) => {
              const isPast = currentTime >= sc.endTime;
              const isCurrent = currentTime >= sc.startTime && currentTime < sc.endTime;
              return (
                <button
                  key={sc.sceneId}
                  type="button"
                  onClick={() => handleSceneClick(sc)}
                  data-testid={`scene-pill-${sc.sceneId}`}
                  className={`group relative h-2.5 sm:h-3 rounded transition-all cursor-pointer overflow-hidden ${
                    isCurrent
                      ? 'bg-sky-400 ring-2 ring-sky-300 ring-offset-1 ring-offset-slate-900'
                      : isPast
                      ? 'bg-teal-600 hover:bg-teal-500'
                      : 'bg-slate-700/60 hover:bg-slate-600'
                  }`}
                  title={`${idx + 1}. ${sc.title} (${Math.round(sc.startTime)}s - ${Math.round(sc.endTime)}s)`}
                />
              );
            })}
          </div>

          {/* Scene Labels Row (on wider screens) */}
          <div className="hidden sm:grid grid-cols-8 gap-1 pt-0.5 text-[10px] text-slate-400 truncate">
            {scenes.map((sc, idx) => (
              <button
                key={`label-${sc.sceneId}`}
                type="button"
                onClick={() => handleSceneClick(sc)}
                className={`text-left truncate transition-colors ${
                  activeSceneIndex === idx ? 'text-sky-300 font-bold' : 'hover:text-slate-200'
                }`}
              >
                {idx + 1}. {sc.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Video & Visual Control Bar ── */}
        <div className="px-4 py-3 bg-slate-900/95 border-t border-slate-800 text-white flex flex-col gap-2.5">
          {/* Main Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 150}
              step={0.5}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
              aria-label="Seek time"
            />
            <span className="text-[11px] font-mono text-slate-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play / Pause */}
              <button
                type="button"
                onClick={handleTogglePlay}
                data-testid="play-pause-button"
                className="p-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors cursor-pointer shadow-xs"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              {/* Mute */}
              <button
                type="button"
                onClick={handleToggleMute}
                data-testid="mute-button"
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Captions Toggle */}
              <button
                type="button"
                onClick={() => setShowCaptions(!showCaptions)}
                data-testid="captions-toggle-button"
                className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                  showCaptions
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Toggle Captions"
              >
                <Subtitles className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold">CC</span>
              </button>

              {/* Playback Speeds */}
              <div className="hidden sm:flex items-center gap-1 text-xs pl-1">
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleSpeedChange(speed)}
                    data-testid={`speed-button-${speed}`}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      playbackRate === speed
                        ? 'bg-sky-500 text-white font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Completion & Provider Metadata */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-slate-400 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/40">
                <span>Provider: {lesson.provider || 'SmartVest Native'}</span>
                <span>• v{lesson.version || '2.0.0'}</span>
              </div>

              <button
                type="button"
                onClick={handleToggleComplete}
                data-testid="mark-complete-button"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCompleted ? '✓ Completed' : 'Mark Complete'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          LESSON INFORMATION & EDUCATIONAL CORE
      ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Column (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Key Takeaways Card */}
          <div data-testid="key-takeaways-section" className="bg-gradient-to-r from-teal-50/80 to-sky-50/80 rounded-xl border border-teal-200 p-5 space-y-3">
            <div className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Key Takeaway</span>
            </div>
            <div className="space-y-2">
              {activeTakeaways.map((takeaway, i) => (
                <p key={i} className="text-sm sm:text-base font-semibold text-[#0F172A] leading-snug">
                  "{takeaway}"
                </p>
              ))}
            </div>
          </div>

          {/* What You'll Learn (Learning Objectives) */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0EA5E9]" />
              Learning Objectives
            </h3>
            <ul className="space-y-2.5 text-sm text-[#334155]">
              {(lesson.learningObjectives || lesson.learningPoints).map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] shrink-0 mt-2" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Verified Educational Transcript */}
          <div data-testid="transcript-section">
            <LessonTranscript
              transcript={activeTranscript}
              durationSeconds={duration}
              languageLabel={`${currentLangObj.native} (${currentLangObj.label})`}
            />
          </div>

          {/* Verified Regulatory & Academic Sources */}
          <div data-testid="sources-section">
            <LessonSources
              sources={lesson.sources || []}
              ragMetadata={lesson.ragMetadata}
            />
          </div>

          {/* SmartVest Interactive Knowledge Check (Quiz) */}
          <div data-testid="quiz-section">
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
        </div>

        {/* Sidebar Actions Column (1 col) */}
        <div className="space-y-6">
          {/* Ask VestIQ Action Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5E9] uppercase tracking-wider">
              <VestiqMark size={14} />
              <span>Ask VestIQ</span>
            </div>
            <h4 className="text-sm font-bold text-[#0F172A]">
              Have questions about {lesson.title}?
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Ask VestIQ to explain with personalized examples, analogies, or rupee portfolio allocations.
            </p>

            <button
              type="button"
              onClick={handleAskVestIQ}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span>Ask VestIQ About This</span>
            </button>
            <div className="text-[10px] text-slate-400 italic text-center">
              Suggested: "{lesson.vestiqPrompt}"
            </div>
          </div>

          {/* Next Lesson Card */}
          {nextLesson && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Next in Sequence</span>
              <div className="space-y-1">
                <div className="text-xs text-teal-600 font-semibold">
                  Lesson {nextLesson.number < 10 ? `0${nextLesson.number}` : nextLesson.number}
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">{nextLesson.title}</h4>
                <p className="text-xs text-[#64748B] line-clamp-2">{nextLesson.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectLesson(nextLesson)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
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
                    className="w-full text-left p-2.5 rounded-lg border border-[#F1F5F9] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors flex items-center justify-between text-xs group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">
                        {rel.title}
                      </div>
                      <div className="text-[11px] text-[#64748B]">{rel.category}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0EA5E9] group-hover:translate-x-0.5 transition-all" />
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
