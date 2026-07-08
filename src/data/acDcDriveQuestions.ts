import { Question } from "../types";

export const AC_DC_DRIVE_QUESTIONS: Question[] = [
  {
    id: 9001,
    chapterId: 90,
    question: "What is the full form of 'VFD'?",
    questionMarathi: "VFD चे पूर्ण नाव काय आहे?",
    options: ["Variable Frequency Drive", "Value Fixed Drive", "Volume Frequency Drive", "Voltage Frequency Drive"],
    optionsMarathi: ["Variable Frequency Drive", "Value Fixed Drive", "Volume Frequency Drive", "Voltage Frequency Drive"],
    answer: "A",
    explanation: "Variable Frequency Drive.",
    explanationMarathi: "Variable Frequency Drive."
  },
  {
    id: 9002,
    chapterId: 90,
    question: "What is the advantage of AC drive compared to DC drive?",
    questionMarathi: "DC ड्राईव्हच्या तुलनेत AC ड्राईव्हचे फायदे कोणते?",
    options: ["Requires more space", "Installation and running cost is less", "Wide and smooth speed control", "Power circuit and control circuits are complex"],
    optionsMarathi: ["अधिक जागा आवश्यक आहे", "इन्स्टॉलेशन आणि रनिंग ची किंमत कमी असते", "रुंद आणि गुळगुळीत गती नियंत्रण", "पॉवर सर्किट आणि कंट्रोल सर्किट जटिल आहेत"],
    answer: "B",
    explanation: "Installation and running cost is less.",
    explanationMarathi: "इन्स्टॉलेशन आणि रनिंग ची किंमत कमी असते."
  },
  {
    id: 9003,
    chapterId: 90,
    question: "What is the name of the component marked as 'X' in the block diagram of AC drive as shown in the figure?",
    questionMarathi: "आकृतीत दाखवल्याप्रमाणे AC ड्राईव्हच्या ब्लॉक डायग्राममध्ये 'X' म्हणून चिन्हांकित केलेल्या घटकाचे नाव काय आहे?",
    options: ["Rectifier", "D.C bus", "Inverter", "A.C motor"],
    optionsMarathi: ["रेक्टिफायर", "D.C बस", "इन्व्हर्टर", "A.C मोटर"],
    answer: "B",
    explanation: "D.C bus.",
    explanationMarathi: "D.C बस."
  },
  {
    id: 9004,
    chapterId: 90,
    question: "What is the main use of A.C drive?",
    questionMarathi: "A.C ड्राईव्हचा मुख्य उपयोग काय आहे?",
    options: ["High starting torque", "Group drive motors", "Control stepless speed in motors", "Interlocking system in industries"],
    optionsMarathi: ["स्टार्टींग टॉर्क उच्च असतो", "ग्रुप ड्राईव्ह मोटर्स", "मोटरचा वेग स्टेप विना नियंत्रित करता येतो", "उद्योगामध्ये इंटरलॉकिंग सिस्टम"],
    answer: "C",
    explanation: "Control stepless speed in motors.",
    explanationMarathi: "मोटरचा वेग स्टेप विना नियंत्रित करता येतो."
  },
  {
    id: 9005,
    chapterId: 90,
    question: "Which is the correct sequence operation of key button in BOP of AC drive to change the direction of rotation?",
    questionMarathi: "AC ड्राईव्ह मध्ये फिरण्याची दिशा बदलण्यासाठी BOP मधील बटणच्या ऑपरेशनचा योग्य क्रम कोणता?",
    options: ["Press ON -> REV -> ON", "Press OFF -> ON -> REV", "Press ON -> OFF -> REV -> ON", "Press ON -> REV -> OFF -> ON"],
    optionsMarathi: ["Press ON -> REV -> ON", "Press OFF -> ON -> REV", "Press ON -> OFF -> REV -> ON", "Press ON -> REV -> OFF -> ON"],
    answer: "C",
    explanation: "Press ON -> OFF -> REV -> ON.",
    explanationMarathi: "Press ON -> OFF -> REV -> ON."
  },
  {
    id: 9006,
    chapterId: 90,
    question: "Which type of machine in industries is provided with multi motor electric drive?",
    questionMarathi: "उद्योगांमध्ये कोणत्या प्रकारचे मशीन मल्टी मोटर इलेक्ट्रिक ड्राईव्हसह प्रदान केले जाते?",
    options: ["Rolling machine", "Air Compressor", "Shearing machine", "Heavy duty electric drilling machine"],
    optionsMarathi: ["रोलिंग मशीन", "एअर कॉम्प्रेसर", "कातरणे (शेअरिंग) मशीन", "हेवी ड्युटी इलेक्ट्रिक ड्रिल मशीन"],
    answer: "A",
    explanation: "Rolling machine.",
    explanationMarathi: "रोलिंग मशीन."
  },
  {
    id: 9007,
    chapterId: 90,
    question: "What is the name of the characteristic curve in D.C drive as shown in the figure?",
    questionMarathi: "आकृतीत दाखवल्याप्रमाणे D.C ड्राईव्हमधील वैशिष्ट्यपूर्ण वक्राचे नाव काय आहे?",
    options: ["Speed Vs torque characteristic", "Torque Vs field current characteristic", "Speed Vs armature current characteristic", "Field current Vs armature current characteristic"],
    optionsMarathi: ["स्पीड व टॉर्क गुणधर्म", "टॉर्क व फील्ड करंट गुणधर्म", "स्पीड व आर्मेचर करंट गुणधर्म", "फील्ड करंट व आर्मेचर करंट गुणधर्म"],
    answer: "A",
    explanation: "Speed Vs torque characteristic.",
    explanationMarathi: "स्पीड व टॉर्क गुणधर्म."
  },
  {
    id: 9008,
    chapterId: 90,
    question: "Why it is necessary to keep V/F ratio constant in a drive?",
    questionMarathi: "ड्राईव्ह मध्ये V/F गुणोत्तर स्थिर ठेवणे गरजेचे का असते?",
    options: ["Keep the stator flux maximum", "Maintain the rotor current constant", "Maintain the speed of motor constant", "Maintain the rated torque at all speeds"],
    optionsMarathi: ["स्टेटर फ्लक्स जास्तीत जास्त ठेवा", "रोटर करंट कमीत कमी ठेवण्यासाठी", "मोटरचा वेग स्थिर ठेवण्यासाठी", "रेटेड टॉर्क सर्व वेगासाठी स्थिर ठेवण्यासाठी"],
    answer: "D",
    explanation: "Maintain the rated torque at all speeds.",
    explanationMarathi: "रेटेड टॉर्क सर्व वेगासाठी स्थिर ठेवण्यासाठी."
  },
  {
    id: 9009,
    chapterId: 90,
    question: "Which is proportional to the torque in D.C motor?",
    questionMarathi: "D.C मोटरमधील टॉर्कच्या प्रमाणात कोणता आहे?",
    options: ["Back e.m.f", "Field current", "Terminal voltage", "Armature current"],
    optionsMarathi: ["बॅक इ एम एफ", "फील्ड करंट", "टर्मिनल व्होल्टेज", "आर्मेचर करंट"],
    answer: "D",
    explanation: "Armature current.",
    explanationMarathi: "आर्मेचर करंट."
  },
  {
    id: 9010,
    chapterId: 90,
    question: "Which power modulator used in the electric drive system?",
    questionMarathi: "इलेक्ट्रिक ड्राईव्ह सिस्टममध्ये कोणते पॉवर मॉड्युलेटर वापरले जाते?",
    options: ["Cyclo converters", "Frequency multiplier", "Phase sequence indicator", "Servo controlled voltage stabilizer"],
    optionsMarathi: ["सायक्लो कन्व्हर्टर", "फ्रिक्वेन्सी मल्टिप्लायर", "फेज सिक्वेन्स इंडिकेटर", "सर्वो कंट्रोल व्होल्टेज स्टॅबिलायझर"],
    answer: "A",
    explanation: "Cyclo converters.",
    explanationMarathi: "सायक्लो कन्व्हर्टर."
  },
  {
    id: 9011,
    chapterId: 90,
    question: "Which drive is classified according to mode of operation?",
    questionMarathi: "ऑपरेशन मोडनुसार कोणत्या ड्राईव्हचे वर्गीकरण केले जाते?",
    options: ["Group drive", "Manual drive", "Individual drive", "Continuous duty drive"],
    optionsMarathi: ["ग्रुप ड्राईव्ह", "मॅन्युअल ड्राईव्ह", "इंडिव्हिज्युअल ड्राईव्ह", "कन्टिन्युअस ड्युटी ड्राईव्ह"],
    answer: "D",
    explanation: "Continuous duty drive.",
    explanationMarathi: "कन्टिन्युअस ड्युटी ड्राईव्ह."
  },
  {
    id: 9012,
    chapterId: 90,
    question: "What is the full form of B.O.P in D.C drive?",
    questionMarathi: "D.C ड्राईव्ह मध्ये B.O.P चा फुल फॉर्म काय?",
    options: ["Bridge Operational Panel", "Basic Operational Panel", "Basic Operation Programme", "Bridge Operation Programme"],
    optionsMarathi: ["Bridge Operational Panel", "Basic Operational Panel", "Basic Operation Programme", "Bridge Operation Programme"],
    answer: "B",
    explanation: "Basic Operational Panel.",
    explanationMarathi: "Basic Operational Panel."
  },
  {
    id: 9013,
    chapterId: 90,
    question: "How the constant torque–variable HP operation can be obtained from the DC drives?",
    questionMarathi: "सतत टॉर्क-व्हेरिएबल एचपी ऑपरेशन डीसी ड्राईव्हमधून कसे मिळवता येते?",
    options: ["By reducing the field current", "By increasing the field current", "By increasing the field resistance", "By controlling the armature voltage"],
    optionsMarathi: ["फील्ड करंट कमी करून", "फील्ड करंट वाढवून", "फील्ड रेझिस्टन्स वाढवून", "आर्मेचर व्होल्टेज नियंत्रित करून"],
    answer: "D",
    explanation: "By controlling the armature voltage.",
    explanationMarathi: "आर्मेचर व्होल्टेज नियंत्रित करून."
  },
  {
    id: 9014,
    chapterId: 90,
    question: "What is the purpose of LCD on basic operator panel in D.C drive or A.C drive?",
    questionMarathi: "D.C ड्राईव्ह किंवा A.C ड्राईव्ह मधील बेसिक ऑपरेटर पॅनलवरील LCD चा उद्देश काय आहे?",
    options: ["Calculate the speed", "Measure the speed", "Monitor the parameter", "Detect the load current"],
    optionsMarathi: ["गतीची गणना करा", "वेग मोजा", "सर्व पॅरामीटर वर देखरेख ठेवण्यासाठी", "लोड वर्तमान शोधा"],
    answer: "C",
    explanation: "Monitor the parameter.",
    explanationMarathi: "सर्व पॅरामीटर वर देखरेख ठेवण्यासाठी."
  },
  {
    id: 9015,
    chapterId: 90,
    question: "Which control system consumes very low power for motion control in AC and DC motors?",
    questionMarathi: "AC आणि DC मोटर च्या मोशन कंट्रोल मध्ये अतिशय कमी पॉवर खर्च करणारी कंट्रोल सिस्टीम कोणती?",
    options: ["Field control", "Drives control", "Voltage control", "Armature control"],
    optionsMarathi: ["फील्ड कंट्रोल", "ड्राईव्हज कंट्रोल", "व्होल्टेज कंट्रोल", "आर्मेचर कंट्रोल"],
    answer: "B",
    explanation: "Drives control.",
    explanationMarathi: "ड्राईव्हज कंट्रोल."
  },
  {
    id: 9016,
    chapterId: 90,
    question: "What is the reason of using shielded cable for connecting low signal circuits in D.C drives?",
    questionMarathi: "D.C ड्राईव्हमध्ये लो सिग्नल सर्किट्स जोडण्यासाठी शिल्डेड केबल वापरण्याचे कारण काय आहे?",
    options: ["Easy for connection", "Good appearance", "Protects from mechanical injuries", "Eliminates the electrical interference"],
    optionsMarathi: ["कनेक्शनसाठी सोपे", "चांगले दिसावे म्हणून", "यांत्रिक दुखापतीपासून संरक्षण करण्यासाठी", "विद्युत अडथळा दूर करण्यासाठी"],
    answer: "D",
    explanation: "Eliminates the electrical interference.",
    explanationMarathi: "विद्युत अडथळा दूर करण्यासाठी."
  },
  {
    id: 9017,
    chapterId: 90,
    question: "Which sensor is used for speed sensing in a digital drive?",
    questionMarathi: "डिजिटल ड्राईव्हमध्ये स्पीड सेन्सिंगसाठी कोणता सेन्सर वापरला जातो?",
    options: ["Opto coupler", "Speed sensing", "Photo voltaic cell", "Resistance temperature detector"],
    optionsMarathi: ["ऑप्टो कप्लर", "स्पीड सेन्सिंग", "फोटो व्होल्टेक सेल", "रेझिस्टन्स टेम्परेचर डिटेक्टवर"],
    answer: "B",
    explanation: "Speed sensing.",
    explanationMarathi: "स्पीड सेन्सिंग."
  },
  {
    id: 9018,
    chapterId: 90,
    question: "What is the function of the Field Supply Unit (FSU) in DC drive?",
    questionMarathi: "DC ड्राईव्हमध्ये फील्ड सप्लाय युनिट (FSU) चे कार्य काय आहे?",
    options: ["Produces required firing current", "Provides variable voltage to field winding", "Provides variable voltage to armature winding", "Provides constant voltage to armature"],
    optionsMarathi: ["फायरिंग सर्किटला आवश्यक फायरिंग करंट तयार करते", "मोटरच्या फील्ड वाइंडिंगला व्हेरिएबल व्होल्टेज प्रदान करते", "मोटरच्या आर्मेचर वाइंडिंगला व्हेरिएबल व्होल्टेज प्रदान करते", "मोटरच्या आर्मेचर ला स्थिर व्होल्टेज पुरवणे"],
    answer: "B",
    explanation: "Provides variable voltage to the field winding of the motor.",
    explanationMarathi: "मोटरच्या फील्ड वाइंडिंगला व्हेरिएबल व्होल्टेज प्रदान करते."
  },
  {
    id: 9019,
    chapterId: 90,
    question: "What is the disadvantage of AC drive?",
    questionMarathi: "AC ड्राईव्हचे तोटे कोणते?",
    options: ["Not suitable for high speed operation", "More complex with a single power conversion", "Less expensive than AC drive for high capacity motor", "Less maintenance cost"],
    optionsMarathi: ["उच्च वेगाच्या ऑपरेशन योग्य नसते", "पॉवरचे रूपांतर करताना रचना जटिल असते", "उच्च क्षमतेच्या मोटरसाठी AC ड्राईव्हपेक्षा कमी खर्चिक", "देखभाल खर्च कमी"],
    answer: "A",
    explanation: "Not suitable for high speed operation.",
    explanationMarathi: "उच्च वेगाच्या ऑपरेशन योग्य नसते."
  },
  {
    id: 9020,
    chapterId: 90,
    question: "Which is the classification of drive according to dynamics and transients?",
    questionMarathi: "ड्राईव्हच्या वर्गीकरणात डायनॅमिक्स आणि ट्रान्झिएंट ड्राईव्ह कोणता असतो?",
    options: ["Short time duty drive", "Intermittent duty drive", "COMMS technology box", "Speed feedback technology box"],
    optionsMarathi: ["शॉर्ट टाईम ड्युटी ड्राईव्ह", "इंटरमिटेंट ड्युटी ड्राईव्ह", "COMMS टेक्नॉलॉजी बॉक्स", "स्पीड फीडबॅक टेक्नॉलॉजी बॉक्स"],
    answer: "D",
    explanation: "Speed feedback technology box.",
    explanationMarathi: "स्पीड फीडबॅक टेक्नॉलॉजी बॉक्स."
  },
  {
    id: 9021,
    chapterId: 90,
    question: "Why the A.C drives are mostly used in process plant?",
    questionMarathi: "प्रोसेस प्लांट मध्ये A.C ड्राईव्ह जास्त प्रमाणात का वापरतात?",
    options: ["Easy to operate", "Robust in construction", "Very high starting torque", "Maintenance free long life"],
    optionsMarathi: ["ऑपरेट करण्यास सोपे असते", "रचना मजबूत असते", "स्टार्टींग टॉर्क खूप जास्त असतो", "देखभाल मुक्त दीर्घ आयुष्य"],
    answer: "D",
    explanation: "Maintenance free long life.",
    explanationMarathi: "देखभाल मुक्त दीर्घ आयुष्य."
  },
  {
    id: 9022,
    chapterId: 90,
    question: "What is the purpose of PROG / DATA button in BOP of AC drive?",
    questionMarathi: "AC ड्राईव्ह मध्ये BOP मधील PROG / DATA बटणाचा उपयोग काय?",
    options: ["To change the parameter setting", "To store the entered data and show the factory stored data", "To display the direction of rotation forward / REV", "To display the values of the frequency and current"],
    optionsMarathi: ["पॅरामीटर सेटिंग बदलण्यासाठी", "एंटर केलेला डेटा संचयित करण्यासाठी आणि फॅक्टरी संबंधित डेटा दर्शवण्यासाठी", "रोटेशन फॉरवर्ड / REV ची दिशा प्रदर्शित करण्यासाठी", "वारंवारता आणि वर्तमान मूल्ये प्रदर्शित करण्यासाठी"],
    answer: "B",
    explanation: "To store the entered data and show the factory stored data.",
    explanationMarathi: "एंटर केलेला डेटा संचयित करण्यासाठी आणि फॅक्टरी संबंधित डेटा दर्शवण्यासाठी."
  },
  {
    id: 9023,
    chapterId: 90,
    question: "What is IGBT in VF drive?",
    questionMarathi: "VF ड्राईव्हमध्ये IGBT काय आहे?",
    options: ["Inverter switching device", "D.C bus switching device", "Voltage regulator switching device", "Field supply switching device"],
    optionsMarathi: ["इन्व्हर्टर स्विचिंग डिव्हाइस", "D.C बस स्विचिंग डिव्हाइस", "व्होल्टेज रेग्युलेटर स्विचिंग डिव्हाइस", "फील्ड सप्लाय स्विचिंग डिव्हाइस"],
    answer: "A",
    explanation: "Inverter switching device.",
    explanationMarathi: "इन्व्हर्टर स्विचिंग डिव्हाइस."
  }
];
