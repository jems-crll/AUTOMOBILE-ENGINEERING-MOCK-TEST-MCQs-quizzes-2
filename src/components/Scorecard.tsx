import React, { useState, useEffect } from "react";
import { t } from "../utils/i18n";
import { Question, StateLanguage, SubscriptionConfig } from "../types";
import * as Icons from "lucide-react";
import confetti from "canvas-confetti";

interface ScorecardProps {
  questions: Question[];
  score: number;
  selectedAnswers: Record<number, string>;
  timeSpentSeconds: number;
  selectedLanguage: StateLanguage;
  onRetake: () => void;
  onDashboard: () => void;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
  subscriptionConfig: SubscriptionConfig;
}

const getLocalizedText = (
  field: Record<string, string> | string | undefined | null,
  langCode: string
): string => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") {
    return (
      field[langCode] ||
      field["en"] ||
      field["mr"] ||
      Object.values(field).find((v) => typeof v === "string" && v.trim() !== "") ||
      ""
    );
  }
  return String(field);
};

const getLocalizedOptions = (
  field: Record<string, string[]> | string[] | undefined | null,
  langCode: string
): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "object") {
    const opts =
      field[langCode] ||
      field["en"] ||
      field["mr"] ||
      Object.values(field).find((v) => Array.isArray(v) && v.length > 0);
    return Array.isArray(opts) ? opts : [];
  }
  return [];
};

export default function Scorecard({
  questions,
  score,
  selectedAnswers = {},
  timeSpentSeconds = 0,
  selectedLanguage,
  onRetake,
  onDashboard,
  isPremium = false,
  onUpgradeClick,
  subscriptionConfig,
}: ScorecardProps) {
  const [reviewIndex, setReviewIndex] = useState<number>(0);

  const validQuestions = Array.isArray(questions) ? questions.filter(Boolean) : [];
  const safeAnswers = selectedAnswers && typeof selectedAnswers === "object" ? selectedAnswers : {};

  useEffect(() => {
    if (validQuestions.length === 0) return;

    const percentage = (score / validQuestions.length) * 100;
    if (percentage < 60) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    try {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      interval = setInterval(() => {
        try {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            if (interval) clearInterval(interval);
            return;
          }
          const particleCount = Math.max(1, Math.floor(50 * (timeLeft / duration)));
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        } catch (_) {
          if (interval) clearInterval(interval);
        }
      }, 250);
    } catch (_) {
      // Ignore confetti errors in restricted environments
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [score, validQuestions.length]);

  useEffect(() => {
    if (reviewIndex >= validQuestions.length && validQuestions.length > 0) {
      setReviewIndex(0);
    }
  }, [reviewIndex, validQuestions.length]);

  if (validQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl mt-8">
        <Icons.AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Data</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">No questions to display.</p>
        <button
          onClick={onDashboard}
          className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer"
        >
          {t(selectedLanguage.code, "backToDashboard")}
        </button>
      </div>
    );
  }

  const totalQs = validQuestions.length;
  const correctCount = validQuestions.filter((q) => safeAnswers[q.id] === q.answer).length;
  const answeredCount = validQuestions.filter((q) => Boolean(safeAnswers[q.id])).length;
  const incorrectCount = Math.max(0, answeredCount - correctCount);
  const unansweredCount = Math.max(0, totalQs - answeredCount);
  const percentage = Math.round((correctCount / totalQs) * 100);

  const safeReviewIndex = Math.min(Math.max(0, reviewIndex), totalQs - 1);
  const currentReviewQuestion = validQuestions[safeReviewIndex];
  const selectedAns = currentReviewQuestion ? safeAnswers[currentReviewQuestion.id] : undefined;
  const isCorrect = currentReviewQuestion ? selectedAns === currentReviewQuestion.answer : false;

  const getScoreMessage = () => {
    if (percentage >= 85) {
      return {
        title: t(selectedLanguage.code, "outstandingTitle"),
        desc: t(selectedLanguage.code, "outstandingDesc"),
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
      };
    } else if (percentage >= 60) {
      return {
        title: t(selectedLanguage.code, "greatTitle"),
        desc: t(selectedLanguage.code, "greatDesc"),
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
      };
    } else {
      return {
        title: t(selectedLanguage.code, "needsStudyTitle"),
        desc: t(selectedLanguage.code, "needsStudyDesc"),
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
      };
    }
  };

  const msg = getScoreMessage();

  const formatTime = (secs: number) => {
    const safeSecs = Math.max(0, Math.floor(Number(secs) || 0));
    const mins = Math.floor(safeSecs / 60);
    const remainingSecs = safeSecs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const reviewQuestionText = currentReviewQuestion
    ? getLocalizedText(currentReviewQuestion.question, selectedLanguage.code)
    : "";
  const reviewQuestionEn = currentReviewQuestion
    ? getLocalizedText(currentReviewQuestion.question, "en")
    : "";
  const reviewOptions = currentReviewQuestion
    ? getLocalizedOptions(currentReviewQuestion.options, selectedLanguage.code)
    : [];
  const reviewExplanation = currentReviewQuestion
    ? getLocalizedText(currentReviewQuestion.explanation, selectedLanguage.code)
    : "";
  const reviewExplanationEn = currentReviewQuestion
    ? getLocalizedText(currentReviewQuestion.explanation, "en")
    : "";

  return (
    <div className="flex flex-col gap-8">
      {/* Overview Block */}
      <div className={`p-6 md:p-8 rounded-xl border ${msg.bg} ${msg.border} backdrop-blur-md`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Progress Circle */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-36 h-36">
              <circle
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="62"
                cx="72"
                cy="72"
              />
              <circle
                className={percentage >= 60 ? (percentage >= 85 ? "text-emerald-500" : "text-amber-500") : "text-rose-500"}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 62}
                strokeDashoffset={2 * Math.PI * 62 * (1 - percentage / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="62"
                cx="72"
                cy="72"
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{percentage}%</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(selectedLanguage.code, "overallScore")}</span>
            </div>
          </div>

          {/* Feedback details */}
          <div className="flex-1 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">
              {t(selectedLanguage.code, "testScorecard")}
            </span>
            <h2 className={`text-2xl md:text-3xl font-black font-sans tracking-tight mt-1 mb-2 ${msg.color}`}>
              {msg.title}
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-5 leading-relaxed max-w-xl">
              {t(selectedLanguage.code, "scorecardDesc")}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                onClick={onRetake}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {t(selectedLanguage.code, "retakeTest")}
              </button>
              <button
                onClick={onDashboard}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {t(selectedLanguage.code, "backToDashboard")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade Promo Card */}
      {!isPremium && (
        <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-amber-500/5 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl shrink-0">
              <Icons.Crown className="h-6 w-6 fill-amber-500/10 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-400 mb-1 font-sans">
                {t(selectedLanguage.code, "unlockPromptTitle")}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
                {t(selectedLanguage.code, "unlockPromptText")}
              </p>
            </div>
          </div>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-amber-500/10 group active:scale-[0.98]"
            >
              <Icons.Sparkles className="h-4 w-4 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>{t(selectedLanguage.code, "unlockAllNow").replace("{amount}", String(subscriptionConfig?.amount ?? 299))}</span>
            </button>
          )}
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-center">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">{t(selectedLanguage.code, "totalQs")}</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{totalQs}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-center">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">{t(selectedLanguage.code, "correct")}</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{correctCount}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-center">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">{t(selectedLanguage.code, "incorrect")}</span>
          <span className="text-xl font-bold font-mono text-rose-400">{incorrectCount}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-center">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">{t(selectedLanguage.code, "skippedLabel")}</span>
          <span className="text-xl font-bold font-mono text-slate-500">{unansweredCount}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl col-span-2 md:col-span-1 text-center">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">{t(selectedLanguage.code, "timeTaken")}</span>
          <span className="text-xl font-bold font-mono text-amber-400">{formatTime(timeSpentSeconds)}</span>
        </div>
      </div>

      {/* Questions Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Review Panel */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <span className={`text-xs px-3 py-1 font-bold rounded-full ${
                !selectedAns
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  : (isCorrect ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20")
              }`}>
                {!selectedAns
                  ? t(selectedLanguage.code, "skippedValue")
                  : (isCorrect ? t(selectedLanguage.code, "correctValue") : t(selectedLanguage.code, "incorrectValue"))}
              </span>
              <span className="text-xs font-mono text-slate-500">Question {safeReviewIndex + 1} of {totalQs}</span>
            </div>

            {currentReviewQuestion && (
              <div className="mb-4 space-y-1.5">
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">{reviewQuestionText}</h3>
                {selectedLanguage.code !== "en" && reviewQuestionEn && reviewQuestionEn !== reviewQuestionText && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">{reviewQuestionEn}</p>
                )}
              </div>
            )}

            {currentReviewQuestion && currentReviewQuestion.imageSvg && (
              <div className="flex justify-center my-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <div className="max-w-[400px] w-full" dangerouslySetInnerHTML={{ __html: currentReviewQuestion.imageSvg }} />
              </div>
            )}

            {/* Options grid */}
            <div className="grid grid-cols-1 gap-2.5 mb-6">
              {currentReviewQuestion && reviewOptions.map((opt, idx) => {
                const char = String.fromCharCode(65 + idx);
                const isSelected = selectedAns === char;
                const isCorrectAns = currentReviewQuestion.answer === char;

                let borderStyle = "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-500 dark:text-slate-400";
                if (isCorrectAns) {
                  borderStyle = "border-emerald-500/50 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400 font-medium";
                } else if (isSelected) {
                  borderStyle = "border-rose-500/50 bg-rose-500/5 text-rose-500 dark:text-rose-400";
                }

                return (
                  <div key={idx} className={`p-3.5 rounded-lg border text-xs md:text-sm flex items-center justify-between ${borderStyle}`}>
                    <div className="flex items-center gap-3">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border shrink-0 ${
                        isCorrectAns ? "bg-emerald-500 text-slate-950 border-emerald-500" : (isSelected ? "bg-rose-500 text-slate-950 border-rose-500" : "border-slate-200 dark:border-slate-800 text-slate-500")
                      }`}>
                        {char}
                      </span>
                      <div>
                        <span>{opt}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCorrectAns && <Icons.Check className="h-4 w-4 text-emerald-500" />}
                      {!isCorrectAns && isSelected && <Icons.X className="h-4 w-4 text-rose-500" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                <Icons.Lightbulb className="h-4 w-4 text-amber-500" />
                <span>{t(selectedLanguage.code, "explanation")}</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {reviewExplanation || (selectedLanguage.code === "mr" ? "स्पष्टीकरण उपलब्ध नाही." : "No explanation available.")}
                </p>
                {selectedLanguage.code !== "en" && reviewExplanationEn && reviewExplanationEn !== reviewExplanation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed font-sans">
                    {reviewExplanationEn}
                  </p>
                )}
              </div>
            </div>

            {/* Prev / Next Navigation inside Review */}
            <div className="flex justify-between items-center pt-5 mt-5 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setReviewIndex((prev) => Math.max(0, prev - 1))}
                disabled={safeReviewIndex === 0}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Icons.ArrowLeft className="h-4 w-4" />
                <span>{t(selectedLanguage.code, "previous")}</span>
              </button>

              <button
                onClick={() => setReviewIndex((prev) => Math.min(totalQs - 1, prev + 1))}
                disabled={safeReviewIndex >= totalQs - 1}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t(selectedLanguage.code, "next")}</span>
                <Icons.ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right review bubble grid */}
        <div className="lg:col-span-1">
          <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Icons.Eye className="h-4 w-4 text-amber-500" />
              <span>{t(selectedLanguage.code, "reviewPanel")}</span>
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {validQuestions.map((q, idx) => {
                const isActive = safeReviewIndex === idx;
                const isCorrectAns = safeAnswers[q.id] === q.answer;
                const wasSkipped = !safeAnswers[q.id];

                let markerStyle = "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400";
                if (isActive) {
                  markerStyle = "bg-amber-500 text-slate-950 font-bold border-amber-500";
                } else if (wasSkipped) {
                  markerStyle = "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500";
                } else if (isCorrectAns) {
                  markerStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                } else {
                  markerStyle = "bg-rose-500/10 border-rose-500/30 text-rose-400";
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => {
                      setReviewIndex(idx);
                    }}
                    className={`h-9 w-9 rounded-lg border text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${markerStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
