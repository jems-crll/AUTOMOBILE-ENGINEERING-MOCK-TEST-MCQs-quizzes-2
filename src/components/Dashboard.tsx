import React, { useState } from "react";
import { Chapter, QuizAttempt, StateLanguage, STATE_LANGUAGES, SubscriptionConfig } from "../types";
import { CHAPTERS, QUESTIONS } from "../data/questions";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  onStartTest: (config: {
    chapterId: number | "all";
    mode: "practice" | "exam";
    questionCount: number;
    timeLimitMinutes: number;
    source: "static" | "ai";
    setId?: number | "all";
    resumeState?: any;
  }) => void;
  attempts: QuizAttempt[];
  selectedLanguage: StateLanguage;
  setSelectedLanguage: (lang: StateLanguage) => void;
  currentUser: any;
  onUpgradeClick: () => void;
  subscriptionConfig: SubscriptionConfig;
}

export default function Dashboard({
  onStartTest,
  attempts,
  selectedLanguage,
  setSelectedLanguage,
  currentUser,
  onUpgradeClick,
  subscriptionConfig,
}: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState<"Automobile" | "Electrical" | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(null);

  // Load saved active quiz state if any
  const [activeQuizState, setActiveQuizState] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("omto_active_quiz_state");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading saved active quiz state:", e);
    }
    return null;
  });
  
  const isMarathi = selectedLanguage.code === "mr";
  const isDemoMode = !currentUser?.isPremium;

  // Analytics
  const totalTests = attempts.length;
  const averageScore = totalTests
    ? Math.round(attempts.reduce((sum, item) => sum + (item.score / item.totalQuestions) * 100, 0) / totalTests)
    : 0;

  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className={className} /> : <Icons.BookOpen className={className} />;
  };

  // Recent Activity Setup (Configured for exactly 50 Qs as requested)
  const sortedAttempts = [...attempts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastAttempt = sortedAttempts[0];
  let recommendedChapter = CHAPTERS[0];
  if (lastAttempt && lastAttempt.chapterId !== "all") {
    const currentIdx = CHAPTERS.findIndex(c => c.id === lastAttempt.chapterId);
    if (currentIdx !== -1 && currentIdx < CHAPTERS.length - 1) {
      recommendedChapter = CHAPTERS[currentIdx + 1];
    }
  }

  // Set default texts to perfectly match Marathi user request
  let headerText = isMarathi ? "येथून सुरुवात करा" : "Start Here";
  let titleText = isMarathi ? "ऑटोमोबाईल संच 1 (प्र 1 ते 50)" : "Automobile Set 1 (Q 1 - 50)";
  let descText = isMarathi ? "पहिल्या विषयापासून तुमचा सराव सुरु करा." : "Begin your practice from the first chapter.";
  let btnText = isMarathi ? "सराव सुरू करा" : "Start Practice";

  if (lastAttempt) {
    headerText = isMarathi ? "शेवटचा सराव (चालू ठेवा)" : "Resume Practice";
    titleText = lastAttempt.chapterName;
    descText = isMarathi ? "तुमचा शेवटचा सराव पुढे चालू ठेवा किंवा नवीन विषय निवडा." : "Pick up where you left off or review your last test.";
    btnText = isMarathi ? "सराव सुरू ठेवा" : "Continue Practice";
  }

  // Automobile Sections
  const automobileChapters = CHAPTERS.filter(ch => ch.section !== "Electrical");
  const automobileSections = Array.from(new Set(automobileChapters.map(ch => ch.section || "Other")));
  const electricalChapters = CHAPTERS.filter(ch => ch.section === "Electrical");

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Top Bar: Stats & Language */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        {/* Language Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 md:w-1/3 shadow-sm">
           <div className="flex items-center gap-3">
             <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
               <Icons.Languages className="h-5 w-5" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Language / भाषा</p>
               <select
                  value={selectedLanguage.code}
                  onChange={(e) => {
                    const lang = STATE_LANGUAGES.find((l) => l.code === e.target.value);
                    if (lang) setSelectedLanguage(lang);
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 text-sm font-semibold outline-none cursor-pointer appearance-none"
               >
                 {STATE_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
               </select>
             </div>
           </div>
           <Icons.ChevronDown className="h-4 w-4 text-slate-600 pointer-events-none" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
             <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
               <Icons.CheckCircle2 className="h-5 w-5" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
                 {isMarathi ? "दिलेल्या चाचण्या" : "Tests Taken"}
               </p>
               <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{totalTests}</p>
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
             <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
               <Icons.TrendingUp className="h-5 w-5" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
                 {isMarathi ? "सरासरी गुण" : "Avg Score"}
               </p>
               <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{averageScore}%</p>
             </div>
          </div>
        </div>
      </div>

      {/* Continue Learning / Recent Activity */}
      {activeQuizState ? (
        /* Case A: Active Incomplete Quiz State is present */
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-amber-500/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Icons.Zap className="w-32 h-32 text-amber-500 animate-pulse" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  {isMarathi ? "अपूर्ण चाचणी (चालू ठेवा)" : "Active Incomplete Test"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {(() => {
                  if (activeQuizState.chapterId === "all") {
                    return isMarathi ? "सर्व चॅप्टर (पूर्ण अभ्यासक्रम)" : "All Chapters Mixed";
                  }
                  const activeCh = CHAPTERS.find(c => c.id === activeQuizState.chapterId);
                  let name = activeCh ? (isMarathi ? activeCh.nameMarathi : activeCh.name) : `Chapter ${activeQuizState.chapterId}`;
                  if (activeQuizState.setId && activeQuizState.setId !== "all") {
                    name += ` - ${isMarathi ? `संच ${activeQuizState.setId}` : `Set ${activeQuizState.setId}`}`;
                  }
                  return name;
                })()}
              </h2>
              <p className="text-slate-300 text-sm max-w-xl">
                {isMarathi 
                  ? `तुम्ही एकूण ${activeQuizState.questions.length} पैकी ${activeQuizState.currentIndex + 1} प्रश्नांवर आहात. अर्धवट सोडलेली ही चाचणी पूर्ण करा.`
                  : `You are on question ${activeQuizState.currentIndex + 1} of ${activeQuizState.questions.length}. Finish your incomplete test.`}
              </p>
              <div className="text-xs text-amber-400/80 font-mono">
                {isMarathi ? "मोड:" : "Mode:"} {activeQuizState.mode === "exam" ? (isMarathi ? "परीक्षा" : "Exam") : (isMarathi ? "सराव" : "Practice")}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button 
                onClick={() => {
                  onStartTest({
                    chapterId: activeQuizState.chapterId,
                    mode: activeQuizState.mode,
                    questionCount: activeQuizState.questions.length,
                    timeLimitMinutes: activeQuizState.timeLimitMinutes,
                    source: "static",
                    setId: activeQuizState.setId,
                    resumeState: activeQuizState
                  });
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer text-sm"
              >
                <Icons.Play className="w-4 h-4 fill-current" />
                {isMarathi ? "चाचणी येथूनच पुढे सुरू करा" : "Resume Test"}
              </button>
              <button
                onClick={() => {
                  if (window.confirm(isMarathi ? "तुम्हाला ही अपूर्ण चाचणी रद्द करायची आहे का?" : "Are you sure you want to discard this incomplete test?")) {
                    try {
                      localStorage.removeItem("omto_active_quiz_state");
                      setActiveQuizState(null);
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }}
                className="px-4 py-3 border border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl transition text-xs font-bold cursor-pointer"
              >
                {isMarathi ? "चाचणी रद्द करा" : "Discard"}
              </button>
            </div>
          </div>
        </div>
      ) : lastAttempt ? (
        /* Case B: There is no active incomplete test, but lastAttempt exists (Show previous completed practice) */
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800 dark:border-slate-700">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Icons.CheckCircle2 className="w-32 h-32 text-emerald-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icons.Award className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  {isMarathi ? "मागील पूर्ण केलेला सराव" : "Previous Completed Practice"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {lastAttempt.chapterName}
              </h2>
              <p className="text-slate-300 text-sm max-w-xl">
                {(() => {
                  const lastCh = CHAPTERS.find(c => c.id === lastAttempt.chapterId);
                  const lastSection = lastCh?.section === "Electrical" ? (isMarathi ? "इलेक्ट्रिकल" : "Electrical") : (isMarathi ? "ऑटोमोबाईल" : "Automobile");
                  return isMarathi
                    ? `विभाग: ${lastSection} | प्राप्त गुण: ${lastAttempt.score} / ${lastAttempt.totalQuestions} (${Math.round((lastAttempt.score / lastAttempt.totalQuestions) * 100)}%)`
                    : `Section: ${lastSection} | Score: ${lastAttempt.score} / ${lastAttempt.totalQuestions} (${Math.round((lastAttempt.score / lastAttempt.totalQuestions) * 100)}%)`;
                })()}
              </p>
              <div className="text-xs text-slate-400 font-mono">
                {isMarathi ? "दिनांक:" : "Date:"} {new Date(lastAttempt.date).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-US')} | {isMarathi ? "गेलेला वेळ:" : "Time spent:"} {Math.round(lastAttempt.timeSpentSeconds / 60)} {isMarathi ? "मि" : "min"}
              </div>
            </div>

            <button 
              onClick={() => {
                onStartTest({
                  chapterId: lastAttempt.chapterId,
                  mode: "practice",
                  questionCount: isDemoMode ? 5 : lastAttempt.totalQuestions,
                  timeLimitMinutes: isDemoMode ? 5 : 40,
                  source: "static",
                  setId: lastAttempt.setId || 1
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer text-sm shrink-0 w-fit"
            >
              <Icons.RotateCcw className="w-4 h-4" />
              {isMarathi ? "पुन्हा सराव सुरू करा" : "Restart Practice"}
            </button>
          </div>
        </div>
      ) : (
        /* Case C: Fresh User - Automobile Set 1 (Q 1 - 50) */
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800 dark:border-slate-700">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Icons.Play className="w-32 h-32 text-amber-500" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <Icons.Star className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                {isMarathi ? "येथून सुरुवात करा" : "Start Here"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {isMarathi ? "ऑटोमोबाईल संच 1 (प्र 1 ते 50)" : "Automobile Set 1 (Q 1 - 50)"}
            </h2>
            <p className="text-slate-300 text-sm max-w-xl pb-4">
              {isMarathi ? "पहिल्या विषयापासून तुमचा सराव सुरु करा." : "Begin your professional practice from the very first chapter."}
            </p>
            <button 
              onClick={() => {
                onStartTest({
                  chapterId: 1,
                  mode: "practice",
                  questionCount: isDemoMode ? 5 : 50,
                  timeLimitMinutes: isDemoMode ? 5 : 40,
                  source: "static",
                  setId: 1
                });
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer text-sm w-fit"
            >
              <Icons.Play className="w-4 h-4 fill-current" />
              {isMarathi ? "सराव सुरू करा" : "Start Practice"}
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Category Area */}
      <AnimatePresence mode="wait">
        {activeCategory === null ? (
          /* Stacked Vertical Option Cards (Automobile at the top, Electrical below it) */
          <motion.div 
            key="category-selection"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5 max-w-3xl mx-auto"
          >
            <div className="text-center space-y-2 mb-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isMarathi ? "अभ्यास विषय निवडा" : "Select Your Subject"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {isMarathi ? "सराव सुरू करण्यासाठी खालीलपैकी एक विषय निवडा." : "Choose one of the core professional subjects below to start practice sets."}
              </p>
            </div>

            {/* Automobile Big Option Card */}
            <div
              onClick={() => {
                setActiveCategory("Automobile");
                setSelectedSection(null);
                setExpandedChapterId(null);
              }}
              className="group relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-xl shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-start sm:items-center gap-5">
                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Icons.Wrench className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-none mb-2">
                    Automobile Engineering
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                    {isMarathi 
                      ? `${automobileSections.length} मुख्य सेक्शन्स, ${automobileChapters.length} चॅप्टर्स आणि सर्व ऑटोमोबाईलचे ५० प्रश्नांचे सराव संच.` 
                      : `${automobileSections.length} core sections, ${automobileChapters.length} chapters, with multiple practice sets of 50 questions each.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700/50">
                  {automobileChapters.length} {isMarathi ? "विषय" : "Chapters"}
                </span>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 rounded-xl transition-all">
                  <Icons.ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Electrical Big Option Card */}
            <div
              onClick={() => {
                setActiveCategory("Electrical");
                setSelectedSection(null);
                setExpandedChapterId(null);
              }}
              className="group relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-xl shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-start sm:items-center gap-5">
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Icons.Zap className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors leading-none mb-2">
                    Electrical Engineering
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                    {isMarathi 
                      ? `मूलभूत विद्युतशास्त्र, ${electricalChapters.length} चॅप्टर्स आणि सर्व इलेक्ट्रिकलचे ५० प्रश्नांचे सराव संच.` 
                      : `Basics of electricity, machines, ${electricalChapters.length} chapters, and tests of 50 questions each.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700/50">
                  {electricalChapters.length} {isMarathi ? "विषय" : "Chapters"}
                </span>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 rounded-xl transition-all">
                  <Icons.ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeCategory === "Automobile" ? (
          /* Automobile Navigation: Sections List or Expanded Chapter Sets */
          <motion.div 
            key="automobile-sections-area"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header and Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    setSelectedSection(null);
                  }}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <Icons.ArrowLeft className="w-4 h-4" />
                  {isMarathi ? "मागे जा" : "Back to Main"}
                </button>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icons.Wrench className="w-5 h-5 text-amber-500" />
                  Automobile Engineering {selectedSection ? `> ${selectedSection}` : ""}
                </h3>
              </div>
              
              {selectedSection && (
                <button
                  onClick={() => setSelectedSection(null)}
                  className="text-xs font-semibold text-amber-500 hover:text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10 cursor-pointer self-start sm:self-auto"
                >
                  {isMarathi ? "← सर्व सेक्शन्स पहा" : "← All Sections"}
                </button>
              )}
            </div>

            {selectedSection === null ? (
              /* Automobile Section Cards List (Just like original layout) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {automobileSections.map(sectionName => {
                  const sectionChapters = CHAPTERS.filter(ch => (ch.section || "Other") === sectionName);
                  const chapterCount = sectionChapters.length;
                  return (
                    <div 
                      key={sectionName}
                      onClick={() => setSelectedSection(sectionName)}
                      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl group-hover:text-amber-400 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-800">
                          <Icons.Layers className="h-6 w-6" />
                        </div>
                        <span className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                          {chapterCount} {isMarathi ? "विषय" : "Chapters"}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-amber-400 transition-colors">{sectionName}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {isMarathi ? "या विभागातील विषयांचा सराव करण्यासाठी येथे क्लिक करा." : "Click to view and practice chapters in this module."}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Chapters inside the Selected Section */
              <div className="space-y-4 animate-fade-in">
                {CHAPTERS.filter(ch => (ch.section || "Other") === selectedSection).map(ch => {
                  const totalQ = QUESTIONS.filter((q) => q.chapterId === ch.id).length;
                  const isExpanded = expandedChapterId === ch.id;
                  // Dynamic division of sets into exactly 50 Questions per set as requested!
                  const numSets = Math.max(1, Math.ceil(totalQ / 50));
                                
                  return (
                    <div key={ch.id} className={`bg-white dark:bg-slate-900 border ${isExpanded ? 'border-amber-500/40' : 'border-slate-200 dark:border-slate-800'} rounded-2xl overflow-hidden transition-colors shadow-sm`}>
                      <div 
                        onClick={() => setExpandedChapterId(isExpanded ? null : ch.id)}
                        className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors shrink-0 ${isExpanded ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'}`}>
                            {renderIcon(ch.icon, "h-5 w-5")}
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                              {ch.id}. {isMarathi ? ch.nameMarathi : ch.name}
                            </h4>
                            {isMarathi && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{ch.name}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                           <span className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800">
                             {totalQ} Qs
                           </span>
                           <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-amber-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                             <Icons.ChevronDown className={`h-5 w-5 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-amber-500' : ''}`} />
                           </div>
                        </div>
                      </div>

                      {/* Expanded Sets (Max size 50 Questions per set) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
                          >
                            <div className="p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                  {isMarathi ? "सराव संच निवडा" : "Select Practice Set"}
                                </p>
                                <button
                                    onClick={() => onStartTest({ chapterId: ch.id, mode: "exam", questionCount: isDemoMode ? 5 : totalQ, timeLimitMinutes: isDemoMode ? 5 : Math.ceil(totalQ * 1.5), source: "static", setId: "all" })}
                                    className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors cursor-pointer self-start sm:self-auto"
                                >
                                    {isMarathi ? "सर्व प्रश्न एकत्रित (पूर्ण चाचणी)" : "All Questions Test"}
                                </button>
                              </div>
                                                    
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Array.from({ length: numSets }).map((_, i) => {
                                    const setNum = i + 1;
                                    // Set limits calculation configured for exactly 50 questions
                                    const startNum = (setNum - 1) * 50 + 1;
                                    const endNum = Math.min(setNum * 50, totalQ);
                                    const qsInSet = endNum - startNum + 1;
                                    const demoRestricted = isDemoMode && setNum > 1;

                                    return (
                                      <div key={setNum} className="relative p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between group shadow-sm">
                                        {demoRestricted && (
                                          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center z-10 border border-slate-200 dark:border-slate-800/50">
                                              <Icons.Lock className="h-5 w-5 text-amber-500/70 mb-2" />
                                              <button onClick={onUpgradeClick} className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors cursor-pointer">
                                                {isMarathi ? "अनलॉक करा" : "Unlock to Access"}
                                              </button>
                                          </div>
                                        )}
                                        <div className="mb-4">
                                          <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                            {isMarathi ? `संच ${setNum}` : `Set ${setNum}`}
                                          </h5>
                                          <p className="text-[10px] text-slate-500 font-mono">Q {startNum} - {endNum} ({qsInSet} Qs)</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                              onClick={() => onStartTest({ chapterId: ch.id, mode: "practice", questionCount: isDemoMode ? 5 : qsInSet, timeLimitMinutes: isDemoMode ? 5 : 20, source: "static", setId: setNum })}
                                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                          >
                                            <Icons.BookOpen className="h-3 w-3" />
                                            {isMarathi ? "सराव" : "Practice"}
                                          </button>
                                          <button
                                              onClick={() => onStartTest({ chapterId: ch.id, mode: "exam", questionCount: isDemoMode ? 5 : qsInSet, timeLimitMinutes: isDemoMode ? 5 : 20, source: "static", setId: setNum })}
                                            className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 text-[11px] font-bold rounded-lg transition-colors border border-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                                          >
                                            <Icons.Timer className="h-3 w-3" />
                                            {isMarathi ? "परीक्षा" : "Exam"}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* Electrical Navigation: Chapters list (Electrical has no sections, displays directly) */
          <motion.div 
            key="electrical-chapters-area"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header and Back Button */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setSelectedSection(null);
                }}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
                {isMarathi ? "मागे जा" : "Back to Main"}
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Zap className="w-5 h-5 text-blue-500 animate-pulse" />
                Electrical Engineering
              </h3>
            </div>

            {/* Electrical Chapters List */}
            <div className="space-y-4">
              {CHAPTERS.filter(ch => ch.section === "Electrical").map(ch => {
                const totalQ = QUESTIONS.filter((q) => q.chapterId === ch.id).length;
                const isExpanded = expandedChapterId === ch.id;
                // Sets calculated in groups of exactly 50 questions as requested!
                const numSets = Math.max(1, Math.ceil(totalQ / 50));
                              
                return (
                  <div key={ch.id} className={`bg-white dark:bg-slate-900 border ${isExpanded ? 'border-amber-500/40' : 'border-slate-200 dark:border-slate-800'} rounded-2xl overflow-hidden transition-colors shadow-sm`}>
                    <div 
                      onClick={() => setExpandedChapterId(isExpanded ? null : ch.id)}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors shrink-0 ${isExpanded ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'}`}>
                          {renderIcon(ch.icon, "h-5 w-5")}
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {ch.id}. {isMarathi ? ch.nameMarathi : ch.name}
                          </h4>
                          {isMarathi && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{ch.name}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                         <span className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800">
                           {totalQ} Qs
                         </span>
                         <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-amber-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                           <Icons.ChevronDown className={`h-5 w-5 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-amber-500' : ''}`} />
                         </div>
                      </div>
                    </div>

                    {/* Expanded sets inside Electrical chapter */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
                        >
                          <div className="p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                {isMarathi ? "सराव संच निवडा" : "Select Practice Set"}
                              </p>
                              <button
                                  onClick={() => onStartTest({ chapterId: ch.id, mode: "exam", questionCount: isDemoMode ? 5 : totalQ, timeLimitMinutes: isDemoMode ? 5 : Math.ceil(totalQ * 1.5), source: "static", setId: "all" })}
                                  className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors cursor-pointer self-start sm:self-auto"
                              >
                                  {isMarathi ? "सर्व प्रश्न एकत्रित (पूर्ण चाचणी)" : "All Questions Test"}
                              </button>
                            </div>
                                                  
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {Array.from({ length: numSets }).map((_, i) => {
                                  const setNum = i + 1;
                                  // Division range calculated for exactly 50 questions
                                  const startNum = (setNum - 1) * 50 + 1;
                                  const endNum = Math.min(setNum * 50, totalQ);
                                  const qsInSet = endNum - startNum + 1;
                                  const demoRestricted = isDemoMode && setNum > 1;

                                  return (
                                    <div key={setNum} className="relative p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between group shadow-sm">
                                      {demoRestricted && (
                                        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center z-10 border border-slate-200 dark:border-slate-800/50">
                                            <Icons.Lock className="h-5 w-5 text-amber-500/70 mb-2" />
                                            <button onClick={onUpgradeClick} className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors cursor-pointer">
                                              {isMarathi ? "अनलॉक करा" : "Unlock to Access"}
                                            </button>
                                        </div>
                                      )}
                                      <div className="mb-4">
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                          {isMarathi ? `संच ${setNum}` : `Set ${setNum}`}
                                        </h5>
                                        <p className="text-[10px] text-slate-500 font-mono">Q {startNum} - {endNum} ({qsInSet} Qs)</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onStartTest({ chapterId: ch.id, mode: "practice", questionCount: isDemoMode ? 5 : qsInSet, timeLimitMinutes: isDemoMode ? 5 : 20, source: "static", setId: setNum })}
                                          className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                          <Icons.BookOpen className="h-3 w-3" />
                                          {isMarathi ? "सराव" : "Practice"}
                                        </button>
                                        <button
                                            onClick={() => onStartTest({ chapterId: ch.id, mode: "exam", questionCount: isDemoMode ? 5 : qsInSet, timeLimitMinutes: isDemoMode ? 5 : 20, source: "static", setId: setNum })}
                                          className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 text-[11px] font-bold rounded-lg transition-colors border border-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                          <Icons.Timer className="h-3 w-3" />
                                          {isMarathi ? "परीक्षा" : "Exam"}
                                        </button>
                                      </div>
                                    </div>
                                  );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
