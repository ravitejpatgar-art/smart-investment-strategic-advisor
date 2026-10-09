import React, { useState, useRef, useEffect } from 'react';
import type { InvestmentLesson, SupportedAcademyLanguage } from '../../types/investmentAcademy';
import { academyProgress } from '../../services/academyProgress';
import { getNextLesson, getRelatedLessons } from '../../data/investmentAcademyLessons';
import { LessonTranscript } from './LessonTranscript';
import { LessonQuiz } from './LessonQuiz';
import { AcademyDisclaimer } from './AcademyDisclaimer';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Globe,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { VestiqMark } from '../common/VestiqLogo';

const ACADEMY_LANGUAGES: { code: SupportedAcademyLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

export interface LessonPlayerProps {
  lesson: InvestmentLesson;
  onBack: () => void;
  onSelectLesson: (lesson: InvestmentLesson) => void;
  onAskVestIQ?: (prompt: string) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onBack,
  onSelectLesson,
  onAskVestIQ,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedAcademyLanguage>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lesson.durationSeconds);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
    code?: number;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isPendingPlayRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MIN_BUFFER_SECONDS = 1.5;

  const hasEnoughBuffered = (video: HTMLVideoElement | null): boolean => {
    if (!video) return false;
    // readyState 4: HAVE_ENOUGH_DATA (sufficient data to play through to the end)
    if (video.readyState >= 4) return true;
    // readyState 3: HAVE_FUTURE_DATA (data available for immediate and future frames)
    if (video.readyState >= 3) {
      const cur = video.currentTime;
      for (let i = 0; i < video.buffered.length; i++) {
        const start = video.buffered.start(i);
        const end = video.buffered.end(i);
        if (cur >= start && cur <= end) {
          if (end - cur >= MIN_BUFFER_SECONDS || (video.duration > 0 && end >= video.duration - 0.3)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Sync completion state, mark lesson as last opened, and cleanly reset player lifecycle
  useEffect(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setIsCompleted(academyProgress.isLessonCompleted(lesson.id));
    academyProgress.setLastLesson(lesson.id);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setIsLoading(true);
    isPendingPlayRef.current = false;
    setErrorState(null);
    setRetryCount(0);
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [lesson.id, selectedLanguage]);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying || isPendingPlayRef.current) {
        isPendingPlayRef.current = false;
        setIsBuffering(false);
        setIsPlaying(false);
        video.pause();
      } else {
        if (errorState) setErrorState(null);
        setIsPlaying(true);
        isPendingPlayRef.current = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              isPendingPlayRef.current = false;
              setIsBuffering(false);
              setIsPlaying(true);
            })
            .catch((err: unknown) => {
              isPendingPlayRef.current = false;
              console.warn('[LessonPlayer] Playback play attempt failed:', err);
              if (err instanceof Error && err.name !== 'AbortError') {
                setIsPlaying(false);
                setIsBuffering(false);
              }
            });
        }
      }
    } else {
      // In placeholder mode, simulate playback
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadStart = () => {
    console.log(`[LessonPlayer] Video load start: ${activeVideoUrl}`);
    setIsLoading(true);
    if (isPlaying || isPendingPlayRef.current) {
      setIsBuffering(true);
    }
    setErrorState(null);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    console.log(`[LessonPlayer] Metadata loaded: duration=${v?.duration}s, resolution=${v?.videoWidth}x${v?.videoHeight}, readyState=${v?.readyState}`);
    if (v) {
      setDuration(v.duration || lesson.durationSeconds);
      setIsLoading(false);
      setIsBuffering(false);
      setErrorState(null);
    }
  };

  const handleWaiting = () => {
    const v = videoRef.current;
    console.log(`[LessonPlayer] Waiting for buffer: readyState=${v?.readyState}, currentTime=${v?.currentTime}s`);
    if (isPlaying || isPendingPlayRef.current) {
      setIsBuffering(true);
    }
  };

  const handleStalled = () => {
    const v = videoRef.current;
    console.warn(`[LessonPlayer] Media download stalled: networkState=${v?.networkState}, readyState=${v?.readyState}`);
    if (isPlaying || isPendingPlayRef.current) {
      setIsBuffering(true);
    }
  };

  const handlePlaying = () => {
    console.log('[LessonPlayer] Video playing successfully');
    isPendingPlayRef.current = false;
    setIsLoading(false);
    setIsBuffering(false);
    setIsPlaying(true);
    setErrorState(null);
  };

  const handleCanPlay = () => {
    const v = videoRef.current;
    console.log(`[LessonPlayer] Can play: readyState=${v?.readyState}`);
    setIsLoading(false);
    setIsBuffering(false);
    setErrorState(null);
  };

  const handleCanPlayThrough = () => {
    const v = videoRef.current;
    console.log(`[LessonPlayer] Can play through: readyState=${v?.readyState}`);
    setIsLoading(false);
    setIsBuffering(false);
    setErrorState(null);
  };

  const handleProgress = () => {
    if (isBuffering && videoRef.current && hasEnoughBuffered(videoRef.current)) {
      setIsBuffering(false);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = videoRef.current;
    const mediaErr = video?.error;
    const errCode = mediaErr?.code;
    const errMsg = mediaErr?.message || 'Video stream could not be loaded.';

    console.error('[LessonPlayer] Video playback media error:', {
      code: errCode,
      message: errMsg,
      networkState: video?.networkState,
      readyState: video?.readyState,
      currentTime: video?.currentTime,
      duration: video?.duration,
      url: activeVideoUrl,
      event: e
    });

    // Handle MEDIA_ERR_ABORTED (code 1)
    // Abort errors occur normally during lesson unmounting or when Chrome aborts
    // initial byte range to fetch tail metadata. Do not trigger error overlays or retries.
    if (errCode === 1 || errCode === (typeof MediaError !== 'undefined' ? MediaError.MEDIA_ERR_ABORTED : 1)) {
      console.warn('[LessonPlayer] Media operation aborted (MEDIA_ERR_ABORTED). Ignoring non-fatal abort.');
      return;
    }

    setIsBuffering(false);
    setIsLoading(false);
    setIsPlaying(false);
    isPendingPlayRef.current = false;

    // Explicit friendly error messages mapped to MediaError codes
    let friendlyMsg = 'We encountered an issue loading this lesson video.';
    if (errCode === 2 || errCode === (typeof MediaError !== 'undefined' ? MediaError.MEDIA_ERR_NETWORK : 2)) {
      friendlyMsg = 'A network error occurred while downloading the video stream. Please check your internet connection.';
    } else if (errCode === 3 || errCode === (typeof MediaError !== 'undefined' ? MediaError.MEDIA_ERR_DECODE : 3)) {
      friendlyMsg = 'An error occurred while decoding the video stream. The video format could not be decoded.';
    } else if (errCode === 4 || errCode === (typeof MediaError !== 'undefined' ? MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED : 4)) {
      friendlyMsg = 'The video stream is temporarily unreachable or unsupported by this browser.';
    }

    // Controlled automatic retry (maximum 2 retries)
    if (retryCount < 2) {
      const nextRetry = retryCount + 1;
      console.log(`[LessonPlayer] Initiating automatic retry ${nextRetry}/2 in 1.5s...`);
      setRetryCount(nextRetry);
      setIsLoading(true);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        retryTimeoutRef.current = null;
        if (videoRef.current) {
          videoRef.current.load();
        }
      }, 1500);
    } else {
      setErrorState({
        hasError: true,
        message: friendlyMsg,
        code: errCode
      });
    }
  };

  const handleManualRetry = () => {
    console.log('[LessonPlayer] Manual retry requested by user');
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setErrorState(null);
    setRetryCount(0);
    setIsLoading(true);
    setIsBuffering(false);
    if (videoRef.current) {
      videoRef.current.load();
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn('[LessonPlayer] Manual retry play caught:', err);
        });
      }
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
      if (!hasEnoughBuffered(videoRef.current) && isPlaying) {
        setIsBuffering(true);
      }
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
    ? (lesson.languages?.en?.videoUrl || lesson.videoUrl)
    : (localizedContent?.videoUrl || lesson.videoUrl);

  const activeThumbnailUrl = selectedLanguage === 'en'
    ? lesson.thumbnailUrl
    : (localizedContent?.thumbnailUrl || lesson.thumbnailUrl);

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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer w-fit"
        >
          <span>← Back to Academy</span>
        </button>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#0EA5E9]" />
          <span className="text-xs font-semibold text-[#64748B]">Audio & Subtitles:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as SupportedAcademyLanguage)}
            className="text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 hover:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all cursor-pointer shadow-2xs"
            aria-label="Select academy lesson audio and subtitle language"
          >
            {ACADEMY_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lesson Header Title & Meta */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5E9] tracking-wider uppercase">
          <span>Lesson {lesson.number < 10 ? `0${lesson.number}` : lesson.number}</span>
          <span>•</span>
          <span>{lesson.category}</span>
          <span>•</span>
          <span>{lesson.level}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
          {lesson.description}
        </p>
      </div>

      {/* ================================================================
          VIDEO PLAYER CONTAINER
      ================================================================ */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
        <div className="relative aspect-video w-full flex items-center justify-center bg-black">
          {activeVideoUrl ? (
            <video
              ref={videoRef}
              key={`${lesson.id}-${selectedLanguage}-${activeVideoUrl}`}
              src={activeVideoUrl}
              poster={activeThumbnailUrl}
              preload="metadata"
              playsInline
              controls
              className="w-full h-full object-contain cursor-pointer"
              onClick={handleTogglePlay}
              onLoadStart={handleLoadStart}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => {
                setIsPlaying(true);
              }}
              onPause={() => {
                if (!isPendingPlayRef.current) {
                  setIsPlaying(false);
                  setIsBuffering(false);
                }
              }}
              onWaiting={handleWaiting}
              onPlaying={handlePlaying}
              onCanPlay={handleCanPlay}
              onCanPlayThrough={handleCanPlayThrough}
              onProgress={handleProgress}
              onStalled={handleStalled}
              onError={handleError}
              onSeeked={() => {
                setIsBuffering(false);
              }}
              onEnded={() => {
                setIsPlaying(false);
                setIsBuffering(false);
                isPendingPlayRef.current = false;
                if (!isCompleted) {
                  academyProgress.markLessonComplete(lesson.id);
                  setIsCompleted(true);
                }
              }}
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
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 ml-1" />
              </div>
              <div className="text-sm font-semibold text-white">Video Coming Soon</div>
              <p className="text-xs text-slate-400 max-w-sm">
                Interactive lesson video is currently being generated. You can read the full lesson transcript and test your knowledge below.
              </p>
            </div>
          )}

          {/* Friendly Error UI Fallback Overlay (Step 5) */}
          {errorState?.hasError && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Video Playback Interrupted
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {errorState.message}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  You can retry streaming the video or continue learning by reading the full educational transcript below.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleManualRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Playback</span>
                </button>
              </div>
            </div>
          )}

          {/* Buffering Indicator */}
          {(isPlaying || isPendingPlayRef.current) && isBuffering && !errorState?.hasError && (
            <div className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none z-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-xs font-semibold shadow-xl">
                <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span>Buffering...</span>
              </div>
            </div>
          )}

          {/* Loading State Overlay */}
          {isLoading && !errorState?.hasError && !isPlaying && (
            <div className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none z-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-xs font-semibold shadow-xl">
                <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading video...</span>
              </div>
            </div>
          )}

          {/* Floating Big Play Button if Paused and Not Loading */}
          {activeVideoUrl && !isPlaying && !isLoading && !errorState?.hasError && (
            <button
              type="button"
              onClick={handleTogglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#0EA5E9]/90 hover:bg-[#0EA5E9] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer z-10"
              aria-label="Play video"
            >
              <Play className="w-7 h-7 ml-1 fill-current" />
            </button>
          )}
        </div>

        {/* Video Control Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 space-y-2">
          {/* Progress / Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
              aria-label="Video seek slider"
            />
            <span className="text-[11px] font-mono text-slate-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
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
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
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
              <VestiqMark size={14} />
              <span>Ask VestIQ</span>
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
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
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
