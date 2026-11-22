import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Icons from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
  languageCode?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  declare state: ErrorBoundaryState;
  declare setState: (
    state: Partial<ErrorBoundaryState> | ((prev: ErrorBoundaryState) => Partial<ErrorBoundaryState>)
  ) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || "Unexpected application error",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught rendering error:", error, errorInfo);
  }

  handleRecover = () => {
    try {
      localStorage.removeItem("omto_active_quiz_state");
    } catch (_) {}
    this.setState({ hasError: false, errorMessage: "" });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleHardReload = () => {
    try {
      localStorage.removeItem("omto_active_quiz_state");
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isMr = this.props.languageCode === "mr";
      const isHi = this.props.languageCode === "hi";

      return (
        <div className="min-h-[380px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <Icons.ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isMr
                  ? "तांत्रिक अडचण आली होती"
                  : isHi
                  ? "तकनीकी समस्या आई थी"
                  : "Something went wrong"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isMr
                  ? "स्क्रीन बंद पडू नये म्हणून सुरक्षित मोड सुरू केला आहे. कृपया डॅशबोर्डवर परत जा किंवा पेज रीलोड करा."
                  : isHi
                  ? "ऐप हैंग न हो इसके लिए सेफ्टी रिकवरी सक्रिय की गई है। कृपया डैशबोर्ड पर वापस जाएं।"
                  : "Safe recovery mode prevented a blank screen. Return to dashboard or reload to continue."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleRecover}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Icons.Home className="w-4 h-4" />
                <span>
                  {isMr ? "डॅशबोर्डवर जा" : isHi ? "डैशबोर्ड पर जाएं" : "Go to Dashboard"}
                </span>
              </button>
              <button
                onClick={this.handleHardReload}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Icons.RefreshCw className="w-4 h-4" />
                <span>
                  {isMr ? "रीलोड करा" : isHi ? "रीलोड करें" : "Reload App"}
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
