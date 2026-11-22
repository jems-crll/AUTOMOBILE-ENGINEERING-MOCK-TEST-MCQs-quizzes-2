import React, { useState, useEffect, Suspense, lazy, useCallback } from "react";
import { t } from "./utils/i18n";
import Dashboard from "./components/Dashboard";
import { QuizAttempt, Question, StateLanguage, STATE_LANGUAGES, User, SubscriptionConfig } from "./types";
import { QUESTIONS, CHAPTERS } from "./data/questions";
import * as Icons from "lucide-react";
import Auth from "./components/Auth";
import ErrorBoundary from "./components/ErrorBoundary";
import PWAInstallButton from "./components/PWAInstallButton";
import OfflineBanner from "./components/OfflineBanner";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import {
  getStoredUser,
  saveStoredUser,
  clearStoredUser,
  getCachedAttempts,
  setCachedAttempts,
  enqueueSyncAction,
  flushPendingSync,
  getPendingSyncQueue,
  mergeServerAndLocalAttempts,
} from "./utils/offlineStorage";

const QuizContainer = lazy(() => import("./components/QuizContainer"));
const Scorecard = lazy(() => import("./components/Scorecard"));
const Analytics = lazy(() => import("./components/Analytics"));
const RazorpayModal = lazy(() => import("./components/RazorpayModal"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));

const ViewLoader = () => (
  <div className="min-h-[320px] flex flex-col items-center justify-center gap-3 p-8">
    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
      <Icons.Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
    </div>
  </div>
);


export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const stored = localStorage.getItem("omto_theme");
      if (stored === "light") return "light";
      return "dark"; // Default dark
    } catch (_) {
      return "dark";
    }
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("omto_theme", theme);
  }, [theme]);

  const isOnline = useOnlineStatus();
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());

  const handleSetCurrentUser = useCallback((user: User | null) => {
    saveStoredUser(user);
    setCurrentUser(user);
  }, []);

  const [isRazorpayOpen, setIsRazorpayOpen] = useState<boolean>(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  // Synchronize currentUser details with the server when online
  useEffect(() => {
    if (!currentUser || !isOnline) return;

    const syncProfile = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      fetch(`/api/users/profile?email=${encodeURIComponent(currentUser.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            if (
              data.user.isPremium !== currentUser.isPremium || 
              data.user.role !== currentUser.role ||
              data.user.isBlocked !== currentUser.isBlocked ||
              data.user.subscriptionStatus !== currentUser.subscriptionStatus ||
              (data.user.sessionToken && currentUser.sessionToken && data.user.sessionToken !== currentUser.sessionToken)
            ) {
              console.log("[App] Profile sync update detected:", data.user);
              if (data.user.isBlocked) {
                setSessionNotice(t(selectedLanguage.code, "accountBlocked"));
                clearStoredUser();
                setCurrentUser(null);
                return;
              }
              if (data.user.sessionToken && currentUser.sessionToken && data.user.sessionToken !== currentUser.sessionToken) {
                setSessionNotice(t(selectedLanguage.code, "sessionInvalidated"));
                clearStoredUser();
                setCurrentUser(null);
                return;
              }
              const updatedUser = {
                ...currentUser,
                isPremium: data.user.isPremium,
                role: data.user.role,
                subscriptionStatus: data.user.subscriptionStatus,
                sessionToken: data.user.sessionToken
              };
              saveStoredUser(updatedUser);
              setCurrentUser(updatedUser);
            }
          }
        })
        .catch(err => console.warn("Could not auto-sync profile details:", err));
    };

    syncProfile();

    const interval = setInterval(syncProfile, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.email, isOnline]);

  // Heartbeat & User Sync (Online only)
  useEffect(() => {
    let interval: any;
    if (currentUser && isOnline) {
      fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser })
      }).catch(() => {});

      const ping = () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) return;
        fetch("/api/users/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email })
        }).catch(() => {});
      };
      
      interval = setInterval(ping, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser, isOnline]);

  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "admin">("dashboard");
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  
  // National Language state (defaults to Marathi, validated against active STATE_LANGUAGES)
  const [selectedLanguage, setSelectedLanguage] = useState<StateLanguage>(() => {
    try {
      const stored = localStorage.getItem("omto_selected_language");
      if (stored) {
        const parsed = JSON.parse(stored);
        const valid = STATE_LANGUAGES.find((l) => l.code === parsed?.code);
        if (valid) return valid;
      }
    } catch (_) {}
    return STATE_LANGUAGES[0]; // Marathi as default
  });

  // Loader states
  const [loadingTest, setLoadingTest] = useState<boolean>(false);
  const [loadingStatusText, setLoadingStatusText] = useState<string>("");

  // Quiz states
  const [quizState, setQuizState] = useState<{
    isActive: boolean;
    questions: Question[];
    mode: "practice" | "exam";
    chapterId: number | "all";
    timeLimitMinutes: number;
    setId?: number | "all";
    initialCurrentIndex?: number;
    initialSelectedAnswers?: Record<number, string>;
    initialTimeSpent?: number;
    initialSecondsRemaining?: number;
    initialFlaggedQuestions?: Record<number, boolean>;
  } | null>(null);

  // Scorecard states
  const [scorecardState, setScorecardState] = useState<{
    questions: Question[];
    score: number;
    answers: Record<number, string>;
    timeSpentSeconds: number;
    chapterId: number | "all";
    mode: "practice" | "exam";
    timeLimitMinutes: number;
    setId?: number | "all";
  } | null>(null);

  // Load attempts immediately from local cache, then flush pending offline syncs & fetch server when online
  useEffect(() => {
    if (!currentUser) {
      setAttempts([]);
      setPendingSyncCount(0);
      return;
    }

    const email = currentUser.email;
    const cached = getCachedAttempts(email);
    const pending = getPendingSyncQueue(email);
    setAttempts(cached);
    setPendingSyncCount(pending.length);

    if (!isOnline) return;

    let cancelled = false;

    const syncAndLoad = async () => {
      if (pending.length > 0) {
        setIsSyncing(true);
        const left = await flushPendingSync(email);
        if (!cancelled) setPendingSyncCount(left);
        if (!cancelled) setIsSyncing(false);
      }

      try {
        const res = await fetch(`/api/users/attempts?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!cancelled && data.success && Array.isArray(data.attempts)) {
          const merged = mergeServerAndLocalAttempts(
            data.attempts,
            getCachedAttempts(email),
            getPendingSyncQueue(email)
          );
          setAttempts(merged);
          setCachedAttempts(email, merged);
        }
      } catch (err) {
        console.warn("Using offline cached attempts:", err);
      }
    };

    syncAndLoad();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.email, isOnline]);

  // Dynamic subscription configuration state
  const [subscriptionConfig, setSubscriptionConfig] = useState<SubscriptionConfig>({
    amount: 299,
    originalAmount: 999,
    billingPeriod: "lifetime",
    detailsEn: "Automobile Engg. Premium Pack",
    detailsMr: "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
  });

  // Fetch subscription config on mount (with localStorage offline fallback)
  useEffect(() => {
    try {
      const localConfigStr = localStorage.getItem("omto_subscription_config");
      if (localConfigStr) {
        const localConfig = JSON.parse(localConfigStr);
        if (localConfig && typeof localConfig.amount === "number") {
          setSubscriptionConfig(localConfig);
        }
      }
    } catch (e) {
      console.error("Failed to parse local subscription config:", e);
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    fetch(`/api/subscription/config`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.amount === "number") {
          setSubscriptionConfig(data);
          try {
            localStorage.setItem("omto_subscription_config", JSON.stringify(data));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch((err) => console.warn("Could not fetch subscription config from backend, using local configuration:", err));
  }, [isOnline]);

  // Save attempt optimistically to local cache and sync with server (or queue if offline)
  const saveAttempt = (newAttempt: QuizAttempt) => {
    setAttempts((prev) => {
      const updated = [...prev, newAttempt];
      if (currentUser) {
        setCachedAttempts(currentUser.email, updated);
      }
      return updated;
    });

    if (currentUser) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueSyncAction(currentUser.email, { type: "save_attempt", attempt: newAttempt });
        setPendingSyncCount(getPendingSyncQueue(currentUser.email).length);
        return;
      }

      fetch("/api/users/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, attempt: newAttempt })
      })
        .then((res) => {
          if (!res.ok) throw new Error("Server error");
        })
        .catch(() => {
          enqueueSyncAction(currentUser.email, { type: "save_attempt", attempt: newAttempt });
          setPendingSyncCount(getPendingSyncQueue(currentUser.email).length);
        });
    }
  };

  const handleClearHistory = () => {
    setAttempts([]);
    if (currentUser) {
      setCachedAttempts(currentUser.email, []);
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueSyncAction(currentUser.email, { type: "clear_history" });
        setPendingSyncCount(getPendingSyncQueue(currentUser.email).length);
        return;
      }

      fetch("/api/users/attempts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      })
        .then((res) => {
          if (!res.ok) throw new Error("Server error");
        })
        .catch(() => {
          enqueueSyncAction(currentUser.email, { type: "clear_history" });
          setPendingSyncCount(getPendingSyncQueue(currentUser.email).length);
        });
    }
  };

  // Setup questions and start test
  const handleStartTest = (config: {
    chapterId: number | "all";
    mode: "practice" | "exam";
    questionCount: number;
    timeLimitMinutes: number;
    source: "static" | "ai";
    setId?: number | "all";
    resumeState?: any;
  }) => {
    setScorecardState(null);
    setSessionNotice(null);
    setLoadingTest(true);

    if (config.resumeState) {
      let resumedQuestions: Question[] = [];
      if (Array.isArray(config.resumeState.questions) && config.resumeState.questions.length > 0) {
        resumedQuestions = config.resumeState.questions.filter(Boolean);
      } else if (Array.isArray(config.resumeState.questionIds) && config.resumeState.questionIds.length > 0) {
        const questionMap = new Map(QUESTIONS.map((q) => [q.id, q]));
        resumedQuestions = config.resumeState.questionIds
          .map((id: number) => questionMap.get(id))
          .filter((q: Question | undefined): q is Question => Boolean(q));
      }

      if (resumedQuestions.length === 0) {
        try {
          localStorage.removeItem("omto_active_quiz_state");
        } catch (_) {}
        setLoadingTest(false);
        setSessionNotice(
          selectedLanguage.code === "mr"
            ? "जुन्या चाचणीचा डेटा उपलब्ध नाही, कृपया नवीन चाचणी सुरू करा."
            : selectedLanguage.code === "hi"
            ? "पिछले टेस्ट का डेटा उपलब्ध नहीं है, कृपया नया टेस्ट शुरू करें।"
            : "Saved test data is no longer available. Please start a new test."
        );
        return;
      }

      setQuizState({
        isActive: true,
        questions: resumedQuestions,
        mode: config.resumeState.mode === "exam" ? "exam" : "practice",
        chapterId: config.resumeState.chapterId,
        timeLimitMinutes: config.resumeState.timeLimitMinutes || 20,
        setId: config.resumeState.setId,
        initialCurrentIndex: Math.min(Math.max(0, config.resumeState.currentIndex ?? 0), resumedQuestions.length - 1),
        initialSelectedAnswers: config.resumeState.selectedAnswers || {},
        initialTimeSpent: config.resumeState.timeSpent || 0,
        initialSecondsRemaining: config.resumeState.secondsRemaining,
        initialFlaggedQuestions: config.resumeState.flaggedQuestions || {},
      });
      setLoadingTest(false);
      return;
    }

    // Offline Textbook MCQ selection
    let filtered = [...QUESTIONS];
    if (config.chapterId !== "all") {
      filtered = QUESTIONS.filter((q) => q.chapterId === config.chapterId);
    }

    let selected: Question[] = [];
    if (config.chapterId !== "all" && config.setId && config.setId !== "all") {
      // Load specified set sequentially (50 questions per set)
      const startIdx = (config.setId - 1) * 50;
      const endIdx = Math.min(config.setId * 50, filtered.length);
      selected = filtered.slice(startIdx, endIdx);
    } else {
      // Shuffle
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));
    }

    // Limit questions to 10 for free tier demo until user subscribes (10 questions per chapter)
    const effectiveTimeLimit = !currentUser?.isPremium ? Math.min(config.timeLimitMinutes || 10, 10) : config.timeLimitMinutes;
    if (!currentUser?.isPremium) {
      selected = selected.slice(0, 10);
    }

    const validSelected = selected.filter(Boolean);
    if (validSelected.length === 0) {
      setLoadingTest(false);
      setSessionNotice(
        selectedLanguage.code === "mr"
          ? "या संचासाठी कोणतेही प्रश्न उपलब्ध नाहीत. कृपया दुसरा संच निवडा."
          : selectedLanguage.code === "hi"
          ? "इस सेट के लिए कोई प्रश्न उपलब्ध नहीं हैं। कृपया दूसरा सेट चुनें।"
          : "No questions available for this selection. Please choose another chapter or set."
      );
      return;
    }

    if (selectedLanguage.code !== "en" && selectedLanguage.code !== "mr") {
      setLoadingStatusText(
        selectedLanguage.code === "hi" ? "हिंदी प्रश्न संकलित हो रहे हैं..." : "Preparing test..."
      );

      setTimeout(() => {
        setQuizState({
          isActive: true,
          questions: validSelected,
          mode: config.mode,
          chapterId: config.chapterId,
          timeLimitMinutes: effectiveTimeLimit,
          setId: config.setId,
        });
        setLoadingTest(false);
      }, 400);
    } else {
      setQuizState({
        isActive: true,
        questions: validSelected,
        mode: config.mode,
        chapterId: config.chapterId,
        timeLimitMinutes: effectiveTimeLimit,
        setId: config.setId,
      });
      setLoadingTest(false);
    }
  };

  const handleQuizComplete = (score: number, answers: Record<number, string>, timeSpentSeconds: number) => {
    if (!quizState) return;

    try {
      localStorage.removeItem("omto_active_quiz_state");
    } catch (_) {}

    let chName = "";
    if (quizState.chapterId === "all") {
      chName = t(selectedLanguage.code, "allChapters");
    } else {
      const ch = CHAPTERS.find((c) => c.id === quizState.chapterId);
      chName = ch ? (selectedLanguage.code === "mr" ? ch.nameMarathi : ch.name) : `Chapter ${quizState.chapterId}`;
      if (quizState.setId && quizState.setId !== "all") {
        chName += ` - ${`${t(selectedLanguage.code, "set")} ${quizState.setId}`}`;
      }
    }

    const newAttempt: QuizAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      chapterId: quizState.chapterId,
      chapterName: chName,
      score,
      totalQuestions: quizState.questions.length,
      date: new Date().toISOString(),
      timeSpentSeconds,
      answers,
      setId: quizState.setId,
    };

    saveAttempt(newAttempt);

    setScorecardState({
      questions: quizState.questions,
      score,
      answers,
      timeSpentSeconds,
      chapterId: quizState.chapterId,
      mode: quizState.mode,
      timeLimitMinutes: quizState.timeLimitMinutes,
      setId: quizState.setId,
    });

    setQuizState(null);
  };

  // Render spinning mechanical gear loader
  if (loadingTest) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-amber-500/20 selection:text-amber-400 font-sans">
        <div className="relative flex flex-col items-center max-w-md w-full bg-white dark:bg-slate-900/40 p-10 rounded-3xl border border-slate-200 dark:border-slate-800/80 text-center backdrop-blur-md shadow-2xl">
          <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
            <Icons.Settings className="h-20 w-20 text-amber-500 animate-spin" style={{ animationDuration: "10s" }} />
            <Icons.Settings className="absolute top-1 right-1 h-10 w-10 text-amber-600/60 animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} />
            <Icons.Wrench className="absolute h-8 w-8 text-slate-900 dark:text-white animate-pulse" />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 font-mono bg-amber-500/10 px-3 py-1 rounded-full mb-3">
            {selectedLanguage.nativeName} ({selectedLanguage.name})
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-2">
            {loadingStatusText}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            {t(selectedLanguage.code, "compiling")}
          </p>

          <div className="w-full bg-slate-50 dark:bg-slate-950 h-1.5 rounded-full mt-6 overflow-hidden border border-slate-200 dark:border-slate-850">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-400 antialiased font-sans">
        {/* Top Header */}
        <header className="border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            {/* Logo Branding */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-amber-500 rounded-xl text-slate-950 shadow-lg shadow-amber-500/10 shrink-0">
                <Icons.Wrench className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded font-bold">OMTO</span>
                  <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 font-mono truncate">Automobile Engg</span>
                </div>
                <h1 className="text-sm sm:text-lg md:text-xl font-black font-sans tracking-tight text-slate-900 dark:text-white mt-0.5 leading-none truncate">
                  ऑटोमोबाईल मॉक टेस्ट <span className="hidden sm:inline text-amber-500 font-normal">| MCQ Test</span>
                </h1>
              </div>
            </div>
            
            {/* National State Language Selector, Install & Theme */}
            <div className="flex items-center gap-2 shrink-0">
              <PWAInstallButton languageCode={selectedLanguage.code} />
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition cursor-pointer"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Icons.Sun className="h-4 w-4" /> : <Icons.Moon className="h-4 w-4" />}
              </button>
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 pl-2 pr-0.5 sm:pl-2.5 sm:pr-1 py-1 rounded-xl gap-1 sm:gap-2 shadow">
                <Icons.Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 shrink-0" />
                <select
                  value={selectedLanguage.code}
                  onChange={(e) => {
                    const lang = STATE_LANGUAGES.find((l) => l.code === e.target.value);
                    if (lang) {
                      setSelectedLanguage(lang);
                      localStorage.setItem("omto_selected_language", JSON.stringify(lang));
                    }
                  }}
                  className="bg-transparent border-none text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none pr-1 sm:pr-1.5 cursor-pointer font-sans"
                >
                  {STATE_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs">
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <OfflineBanner
            isOnline={isOnline}
            pendingSyncCount={pendingSyncCount}
            isSyncing={isSyncing}
            languageCode={selectedLanguage.code}
          />
        </header>

        {/* Auth Module Wrapper */}
        <main className="flex-grow flex flex-col items-center justify-center px-3 py-4 gap-4">
          {sessionNotice && (
            <div className="max-w-md w-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs font-semibold shadow-sm">
              <div className="flex items-start gap-2.5">
                <Icons.AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{sessionNotice}</span>
              </div>
              <button
                onClick={() => setSessionNotice(null)}
                className="text-rose-500 hover:text-rose-400 cursor-pointer shrink-0"
                aria-label="Close notification"
              >
                <Icons.X className="h-4 w-4" />
              </button>
            </div>
          )}
          <Auth onLoginSuccess={handleSetCurrentUser} selectedLanguage={selectedLanguage} />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
          <p>© 2026 OMTO Automobile Engineering Lab. {t(selectedLanguage.code, "allRightsReserved")}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-400 antialiased font-sans">
      
      {/* Top Banner and Header */}
      <header className="border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex items-center justify-between gap-3">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-amber-500 rounded-xl text-slate-950 shadow-lg shadow-amber-500/10 shrink-0">
              <Icons.Wrench className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded font-bold">OMTO</span>
                <span className="h-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 font-mono truncate">Automobile Engg</span>
              </div>
              <h1 className="text-sm sm:text-lg md:text-xl font-black font-sans tracking-tight text-slate-900 dark:text-white mt-0.5 leading-none truncate">
                ऑटोमोबाईल मॉक टेस्ट <span className="hidden sm:inline text-amber-500 font-normal">| MCQ Test</span>
              </h1>
            </div>
          </div>

          {/* User Profile, Subscription and Language (Hidden during active test) */}
          {!quizState && (
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
              {/* Tab selector */}
              <nav className="hidden lg:flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setScorecardState(null);
                  }}
                  className={`px-4 py-2 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "dashboard" && !scorecardState
                      ? "bg-slate-100 dark:bg-slate-800 text-amber-400"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Icons.LayoutDashboard className="h-3.5 w-3.5" />
                  <span>{t(selectedLanguage.code, "dashboard")}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("analytics");
                    setScorecardState(null);
                  }}
                  className={`px-4 py-2 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "analytics" && !scorecardState
                      ? "bg-slate-100 dark:bg-slate-800 text-amber-400"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Icons.TrendingUp className="h-3.5 w-3.5" />
                  <span>{t(selectedLanguage.code, "analytics")}</span>
                </button>
                {currentUser?.role === "admin" && (
                  <button
                    onClick={() => {
                      setActiveTab("admin");
                      setScorecardState(null);
                    }}
                    className={`px-4 py-2 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "admin" && !scorecardState
                        ? "bg-slate-100 dark:bg-slate-800 text-amber-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <Icons.ShieldAlert className="h-3.5 w-3.5" />
                    <span>{t(selectedLanguage.code, "admin")}</span>
                  </button>
                )}
              </nav>

              <PWAInstallButton languageCode={selectedLanguage.code} />

              {/* National State Language Selector */}
              
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Icons.Sun className="h-4 w-4" /> : <Icons.Moon className="h-4 w-4" />}
            </button>
            <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 pl-2 pr-0.5 sm:pl-2.5 sm:pr-1 py-1 rounded-xl gap-1 sm:gap-2 shadow">

                <Icons.Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 shrink-0" />
                <select
                  value={selectedLanguage.code}
                  onChange={(e) => {
                    const lang = STATE_LANGUAGES.find((l) => l.code === e.target.value);
                    if (lang) {
                      setSelectedLanguage(lang);
                      localStorage.setItem("omto_selected_language", JSON.stringify(lang));
                    }
                  }}
                  className="bg-transparent border-none text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none pr-1 sm:pr-1.5 cursor-pointer font-sans"
                >
                  {STATE_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs">
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Session Profile Header Info */}
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-850 pl-2 sm:pl-3 md:pl-4">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-bold truncate max-w-[120px]">{currentUser.email}</span>
                  <span className="text-[10px] font-mono font-black flex items-center gap-1 justify-end">
                    {currentUser.isPremium ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Icons.Crown className="h-3 w-3 text-amber-500 fill-amber-500/20" />
                        PREMIUM
                      </span>
                    ) : (
                      <span className="text-slate-500 uppercase">Free Account</span>
                    )}
                  </span>
                </div>

                {/* Upgrade Button */}
                {!currentUser.isPremium && (
                  <button
                    onClick={() => setIsRazorpayOpen(true)}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-[11px] sm:text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Icons.Crown className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">{t(selectedLanguage.code, "premium")}</span>
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={() => {
                    clearStoredUser();
                    setCurrentUser(null);
                  }}
                  title={t(selectedLanguage.code, "logout")}
                  className="p-1.5 sm:p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg transition cursor-pointer"
                >
                  <Icons.LogOut className="h-3.5 sm:h-4 sm:w-4 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
        <OfflineBanner
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          isSyncing={isSyncing}
          languageCode={selectedLanguage.code}
        />
      </header>

      {/* Main Core Content Stage */}
      <main className={`flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10 ${!quizState && !scorecardState ? "pb-24 lg:pb-10" : ""}`}>
        {sessionNotice && (
          <div className="mb-5 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-semibold shadow-sm">
            <div className="flex items-center gap-2.5">
              <Icons.Info className="h-4 w-4 shrink-0 text-amber-500" />
              <span>{sessionNotice}</span>
            </div>
            <button
              onClick={() => setSessionNotice(null)}
              className="text-amber-500 hover:text-amber-400 cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <Icons.X className="h-4 w-4" />
            </button>
          </div>
        )}

        <ErrorBoundary
          languageCode={selectedLanguage.code}
          onReset={() => {
            setQuizState(null);
            setScorecardState(null);
            setActiveTab("dashboard");
          }}
        >
        <Suspense fallback={<ViewLoader />}>
        {/* Scenario 1: Active Quiz Session */}
        {quizState && (
          <QuizContainer
            chapterId={quizState.chapterId}
            mode={quizState.mode}
            questions={quizState.questions}
            timeLimitMinutes={quizState.timeLimitMinutes}
            selectedLanguage={selectedLanguage}
            onComplete={handleQuizComplete}
            onExit={() => setQuizState(null)}
            isPremium={currentUser?.isPremium ?? false}
            onUpgradeClick={() => setIsRazorpayOpen(true)}
            subscriptionConfig={subscriptionConfig}
            initialCurrentIndex={quizState.initialCurrentIndex}
            initialSelectedAnswers={quizState.initialSelectedAnswers}
            initialTimeSpent={quizState.initialTimeSpent}
            initialSecondsRemaining={quizState.initialSecondsRemaining}
            initialFlaggedQuestions={quizState.initialFlaggedQuestions}
          />
        )}

        {/* Scenario 2: Test Completion scorecard */}
        {!quizState && scorecardState && (
          <Scorecard
            questions={scorecardState.questions}
            score={scorecardState.score}
            selectedAnswers={scorecardState.answers}
            timeSpentSeconds={scorecardState.timeSpentSeconds}
            selectedLanguage={selectedLanguage}
            onRetake={() => {
              handleStartTest({
                chapterId: scorecardState.chapterId,
                mode: scorecardState.mode,
                questionCount: scorecardState.questions.length,
                timeLimitMinutes: scorecardState.timeLimitMinutes,
                source: "static",
                setId: scorecardState.setId,
              });
            }}
            onDashboard={() => setScorecardState(null)}
            isPremium={currentUser?.isPremium ?? false}
            onUpgradeClick={() => setIsRazorpayOpen(true)}
            subscriptionConfig={subscriptionConfig}
          />
        )}

        {/* Scenario 3: Standard Navigation and Tabs */}
        {!quizState && !scorecardState && (
          <>
            {/* Small Tab bar for mobile and tablet devices */}
            <div className="lg:hidden mb-6 flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex-1 py-2.5 rounded-md text-center transition ${
                  activeTab === "dashboard" ? "bg-slate-100 dark:bg-slate-800 text-amber-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {t(selectedLanguage.code, "dashboard")}
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 py-2.5 rounded-md text-center transition ${
                  activeTab === "analytics" ? "bg-slate-100 dark:bg-slate-800 text-amber-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {t(selectedLanguage.code, "analytics")}
              </button>
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`flex-1 py-2.5 rounded-md text-center transition ${
                    activeTab === "admin" ? "bg-slate-100 dark:bg-slate-800 text-amber-400" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {t(selectedLanguage.code, "admin")}
                </button>
              )}
            </div>

            {/* Render Dashboard, Analytics, or AdminPanel */}
            {activeTab === "dashboard" ? (
              <Dashboard
                attempts={attempts}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                currentUser={currentUser}
                onStartTest={handleStartTest}
                onUpgradeClick={() => setIsRazorpayOpen(true)}
                subscriptionConfig={subscriptionConfig}
              />
            ) : activeTab === "analytics" ? (
              <Analytics
                attempts={attempts}
                onClearHistory={handleClearHistory}
                selectedLanguage={selectedLanguage}
              />
            ) : (
              currentUser?.role === "admin" ? (
                <AdminPanel
                  selectedLanguage={selectedLanguage}
                  onClose={() => setActiveTab("dashboard")}
                  subscriptionConfig={subscriptionConfig}
                  onUpdateSubscriptionConfig={(updated) => setSubscriptionConfig(updated)}
                />
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 max-w-md mx-auto text-center space-y-4 shadow-2xl">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit mx-auto border border-red-500/20">
                    <Icons.ShieldAlert className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Access Denied / प्रवेश नाकारला</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(selectedLanguage.code, "needAdmin")}
                  </p>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg transition"
                  >
                    {t(selectedLanguage.code, "goToDashboard")}
                  </button>
                </div>
              )
            )}
          </>
        )}
        </Suspense>
        </ErrorBoundary>
      </main>

      {/* Razorpay Gateway Modal */}
      {isRazorpayOpen && (
        <Suspense fallback={null}>
          <RazorpayModal
            isOpen={isRazorpayOpen}
            onClose={() => setIsRazorpayOpen(false)}
            currentUser={currentUser}
            onPaymentSuccess={(updatedUser) => {
              handleSetCurrentUser(updatedUser);
            }}
            selectedLanguage={selectedLanguage}
            subscriptionConfig={subscriptionConfig}
          />
        </Suspense>
      )}

      {/* Mobile Sticky Bottom App Navigation Bar */}
      {currentUser && !quizState && !scorecardState && (
        <nav aria-label="Mobile Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden px-4 py-2.5 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => { setActiveTab("dashboard"); setScorecardState(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer ${
              activeTab === "dashboard" && !scorecardState ? "text-amber-500 scale-105" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icons.LayoutDashboard className="h-5 w-5" />
            <span>{t(selectedLanguage.code, "dashboard")}</span>
          </button>
          <button
            onClick={() => { setActiveTab("analytics"); setScorecardState(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer ${
              activeTab === "analytics" && !scorecardState ? "text-amber-500 scale-105" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icons.BarChart3 className="h-5 w-5" />
            <span>{t(selectedLanguage.code, "analytics")}</span>
          </button>
          {!currentUser.isPremium && (
            <button
              onClick={() => setIsRazorpayOpen(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-amber-500 hover:text-amber-400 transition cursor-pointer scale-110"
            >
              <div className="p-1.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                <Icons.Crown className="h-5 w-5 text-amber-500" />
              </div>
              <span>{t(selectedLanguage.code, "premium")}</span>
            </button>
          )}
          {currentUser.role === "admin" && (
            <button
              onClick={() => { setActiveTab("admin"); setScorecardState(null); }}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer ${
                activeTab === "admin" && !scorecardState ? "text-amber-500 scale-105" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icons.ShieldAlert className="h-5 w-5" />
              <span>{t(selectedLanguage.code, "admin")}</span>
            </button>
          )}
        </nav>
      )}

      {/* Footer copyright */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 OMTO Automobile Engineering Lab. {t(selectedLanguage.code, "allRightsReserved")}</p>
      </footer>
    </div>
  );
}
