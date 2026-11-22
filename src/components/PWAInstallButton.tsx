import React, { useState } from "react";
import * as Icons from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallButtonProps {
  languageCode?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ languageCode = "mr" }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  const isMr = languageCode === "mr";
  const isHi = languageCode === "hi";

  const installLabel = isMr ? "अ‍ॅप इन्स्टॉल करा" : isHi ? "ऐप इंस्टॉल करें" : "Install App";

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-2.5 sm:px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 text-[11px] sm:text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-sm active:scale-95"
        title={installLabel}
      >
        <Icons.Download className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">{installLabel}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-2.5 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
        >
          <Icons.Smartphone className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span className="hidden sm:inline">{installLabel}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isMr
                    ? "iPhone / iPad वर इन्स्टॉल करा"
                    : isHi
                    ? "iPhone / iPad पर इंस्टॉल करें"
                    : "Install on iPhone / iPad"}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Close"
                >
                  <Icons.X className="h-4 w-4" />
                </button>
              </div>
              <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>
                  1.{" "}
                  {isMr
                    ? "Safari मध्ये खालील Share बटणावर टॅप करा."
                    : isHi
                    ? "Safari में नीचे Share बटन पर टैप करें।"
                    : "Tap the Share button in Safari's toolbar."}
                </li>
                <li>
                  2.{" "}
                  {isMr
                    ? "खाली स्क्रोल करून 'Add to Home Screen' निवडा."
                    : isHi
                    ? "नीचे स्क्रॉल करके 'Add to Home Screen' चुनें।"
                    : "Scroll down and tap 'Add to Home Screen'."}
                </li>
                <li>
                  3.{" "}
                  {isMr
                    ? "वरच्या कोपऱ्यातील 'Add' वर टॅप करा — अ‍ॅप ऑफलाइन देखील चालेल!"
                    : isHi
                    ? "ऊपर 'Add' पर टैप करें — ऐप ऑफलाइन भी चलेगा!"
                    : "Tap 'Add' — the app works offline right from your home screen."}
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer"
              >
                {isMr ? "समजले" : isHi ? "समझ गया" : "Got it"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export default PWAInstallButton;
