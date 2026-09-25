import { Question } from "../types";

const TECHNICAL_DICTIONARY: Record<string, Record<string, string>> = {
  hi: {
    "Resistance": "प्रतिरोध",
    "Current": "विद्युत धारा",
    "Voltage": "वोल्टेज",
    "Battery": "बैटरी",
    "Engine": "इंजन",
    "Spark Plug": "स्पार्क प्लग",
    "Gearbox": "गियरबॉक्स",
    "Brake": "ब्रेक",
    "Alternator": "अल्टरनेटर",
    "Transformer": "ट्रांसफॉर्मर",
    "Motor": "मोटर",
    "Generator": "जनरेटर",
    "Switch": "स्विच",
    "Fuse": "फ्यूज",
    "Wire": "तार",
    "Cable": "केबल",
    "Clutch": "क्लच",
    "Steering": "स्टीयरिंग",
    "Suspension": "सस्पेंशन",
    "Radiator": "रेडिएटर",
    "Piston": "पिस्टन",
    "Cylinder": "सिलेंडर",
    "Crankshaft": "क्रैंकशाफ्ट",
    "Camshaft": "कॅमशाफ्ट",
    "Valve": "वाल्व",
    "Carburetor": "कार्बोरेटर",
    "Fuel": "ईंधन",
    "Oil": "तेल",
    "Coolant": "कुलेंट",
    "Power": "शक्ति",
    "Energy": "ऊर्जा",
    "Circuit": "सर्किट",
    "Magnetic": "चुंबकीय",
    "Inductance": "प्रेरकता",
    "Capacitance": "धारिता"
  }
};

export const translationService = {
  async translateQuestion(question: Question, targetLang: string, langName?: string): Promise<Question> {
    if (targetLang === "en") return question;

    if (question.question[targetLang] && question.options[targetLang] && question.explanation[targetLang]) {
      return question;
    }

    const baseText = question.question["mr"] || question.question["en"] || Object.values(question.question)[0] || "";
    const baseOptions = question.options["mr"] || question.options["en"] || Object.values(question.options)[0] || [];
    const baseExplanation = question.explanation["mr"] || question.explanation["en"] || Object.values(question.explanation)[0] || "";

    const dict = TECHNICAL_DICTIONARY[targetLang] || {};
    
    let translatedQ = baseText;
    Object.keys(dict).forEach(engTerm => {
      const targetTerm = dict[engTerm];
      const regex = new RegExp(engTerm, "gi");
      translatedQ = translatedQ.replace(regex, targetTerm);
    });

    const translatedOptions = baseOptions.map((opt: string) => {
      let tOpt = opt;
      Object.keys(dict).forEach(engTerm => {
        const targetTerm = dict[engTerm];
        const regex = new RegExp(engTerm, "gi");
        tOpt = tOpt.replace(regex, targetTerm);
      });
      return tOpt;
    });

    const translatedExp = baseExplanation ? (() => {
      let tExp = baseExplanation;
      Object.keys(dict).forEach(engTerm => {
        const targetTerm = dict[engTerm];
        const regex = new RegExp(engTerm, "gi");
        tExp = tExp.replace(regex, targetTerm);
      });
      return tExp;
    })() : "";

    const result = {
      ...question,
      question: { ...question.question, [targetLang]: translatedQ },
      options: { ...question.options, [targetLang]: translatedOptions },
      explanation: { ...question.explanation, [targetLang]: translatedExp },
    };

    return result;
  },

  async translateText(text: string, targetLang: string): Promise<string> {
    if (targetLang === "en") return text;

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
      },
      "hi": {
        "Score": "स्कोर",
        "Time Taken": "लिया गया समय",
        "Correct": "सही",
        "Incorrect": "गलत",
        "Result": "परिणाम",
        "Explanation": "स्पष्टीकरण",
        "Next Question": "अगला प्रश्न",
        "Finish Quiz": "क्विज़ समाप्त करें"
      }
    };

    if (uiDictionary[targetLang] && uiDictionary[targetLang][text]) {
      return uiDictionary[targetLang][text];
    }

    return text;
  }
};
