import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { StateLanguage, User, SubscriptionConfig } from "../types";
import { t } from "../utils/i18n";
import { CHAPTERS, QUESTIONS } from "../data/questions";

interface AdminPanelProps {
  selectedLanguage: StateLanguage;
  onClose?: () => void;
  subscriptionConfig: SubscriptionConfig;
  onUpdateSubscriptionConfig: (config: SubscriptionConfig) => void;
}

interface StudentRecord {
  email: string;
  username: string;
  password?: string;
  isPremium: boolean;
  expiryDate?: string;
  isBlocked?: boolean;
  paymentTxnId?: string;
  paymentDate?: string;
  isOnline?: boolean;
  createdAt?: string;
}

export default function AdminPanel({ 
  selectedLanguage, 
  onClose,
  subscriptionConfig,
  onUpdateSubscriptionConfig,
}: AdminPanelProps) {
  
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "guide" | "pricing" | "coupons" | "email">("list");
  const [guideSubTab, setGuideSubTab] = useState<"firebase" | "sheets" | "sql">("firebase");

  // SMTP Configuration states
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState("jemshery17@gmail.com");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpIsConnected, setSmtpIsConnected] = useState<boolean | null>(null);
  const [smtpVerifyError, setSmtpVerifyError] = useState("");
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpUpdating, setSmtpUpdating] = useState(false);
  const [smtpSuccessMessage, setSmtpSuccessMessage] = useState("");
  const [smtpErrorMessage, setSmtpErrorMessage] = useState("");
  const [testEmailTo, setTestEmailTo] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  const fetchSmtpConfig = () => {
    fetch("/api/admin/smtp-config")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.host) setSmtpHost(data.host);
          if (data.port) setSmtpPort(String(data.port));
          if (data.user) {
            setSmtpUser(data.user);
            setTestEmailTo(data.user);
          }
          setSmtpIsConnected(data.isConnected);
          setSmtpVerifyError(data.verifyError || "");
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSmtpConfig();
  }, []);

  const handleUpdateSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpUpdating(true);
    setSmtpSuccessMessage("");
    setSmtpErrorMessage("");

    try {
      const res = await fetch("/api/admin/smtp-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          pass: smtpPass,
        })
      });
      const data = await res.json();
      setSmtpUpdating(false);

      if (res.ok && data.success) {
        setSmtpSuccessMessage(
          selectedLanguage.code === "mr"
            ? "✅ ईमेल (SMTP) तपशील यशस्वीरित्या सेव्ह व पडताळले गेले! नवीन युझर्सना आता ईमेलवर ओटीपी जाईल."
            : "✅ SMTP credentials verified and saved successfully! New users will now receive OTP emails."
        );
        setSmtpIsConnected(true);
        setSmtpVerifyError("");
        setSmtpPass("");
      } else {
        setSmtpErrorMessage(data.error || "Failed to update SMTP credentials.");
        setSmtpIsConnected(false);
        setSmtpVerifyError(data.details || "");
      }
    } catch (err: any) {
      setSmtpUpdating(false);
      setSmtpErrorMessage("Network error: Failed to connect to server.");
    }
  };

  const handleSendTestEmail = async () => {
    setSmtpTesting(true);
    setSmtpSuccessMessage("");
    setSmtpErrorMessage("");

    try {
      const res = await fetch("/api/admin/smtp-send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: testEmailTo || smtpUser })
      });
      const data = await res.json();
      setSmtpTesting(false);

      if (res.ok && data.success) {
        setSmtpSuccessMessage(
          selectedLanguage.code === "mr"
            ? `🎉 चाचणी ईमेल ${testEmailTo || smtpUser} वर पाठवला गेला आहे! कृपया इनबॉक्स / स्पॅम तपासा.`
            : `🎉 Test email successfully sent to ${testEmailTo || smtpUser}! Please check inbox/spam.`
        );
      } else {
        setSmtpErrorMessage(data.error || "Failed to send test email.");
      }
    } catch (err) {
      setSmtpTesting(false);
      setSmtpErrorMessage("Network error: Could not send test email.");
    }
  };

  // Coupon states
  const [coupons, setCoupons] = useState<{ id: string; code: string; discountPercent: number; isActive: boolean }[]>([]);
  const [couponsSaving, setCouponsSaving] = useState(false);
  const [couponsSuccess, setCouponsSuccess] = useState("");
  const [couponsError, setCouponsError] = useState("");

  // Load coupons
  useEffect(() => {
    fetch("/api/coupons")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.coupons) {
          setCoupons(data.coupons);
        }
      });
  }, []);

  const handleSaveCoupons = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponsSaving(true);
    setCouponsSuccess("");
    setCouponsError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupons }),
      });
      if (res.ok) {
        setCouponsSuccess(selectedLanguage.code === "mr" ? t(selectedLanguage.code, "couponApplied").replace("{percent}", "") : t(selectedLanguage.code, "couponApplied").replace("{percent}", ""));
        setTimeout(() => setCouponsSuccess(""), 3000);
      } else {
        setCouponsError("Failed to save coupons.");
      }
    } catch (err) {
      setCouponsError("Network error.");
    } finally {
      setCouponsSaving(false);
    }
  };

  const handleUpdateCoupon = (id: string, field: string, value: any) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // Form states for dynamic subscription pricing
  const [pricingAmount, setPricingAmount] = useState(subscriptionConfig.amount);
  const [pricingOriginalAmount, setPricingOriginalAmount] = useState(subscriptionConfig.originalAmount);
  const [pricingPeriod, setPricingPeriod] = useState(subscriptionConfig.billingPeriod);
  const [pricingDetailsEn, setPricingDetailsEn] = useState(subscriptionConfig.detailsEn);
  const [pricingDetailsMr, setPricingDetailsMr] = useState(subscriptionConfig.detailsMr);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSuccess, setPricingSuccess] = useState("");
  const [pricingError, setPricingError] = useState("");

  // Bypass Code state
  const [bypassCode, setBypassCode] = useState("OMTOADMIN");
  const [bypassSaving, setBypassSaving] = useState(false);
  const [bypassSuccess, setBypassSuccess] = useState("");
  const [bypassError, setBypassError] = useState("");

  // Load bypass code on mount
  useEffect(() => {
    fetch("/api/admin/bypass-code")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.bypassCode) {
          setBypassCode(data.bypassCode);
          localStorage.setItem("omto_admin_bypass_code", data.bypassCode);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch bypass code from server:", err);
        const localBypass = localStorage.getItem("omto_admin_bypass_code");
        if (localBypass) {
          setBypassCode(localBypass);
        }
      });
  }, []);

  const handleSaveBypassCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBypassSaving(true);
    setBypassSuccess("");
    setBypassError("");

    try {
      localStorage.setItem("omto_admin_bypass_code", bypassCode);
      const res = await fetch("/api/admin/bypass-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bypassCode }),
      });
      if (res.ok) {
        setBypassSuccess(
          selectedLanguage.code === "mr"
            ? "बायपास पासवर्ड यशस्वीरित्या बदलला!"
            : "Bypass code updated successfully!"
        );
        setTimeout(() => setBypassSuccess(""), 4000);
      } else {
        const data = await res.json();
        setBypassError(data.error || "Failed to sync bypass code with backend.");
      }
    } catch (err: any) {
      console.error(err);
      setBypassError(t(selectedLanguage.code, "authAdminErrorNetwork"));
    } finally {
      setBypassSaving(false);
    }
  };

  // Sync state if subscriptionConfig changes
  useEffect(() => {
    setPricingAmount(subscriptionConfig.amount);
    setPricingOriginalAmount(subscriptionConfig.originalAmount);
    setPricingPeriod(subscriptionConfig.billingPeriod);
    setPricingDetailsEn(subscriptionConfig.detailsEn);
    setPricingDetailsMr(subscriptionConfig.detailsMr);
  }, [subscriptionConfig]);

  const handleDownloadBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      totalQuestions: QUESTIONS.length,
      chapters: CHAPTERS,
      questions: QUESTIONS
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `question_bank_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Form states for adding a student
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newIsPremium, setNewIsPremium] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState(() => {
    // Default to 1 year from now
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Connect to realtime user stream on mount
  useEffect(() => {
    // 1. Initial fetch
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users) {
          setStudents(data.users);
        }
      })
      .catch(err => console.warn("Failed initial user load, relying on stream:", err));

    // 2. Real-time stream
    console.log("[AdminPanel] Connecting to real-time user stream /api/users/stream...");
    const eventSource = new EventSource("/api/users/stream");
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.success && data.users) {
          console.log(`[AdminPanel] Stream update: Received ${data.users.length} users.`);
          setStudents(data.users);
        }
      } catch (e) {
        console.error("Stream parse error:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE stream connection closed or failed. Reconnecting...", err);
    };

    return () => {
      console.log("[AdminPanel] Closing user stream connection...");
      eventSource.close();
    };
  }, []);

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPricingSaving(true);
    setPricingSuccess("");
    setPricingError("");

    try {
      const updatedConfig = {
        amount: Number(pricingAmount),
        originalAmount: Number(pricingOriginalAmount),
        billingPeriod: pricingPeriod,
        detailsEn: pricingDetailsEn,
        detailsMr: pricingDetailsMr,
      };

      // 1. Always save to local storage as fallback first so it instantly works locally & on static hosts (e.g. Vercel)
      try {
        localStorage.setItem("omto_subscription_config", JSON.stringify(updatedConfig));
      } catch (e) {
        console.error("Failed to save config to local storage:", e);
      }

      // 2. Propagate to parent React state immediately
      onUpdateSubscriptionConfig(updatedConfig);

      // 3. Inform the user of successful configuration save
      setPricingSuccess(
        selectedLanguage.code === "mr" 
          ? "सबस्क्रिप्शन प्लॅन यशस्वीरित्या सेव्ह केला गेला!" 
          : "Subscription plan updated and saved successfully!"
      );

      // 4. Try to sync with backend API server if online/available (fail silently if offline/404 on static hosts)
      try {
        const res = await fetch(`/api/subscription/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedConfig),
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Subscription plan successfully synced with backend API:", data);
        } else {
          console.warn("Backend API returned non-OK status. Relying on local storage.");
        }
      } catch (apiErr) {
        console.warn("Could not sync subscription plan with backend API. Using local storage fallback:", apiErr);
      }

    } catch (err: any) {
      console.error("Save pricing error:", err);
      setPricingError(t(selectedLanguage.code, "authAdminErrorNetwork") + ": " + (err.message || ""));
    } finally {
      setPricingSaving(false);
    }
  };

  // 1. Add Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newEmail || !newUsername) {
      setFormError(t(selectedLanguage.code, "authErrorFillFields"));
      return;
    }

    const emailKey = newEmail.toLowerCase().trim();
    if (students.some((s) => s && s.email && s.email.toLowerCase() === emailKey)) {
      setFormError(t(selectedLanguage.code, "noStudentsFound"));
      return;
    }

    const newRecord = {
      email: newEmail,
      username: newUsername,
      isPremium: newIsPremium,
      subscriptionStatus: newIsPremium ? "active" : "inactive",
      expiryDate: newExpiryDate,
      isBlocked: false,
      role: "student",
    };

    // Save to Server
    try {
      const res = await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: newRecord })
      });
      if (res.ok) {
        setFormSuccess(t(selectedLanguage.code, "authSignupSuccess"));
        setNewEmail("");
        setNewUsername("");
        setNewIsPremium(false);
        setTimeout(() => setFormSuccess(""), 3000);
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to add student.");
      }
    } catch (e) {
      setFormError("Network error: Failed to add student.");
    }
  };

  // 2. Toggle Premium Subscription
  const handleToggleSubscription = async (email: string) => {
    const student = students.find((s) => s.email === email);
    if (!student) return;
    
    const nextPremium = !student.isPremium;
    const subscriptionStatus = nextPremium ? "active" : "inactive";
    const expiryDate = nextPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : student.expiryDate;
    
    try {
      await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, updates: { isPremium: nextPremium, subscriptionStatus, expiryDate } })
      });
    } catch (e) {
      console.error("Failed to update subscription status on server:", e);
    }
  };

  // 3. Toggle Block User
  const handleToggleBlock = async (email: string) => {
    const student = students.find((s) => s.email === email);
    if (!student) return;
    
    const isBlocked = !student.isBlocked;
    
    try {
      await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, updates: { isBlocked } })
      });
    } catch (e) {
      console.error("Failed to toggle block status on server:", e);
    }
  };

  // 4. Delete Student Record
  const handleDeleteStudent = async (email: string) => {
    if (confirm(selectedLanguage.code === "mr" ? `तुम्हाला खात्री आहे की तुम्ही ${email} ला काढून टाकू इच्छिता?` : `Are you sure you want to remove ${email}?`)) {
      try {
        await fetch(`/api/users/${encodeURIComponent(email)}`, {
          method: "DELETE"
        });
      } catch (e) {
        console.error("Failed to delete student on server:", e);
      }
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter((s) => {
    if (!s) return false;
    const q = searchQuery.toLowerCase();
    const username = s.username || (s.email ? s.email.split("@")[0] : "") || "";
    const email = s.email || "";
    return (
      username.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Icons.ShieldAlert className="h-6 w-6 text-amber-500" />
            <span>{t(selectedLanguage.code, "adminDashboard")}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(selectedLanguage.code, "adminDesc")}
          </p>
        </div>

        {/* View togglers */}
        <div className="flex flex-wrap gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "list" 
                ? "bg-amber-500 text-slate-950" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
            }`}
          >
            <Icons.Users className="h-3.5 w-3.5" />
            <span>{t(selectedLanguage.code, "studentDirectory")}</span>
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pricing" 
                ? "bg-amber-500 text-slate-950" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
            }`}
          >
            <Icons.Settings className="h-3.5 w-3.5" />
            <span>{t(selectedLanguage.code, "subscriptionSettings")}</span>
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "coupons" 
                ? "bg-amber-500 text-slate-950" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
            }`}
          >
            <Icons.Tag className="h-3.5 w-3.5" />
            <span>{t(selectedLanguage.code, "couponCodes")}</span>
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "email" 
                ? "bg-amber-500 text-slate-950" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
            }`}
          >
            <Icons.Mail className="h-3.5 w-3.5" />
            <span>{selectedLanguage.code === "mr" ? "ईमेल (SMTP) सेटिंग" : "Email / SMTP Setup"}</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "guide" 
                ? "bg-amber-500 text-slate-950" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
            }`}
          >
            <Icons.DatabaseBackup className="h-3.5 w-3.5" />
            <span>{t(selectedLanguage.code, "connectDatabase")}</span>
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Manage & Directory */}
          <div className="lg:col-span-2 space-y-5">
            {/* Search filter utility */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-2">
              <Icons.Search className="h-4 w-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder={t(selectedLanguage.code, "searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-full placeholder-slate-600 font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-300 transition"
                >
                  <Icons.X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Students List Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden">
              <div className="p-4 bg-white dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {t(selectedLanguage.code, "totalStudents").replace("{count}", filteredStudents.length.toString())}
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {t(selectedLanguage.code, "liveDatabase")}
                </span>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Icons.UserX className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold">
                    {t(selectedLanguage.code, "noStudentsFound")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-850 max-h-[450px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.email} 
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-white dark:bg-slate-900/30 ${
                        student.isBlocked ? "opacity-60 bg-red-950/5" : ""
                      }`}
                    >
                      {/* Left: User description & email */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-black text-sm text-slate-900 dark:text-white truncate max-w-[180px]`}>
                            {student.username || (student.email ? student.email.split("@")[0] : "Student")}
                          </span>

                          {/* Online Indicator */}
                          {student.isOnline && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              ONLINE
                            </span>
                          )}
                          
                          {/* Expiry / Sub Badge */}
                          {student.isBlocked ? (
                            <span className="text-[9px] bg-red-500/10 text-red-400 font-bold px-2 py-0.5 rounded border border-red-500/25">
                              {t(selectedLanguage.code, "blocked")}
                            </span>
                          ) : student.isPremium ? (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/25 flex items-center gap-0.5 shadow-sm shadow-emerald-500/10">
                              <Icons.Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500/25" />
                              {t(selectedLanguage.code, "premiumBadge")}
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                              {t(selectedLanguage.code, "freeUser")}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 truncate">
                          <Icons.Mail className="h-3 w-3 text-slate-500 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>

                        {student.isPremium && (
                          <div className="text-[10px] text-amber-500/80 font-semibold flex items-center gap-1">
                            <Icons.CalendarDays className="h-3 w-3 text-amber-500/70" />
                            <span>
                              {t(selectedLanguage.code, "expiresOn").replace("{date}", "")}
                              <span className="font-mono">{student.expiryDate || "2027-06-25"}</span>
                            </span>
                          </div>
                        )}

                        {student.paymentTxnId && (
                          <div className="text-[9px] text-slate-500 font-mono truncate max-w-full">
                            UTR: {student.paymentTxnId}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Toggle Premium Button */}
                        <button
                          onClick={() => handleToggleSubscription(student.email)}
                          disabled={student.isBlocked}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer select-none ${
                            student.isBlocked
                              ? "bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-850 cursor-not-allowed"
                              : student.isPremium
                              ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25"
                              : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                          }`}
                        >
                          {student.isPremium ? (
                            <>
                              <Icons.UserMinus className="h-3.5 w-3.5" />
                              <span>{t(selectedLanguage.code, "cancelSub")}</span>
                            </>
                          ) : (
                            <>
                              <Icons.UserPlus className="h-3.5 w-3.5" />
                              <span>{t(selectedLanguage.code, "activateSub")}</span>
                            </>
                          )}
                        </button>

                        {/* Block/Unblock Button */}
                        <button
                          onClick={() => handleToggleBlock(student.email)}
                          className={`p-1.5 rounded-lg text-xs border transition cursor-pointer select-none ${
                            student.isBlocked
                              ? "bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white border-red-500"
                              : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-400 border-slate-200 dark:border-slate-850"
                          }`}
                          title={student.isBlocked ? t(selectedLanguage.code, "unblock") : t(selectedLanguage.code, "block")}
                        >
                          <Icons.Ban className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteStudent(student.email)}
                          className="p-1.5 bg-white dark:bg-slate-900 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-200 dark:border-slate-850 rounded-lg transition cursor-pointer select-none"
                          title={t(selectedLanguage.code, "deleteRecord")}
                        >
                          <Icons.Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Add Student Form */}
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
                <Icons.UserPlus className="h-4 w-4 text-emerald-500" />
                <span>{t(selectedLanguage.code, "addNewStudent")}</span>
              </h3>

              <form onSubmit={handleAddStudent} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t(selectedLanguage.code, "emailAddress")}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>

                {/* Username / Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t(selectedLanguage.code, "studentFullName")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t(selectedLanguage.code, "studentNamePlaceholder")}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t(selectedLanguage.code, "subscriptionExpiry")}
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>

                {/* Is Premium Checkbox */}
                <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl cursor-pointer hover:border-slate-200 dark:border-slate-800 transition select-none">
                  <input
                    type="checkbox"
                    checked={newIsPremium}
                    onChange={(e) => setNewIsPremium(e.target.checked)}
                    className="rounded border-slate-200 dark:border-slate-800 text-emerald-500 bg-slate-50 dark:bg-slate-950 focus:ring-emerald-500/20 h-3.5 w-3.5 cursor-pointer accent-emerald-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                    {t(selectedLanguage.code, "activatePremiumImmediately")}
                  </span>
                </label>

                {formError && (
                  <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                    <Icons.AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>{formError}</span>
                  </p>
                )}

                {formSuccess && (
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                    <Icons.CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{formSuccess}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 select-none"
                >
                  <Icons.Plus className="h-4 w-4" />
                  <span>{t(selectedLanguage.code, "addNewStudent")}</span>
                </button>
              </form>
            </div>

            {/* Quick Helper card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-2 font-sans">
              <span className="font-bold text-amber-500 uppercase tracking-wider text-[9px] block">
                {t(selectedLanguage.code, "dbNoticeTitle")}
              </span>
              <p>
                {t(selectedLanguage.code, "dbNoticeDesc")}
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "pricing" ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Icons.Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
              <span>{t(selectedLanguage.code, "planSettingsTitle")}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t(selectedLanguage.code, "planSettingsDesc")}
            </p>
          </div>

          <form onSubmit={handleSavePricing} className="space-y-4">
            {pricingSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <Icons.CheckCircle className="h-4 w-4 shrink-0" />
                <span>{pricingSuccess}</span>
              </div>
            )}

            {pricingError && (
              <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/25 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <Icons.AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{pricingError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t(selectedLanguage.code, "subscriptionFee")}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={pricingAmount}
                  onChange={(e) => setPricingAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-amber-500 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t(selectedLanguage.code, "originalPrice")}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={pricingOriginalAmount}
                  onChange={(e) => setPricingOriginalAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-amber-500 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {t(selectedLanguage.code, "billingPeriod")}
              </label>
              <select
                value={["lifetime", "1 month", "3 months", "6 months", "1 year"].includes(pricingPeriod) ? pricingPeriod : "custom"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setPricingPeriod("");
                  } else {
                    setPricingPeriod(val);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-amber-500 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold cursor-pointer"
              >
                <option value="lifetime">{t(selectedLanguage.code, "lifetimeAccess")}</option>
                <option value="1 month">{t(selectedLanguage.code, "monthAccess").replace("{count}", "1")}</option>
                <option value="3 months">{t(selectedLanguage.code, "monthsAccess").replace("{count}", "3")}</option>
                <option value="6 months">{t(selectedLanguage.code, "monthsAccess").replace("{count}", "6")}</option>
                <option value="1 year">{t(selectedLanguage.code, "monthAccess").replace("{count}", "12")}</option>
                <option value="custom">{t(selectedLanguage.code, "customDuration")}</option>
              </select>
            </div>

            {(!["lifetime", "1 month", "3 months", "6 months", "1 year"].includes(pricingPeriod)) && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t(selectedLanguage.code, "customDuration")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t(selectedLanguage.code, "customDurationPlaceholder")}
                  value={pricingPeriod}
                  onChange={(e) => setPricingPeriod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-amber-500 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {t(selectedLanguage.code, "packageNameEn")}
              </label>
              <input
                type="text"
                required
                value={pricingDetailsEn}
                onChange={(e) => setPricingDetailsEn(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-amber-500 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {t(selectedLanguage.code, "packageNameMr")}
              </label>
              <input
                type="text"
                required
                value={pricingDetailsMr}
                onChange={(e) => setPricingDetailsMr(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-amber-500 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={pricingSaving}
              className={`w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 dark:bg-slate-800 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 ${
                pricingSaving ? "animate-pulse" : ""
              }`}
            >
              {pricingSaving ? (
                <>
                  <Icons.Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t(selectedLanguage.code, "savingSettings")}</span>
                </>
              ) : (
                <>
                  <Icons.Save className="h-4 w-4" />
                  <span>{t(selectedLanguage.code, "saveConfiguration")}</span>
                </>
              )}
            </button>
          </form>

          {/* Admin Bypass Code Configuration Card */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Icons.Key className="h-5 w-5 text-amber-500" />
                <span>{t(selectedLanguage.code, "bypassCodeTitle")}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t(selectedLanguage.code, "bypassCodeDesc")}
              </p>
            </div>

            <form onSubmit={handleSaveBypassCode} className="space-y-4">
              {bypassSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Icons.CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{bypassSuccess}</span>
                </div>
              )}

              {bypassError && (
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/25 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Icons.AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{bypassError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t(selectedLanguage.code, "bypassCodeLabel")}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Icons.Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OMTOADMIN"
                    value={bypassCode}
                    onChange={(e) => setBypassCode(e.target.value.toUpperCase().trim())}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-amber-500 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none transition font-semibold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bypassSaving}
                className={`w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-750 disabled:bg-white dark:bg-slate-900 text-amber-400 border border-slate-300 dark:border-slate-700 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg`}
              >
                {bypassSaving ? (
                  <>
                    <Icons.Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t(selectedLanguage.code, "updatingBypassCode")}</span>
                  </>
                ) : (
                  <>
                    <Icons.Key className="h-4 w-4" />
                    <span>{t(selectedLanguage.code, "updateBypassCode")}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Question Bank Backup Card */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-8 space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Icons.DatabaseBackup className="h-5 w-5 text-blue-500" />
                <span>{selectedLanguage.code === "mr" ? "प्रश्न बँक बॅकअप (Question Bank Backup)" : "Question Bank Backup"}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedLanguage.code === "mr" 
                  ? "सर्व ऑटोमोबाईल आणि इलेक्ट्रिकल प्रश्नांचा JSON बॅकअप तुमच्या डिव्हाइसवर डाउनलोड करा." 
                  : "Download JSON backup of all Automobile and Electrical question banks."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
            >
              <Icons.Download className="h-4 w-4" />
              <span>{selectedLanguage.code === "mr" ? `सर्व प्रश्न डाउनलोड करा (${QUESTIONS.length} प्रश्न)` : `Download All Questions (${QUESTIONS.length})`}</span>
            </button>
          </div>
        </div>
      ) : activeTab === "coupons" ? (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl space-y-8 animate-fade-in">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Icons.Tag className="h-5 w-5 text-amber-500" />
              <span>{t(selectedLanguage.code, "couponCodes")}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {selectedLanguage.code === "mr"
                ? "विद्यार्थ्यांना सवलत देण्यासाठी ५ कूपन कोड सेट करा."
                : "Set up 5 coupon codes to offer discounts to students."}
            </p>
          </div>

          <form onSubmit={handleSaveCoupons} className="space-y-6">
            {couponsSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <Icons.CheckCircle className="h-4 w-4 shrink-0" />
                <span>{couponsSuccess}</span>
              </div>
            )}

            {couponsError && (
              <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/25 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <Icons.AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{couponsError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {coupons.map((coupon, index) => (
                <div key={coupon.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-500">#{index + 1}</span>
                  </div>
                  
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {t(selectedLanguage.code, "couponCodes")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SAVE50"
                      value={coupon.code}
                      onChange={(e) => handleUpdateCoupon(coupon.id, "code", e.target.value.toUpperCase().trim())}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {t(selectedLanguage.code, "couponCodes")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={coupon.discountPercent}
                        onChange={(e) => handleUpdateCoupon(coupon.id, "discountPercent", Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-amber-500 transition font-mono font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">%</span>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex items-center gap-3 justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className={`text-[10px] font-bold uppercase ${coupon.isActive ? "text-emerald-500" : "text-slate-500"}`}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                      <div 
                        onClick={() => handleUpdateCoupon(coupon.id, "isActive", !coupon.isActive)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${coupon.isActive ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${coupon.isActive ? "left-6" : "left-1"}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={couponsSaving}
              className={`w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 dark:bg-slate-800 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 ${
                couponsSaving ? "animate-pulse" : ""
              }`}
            >
              {couponsSaving ? (
                <>
                  <Icons.Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t(selectedLanguage.code, "savingSettings")}</span>
                </>
              ) : (
                <>
                  <Icons.Save className="h-4 w-4" />
                  <span>{t(selectedLanguage.code, "saveConfiguration")}</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : activeTab === "guide" ? (
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
              <Icons.DatabaseBackup className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {t(selectedLanguage.code, "connectDatabase")}
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              {selectedLanguage.code === "mr"
                ? "सध्या हा ॲप स्थानिक ब्राउझर मेमरी (LocalStorage) वापरतो. तुम्ही जेव्हा हे ॲप तुमच्या विद्यार्थ्यांसाठी लाईव्ह कराल, तेव्हा तुम्ही खालीलपैकी कोणत्याही पद्धतीने डेटाबेस कनेक्ट करू शकता. येथे आम्ही पूर्ण कोड तयार केला आहे:"
                : "Currently this app saves students inside standard LocalStorage. When deploying this for real student registration, you can integrate Firebase, Google Sheets, or SQL databases. Below are clean copy-paste templates ready to go:"}
            </p>

            {/* Sub Tabs for guides */}
            <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-850 max-w-lg">
              <button
                onClick={() => setGuideSubTab("firebase")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  guideSubTab === "firebase" ? "bg-amber-500 text-slate-950" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
                }`}
              >
                Firebase Firestore
              </button>
              <button
                onClick={() => setGuideSubTab("sheets")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  guideSubTab === "sheets" ? "bg-amber-500 text-slate-950" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
                }`}
              >
                Google Sheets API
              </button>
              <button
                onClick={() => setGuideSubTab("sql")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  guideSubTab === "sql" ? "bg-amber-500 text-slate-950" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
                }`}
              >
                REST API (Node/SQL)
              </button>
            </div>

            {/* Guide details */}
            {guideSubTab === "firebase" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <p className="text-slate-700 dark:text-slate-300 font-bold">1. Firebase cloud setup instructions:</p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  Firebase is the easiest cloud database. Create a Firestore collection named <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-amber-400 font-mono text-[10.5px]">students</code> where each document ID is the student's email, containing fields: <code className="text-amber-400 font-mono text-[10px]">username</code>, <code className="text-amber-400 font-mono text-[10px]">isPremium</code>, and <code className="text-amber-400 font-mono text-[10px]">expiryDate</code>.
                </p>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[10.5px] overflow-x-auto text-amber-300 whitespace-pre leading-relaxed">
{`// src/db/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "omto-test-app.firebaseapp.com",
  projectId: "omto-test-app",
  storageBucket: "omto-test-app.appspot.com",
  messagingSenderId: "12345678",
  appId: "1:12345678:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Save or upgrade a student subscription
export async function updateStudentSubscription(email: string, isPremium: boolean, expiryDate: string) {
  const studentRef = doc(db, "students", email.toLowerCase().trim());
  await updateDoc(studentRef, {
    isPremium: isPremium,
    expiryDate: expiryDate
  });
}`}
                </div>
              </div>
            )}

            {guideSubTab === "sheets" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <p className="text-slate-700 dark:text-slate-300 font-bold">2. Connect via Google Sheets (Free No-Code Backend):</p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  You can use a simple Google Sheet as your subscription database. Create a Sheet with headers: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-amber-400 font-mono text-[10.5px]">Name, Email, Status, Expiry</code>. Then publish a Google Apps Script Web App to handle GET/POST:
                </p>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[10.5px] overflow-x-auto text-amber-300 whitespace-pre leading-relaxed">
{`// Google Apps Script (Tools > Extensions > Apps Script)
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  if (data.action === "add") {
    sheet.appendRow([data.username, data.email, data.isPremium ? "Active" : "Inactive", data.expiryDate]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// React code to submit new student to Google Sheets
const addStudentToGoogleSheet = async (student) => {
  const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_MACRO_ID/exec";
  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({ action: "add", ...student })
  });
};`}
                </div>
              </div>
            )}

            {guideSubTab === "sql" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <p className="text-slate-700 dark:text-slate-300 font-bold">3. Express backend REST API Integration (PostgreSQL/SQL):</p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  For secure, enterprise-grade applications, connect this Admin Panel to a Node.js Express server backed by an SQL database:
                </p>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[10.5px] overflow-x-auto text-amber-300 whitespace-pre leading-relaxed">
{`// server.ts (Express subscription endpoints)
app.post("/api/admin/subscriptions", async (req, res) => {
  const { email, isPremium, expiryDate } = req.body;
  try {
    // Update PostgreSQL Database using SQL/ORM
    await db.query(
      "UPDATE students SET is_premium = $1, expiry_date = $2 WHERE email = $3",
      [isPremium, expiryDate, email.toLowerCase().trim()]
    );
    res.json({ success: true, message: "Subscription updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`}
                </div>
              </div>
            )}
          </div>
      ) : activeTab === "email" ? (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Status Card */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icons.Mail className="h-5 w-5 text-amber-500" />
                  <span>{selectedLanguage.code === "mr" ? "ईमेल सर्व्हर (SMTP) व ओटीपी व्यवस्थापन" : "Email Server (SMTP) & OTP Settings"}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedLanguage.code === "mr"
                    ? "नवीन युझर नोंदणी (Registration) करताना ईमेलवर जाणारा ओटीपी (OTP) येथून नियंत्रित केला जातो."
                    : "Controls the OTP emails sent to users during new registration and password recovery."}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 shrink-0">
                {smtpIsConnected === true ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Icons.CheckCircle2 className="h-4 w-4" />
                    <span>{selectedLanguage.code === "mr" ? "कनेक्टेड (Active)" : "Connected (Active)"}</span>
                  </span>
                ) : smtpIsConnected === false ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <Icons.AlertTriangle className="h-4 w-4" />
                    <span>{selectedLanguage.code === "mr" ? "अवैध पासवर्ड (Bad Credentials)" : "Authentication Error"}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Icons.RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{selectedLanguage.code === "mr" ? "तपासत आहे..." : "Checking..."}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={fetchSmtpConfig}
                  title="Refresh status"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Icons.RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {smtpVerifyError && (
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <Icons.AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <div className="font-bold">
                    {selectedLanguage.code === "mr"
                      ? "Gmail कडून एरर: युझरनेम किंवा ॲप पासवर्ड स्वीकारला नाही (BadCredentials)."
                      : "Gmail Error: Username and password not accepted (BadCredentials)."}
                  </div>
                  <div className="mt-0.5 text-[11px] text-rose-600/90 dark:text-rose-400/90">
                    {selectedLanguage.code === "mr"
                      ? "कृपया खालील फॉर्ममध्ये आपला योग्य १६-अक्षरी Google App Password टाका आणि 'सेव्ह करा आणि तपासा' बटणावर क्लिक करा."
                      : "Please enter your 16-character Google App Password below and click 'Save & Verify Connection'."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {smtpSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
              <Icons.CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{smtpSuccessMessage}</span>
            </div>
          )}

          {smtpErrorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
              <Icons.AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{smtpErrorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form to update SMTP */}
            <form onSubmit={handleUpdateSmtp} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Icons.Key className="h-4 w-4 text-amber-500" />
                <span>{selectedLanguage.code === "mr" ? "SMTP क्रेडेंशियल अपडेट करा" : "Update SMTP Credentials"}</span>
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="465"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {selectedLanguage.code === "mr" ? "ईमेल आयडी (Sender Email)" : "Sender Email Address"}
                </label>
                <div className="relative">
                  <Icons.Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-500">
                    {selectedLanguage.code === "mr" ? "Google ॲप पासवर्ड (16 letters)" : "Google App Password (16 letters)"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold"
                  >
                    {showSmtpPass ? (selectedLanguage.code === "mr" ? "लपवा" : "Hide") : (selectedLanguage.code === "mr" ? "दाखवा" : "Show")}
                  </button>
                </div>
                <div className="relative">
                  <Icons.Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showSmtpPass ? "text" : "password"}
                    required
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="abcd efgh ijkl mnop"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">
                  {selectedLanguage.code === "mr"
                    ? "हा तुमचा सामान्य जीमेल पासवर्ड नाही, तर Google कडून मिळालेला १६-अक्षरी ॲप पासवर्ड आहे."
                    : "This is a 16-character Google App Password (not your personal account password)."}
                </p>
              </div>

              <button
                type="submit"
                disabled={smtpUpdating}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {smtpUpdating ? (
                  <>
                    <Icons.Loader2 className="h-4 w-4 animate-spin" />
                    <span>{selectedLanguage.code === "mr" ? "तपासत व सेव्ह करत आहे..." : "Verifying & Saving..."}</span>
                  </>
                ) : (
                  <>
                    <Icons.Save className="h-4 w-4" />
                    <span>{selectedLanguage.code === "mr" ? "सेव्ह करा आणि कनेक्शन तपासा" : "Save & Verify Connection"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Test Email & Instructions */}
            <div className="space-y-4">
              {/* Test Email Box */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Icons.Send className="h-4 w-4 text-emerald-500" />
                  <span>{selectedLanguage.code === "mr" ? "ईमेल टेस्ट करा (Send Test OTP)" : "Send Test OTP Email"}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {selectedLanguage.code === "mr"
                    ? "ईमेल खरंच तुमच्या इनबॉक्समध्ये येतोय की नाही हे तपासण्यासाठी खालील बटणावर क्लिक करा."
                    : "Verify that test OTP emails land directly in the recipient inbox."}
                </p>

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    placeholder="recipient@gmail.com"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={smtpTesting}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {smtpTesting ? (
                      <Icons.Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Icons.Send className="h-3.5 w-3.5" />
                    )}
                    <span>{selectedLanguage.code === "mr" ? "टेस्ट पाठवा" : "Send Test"}</span>
                  </button>
                </div>
              </div>

              {/* Step by Step Guide Card */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icons.HelpCircle className="h-4 w-4 text-amber-500" />
                  <span>{selectedLanguage.code === "mr" ? "Google App Password कसा मिळवावा? (२ मिनिटे)" : "How to get Google App Password (2 mins)"}</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11.5px] leading-relaxed">
                  <li>
                    {selectedLanguage.code === "mr" ? "आपले " : "Open "}
                    <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-amber-500 underline font-semibold">Google Account Security</a>
                    {selectedLanguage.code === "mr" ? " उघडा." : "."}
                  </li>
                  <li>
                    {selectedLanguage.code === "mr"
                      ? "'2-Step Verification' चालू (Turn ON) असल्याची खात्री करा."
                      : "Make sure '2-Step Verification' is turned ON."}
                  </li>
                  <li>
                    {selectedLanguage.code === "mr"
                      ? "वर शोध बारमध्ये 'App Passwords' टाइप करा किंवा सुरक्षा विभागात शोधा."
                      : "Search for 'App passwords' in the top search bar."}
                  </li>
                  <li>
                    {selectedLanguage.code === "mr"
                      ? "ॲपचे नाव 'OMTO' टाका आणि 'Create' बटणावर क्लिक करा."
                      : "Give the app a name like 'OMTO' and click 'Create'."}
                  </li>
                  <li>
                    {selectedLanguage.code === "mr"
                      ? "स्क्रीनवर दिसणारा १६ अक्षरांचा पासवर्ड (उदा. abcd efgh ijkl mnop) कॉपी करून डावीकडील फॉर्ममध्ये पेस्ट करा."
                      : "Copy the 16-character code (e.g. abcd efgh ijkl mnop) and paste it into the form on the left."}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
