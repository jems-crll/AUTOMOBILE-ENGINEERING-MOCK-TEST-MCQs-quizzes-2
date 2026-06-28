import React, { useState } from "react";
import * as Icons from "lucide-react";
import { User, STATE_LANGUAGES, StateLanguage } from "../types";

interface AuthProps {
  onLoginSuccess: (user: User) => void;
  selectedLanguage: StateLanguage;
}

export default function Auth({ onLoginSuccess, selectedLanguage }: AuthProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup" | "verify_otp" | "forgot_password" | "forgot_username">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Recovery States
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveredInfo, setRecoveredInfo] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [logoClicks, setLogoClicks] = useState(0);

  const isMarathi = selectedLanguage.code === "mr";

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    if (nextClicks >= 5) {
      setLogoClicks(0);
      const secretPassword = prompt(isMarathi ? "कृपया गुप्त ॲडमीन पासवर्ड प्रविष्ट करा (उदा. 9988):" : "Enter secret admin password (e.g., 9988):");
      if (secretPassword === "9988") {
        const adminUser: User = {
          email: "admin@omto.com",
          username: "Admin",
          isPremium: true,
          role: "admin",
          subscriptionStatus: "active"
        };
        onLoginSuccess(adminUser);
      } else if (secretPassword !== null) {
        alert(isMarathi ? "चुकीचा पासवर्ड!" : "Incorrect password!");
      }
    } else {
      setLogoClicks(nextClicks);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage(isMarathi ? "कृपया सर्व माहिती भरा." : "Please fill in all fields.");
      return;
    }

    const emailKey = email.trim().toLowerCase();
    setIsProcessing(true);

    if (authMode === "login") {
      // Admin bypass quick trigger
      if (password === "OMTOADMIN" || password === "BYPASS2026") {
        const adminUser: User = {
          email: emailKey.includes("@") ? emailKey : `${emailKey}@omto.com`,
          username: emailKey,
          isPremium: true,
          role: "admin",
          subscriptionStatus: "active"
        };
        setIsProcessing(false);
        onLoginSuccess(adminUser);
        return;
      }

      // Standard API-based login
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrUsername: emailKey, password })
        });
        const data = await res.json();
        setIsProcessing(false);

        if (res.ok && data.success && data.user) {
          onLoginSuccess(data.user);
        } else {
          setErrorMessage(
            data.error || 
            (isMarathi
              ? "चुकीचा ईमेल/युझरनेम किंवा पासवर्ड. कृपया पुन्हा प्रयत्न करा."
              : "Invalid email/username or password. Please try again.")
          );
        }
      } catch (e) {
        setIsProcessing(false);
        setErrorMessage(isMarathi ? "नेटवर्क त्रुटी! पुन्हा प्रयत्न करा." : "Network error! Please try again.");
      }
    } else if (authMode === "signup") {
      if (!username) {
        setErrorMessage(isMarathi ? "कृपया युझरनेम भरा." : "Please fill in username.");
        setIsProcessing(false);
        return;
      }

      // signup check API
      try {
        const res = await fetch("/api/auth/signup-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailKey, username: username.trim() })
        });
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Validation failed");
          setIsProcessing(false);
          return;
        }

        // Send OTP
        const otpRes = await fetch(`/api/otp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: emailKey })
        });
        const otpData = await otpRes.json();
        setIsProcessing(false);

        if (otpData.success) {
          setSuccessMessage(
            isMarathi 
              ? "ओटीपी पाठवला आहे. कृपया तपासा." 
              : "OTP sent successfully. Please check your email/phone."
          );
          setAuthMode("verify_otp");
          setOtp("");
        } else {
          setErrorMessage(otpData.error || "Failed to send OTP.");
        }
      } catch (err) {
        setIsProcessing(false);
        setErrorMessage("Network error: Failed to proceed with signup.");
      }
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp) {
      setErrorMessage(isMarathi ? "कृपया ओटीपी भरा." : "Please enter the OTP.");
      return;
    }

    setIsProcessing(true);
    const emailKey = email.trim().toLowerCase();

    try {
      const res = await fetch(`/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: emailKey, otp })
      });
      const data = await res.json();

      if (data.success) {
        // Complete the signup on backend
        const completeRes = await fetch("/api/auth/signup-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailKey, username: username.trim(), password })
        });
        const completeData = await completeRes.json();
        setIsProcessing(false);

        if (completeData.success) {
          setSuccessMessage(
            isMarathi
              ? "नोंदणी यशस्वी! आता तुम्ही लॉगिन करू शकता."
              : "Registration successful! You can now login."
          );
          setAuthMode("login");
          setPassword("");
          setOtp("");
        } else {
          setErrorMessage(completeData.error || "Failed to complete signup.");
        }
      } else {
        setIsProcessing(false);
        setErrorMessage(data.error || "Invalid OTP.");
      }
    } catch (e) {
      setIsProcessing(false);
      setErrorMessage("Network error: Failed to verify OTP.");
    }
  };

  const handleResendOtp = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsProcessing(true);
    const emailKey = email.trim().toLowerCase();
    
    fetch(`/api/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: emailKey })
    })
    .then(res => res.json())
    .then(data => {
      setIsProcessing(false);
      if (data.success) {
        setSuccessMessage(
          isMarathi 
            ? "नवीन ओटीपी पाठवला आहे." 
            : "New OTP sent successfully."
        );
      } else {
        setErrorMessage(data.error || "Failed to resend OTP.");
      }
    })
    .catch(err => {
      setIsProcessing(false);
      setErrorMessage("Network error: Failed to resend OTP.");
    });
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setRecoveredInfo(null);

    if (!recoveryEmail) {
      setErrorMessage(
        isMarathi
          ? "कृपया ईमेल किंवा युझरनेम भरा."
          : "Please enter your email or username."
      );
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: recoveryEmail })
      });
      const data = await res.json();
      setIsProcessing(false);

      if (res.ok && data.success) {
        setRecoveredInfo(data);
        setSuccessMessage(
          isMarathi
            ? `खाते सापडले! युझरनेम: ${data.username || "N/A"}`
            : `Account found! Username: ${data.username || "N/A"}`
        );
      } else {
        setErrorMessage(
          data.error || 
          (isMarathi
            ? "या ईमेल किंवा युझरनेमसह कोणतेही खाते सापडले नाही."
            : "No account found with this email or username.")
        );
      }
    } catch (e) {
      setIsProcessing(false);
      setErrorMessage("Network error: Failed to fetch recovery info.");
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !recoveredInfo) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveredInfo.email, password: newPassword })
      });
      const data = await res.json();
      setIsProcessing(false);

      if (res.ok && data.success) {
        setSuccessMessage(
          isMarathi
            ? "पासवर्ड यशस्वीरित्या रिसेट झाला! आता तुम्ही नवीन पासवर्डने लॉगिन करू शकता."
            : "Password successfully reset! You can now login with your new password."
        );
        setRecoveredInfo(null);
        setNewPassword("");
        setRecoveryEmail("");
        setAuthMode("login");
      } else {
        setErrorMessage(data.error || "Failed to reset password.");
      }
    } catch (e) {
      setIsProcessing(false);
      setErrorMessage("Network error: Failed to reset password.");
    }
  };

  const handleForgotUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!recoveryEmail) {
      setErrorMessage(
        isMarathi ? "कृपया नोंदणीकृत ईमेल पत्ता भरा." : "Please enter your registered email address."
      );
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/auth/forgot-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail })
      });
      const data = await res.json();
      setIsProcessing(false);

      if (res.ok && data.success) {
        setSuccessMessage(
          isMarathi
            ? `तुमचा युझरनेम आहे: "${data.username || "N/A"}"`
            : `Your registered username is: "${data.username || "N/A"}"`
        );
      } else {
        setErrorMessage(
          data.error || 
          (isMarathi
            ? "या ईमेल पत्त्यासह कोणतेही खाते सापडले नाही."
            : "No account found with this email address.")
        );
      }
    } catch (e) {
      setIsProcessing(false);
      setErrorMessage("Network error: Failed to recover username.");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div 
            id="app-logo"
            onClick={handleLogoClick}
            className="p-3 bg-amber-500 rounded-2xl text-slate-950 shadow-xl shadow-amber-500/10 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
            title={isMarathi ? "गुप्त ॲडमीन ॲक्सेससाठी ५ वेळा क्लिक करा" : "Click 5 times for secret admin access"}
          >
            <Icons.Wrench className="h-8 w-8 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="text-center text-2xl md:text-3xl font-black text-white tracking-tight">
          {authMode === "login" && (isMarathi ? "ऑटोमोबाईल मॉक टेस्ट लॉगिन" : "Automobile Mock Test Login")}
          {authMode === "signup" && (isMarathi ? "नवीन खाते तयार करा" : "Create New Account")}
          {authMode === "verify_otp" && (isMarathi ? "ओटीपी तपासा" : "Verify Account")}
          {authMode === "forgot_password" && (isMarathi ? "पासवर्ड विसरलात?" : "Forgot Password")}
          {authMode === "forgot_username" && (isMarathi ? "युझरनेम विसरलात?" : "Forgot Username")}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          {isMarathi 
            ? "सर्व फीचर्स आणि सराव चाचण्या वापरण्यासाठी खालील माहिती भरा" 
            : "Fill in the details below to access all study and exam features"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Icons.AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Icons.CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Login or Signup form */}
          {(authMode === "login" || authMode === "signup") && (
            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              {/* Optional Username input for Signup */}
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isMarathi ? "युझरनेम (Username)" : "Username"}
                  </label>
                  <div className="relative">
                    <Icons.User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. jemshery"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {authMode === "login" 
                    ? (isMarathi ? "ईमेल पत्ता किंवा युझरनेम" : "Email Address or Username")
                    : (isMarathi ? "ईमेल पत्ता" : "Email Address")}
                </label>
                <div className="relative">
                  <Icons.Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder={authMode === "login" ? "student@test.com or student" : "student@test.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isMarathi ? "पासवर्ड" : "Password"}
                  </label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot_password");
                        setErrorMessage("");
                        setSuccessMessage("");
                        setRecoveryEmail("");
                        setRecoveredInfo(null);
                      }}
                      className="text-[11px] text-amber-500 hover:text-amber-400 font-bold"
                    >
                      {isMarathi ? "पासवर्ड विसरलात?" : "Forgot Password?"}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Icons.Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-black rounded-xl hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isProcessing ? (
                  <Icons.Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{authMode === "login" ? (isMarathi ? "लॉगिन करा" : "Login") : (isMarathi ? "नोंदणी (Signup) करा" : "Register") }</span>
                    <Icons.ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Verification form */}
          {authMode === "verify_otp" && (
            <form className="space-y-4" onSubmit={handleVerifyOtpSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isMarathi ? "ओटीपी प्रविष्ट करा" : "Enter OTP"}
                </label>
                <div className="relative">
                  <Icons.Key className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors tracking-[0.5em] font-mono text-center"
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-500 text-center">
                  {isMarathi 
                    ? `आम्ही ${email} वर एक ओटीपी पाठवला आहे.`
                    : `We've sent a 6-digit OTP to ${email}.`}
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isProcessing ? (
                  <Icons.Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{isMarathi ? "ओटीपी तपासा" : "Verify OTP"}</span>
                    <Icons.CheckCircle className="h-4 w-4" />
                  </>
                )}
              </button>
              
              <div className="flex flex-col gap-3 text-center mt-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isProcessing}
                  className="text-xs text-amber-500 hover:text-amber-400 disabled:opacity-50 font-semibold cursor-pointer"
                >
                  {isMarathi ? "ओटीपी पुन्हा पाठवा" : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorMessage("");
                    setSuccessMessage("");
                    setOtp("");
                  }}
                  disabled={isProcessing}
                  className="text-xs text-slate-500 hover:text-slate-400 disabled:opacity-50 font-semibold cursor-pointer"
                >
                  {isMarathi ? "मागे जा" : "Go Back"}
                </button>
              </div>
            </form>
          )}

          {/* 2. Forgot Password Recovery view */}
          {authMode === "forgot_password" && (
            <div className="space-y-4">
              {!recoveredInfo ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      {isMarathi ? "नोंदणीकृत ईमेल किंवा युझरनेम" : "Registered Email or Username"}
                    </label>
                    <div className="relative">
                      <Icons.Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="student@test.com or student"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Icons.Search className="h-4 w-4" />
                    <span>{isMarathi ? "खाते शोधा" : "Find Account"}</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs space-y-1">
                    <div className="text-slate-400">{isMarathi ? "युझर ईमेल:" : "User Email:"} <span className="text-white font-semibold">{recoveredInfo.email}</span></div>
                    <div className="text-slate-400">{isMarathi ? "सध्याचा पासवर्ड:" : "Current Password:"} <span className="text-amber-400 font-mono font-bold">{recoveredInfo.password}</span></div>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                      {isMarathi 
                        ? "(टीप: सुरक्षिततेसाठी तुम्ही खाली थेट नवीन पासवर्ड रिसेट देखील करू शकता)" 
                        : "(Note: You can also reset it to a new password directly below)"}
                    </p>
                  </div>

                  <form onSubmit={handlePasswordResetSubmit} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isMarathi ? "नवीन पासवर्ड प्रविष्ट करा" : "Enter New Password"}
                      </label>
                      <div className="relative">
                        <Icons.Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Icons.Check className="h-4 w-4" />
                      <span>{isMarathi ? "पासवर्ड बदला (Reset)" : "Change Password"}</span>
                    </button>
                  </form>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-300 font-bold transition cursor-pointer"
              >
                {isMarathi ? "लॉगिन कडे परत जा" : "Back to Login"}
              </button>
            </div>
          )}

          {/* 3. Forgot Username Recovery view */}
          {authMode === "forgot_username" && (
            <div className="space-y-4">
              <form onSubmit={handleForgotUsernameSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isMarathi ? "तुमचा नोंदणीकृत ईमेल पत्ता" : "Your Registered Email Address"}
                  </label>
                  <div className="relative">
                    <Icons.Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="student@test.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icons.Search className="h-4 w-4" />
                  <span>{isMarathi ? "युझरनेम शोधा" : "Find Username"}</span>
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-300 font-bold transition cursor-pointer"
              >
                {isMarathi ? "लॉगिन कडे परत जा" : "Back to Login"}
              </button>
            </div>
          )}

          {/* Navigation links between login and signup */}
          {authMode === "login" && (
            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-800/60 text-center">
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-xs text-amber-500 hover:text-amber-400 font-bold transition-colors cursor-pointer"
              >
                {isMarathi ? "नवीन खाते तयार करायचे आहे? येथे नोंदणी करा" : "Don't have an account? Sign up here"}
              </button>
              <button
                onClick={() => {
                  setAuthMode("forgot_username");
                  setErrorMessage("");
                  setSuccessMessage("");
                  setRecoveryEmail("");
                }}
                className="text-xs text-slate-500 hover:text-slate-400 font-medium transition-colors cursor-pointer"
              >
                {isMarathi ? "युझरनेम विसरलात? येथे शोधा" : "Forgot your username? Find it here"}
              </button>
            </div>
          )}

          {authMode === "signup" && (
            <div className="mt-4 pt-4 border-t border-slate-800/60 text-center">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-xs text-amber-500 hover:text-amber-400 font-bold transition-colors cursor-pointer"
              >
                {isMarathi ? "आधीच खाते आहे? येथे लॉगिन करा" : "Already have an account? Login here"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
