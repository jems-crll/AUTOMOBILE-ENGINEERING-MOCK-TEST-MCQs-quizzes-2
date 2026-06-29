import React, { useState } from "react";
import * as Icons from "lucide-react";
import { User, StateLanguage, SubscriptionConfig } from "../types";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPaymentSuccess: (updatedUser: User) => void;
  selectedLanguage: StateLanguage;
  subscriptionConfig: SubscriptionConfig;
}

export default function RazorpayModal({
  isOpen,
  onClose,
  currentUser,
  onPaymentSuccess,
  selectedLanguage,
  subscriptionConfig,
}: RazorpayModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [txnError, setTxnError] = useState("");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const isMarathi = selectedLanguage.code === "mr";
  
  const currentAmount = Math.round(subscriptionConfig.amount * (1 - couponDiscount / 100));

  const isTestingEnv = typeof window !== "undefined" && (
    window.location.hostname.includes("localhost") || 
    window.location.hostname.includes("127.0.0.1") ||
    window.location.hostname.includes("run.app") || 
    window.location.hostname.includes("webcontainer") ||
    window.location.hostname.includes("github.dev")
  );

  const discountPercent = subscriptionConfig.originalAmount > 0 
    ? Math.round(((subscriptionConfig.originalAmount - currentAmount) / subscriptionConfig.originalAmount) * 100)
    : 0;

  if (!isOpen) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setCouponDiscount(data.discountPercent);
        setCouponMessage({
          text: isMarathi 
            ? `अभिनंदन! ${data.discountPercent}% सवलत लागू झाली.` 
            : `Success! ${data.discountPercent}% discount applied.`,
          type: "success"
        });
      } else {
        setCouponDiscount(0);
        setCouponMessage({
          text: isMarathi ? "अवैध कूपन कोड!" : "Invalid coupon code!",
          type: "error"
        });
      }
    } catch (err) {
      setCouponMessage({ text: "Error validating coupon", type: "error" });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleOpenPaymentLink = async () => {
    setIsProcessing(true);
    setTxnError("");
    try {
      const res = await fetch(`/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: currentAmount * 100, // Updated amount with coupon
          currency: "INR",
          notes: {
            email: currentUser.email,
            document_id: currentUser.email,
            coupon_applied: couponCode
          }
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate secure order ID");
      }

      const orderData = await res.json();
      console.log("Secure order created on backend:", orderData);

      // Check if Razorpay Checkout script is loaded
      if (typeof (window as any).Razorpay === "undefined") {
        console.warn("Razorpay script not loaded. Falling back to UPI landing page.");
        window.open("https://razorpay.me/@hinajavedsayyad", "_blank", "noopener,noreferrer");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Automobile Engg. Premium",
        description: "Bilingual Automobile Premium Pack",
        order_id: orderData.id,
        handler: async function (response: any) {
          console.log("Razorpay Checkout payment response:", response);
          setIsProcessing(true);
          
          try {
            const verifyRes = await fetch(`/api/razorpay/verify-signature`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: currentUser.email,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json();
              throw new Error(errData.error || "Payment signature verification failed");
            }

            setTxnId(response.razorpay_payment_id);
            setPaymentSuccess(true);

            const updatedUser: User = {
              ...currentUser,
              isPremium: true,
              subscriptionStatus: "active"
            };
            
            setTimeout(() => {
              onPaymentSuccess(updatedUser);
              onClose();
            }, 2000);

          } catch (verifyErr: any) {
            console.error("Verification failed:", verifyErr);
            setTxnError(verifyErr.message || "Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: currentUser.username || "",
          email: currentUser.email || ""
        },
        notes: {
          email: currentUser.email,
          document_id: currentUser.email
        },
        theme: {
          color: "#f59e0b"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        console.error("Razorpay Payment Failed:", resp?.error);
        setTxnError(isMarathi ? "पेमेंट अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा." : `Payment failed: ${resp?.error?.description || "Transaction was not completed."}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Error creating payment:", err);
      window.open("https://razorpay.me/@hinajavedsayyad", "_blank", "noopener,noreferrer");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in text-slate-100 overflow-y-auto max-h-[90vh] custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Icons.Crown className="h-5 w-5 text-amber-500 fill-amber-500/10" />
            <h3 className="font-extrabold text-white text-lg font-sans">
              {isMarathi ? "प्रीमियम पॅक अनलॉक करा" : "Unlock Premium Features"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <Icons.X className="h-5 w-5" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-4 animate-scale-up">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-3xl shadow-lg">
              <Icons.Check className="h-8 w-8 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-1">
                {isMarathi ? "पेमेंट यशस्वीरित्या सबमिट झाले!" : "Payment Verified Successfully!"}
              </h4>
              <p className="text-xs text-slate-400 px-4">
                {isMarathi 
                  ? "तुमचे प्रीमियम सबस्क्रिप्शन सुरू करण्यात आले आहे. सर्व प्रगत सराव संच, उत्तरे आणि स्पष्टीकरणे अनलॉक झाले आहेत!" 
                  : "Your Premium access is now fully active. All advanced sets, answers, and detailed explanations are unlocked!"}
              </p>
            </div>
            <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold flex flex-col gap-0.5">
              <span>{isMarathi ? "सक्रिय आयडी:" : "ACTIVATION ID:"}</span>
              <span className="text-white select-all">{txnId || "PROMO_OMTO"}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Package details */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                    {subscriptionConfig.billingPeriod.toUpperCase()} ACCESS
                  </span>
                  <h4 className="font-black text-slate-100 text-base mt-2 font-sans leading-tight">
                    {isMarathi ? subscriptionConfig.detailsMr : subscriptionConfig.detailsEn}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isMarathi 
                      ? "सर्व धड्यांचे सराव संच, उत्तरे, प्रगत मॉक टेस्ट आणि सविस्तर स्पष्टीकरणांसह" 
                      : "Full access to all chapters, practice sets, answers & detailed explanations"}
                  </p>
                </div>
                <div className="text-right">
                  {subscriptionConfig.originalAmount > subscriptionConfig.amount && (
                    <div className="text-xs text-slate-500 line-through">₹{subscriptionConfig.originalAmount}</div>
                  )}
                  <div className="text-xl font-black text-white">₹{currentAmount}</div>
                  {discountPercent > 0 && (
                    <div className="text-[10px] text-emerald-400 font-bold">{isMarathi ? `${discountPercent}% सूट` : `${discountPercent}% OFF`}</div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 overflow-hidden max-w-[200px]">
                  <Icons.User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded shrink-0">
                  ORDER_OMTO_8293
                </span>
              </div>
            </div>

            {isTestingEnv && (
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
                    <Icons.ShieldAlert className="h-4 w-4" />
                    <span>{isMarathi ? "चाचणी सिम्युलेटर" : "Reviewer Sandbox Mode"}</span>
                  </div>
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                  {isMarathi
                    ? "तुम्ही चाचणी पर्यावरणामध्ये आहात. लाइव्ह पेमेंट गेटवे बंद असल्यास किंवा अडचण आल्यास, खालील बटणावर क्लिक करून त्वरित प्रीमियम अनलॉक करू शकता."
                    : "You are in a preview/testing environment. If the live payment gateway has issues or is closed, click the button below to instantly unlock Premium Features."}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    setIsProcessing(true);
                    setTxnError("");
                    try {
                      const mockPaymentId = "pay_sim_" + Math.random().toString(36).substring(2, 10);
                      await fetch(`/api/razorpay/admin-verify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: currentUser.email,
                          paymentId: mockPaymentId
                        })
                      });

                      setTxnId(mockPaymentId);
                      setPaymentSuccess(true);

                      const updatedUser: User = {
                        ...currentUser,
                        isPremium: true,
                        subscriptionStatus: "active"
                      };
                      
                      setTimeout(() => {
                        onPaymentSuccess(updatedUser);
                        onClose();
                      }, 2000);
                    } catch (err: any) {
                      console.error("Simulation failed:", err);
                      setTxnError("Simulation failed: " + err.message);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  <Icons.Zap className="h-3.5 w-3.5 fill-current" />
                  <span>{isMarathi ? "इन्स्टंट प्रीमियम अनलॉक करा (चाचणी)" : "Simulate Instant Success (Demo)"}</span>
                </button>
              </div>
            )}

            {/* Coupon Code Section */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {isMarathi ? "कूपन कोड आहे का?" : "Have a Coupon Code?"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isMarathi ? "उदा. SAVE50" : "e.g. SAVE50"}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase().trim())}
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-amber-500 text-[10px] font-black rounded-xl border border-slate-700 transition cursor-pointer select-none"
                >
                  {isApplyingCoupon ? <Icons.Loader2 className="h-3 w-3 animate-spin" /> : (isMarathi ? "लागू करा" : "APPLY")}
                </button>
              </div>
              {couponMessage && (
                <p className={`text-[10px] font-bold flex items-center gap-1 ${couponMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {couponMessage.type === "success" ? <Icons.CheckCircle className="h-3 w-3" /> : <Icons.AlertCircle className="h-3 w-3" />}
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Instruction Banner */}
            <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <Icons.Zap className="h-4 w-4" />
                <span>{isMarathi ? "इन्स्टंट प्रीमियम अ‍ॅक्सेस" : "Instant Premium Access"}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isMarathi
                  ? `प्रीमियम फीचर्स वापरण्यासाठी खालील लिंकवर क्लिक करून ₹${currentAmount} पेमेंट पूर्ण करा. पेमेंट यशस्वी झाल्यावर तुमचे खाते लगेच प्रीमियम मध्ये अपग्रेड होईल.`
                  : `To unlock premium features, click the button below to complete your payment of ₹${currentAmount}. Your account will be instantly upgraded upon successful payment.`}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenPaymentLink}
                disabled={isProcessing}
                className={`w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 ${
                  isProcessing ? "animate-pulse" : ""
                }`}
              >
                {isProcessing ? (
                  <>
                    <Icons.Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">{isMarathi ? "पेमेंट सुरु आहे..." : "Processing Payment..."}</span>
                  </>
                ) : (
                  <>
                    <Icons.CreditCard className="h-5 w-5" />
                    <span className="text-sm">{isMarathi ? `₹${currentAmount} भरा आणि प्रीमियम सुरु करा` : `Pay ₹${currentAmount} & Unlock`}</span>
                  </>
                )}
              </button>
            </div>
            {txnError && (
              <p className="text-[10px] text-red-400 font-semibold text-center mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                {txnError}
              </p>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
