import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import type { InvestmentLesson, SupportedAcademyLanguage } from '../../types/investmentAcademy';
import { academyProgress } from '../../services/academyProgress';
import {
  INVESTMENT_LESSONS,
  getNextLesson,
  getPreviousLesson,
  getRelatedLessons
} from '../../data/investmentAcademyLessons';
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
  ArrowLeft,
  BookOpen,
  Globe,
  AlertCircle,
  RefreshCw,
  Maximize2,
  Minimize2,
  HelpCircle,
  FileText,
  Sparkles,
  Clock,
  Layers,
  Award,
  ChevronRight,
  Check
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

const LESSON_PRACTICAL_INSIGHTS: Record<string, { label: string; example: string }> = {
  'what-is-investment': {
    label: 'Real Indian Rupee Context',
    example: 'At 6% annual inflation, ₹1,00,000 kept idle in a locker loses nearly half its real purchasing power in 10 years. Putting capital into productive equity and debt helps outpace this silent drain.'
  },
  'what-is-a-stock': {
    label: 'Fractional Corporate Ownership',
    example: 'Owning even 1 share of a listed Indian enterprise gives you legal fractional ownership in its factories, technology patents, and global profits through dividends and stock appreciation.'
  },
  'what-are-shares': {
    label: 'Authorized & Issued Share Capital',
    example: 'When a company splits its equity into 10 lakh units, each unit is a single share. Your percentage ownership and shareholder rights equal the exact number of shares you hold.'
  },
  'what-is-an-etf': {
    label: 'Exchange-Traded Basket Liquidity',
    example: 'A Nifty 50 ETF lets you purchase the top 50 blue-chip companies in India in a single trade on NSE with ultra-low expense ratios (often 0.04% to 0.10%) and instant liquidity.'
  },
  'what-is-a-mutual-fund': {
    label: 'Professional Fund Management',
    example: 'A SEBI-registered mutual fund pools money from millions of investors, deploying certified fund managers to diversify risk across dozens of companies and credit ratings.'
  },
  'why-long-term-investing': {
    label: 'Time in the Market vs. Timing the Market',
    example: 'Historically over 10-year rolling horizons on the Indian equity indices, the probability of negative returns has approached zero, smoothing out volatile market cycles.'
  },
  'what-is-compounding': {
    label: 'The Exponential Wealth Curve',
    example: 'A monthly SIP of ₹5,000 at a 12% annualized return builds to ~₹11.2 lakhs in 10 years, grows to ~₹50 lakhs in 20 years, and surges past ₹1.75 crores in 30 years.'
  },
  'what-is-sip': {
    label: 'Rupee Cost Averaging in India',
    example: 'SIP automatically deducts a set amount each month, purchasing more units when markets drop and fewer when they rally, completely removing emotional timing stress.'
  },
  'what-is-swp': {
    label: 'Tax-Efficient Regular Cash Flow',
    example: 'A Systematic Withdrawal Plan (SWP) withdraws a fixed monthly amount from mutual funds for retirement income, incurring capital gains tax only on the profit portion of redeemed units.'
  },
  'what-is-a-hedge-fund': {
    label: 'Alternative Investment Funds (AIF Cat III)',
    example: 'In India, Category III AIFs require a minimum ₹1 crore commitment and utilize long/short derivatives and leverage strategies designed for accredited institutional investors.'
  },
  'risk-return-diversification': {
    label: 'The Only Free Lunch in Investing',
    example: 'Spreading allocations across large-cap equities, government bonds, and gold protects your overall wealth from severe portfolio drawdowns during major economic downturns.'
  },
  'how-to-start-investing': {
    label: 'Actionable Beginner Blueprint',
    example: '1) Build a 6-month emergency fund in liquid assets; 2) Secure adequate term and health insurance; 3) Finish digital KYC; 4) Start an automated Nifty 50 Index SIP.'
  }
};

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
  const [completedIds, setCompletedIds] = useState<string[]>(academyProgress.getProgress().completedLessonIds);
  const [activeTab, setActiveTab] = useState<'objectives' | 'quiz' | 'transcript' | 'vestiq' | 'curriculum'>('objectives');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
    code?: number;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hlsNetworkRetryRef = useRef(0);
  const hlsMediaRetryRef = useRef(0);
  const isPendingPlayRef = useRef(false);
  const isMountedRef = useRef(true);
  const isFallbackToMp4Ref = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Subscribe to progress changes across the course
  useEffect(() => {
    const unsub = academyProgress.subscribe((state) => {
      setCompletedIds([...state.completedLessonIds]);
      setIsCompleted(state.completedLessonIds.includes(lesson.id));
    });
    return () => unsub();
  }, [lesson.id]);

  const localizedContent = lesson.languages?.[selectedLanguage];

  const activeVideoUrl = selectedLanguage === 'en'
    ? (lesson.languages?.en?.videoUrl || lesson.videoUrl)
    : (localizedContent?.videoUrl || lesson.videoUrl);

  const activeHlsPlaylistUrl = selectedLanguage === 'en'
    ? (lesson.languages?.en?.hlsPlaylistUrl || lesson.hlsPlaylistUrl)
    : (localizedContent?.hlsPlaylistUrl || lesson.hlsPlaylistUrl);

  const rawThumbnailUrl = selectedLanguage === 'en'
    ? (lesson.languages?.en?.thumbnailUrl || lesson.thumbnailUrl)
    : (localizedContent?.thumbnailUrl || lesson.thumbnailUrl);

  const activeThumbnailUrl = rawThumbnailUrl
    ? `${rawThumbnailUrl}?v=20261011`
    : '';

  const activeCaptionUrl = selectedLanguage === 'en'
    ? lesson.videoUrl?.replace(/\.mp4$/i, '.vtt')
    : localizedContent?.captionUrl;

  const activeTranscript = (selectedLanguage === 'en' ? lesson.transcript : localizedContent?.transcript) || lesson.transcript;
  const activeTakeaway = (selectedLanguage === 'en' ? lesson.keyTakeaway : localizedContent?.keyTakeaway) || lesson.keyTakeaway;

  const hasMedia = Boolean(activeHlsPlaylistUrl || activeVideoUrl);

  const MIN_BUFFER_SECONDS = 1.5;

  const hasEnoughBuffered = (video: HTMLVideoElement | null): boolean => {
    if (!video) return false;
    if (video.readyState >= 4) return true;
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

  const initMediaStream = useCallback((video: HTMLVideoElement) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (activeHlsPlaylistUrl) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari on macOS/iOS)
        video.src = activeHlsPlaylistUrl;
        video.load();
      } else if (Hls.isSupported()) {
        // hls.js for Chrome, Firefox, Edge, etc.
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 30, // 20-30 seconds buffer target
          maxMaxBufferLength: 60,
          maxBufferSize: 30 * 1000 * 1000, // 30 MB buffer limit
          maxBufferHole: 0.5,
        });
        hlsRef.current = hls;
        hls.loadSource(activeHlsPlaylistUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!isMountedRef.current) return;
          setIsLoading(false);
          setIsBuffering(false);
          setErrorState(null);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!isMountedRef.current) return;
          console.warn('[LessonPlayer] HLS Error event:', data.type, data.details, data.fatal);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (hlsNetworkRetryRef.current < 2) {
                  hlsNetworkRetryRef.current += 1;
                  console.log(`[LessonPlayer] Recovering from HLS network error (retry ${hlsNetworkRetryRef.current}/2)...`);
                  hls.startLoad();
                } else if (!isFallbackToMp4Ref.current && activeVideoUrl && video.src !== activeVideoUrl) {
                  console.log('[LessonPlayer] HLS network retries exhausted. Falling back to progressive MP4:', activeVideoUrl);
                  isFallbackToMp4Ref.current = true;
                  hls.destroy();
                  hlsRef.current = null;
                  video.src = activeVideoUrl;
                  video.load();
                } else {
                  setIsBuffering(false);
                  setIsLoading(false);
                  setIsPlaying(false);
                  setErrorState({
                    hasError: true,
                    message: 'A network error occurred while streaming the video. Please check your internet connection.',
                  });
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                if (hlsMediaRetryRef.current < 2) {
                  hlsMediaRetryRef.current += 1;
                  console.log(`[LessonPlayer] Attempting media error recovery (retry ${hlsMediaRetryRef.current}/2)...`);
                  hls.recoverMediaError();
                } else if (!isFallbackToMp4Ref.current && activeVideoUrl && video.src !== activeVideoUrl) {
                  console.log('[LessonPlayer] HLS media retries exhausted. Falling back to progressive MP4:', activeVideoUrl);
                  isFallbackToMp4Ref.current = true;
                  hls.destroy();
                  hlsRef.current = null;
                  video.src = activeVideoUrl;
                  video.load();
                } else {
                  setIsBuffering(false);
                  setIsLoading(false);
                  setIsPlaying(false);
                  setErrorState({
                    hasError: true,
                    message: 'An error occurred while decoding the video stream. Please retry.',
                  });
                }
                break;
              default:
                console.error('[LessonPlayer] Fatal unrecoverable HLS error:', data.details);
                hls.destroy();
                hlsRef.current = null;
                if (!isFallbackToMp4Ref.current && activeVideoUrl && video.src !== activeVideoUrl) {
                  console.log('[LessonPlayer] Falling back to progressive MP4 after fatal HLS error.');
                  isFallbackToMp4Ref.current = true;
                  video.src = activeVideoUrl;
                  video.load();
                } else {
                  setIsBuffering(false);
                  setIsLoading(false);
                  setIsPlaying(false);
                  setErrorState({
                    hasError: true,
                    message: 'An error occurred during video streaming. Please retry.',
                  });
                }
                break;
            }
          }
        });
      } else if (activeVideoUrl) {
        video.src = activeVideoUrl;
        video.load();
      }
    } else if (activeVideoUrl) {
      video.src = activeVideoUrl;
      video.load();
    }
  }, [activeHlsPlaylistUrl, activeVideoUrl]);

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
    isFallbackToMp4Ref.current = false;
    setErrorState(null);
    setRetryCount(0);
    hlsNetworkRetryRef.current = 0;
    hlsMediaRetryRef.current = 0;
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const video = videoRef.current;
    if (video) {
      initMediaStream(video);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [lesson.id, selectedLanguage, initMediaStream]);

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
              if (!isMountedRef.current) return;
              isPendingPlayRef.current = false;
              setIsBuffering(false);
              setIsPlaying(true);
            })
            .catch((err: unknown) => {
              if (!isMountedRef.current) return;
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
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    if (isPlaying || isPendingPlayRef.current) {
      setIsBuffering(true);
    }
    setErrorState(null);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) {
      setDuration(v.duration || lesson.durationSeconds);
      setIsLoading(false);
      setIsBuffering(false);
      setErrorState(null);
    }
  };

  const handleWaiting = () => {
    if (isPlaying || isPendingPlayRef.current) {
      setIsBuffering(true);
    }
  };

  const handleStalled = () => {
    if (isPlaying || isPendingPlayRef.current) {
      setIsBuffering(true);
    }
  };

  const handlePlaying = () => {
    isPendingPlayRef.current = false;
    setIsLoading(false);
    setIsBuffering(false);
    setIsPlaying(true);
    setErrorState(null);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setIsBuffering(false);
    setErrorState(null);
  };

  const handleCanPlayThrough = () => {
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
      url: activeVideoUrl,
      event: e
    });

    if (errCode === 1 || errCode === (typeof MediaError !== 'undefined' ? MediaError.MEDIA_ERR_ABORTED : 1)) {
      console.warn('[LessonPlayer] Media operation aborted. Ignoring non-fatal abort.');
      return;
    }

    setIsBuffering(false);
    setIsLoading(false);
    setIsPlaying(false);
    isPendingPlayRef.current = false;

    let friendlyMsg = 'We encountered an issue loading this lesson video.';
    if (errCode === 2 || errCode === (typeof MediaError !== 'undefined' ? MediaError.MEDIA_ERR_NETWORK : 2)) {
      friendlyMsg = 'A network error occurred while downloading the video stream. Please check your internet connection.';
    } else if (errCode === 3 || errCode === (typeof MediaError !== 'undefined' ? MediaError.MEDIA_ERR_DECODE : 3)) {
      friendlyMsg = 'An error occurred while decoding the video stream. The video format could not be decoded.';
    } else if (errCode === 4 || errCode === (typeof MediaError !== 'undefined' ? MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED : 4)) {
      friendlyMsg = 'The video stream is temporarily unreachable or unsupported by this browser.';
    }

    if (!isFallbackToMp4Ref.current && retryCount < 2) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      setIsLoading(true);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        retryTimeoutRef.current = null;
        if (isMountedRef.current && videoRef.current) {
          initMediaStream(videoRef.current);
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
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setErrorState(null);
    setRetryCount(0);
    isFallbackToMp4Ref.current = false;
    hlsNetworkRetryRef.current = 0;
    hlsMediaRetryRef.current = 0;
    setIsLoading(true);
    setIsBuffering(false);
    if (videoRef.current) {
      initMediaStream(videoRef.current);
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
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatDurationDisplay = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s > 0 ? `${s}s` : ''}`;
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen().catch((err) => {
          console.warn('[LessonPlayer] Fullscreen request error:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn('[LessonPlayer] Exit fullscreen error:', err);
        });
      }
    }
  };

  const prevLesson = getPreviousLesson(lesson.id);
  const nextLesson = getNextLesson(lesson.id);
  const relatedLessons = getRelatedLessons(lesson);

  const handleAskVestIQ = () => {
    if (onAskVestIQ) {
      onAskVestIQ(lesson.vestiqPrompt);
    }
  };

  const currentLangObj = ACADEMY_LANGUAGES.find((l) => l.code === selectedLanguage) || ACADEMY_LANGUAGES[0];
  const practicalInsight = LESSON_PRACTICAL_INSIGHTS[lesson.id];
  const totalLessons = INVESTMENT_LESSONS.length;
  const completedCount = completedIds.length;
  const courseCompletionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const formattedNumber = lesson.number < 10 ? `0${lesson.number}` : `${lesson.number}`;

  return (
    <div className="space-y-6 pb-16">
      {/* ================================================================
          TOP NAVIGATION & COURSE HEADER BAR
      ================================================================ */}
      <div className="financial-section-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Back Button & Breadcrumbs */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-soft)] hover:bg-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-xs font-semibold border border-[var(--color-border)] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Academy</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-mono">
            <span>/</span>
            <span className="text-[var(--color-text-secondary)] font-sans font-medium">{lesson.category}</span>
            <span>/</span>
            <span className="text-[var(--color-accent)] font-bold">Lesson {formattedNumber} of {totalLessons}</span>
          </div>
        </div>

        {/* Right: Language Selector & Fast Navigation */}
        <div className="flex items-center gap-3 flex-wrap justify-between md:justify-end">
          {/* Audio & Subtitles Language */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-soft)]/60 border border-[var(--color-border)]">
            <Globe className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Audio:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedAcademyLanguage)}
              className="text-xs font-semibold text-[var(--color-text-primary)] bg-transparent border-0 focus:outline-none cursor-pointer"
              aria-label="Select academy lesson audio and subtitle language"
            >
              {ACADEMY_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Prev / Next Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && onSelectLesson(prevLesson)}
              className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                prevLesson
                  ? 'bg-[var(--color-surface-soft)] hover:bg-[var(--color-border-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] cursor-pointer'
                  : 'bg-[var(--color-surface-soft)]/30 border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed'
              }`}
              title={prevLesson ? `Previous: ${prevLesson.title}` : 'First lesson'}
              aria-label="Go to previous lesson"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={!nextLesson}
              onClick={() => nextLesson && onSelectLesson(nextLesson)}
              className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                nextLesson
                  ? 'bg-[var(--color-surface-soft)] hover:bg-[var(--color-border-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] cursor-pointer'
                  : 'bg-[var(--color-surface-soft)]/30 border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed'
              }`}
              title={nextLesson ? `Next: ${nextLesson.title}` : 'Last lesson'}
              aria-label="Go to next lesson"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mark Complete Action */}
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--color-surface-soft)] hover:bg-[var(--color-border-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? '✓ Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* ================================================================
          MAIN WORKSPACE GRID: THEATER PLAYER (LEFT) + CURRICULUM (RIGHT)
      ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ==============================================================
            LEFT COLUMN (COLS 1-8): VIDEO THEATER & EDUCATIONAL TABS
        ============================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* ============================================================
              HERO VIDEO THEATER PLAYER
          ============================================================ */}
          <div
            ref={playerContainerRef}
            className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group transition-all"
          >
            {/* Top Overlay Badge Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-white text-[11px] font-mono shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Bunny HLS • 1080p HD</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[11px] font-mono shadow-md">
                <span>{currentLangObj.label} Audio</span>
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video w-full flex items-center justify-center bg-black">
              {hasMedia ? (
                <video
                  ref={videoRef}
                  key={`${lesson.id}-${selectedLanguage}`}
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
                      if (isBuffering && hasEnoughBuffered(videoRef.current)) {
                        setIsBuffering(false);
                      }
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
                  onSeeking={() => {
                    if (isPlaying && !hasEnoughBuffered(videoRef.current)) {
                      setIsBuffering(true);
                    }
                  }}
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
                  Your browser does not support HTML5 video playback.
                </video>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                  <div className="text-sm font-semibold text-white">Video Coming Soon</div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Interactive high-yield video is rendering. You can explore the complete educational transcript and knowledge quiz below.
                  </p>
                </div>
              )}

              {/* Error UI Fallback Overlay */}
              {errorState?.hasError && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Streaming Playback Interrupted
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {errorState.message}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      You can retry HLS streaming or read the structured educational transcript below.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleManualRetry}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:brightness-110 text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
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
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-xs font-semibold shadow-2xl">
                    <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span>Buffering video...</span>
                  </div>
                </div>
              )}

              {/* Loading State Overlay */}
              {isLoading && !errorState?.hasError && !isPlaying && (
                <div className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none z-20">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-xs font-semibold shadow-2xl">
                    <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span>Loading stream...</span>
                  </div>
                </div>
              )}

              {/* Big Floating Play Button */}
              {hasMedia && !isPlaying && !isLoading && !errorState?.hasError && (
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="absolute inset-0 m-auto w-18 h-18 rounded-full bg-[var(--color-accent)]/90 hover:bg-[var(--color-accent)] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer z-10"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 ml-1 fill-current" />
                </button>
              )}
            </div>

            {/* Video Control Bar */}
            <div className="p-3.5 sm:p-4 bg-slate-950/95 border-t border-slate-800/80 space-y-2.5">
              {/* Scrubbable Seek Bar */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-400 w-11 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] hover:h-2 transition-all"
                  aria-label="Video seek slider"
                />
                <span className="text-[11px] font-mono text-slate-400 w-11">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls Toolbar */}
              <div className="flex items-center justify-between gap-3">
                {/* Left Controls: Play, Step Prev/Next, Volume, Speeds */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Playback Speed Selectors */}
                  <div className="hidden sm:flex items-center gap-1 text-xs">
                    {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          playbackRate === speed
                            ? 'bg-[var(--color-accent)] text-white font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Controls: Fullscreen Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              LESSON HEADER & SUMMARY
          ============================================================ */}
          <div className="financial-section-card p-6 space-y-4">
            {/* Meta Tags Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
                <span className="px-2.5 py-1 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] uppercase">
                  Lesson {formattedNumber}
                </span>
                <span className="px-2.5 py-1 rounded bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)] border border-[var(--color-border)] uppercase">
                  {lesson.category}
                </span>
                <span className="px-2.5 py-1 rounded bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  {lesson.level}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)]">
                <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Runtime: {formatDurationDisplay(lesson.durationSeconds)} ({lesson.durationSeconds}s)</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                {lesson.title}
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                {lesson.description}
              </p>
            </div>

            {/* Quick Next / Prev Action Bar */}
            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {prevLesson && (
                  <button
                    type="button"
                    onClick={() => onSelectLesson(prevLesson)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-surface-soft)] hover:bg-[var(--color-border-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Prev: {prevLesson.title}</span>
                  </button>
                )}
                {nextLesson && (
                  <button
                    type="button"
                    onClick={() => onSelectLesson(nextLesson)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-accent)] hover:brightness-105 text-xs font-semibold text-[var(--color-accent-text)] transition-all cursor-pointer shadow-xs"
                  >
                    <span>Next: {nextLesson.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleAskVestIQ}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--color-surface-soft)] hover:bg-[var(--color-border-subtle)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-accent)] transition-all cursor-pointer"
              >
                <VestiqMark size={14} />
                <span>Ask VestIQ About This Lesson</span>
              </button>
            </div>
          </div>

          {/* ============================================================
              INTERACTIVE EDUCATIONAL TABS
          ============================================================ */}
          <div className="space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('objectives')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'objectives'
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learning Objectives</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'quiz'
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Concept Quiz</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] font-mono">
                  {lesson.quiz.length} Qs
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transcript')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'transcript'
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Transcript</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vestiq')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'vestiq'
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>VestIQ Study Prompts</span>
              </button>

              {/* Mobile-only Curriculum Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className={`lg:hidden inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'curriculum'
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Curriculum (12)</span>
              </button>
            </div>

            {/* Tab 1: Objectives & Practical Insights */}
            {activeTab === 'objectives' && (
              <div className="space-y-6">
                {/* Core Learning Objectives Card */}
                <div className="financial-section-card p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>Core Learning Objectives</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {lesson.learningPoints.map((point, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-[var(--color-surface-soft)]/50 border border-[var(--color-border-subtle)] flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-xs sm:text-sm text-[var(--color-text-primary)] leading-relaxed">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Takeaway Callout */}
                <div className="financial-section-card p-6 bg-gradient-to-r from-[var(--color-accent)]/5 to-[var(--color-surface-soft)] border-l-4 border-[var(--color-accent)] space-y-2">
                  <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Institutional Key Takeaway</span>
                  </div>
                  <blockquote className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] leading-snug">
                    "{activeTakeaway}"
                  </blockquote>
                </div>

                {/* Practical Indian Market Rupee Context */}
                {practicalInsight && (
                  <div className="financial-section-card p-6 space-y-2">
                    <span className="text-xs font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">
                      {practicalInsight.label}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
                      Why This Matters for Your Real Wealth
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {practicalInsight.example}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Quiz */}
            {activeTab === 'quiz' && (
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
            )}

            {/* Tab 3: Full Transcript */}
            {activeTab === 'transcript' && (
              <LessonTranscript
                transcript={activeTranscript}
                durationSeconds={lesson.durationSeconds}
                languageLabel={`${currentLangObj.native} (${currentLangObj.label})`}
              />
            )}

            {/* Tab 4: VestIQ AI Study Companion */}
            {activeTab === 'vestiq' && (
              <div className="financial-section-card p-6 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
                    <VestiqMark size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">VestIQ AI Financial Tutor</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Get personalized analogies, tax considerations, and portfolio allocations for this lesson.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-surface-soft)]/50 border border-[var(--color-border-subtle)] space-y-3">
                  <span className="text-xs font-mono font-bold text-[var(--color-accent)] uppercase">Suggested Inquiry:</span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] italic">
                    "{lesson.vestiqPrompt}"
                  </p>
                  <button
                    type="button"
                    onClick={handleAskVestIQ}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <VestiqMark size={14} />
                    <span>Launch Prompt in VestIQ</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[var(--color-text-muted)] uppercase">More Questions to Explore:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      `How does ${lesson.title.toLowerCase()} affect my monthly budget?`,
                      `What are the tax implications in India for this?`,
                      `Give me a real-life analogy using Indian everyday examples.`,
                      `What mistakes do beginners commonly make with this?`
                    ].map((promptText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onAskVestIQ && onAskVestIQ(promptText)}
                        className="text-left p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-surface-soft)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                      >
                        "{promptText}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5 (Mobile-only Curriculum View) */}
            {activeTab === 'curriculum' && (
              <div className="lg:hidden financial-section-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">All 12 Course Lessons</h3>
                  <span className="text-xs font-mono text-[var(--color-accent)]">{completedCount}/12 Done</span>
                </div>
                <div className="space-y-2">
                  {INVESTMENT_LESSONS.map((l) => {
                    const isCurrent = l.id === lesson.id;
                    const isDone = completedIds.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => onSelectLesson(l)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isCurrent
                            ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-accent)]'
                            : 'bg-[var(--color-card)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : isCurrent
                              ? 'bg-[var(--color-accent)] text-white'
                              : 'bg-[var(--color-surface-soft)] text-[var(--color-text-muted)]'
                          }`}>
                            {isDone ? '✓' : l.number}
                          </span>
                          <span className="font-semibold truncate">{l.title}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--color-text-muted)] shrink-0">
                          {formatDurationDisplay(l.durationSeconds)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==============================================================
            RIGHT COLUMN (COLS 9-12): LESSON CURRICULUM SYLLABUS SIDEBAR
        ============================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Syllabus Card Header & Progress Bar */}
          <div className="financial-section-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Course Curriculum</h3>
                  <p className="text-[11px] text-[var(--color-text-muted)]">12 Structured Lessons</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
                {courseCompletionPct}%
              </span>
            </div>

            {/* Course Progress Track */}
            <div className="space-y-1.5">
              <div className="w-full bg-[var(--color-surface-soft)] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-500"
                  style={{ width: `${courseCompletionPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
                <span>{completedCount} of 12 completed</span>
                <span>{12 - completedCount} remaining</span>
              </div>
            </div>

            {/* Sequential Lesson Syllabus */}
            <div className="space-y-2 pt-2 divide-y divide-[var(--color-border-subtle)] max-h-[580px] overflow-y-auto pr-1">
              {INVESTMENT_LESSONS.map((l) => {
                const isCurrent = l.id === lesson.id;
                const isDone = completedIds.includes(l.id);
                const lNum = l.number < 10 ? `0${l.number}` : `${l.number}`;

                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSelectLesson(l)}
                    className={`w-full text-left pt-3 pb-2.5 px-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${
                      isCurrent
                        ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30'
                        : 'hover:bg-[var(--color-surface-soft)]/60'
                    }`}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {/* Status Badge */}
                    <div className="pt-0.5 shrink-0">
                      {isDone ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center animate-pulse">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono text-[10px] flex items-center justify-center">
                          {lNum}
                        </div>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold truncate ${
                          isCurrent
                            ? 'text-[var(--color-accent)]'
                            : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]'
                        }`}>
                          {l.title}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-[var(--color-accent)] text-white text-[9px] font-mono font-bold uppercase shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--color-text-muted)]">
                        <span>{formatDurationDisplay(l.durationSeconds)}</span>
                        <span>•</span>
                        <span className="truncate">{l.category}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick AI Study Buddy Card */}
          <div className="financial-section-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] uppercase">
              <VestiqMark size={14} />
              <span>VestIQ Assistant</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
              Got questions on {lesson.title}?
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Ask VestIQ to explain with tailored real-world analogies or calculations.
            </p>
            <button
              type="button"
              onClick={handleAskVestIQ}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-soft)] hover:bg-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-xs font-semibold border border-[var(--color-border)] transition-colors cursor-pointer"
            >
              <span>Ask VestIQ</span>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            </button>
          </div>

          {/* Related Lessons Card */}
          {relatedLessons.length > 0 && (
            <div className="financial-section-card p-5 space-y-3">
              <span className="text-xs font-bold text-[var(--color-text-muted)] font-mono uppercase tracking-wider">
                Related Topics
              </span>
              <div className="space-y-2">
                {relatedLessons.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectLesson(rel)}
                    className="w-full text-left p-2.5 rounded-lg border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] transition-colors flex items-center justify-between text-xs group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate">
                        {rel.title}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">{rel.category}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Educational Disclaimer Card */}
          <AcademyDisclaimer />
        </div>
      </div>
    </div>
  );
};
