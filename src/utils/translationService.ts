import { Question } from "../types";

const CACHE_VERSION = "v2";
const CACHE_PREFIX = `trans_${CACHE_VERSION}_`;

export const translationService = {
  async translateQuestion(question: Question, targetLang: string): Promise<Question> {
    if (targetLang === "en") return question;

    // Check if translation already exists in the question object (Offline Support)
    if (question.question[targetLang] && question.options[targetLang] && question.explanation[targetLang]) {
      return question;
    }

    // Check cache for any previous AI translations (if any exist from before)
    const cacheKey = `${CACHE_PREFIX}${targetLang}_${question.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.question) {
          return {
            ...question,
            question: { ...question.question, [targetLang]: parsed.question },
            options: { ...question.options, [targetLang]: parsed.options },
            explanation: { ...question.explanation, [targetLang]: parsed.explanation },
          };
        }
      } catch (e) {
        console.error("Failed to parse cached translation", e);
      }
    }

    // AI translation is disabled as per user request for offline support
    // console.log("AI Translation disabled. Showing English fallback for question", question.id);
    return question;
  },

  async translateText(text: string, targetLang: string): Promise<string> {
    if (targetLang === "en") return text;

    // Local dictionary for common UI elements (Offline UI translation)
    const uiDictionary: Record<string, Record<string, string>> = {
      "mr": {
        "Score": "गुण",
        "Time Taken": "घेतलेला वेळ",
        "Correct": "बरोबर",
        "Incorrect": "चूक",
        "Result": "निकाल",
        "Explanation": "स्पष्टीकरण",
        "Next Question": "पुढील प्रश्न",
        "Finish Quiz": "चाचणी पूर्ण करा"
      }
    };

    if (uiDictionary[targetLang] && uiDictionary[targetLang][text]) {
      return uiDictionary[targetLang][text];
    }

    return text;
  }
};
