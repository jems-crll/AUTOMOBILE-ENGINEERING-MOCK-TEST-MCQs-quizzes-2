import { Question } from "../types";

export const CONTROL_PANEL_WIRING_QUESTIONS: Question[] = [
  {
    id: 8001,
    chapterId: 80,
    question: "Which supply indicates by the colour of conductor exhibited on Red, Blue and Black?",
    questionMarathi: "लाल, निळा आणि काळ्या रंगावर प्रदर्शन कँडक्टरचा रंग कोणता सप्लाय दर्शवतात?",
    options: ["Supply DC 3 wire system", "Single phase AC system", "Supply AC system 3 phase", "Apparatus AC system 3 phase"],
    optionsMarathi: ["3 वायर सिस्टिम डी सी सप्लाय", "सिंगल फेज एसी सिस्टिम", "थ्री फेज एसी सिस्टिम", "अपारेटस थ्री फेज एसी सिस्टिम"],
    answer: "A",
    explanation: "Supply DC 3 wire system.",
    explanationMarathi: "3 वायर सिस्टिम डी सी सप्लाय."
  },
  {
    id: 8002,
    chapterId: 80,
    question: "What is the name of the wiring accessory used in control panel wiring as shown in the figure?",
    questionMarathi: "आकृतीत दाखवल्याप्रमाणे कंट्रोल पॅनल वायरिंगमध्ये वापरल्या जाणाऱ्या वायरिंग ॲक्सेसरीजचे नाव काय आहे?",
    options: ["DIN rails", "G channel", "Grommets", "Race ways"],
    optionsMarathi: ["DIN रेल्स", "G चॅनेल", "ग्रोमेट", "रेस वेज"],
    answer: "A",
    explanation: "DIN rails.",
    explanationMarathi: "DIN रेल्स."
  },
  {
    id: 8003,
    chapterId: 80,
    question: "What is the name of the control circuit as shown in the figure?",
    questionMarathi: "आकृतीत दाखवल्याप्रमाणे कंट्रोल सर्किटचे नाव काय आहे?",
    options: ["Remote control circuit", "Jog control using a relay", "Inching control circuit with push motor", "Jogging control circuit with selector switch"],
    optionsMarathi: ["रिमोट कंट्रोल सर्किट", "रिले वापरून जोग कंट्रोल", "पुश मोटरसह इंचिंग कंट्रोल सर्किट", "निवडक स्विचसह जॉगिंग कंट्रोल सर्किट"],
    answer: "D",
    explanation: "Jogging control circuit with selector switch.",
    explanationMarathi: "निवडक स्विचसह जॉगिंग कंट्रोल सर्किट."
  },
  {
    id: 8004,
    chapterId: 80,
    question: "How to prevent the entry of the insects and rats into the control panel?",
    questionMarathi: "नियंत्रण पॅनेलमध्ये कीटक आणि उंदरांचा प्रवेश कसा रोखायचा?",
    options: ["By using sleeve", "By using Grommets", "By using cable binding straps", "Mounting the control accessories without screws"],
    optionsMarathi: ["स्लीव्हजचा वापर करून", "ग्रोमेटचा वापर करून", "केबल बाइंडिंग स्ट्रॅप्सचा वापर करून", "स्क्रूशिवाय कंट्रोल ॲक्सेसरीज माउंट करणे"],
    answer: "B",
    explanation: "By using Grommets.",
    explanationMarathi: "ग्रोमेटचा वापर करून."
  },
  {
    id: 8005,
    chapterId: 80,
    question: "Which circuit breaker is installed along with wiring circuit against leakage current protection?",
    questionMarathi: "लीकेज करंट प्रोटेक्शन साठी वायरिंग सर्किट सोबत कोणता सर्किट ब्रेकर स्थापित केला आहे?",
    options: ["OCB", "MCB", "ELCB", "MCCB"],
    optionsMarathi: ["OCB", "MCB", "ELCB", "MCCB"],
    answer: "C",
    explanation: "ELCB.",
    explanationMarathi: "ELCB."
  },
  {
    id: 8006,
    chapterId: 80,
    question: "What is the use of PVC channel in a control panel wiring?",
    questionMarathi: "कंट्रोल पॅनल वायरिंग मध्ये PVC चॅनेलचा उपयोग काय?",
    options: ["Mounting MCB", "Mounting relays", "Path way for electrical wiring and protection", "Mounting double deck terminal contactor"],
    optionsMarathi: ["माउंटिंग MCB", "माउंटिंग रिले", "इलेक्ट्रीकल वायरिंगच्या मार्गासाठी व संरक्षणासाठी", "माउंटींग डबल डेक टर्मिनल कॉन्टॅक्टर"],
    answer: "C",
    explanation: "Path way for electrical wiring and protection.",
    explanationMarathi: "इलेक्ट्रीकल वायरिंगच्या मार्गासाठी व संरक्षणासाठी."
  },
  {
    id: 8007,
    chapterId: 80,
    question: "What is the name of the contactor marked as 'x' in the star delta starter as shown in the figure?",
    questionMarathi: "आकृतीमध्ये दर्शविल्याप्रमाणे स्टार डेल्टा स्टार्टरमध्ये 'x' म्हणून चिन्हांकित केलेल्या संपर्ककर्त्याचे नाव काय आहे?",
    options: ["Main contactor", "Star contactor", "Delta contactor", "Timer"],
    optionsMarathi: ["मुख्य कॉन्टॅक्टर", "स्टार कॉन्टॅक्टर", "डेल्टा कॉन्टॅक्टर", "टायमर"],
    answer: "B",
    explanation: "Star contactor.",
    explanationMarathi: "स्टार कॉन्टॅक्टर."
  },
  {
    id: 8008,
    chapterId: 80,
    question: "What is the pick-up voltage in a over voltage relay indicated?",
    questionMarathi: "ओव्हर व्होल्टेज रिले मधील पिक अप व्होल्टेज काय सूचित करतो?",
    options: ["Working voltage of relay", "Maximum voltage rating of relay", "Minimum voltage rating of relay", "Minimum voltage to start the relay"],
    optionsMarathi: ["रिले चे वर्किंग व्होल्टेज", "रिले चे जास्तीत जास्त व्होल्टेज रेटिंग", "रिले चे कमीत कमी व्होल्टेज रेटिंग", "रिले चालू होण्याचे कमीत कमी व्होल्टेज"],
    answer: "D",
    explanation: "Minimum voltage to start the relay.",
    explanationMarathi: "रिले चालू होण्याचे कमीत कमी व्होल्टेज."
  },
  {
    id: 8009,
    chapterId: 80,
    question: "What is the effect, if the test button marked as 'X' is closed permanently in ELCB as shown in the figure?",
    questionMarathi: "आकृतीत दर्शविल्याप्रमाणे ELCB मध्ये 'X' म्हणून चिन्हांकित केलेले चाचणी बटण कायमचे बंद झाल्यास काय परिणाम होईल?",
    options: ["Incorrect setting of relay", "Excessive heat", "Insufficient air pressure", "Higher setting of relay"],
    optionsMarathi: ["रिले चे सेटिंग चुकीचे असेल", "जास्त उष्णता", "हवेचा दाब अपुरा असेल", "रिलेची उच्च सेटिंग"],
    answer: "A",
    explanation: "Incorrect setting of relay.",
    explanationMarathi: "रिले चे सेटिंग चुकीचे असेल."
  },
  {
    id: 8010,
    chapterId: 80,
    question: "What is the name of accessory used in control panel wiring as shown in the figure?",
    questionMarathi: "आकृतीत दाखवल्याप्रमाणे कंट्रोल पॅनल वायरिंगमध्ये वापरल्या जाणाऱ्या ॲक्सेसरीजचे नाव काय आहे?",
    options: ["Lugs", "Thimble", "Grommet", "Terminal connector"],
    optionsMarathi: ["लग्स", "थिम्बल", "ग्रोमेट", "टर्मिनल कनेक्टर"],
    answer: "C",
    explanation: "Grommet.",
    explanationMarathi: "ग्रोमेट."
  },
  {
    id: 8011,
    chapterId: 80,
    question: "Which is the essential feature to be considered while designing a layout of control panel?",
    questionMarathi: "कंट्रोल पॅनलचे लेआउट तयार करताना कोणती आवश्यक वैशिष्ट्य लक्षात घेतले पाहिजे?",
    options: ["Weight of the control panel", "Cost of the control panel", "Suitable method of labelling and cable harnessing", "Outside dimensions and swing area of cabinet door"],
    optionsMarathi: ["नियंत्रण पॅनेलचे वजन", "नियंत्रण पॅनेलची किंमत", "लेबलिंग व केबल हार्नेस ची पद्धत", "कॅबिनेट डोअर ची मापे आणि स्विंग एरिया"],
    answer: "D",
    explanation: "Outside dimensions and swing area of cabinet door.",
    explanationMarathi: "कॅबिनेट डोअर ची मापे आणि स्विंग एरिया."
  },
  {
    id: 8012,
    chapterId: 80,
    question: "Which switch is operated at OFF load condition?",
    questionMarathi: "OFF लोड स्थितीत कोणता स्विच कार्य करतो?",
    options: ["Limit switch", "Isolating switch", "Two way switch", "Push button switch"],
    optionsMarathi: ["लिमिट स्विच", "आयसोलेटिंग स्विच", "टू वे स्विच", "पुश बटन स्विच"],
    answer: "B",
    explanation: "Isolating switch.",
    explanationMarathi: "आयसोलेटिंग स्विच."
  },
  {
    id: 8013,
    chapterId: 80,
    question: "Which type of relay is used in both A.C and D.C supply?",
    questionMarathi: "A.C आणि D.C या दोन्ही पुरवठ्यामध्ये कोणता रिले वापरला जातो?",
    options: ["Reed relay", "Impulse relay", "Thermal relay", "Clapper-type armature relay"],
    optionsMarathi: ["रीड रिले", "इम्पल्स रिले", "थर्मल रिले", "क्लॅपर टाईप आर्मेचर रिले"],
    answer: "B",
    explanation: "Impulse relay.",
    explanationMarathi: "इम्पल्स रिले."
  },
  {
    id: 8014,
    chapterId: 80,
    question: "What is the purpose of external source for passive sensors?",
    questionMarathi: "पॅसिव्ह सेन्सर्ससाठी एक्सटर्नल सोर्सचा उद्देश काय आहे?",
    options: ["To generate pressure", "To generate heat", "To generate light", "To generate signal"],
    optionsMarathi: ["प्रेशर निर्माण करण्यासाठी", "उष्णता निर्माण करण्यासाठी", "प्रकाश निर्माण करण्यासाठी", "सिग्नल निर्माण करण्यासाठी"],
    answer: "D",
    explanation: "To generate signal.",
    explanationMarathi: "सिग्नल निर्माण करण्यासाठी."
  },
  {
    id: 8015,
    chapterId: 80,
    question: "Which accessory prevents the flare out of stripped stranded cables in the panel board wiring?",
    questionMarathi: "पॅनेल बोर्डच्या वायरिंगमध्ये उघडलेल्या तारांमध्ये ज्वलंत होण्यास कोणता ॲक्सेसरी प्रतिबंधित करते?",
    options: ["Sleeves", "Wire ferrules", "Lugs and Thimbles", "Cable binding straps and button"],
    optionsMarathi: ["स्लीव्हज", "वायर फेरुलस", "लग्ज आणि थिम्बल्स", "केबल बाइंडिंग स्ट्रॅप्स आणि बटण"],
    answer: "C",
    explanation: "Lugs and Thimbles.",
    explanationMarathi: "लग्ज आणि थिम्बल्स."
  },
  {
    id: 8016,
    chapterId: 80,
    question: "Which type of load is protected by 'G' series MCB?",
    questionMarathi: "'G' series MCBचा वापर करून कोणत्या टाईप चे लोड संरक्षित केले जातात?",
    options: ["Ovens", "Geysers", "Air conditioners", "General lighting systems"],
    optionsMarathi: ["ओव्हन", "गीझर", "एअर कंडिशनर्स", "लायटिंग सिस्टीम"],
    answer: "C",
    explanation: "Air conditioners.",
    explanationMarathi: "एअर कंडिशनर्स."
  }
];
