import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { StateLanguage, User, SubscriptionConfig } from "../types";

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
  const isMarathi = selectedLanguage.code === "mr";
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "guide" | "pricing">("list");
  const [guideSubTab, setGuideSubTab] = useState<"firebase" | "sheets" | "sql">("firebase");

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
          isMarathi
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
      setBypassError(isMarathi ? "त्रुटी आढळली!" : "Network error! Please try again.");
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
        isMarathi 
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
      setPricingError(isMarathi ? "त्रुटी आढळली: " + (err.message || "") : err.message || "An error occurred.");
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
      setFormError(isMarathi ? "कृपया ईमेल आणि नाव प्रविष्ट करा." : "Please enter email and name.");
      return;
    }

    const emailKey = newEmail.toLowerCase().trim();
    if (students.some((s) => s && s.email && s.email.toLowerCase() === emailKey)) {
      setFormError(isMarathi ? "या ईमेलचा विद्यार्थी आधीपासूनच अस्तित्वात आहे!" : "A student with this email already exists!");
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
        setFormSuccess(isMarathi ? "विद्यार्थी यशस्वीरित्या जोडला गेला!" : "Student added successfully!");
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
    if (confirm(isMarathi ? `तुम्हाला खात्री आहे की तुम्ही ${email} ला काढून टाकू इच्छिता?` : `Are you sure you want to remove ${email}?`)) {
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
    <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-100">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Icons.ShieldAlert className="h-6 w-6 text-amber-500" />
            <span>{isMarathi ? "ॲडमीन डॅशबोर्ड" : "Admin Control Panel"}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isMarathi 
              ? "विद्यार्थ्यांच्या सबस्क्रिप्शन व प्रीमियम खात्यांचे व्यवस्थापन करा" 
              : "Manage students, edit subscription status, and monitor user logins"}
          </p>
        </div>

        {/* View togglers */}
        <div className="flex flex-wrap gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "list" 
                ? "bg-amber-500 text-slate-950" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icons.Users className="h-3.5 w-3.5" />
            <span>{isMarathi ? "विद्यार्थी यादी" : "Student Directory"}</span>
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pricing" 
                ? "bg-amber-500 text-slate-950" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icons.Settings className="h-3.5 w-3.5" />
            <span>{isMarathi ? "सबस्क्रिप्शन किंमत बदला" : "Subscription Settings"}</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "guide" 
                ? "bg-amber-500 text-slate-950" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icons.DatabaseBackup className="h-3.5 w-3.5" />
            <span>{isMarathi ? "डेटाबेस कनेक्ट" : "Connect Database"}</span>
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Manage & Directory */}
          <div className="lg:col-span-2 space-y-5">
            {/* Search filter utility */}
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 rounded-2xl px-4 py-2">
              <Icons.Search className="h-4 w-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder={isMarathi ? "नाव किंवा ईमेलने शोधा..." : "Search students by name or email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full placeholder-slate-600 font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-slate-500 hover:text-slate-300 transition"
                >
                  <Icons.X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Students List Card */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden">
              <div className="p-4 bg-slate-900/40 border-b border-slate-850 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">
                  {isMarathi ? `एकूण विद्यार्थी: ${filteredStudents.length}` : `Total Registered: ${filteredStudents.length}`}
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {isMarathi ? "लाईव्ह डेटाबेस" : "Live Local DB Sync"}
                </span>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Icons.UserX className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold">
                    {isMarathi ? "कोणताही विद्यार्थी सापडला नाही." : "No student matches your query."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-850 max-h-[450px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.email} 
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-900/30 ${
                        student.isBlocked ? "opacity-60 bg-red-950/5" : ""
                      }`}
                    >
                      {/* Left: User description & email */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-black text-sm text-white truncate max-w-[180px]`}>
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
                              {isMarathi ? "ब्लॉक केलेला" : "BLOCKED"}
                            </span>
                          ) : student.isPremium ? (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/25 flex items-center gap-0.5 shadow-sm shadow-emerald-500/10">
                              <Icons.Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500/25" />
                              {isMarathi ? "प्रीमियम" : "PREMIUM"}
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-700">
                              {isMarathi ? "मोफत सदस्य" : "FREE USER"}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 truncate">
                          <Icons.Mail className="h-3 w-3 text-slate-500 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>

                        {student.isPremium && (
                          <div className="text-[10px] text-amber-500/80 font-semibold flex items-center gap-1">
                            <Icons.CalendarDays className="h-3 w-3 text-amber-500/70" />
                            <span>
                              {isMarathi ? `मुदत संपण्याची तारीख: ` : `Expires on: `}
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
                              ? "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed"
                              : student.isPremium
                              ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25"
                              : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                          }`}
                        >
                          {student.isPremium ? (
                            <>
                              <Icons.UserMinus className="h-3.5 w-3.5" />
                              <span>{isMarathi ? "कॅन्सल सबस्क्रिप्शन" : "Cancel Sub"}</span>
                            </>
                          ) : (
                            <>
                              <Icons.UserPlus className="h-3.5 w-3.5" />
                              <span>{isMarathi ? "प्रीमियम द्या" : "Activate Sub"}</span>
                            </>
                          )}
                        </button>

                        {/* Block/Unblock Button */}
                        <button
                          onClick={() => handleToggleBlock(student.email)}
                          className={`p-1.5 rounded-lg text-xs border transition cursor-pointer select-none ${
                            student.isBlocked
                              ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                              : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border-slate-850"
                          }`}
                          title={student.isBlocked ? (isMarathi ? "अनब्लॉक करा" : "Unblock Student") : (isMarathi ? "ब्लॉक करा" : "Block Student")}
                        >
                          <Icons.Ban className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteStudent(student.email)}
                          className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-850 rounded-lg transition cursor-pointer select-none"
                          title={isMarathi ? "पूर्णपणे काढून टाका" : "Delete Student Record"}
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
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-3">
                <Icons.UserPlus className="h-4 w-4 text-emerald-500" />
                <span>{isMarathi ? "नवीन विद्यार्थी जोडा" : "Add New Student"}</span>
              </h3>

              <form onSubmit={handleAddStudent} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {isMarathi ? "ईमेल आयडी" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>

                {/* Username / Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {isMarathi ? "विद्यार्थ्याचे नाव" : "Student Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isMarathi ? "उदा. गणेश पाटील" : "e.g. Rahul Sharma"}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {isMarathi ? "सबस्क्रिप्शन मुदत तारीख" : "Subscription Expiry"}
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>

                {/* Is Premium Checkbox */}
                <label className="flex items-center gap-2.5 p-2.5 bg-slate-900/60 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-800 transition select-none">
                  <input
                    type="checkbox"
                    checked={newIsPremium}
                    onChange={(e) => setNewIsPremium(e.target.checked)}
                    className="rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-emerald-500/20 h-3.5 w-3.5 cursor-pointer accent-emerald-500"
                  />
                  <span className="text-xs text-slate-300 font-bold">
                    {isMarathi ? "थेट प्रीमियम खाते द्या" : "Activate Premium Sub immediately"}
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
                  <span>{isMarathi ? "नवीन विद्यार्थी जोडा" : "Add Student Record"}</span>
                </button>
              </form>
            </div>

            {/* Quick Helper card */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-[10.5px] text-slate-400 leading-relaxed space-y-2 font-sans">
              <span className="font-bold text-amber-500 uppercase tracking-wider text-[9px] block">
                {isMarathi ? "💡 डेटाबेस टीप" : "💡 Synchronization Notice"}
              </span>
              <p>
                {isMarathi 
                  ? "हा डॅशबोर्ड थेट विद्यार्थ्यांच्या स्थानिक डेटाबेसशी सिंक केलेला आहे. तुम्ही बदललेली कोणतीही सबस्क्रिप्शन स्टेटस किंवा ब्लॉक स्टेटस लॉगिन करताना तात्काळ लागू होते."
                  : "This panel connects directly to the local users database on this browser session. Activating or canceling subscriptions dynamically blocks or unlocks mock tests for that student immediately."}
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "pricing" ? (
        <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Icons.Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
              <span>{isMarathi ? "सबस्क्रिप्शन किंमत आणि प्लॅन सेटिंग्ज" : "Subscription Plan & Pricing"}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isMarathi
                ? "इथून तुम्ही प्रीमियम सबस्क्रिप्शनची किंमत, मूळ किंमत, मुदत आणि वर्णन बदलू शकता."
                : "Configure the checkout subscription amounts, discounts, billing period, and names dynamically."}
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isMarathi ? "सबस्क्रिप्शन शुल्क (₹)" : "Subscription Fee (₹)"}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={pricingAmount}
                  onChange={(e) => setPricingAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isMarathi ? "मूळ किंमत / छापील किंमत (₹)" : "Original / Strikeout Price (₹)"}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={pricingOriginalAmount}
                  onChange={(e) => setPricingOriginalAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMarathi ? "पेमेंट मुदत" : "Billing Period / Access Duration"}
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
                className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold cursor-pointer"
              >
                <option value="lifetime">{isMarathi ? "लाइफटाईम (Lifetime Access)" : "Lifetime Access"}</option>
                <option value="1 month">{isMarathi ? "१ महिना (1 Month Access)" : "1 Month Access"}</option>
                <option value="3 months">{isMarathi ? "३ महिने (3 Months Access)" : "3 Months Access"}</option>
                <option value="6 months">{isMarathi ? "६ महिने (6 Months Access)" : "6 Months Access"}</option>
                <option value="1 year">{isMarathi ? "१ वर्ष (1 Year Access)" : "1 Year Access"}</option>
                <option value="custom">{isMarathi ? "कस्टम मुदत (Custom Duration...)" : "Custom Duration..."}</option>
              </select>
            </div>

            {(!["lifetime", "1 month", "3 months", "6 months", "1 year"].includes(pricingPeriod)) && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isMarathi ? "कस्टम मुदत प्रविष्ट करा (उदा. 45 Days, 2 Months)" : "Enter Custom Duration (e.g. 45 Days, 2 Months)"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMarathi ? "उदा. 45 Days, 3 Months" : "e.g. 45 Days, 3 Months"}
                  value={pricingPeriod}
                  onChange={(e) => setPricingPeriod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMarathi ? "पॅकेज नाव (इंग्रजी)" : "Package Name (English)"}
              </label>
              <input
                type="text"
                required
                value={pricingDetailsEn}
                onChange={(e) => setPricingDetailsEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMarathi ? "पॅकेज नाव (मराठी)" : "Package Name (Marathi)"}
              </label>
              <input
                type="text"
                required
                value={pricingDetailsMr}
                onChange={(e) => setPricingDetailsMr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={pricingSaving}
              className={`w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 ${
                pricingSaving ? "animate-pulse" : ""
              }`}
            >
              {pricingSaving ? (
                <>
                  <Icons.Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isMarathi ? "प्लॅन सेव्ह केला जात आहे..." : "Saving Plan Settings..."}</span>
                </>
              ) : (
                <>
                  <Icons.Save className="h-4 w-4" />
                  <span>{isMarathi ? "सबस्क्रिप्शन माहिती अपडेट करा" : "Save Plan Configuration"}</span>
                </>
              )}
            </button>
          </form>

          {/* Admin Bypass Code Configuration Card */}
          <div className="border-t border-slate-800 pt-8 mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Icons.Key className="h-5 w-5 text-amber-500" />
                <span>{isMarathi ? "बायपास कोड मॅनेजमेंट (Admin Bypass Code)" : "Admin Bypass Code Management"}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isMarathi
                  ? "हा बायपास कोड वापरून विद्यार्थी किंवा तुम्ही पासवर्ड न वापरता डायरेक्ट लॉगिन करू शकता. हा वारंवार बदलत राहा."
                  : "Change the admin bypass code periodically to keep registration or testing access secure."}
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isMarathi ? "बायपास पासवर्ड कोड" : "Bypass Password Code"}
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
                    className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none transition font-semibold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bypassSaving}
                className={`w-full py-3 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 text-amber-400 border border-slate-700 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg`}
              >
                {bypassSaving ? (
                  <>
                    <Icons.Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isMarathi ? "बायपास कोड बदलला जात आहे..." : "Updating Bypass Code..."}</span>
                  </>
                ) : (
                  <>
                    <Icons.Key className="h-4 w-4" />
                    <span>{isMarathi ? "बायपास कोड अपडेट करा" : "Update Bypass Code"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Real Database Connection Guide */
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Icons.DatabaseBackup className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isMarathi ? "तुमचा स्वतःचा खरा डेटाबेस कसा कनेक्ट कराल?" : "Database Connection Integration Guide"}
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {isMarathi
                ? "सध्या हा ॲप स्थानिक ब्राउझर मेमरी (LocalStorage) वापरतो. तुम्ही जेव्हा हे ॲप तुमच्या विद्यार्थ्यांसाठी लाईव्ह कराल, तेव्हा तुम्ही खालीलपैकी कोणत्याही पद्धतीने डेटाबेस कनेक्ट करू शकता. येथे आम्ही पूर्ण कोड तयार केला आहे:"
                : "Currently this app saves students inside standard LocalStorage. When deploying this for real student registration, you can integrate Firebase, Google Sheets, or SQL databases. Below are clean copy-paste templates ready to go:"}
            </p>

            {/* Sub Tabs for guides */}
            <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-850 max-w-lg">
              <button
                onClick={() => setGuideSubTab("firebase")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  guideSubTab === "firebase" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Firebase Firestore
              </button>
              <button
                onClick={() => setGuideSubTab("sheets")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  guideSubTab === "sheets" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Google Sheets API
              </button>
              <button
                onClick={() => setGuideSubTab("sql")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  guideSubTab === "sql" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                REST API (Node/SQL)
              </button>
            </div>

            {/* Guide details */}
            {guideSubTab === "firebase" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <p className="text-slate-300 font-bold">1. Firebase cloud setup instructions:</p>
                <p className="text-slate-400 leading-relaxed font-sans">
                  Firebase is the easiest cloud database. Create a Firestore collection named <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-400 font-mono text-[10.5px]">students</code> where each document ID is the student's email, containing fields: <code className="text-amber-400 font-mono text-[10px]">username</code>, <code className="text-amber-400 font-mono text-[10px]">isPremium</code>, and <code className="text-amber-400 font-mono text-[10px]">expiryDate</code>.
                </p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[10.5px] overflow-x-auto text-amber-300 whitespace-pre leading-relaxed">
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
                <p className="text-slate-300 font-bold">2. Connect via Google Sheets (Free No-Code Backend):</p>
                <p className="text-slate-400 leading-relaxed font-sans">
                  You can use a simple Google Sheet as your subscription database. Create a Sheet with headers: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-400 font-mono text-[10.5px]">Name, Email, Status, Expiry</code>. Then publish a Google Apps Script Web App to handle GET/POST:
                </p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[10.5px] overflow-x-auto text-amber-300 whitespace-pre leading-relaxed">
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
                <p className="text-slate-300 font-bold">3. Express backend REST API Integration (PostgreSQL/SQL):</p>
                <p className="text-slate-400 leading-relaxed font-sans">
                  For secure, enterprise-grade applications, connect this Admin Panel to a Node.js Express server backed by an SQL database:
                </p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[10.5px] overflow-x-auto text-amber-300 whitespace-pre leading-relaxed">
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
        </div>
      )}
    </div>
  );
}
