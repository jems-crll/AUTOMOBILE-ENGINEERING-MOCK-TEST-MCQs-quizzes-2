import React from "react";
import * as Icons from "lucide-react";

interface OfflineBannerProps {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  languageCode?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  pendingSyncCount,
  isSyncing,
  languageCode = "mr",
}) => {
  if (isOnline && !isSyncing && pendingSyncCount === 0) return null;

  const isMr = languageCode === "mr";
  const isHi = languageCode === "hi";

  if (!isOnline) {
    return (
      <div
        role="status"
        className="bg-slate-900 dark:bg-slate-800 border-b border-amber-500/30 text-amber-300 px-3 py-1.5 text-[11px] font-semibold flex items-center justify-center gap-2"
      >
        <Icons.WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="truncate">
          {isMr
            ? "ऑफलाइन मोड सुरू — सर्व टेस्ट चालतील, इंटरनेट आल्यावर रिझल्ट सेव्ह होईल."
            : isHi
            ? "ऑफलाइन मोड सक्रिय — सभी टेस्ट चलेंगे, इंटरनेट आने पर स्कोर सिंक होगा।"
            : "Offline mode active — tests work offline and results will sync automatically."}
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="bg-emerald-950/90 border-b border-emerald-500/30 text-emerald-300 px-3 py-1.5 text-[11px] font-semibold flex items-center justify-center gap-2"
    >
      <Icons.RefreshCw className={`h-3.5 w-3.5 text-emerald-400 shrink-0 ${isSyncing ? "animate-spin" : ""}`} />
      <span className="truncate">
        {isMr
          ? `ऑफलाइन दिलेले ${pendingSyncCount} रिझल्ट सर्व्हरवर सिंक होत आहेत...`
          : isHi
          ? `ऑफलाइन दिए गए ${pendingSyncCount} परिणाम सिंक हो रहे हैं...`
          : `Syncing ${pendingSyncCount} offline test result(s)...`}
      </span>
    </div>
  );
};

export default OfflineBanner;
