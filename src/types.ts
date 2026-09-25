export interface User {
  email: string;
  isPremium: boolean;
  username?: string;
  role?: "student" | "admin";
  subscriptionStatus?: "active" | "inactive";
  sessionToken?: string;
}

export interface Question {
  id: number;
  chapterId: number | string;
  question: Record<string, string>;
  options: Record<string, string[]>;
  answer: string;           
  explanation: Record<string, string>;
  imageSvg?: string;        
}

export interface StateLanguage {
  code: string;
  name: string;
  nativeName: string;
  state: string;
}

export const STATE_LANGUAGES: StateLanguage[] = [
  { code: "mr", name: "Marathi", nativeName: "मराठी", state: "Maharashtra" },
  { code: "en", name: "English", nativeName: "English", state: "All India" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", state: "North & Central India" },
];

export interface Chapter {
  id: number;
  name: string;
  nameMarathi: string;
  nameTranslated?: string; // Translated chapter name
  description: string;
  descriptionMarathi: string;
  descriptionTranslated?: string; // Translated chapter description
  icon: string; // lucide icon name
  section?: string; // Section name (e.g., "Section 1")
}

export interface QuizAttempt {
  id: string;
  chapterId: number | "all"; // "all" for custom multi-chapter test
  chapterName: string;
  score: number;
  totalQuestions: number;
  date: string;
  timeSpentSeconds: number;
  answers: Record<number, string>; // questionId -> selectedOption
  setId?: number | "all";
}

export interface ChapterStats {
  chapterId: number;
  completedTests: number;
  averageScore: number;
  highestScore: number;
}

export interface SubscriptionConfig {
  amount: number;
  originalAmount: number;
  billingPeriod: string;
  detailsEn: string;
  detailsMr: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
}
