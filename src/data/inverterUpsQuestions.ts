import { Question } from "../types";

export const INVERTER_UPS_QUESTIONS: Question[] = [
  {
    id: 10001,
    chapterId: 100,
    question: "What is the function of an inverter?",
    questionMarathi: "इन्व्हर्टर चे कार्य कोणते आहे?",
    options: ["Converts A.C voltage into D.C voltage", "Converts D.C voltage into A.C voltage", "Converts D.C voltage into higher D.C voltage", "Converts A.C voltage into higher A.C voltage"],
    optionsMarathi: ["AC व्होल्टेज चे DC व्होल्टेज मध्ये रुपांतर करतो", "DC व्होल्टेज चे AC व्होल्टेज मध्ये रुपांतर करतो", "DC व्होल्टेजचे जास्त DC व्होल्टेजमध्ये रुपांतर करतो", "AC व्होल्टेजचे जास्त AC व्होल्टेजमध्ये रुपांतर करतो"],
    answer: "B",
    explanation: "Inverter converts D.C voltage into A.C voltage.",
    explanationMarathi: "इन्व्हर्टर DC व्होल्टेजचे AC व्होल्टेजमध्ये रूपांतर करतो."
  },
  {
    id: 10002,
    chapterId: 100,
    question: "What is the full form of PWM?",
    questionMarathi: "PWM चा फुल फॉर्म काय आहे?",
    options: ["Pulse Wide Modulation", "Pulse Width Modulation", "Phase Wide Modulation", "Phase Width Modulation"],
    optionsMarathi: ["Pulse Wide Modulation", "Pulse Width Modulation", "Phase Wide Modulation", "Phase Width Modulation"],
    answer: "B",
    explanation: "PWM stands for Pulse Width Modulation.",
    explanationMarathi: "PWM म्हणजे पल्स विड्थ मॉड्यूलेशन."
  },
  {
    id: 10003,
    chapterId: 100,
    question: "What is the name of the stabilizer as shown in the figure?",
    questionMarathi: "आकृतीत दाखवल्याप्रमाणे स्टॅबिलायझरचे नाव काय आहे?",
    options: ["Stepped voltage stabilizer-automatic", "Stepped voltage stabilizer-manual", "Constant voltage transformer", "Servo voltage stabilizer"],
    optionsMarathi: ["स्टेपड् व्होल्टेज स्टॅबिलायझर - ऑटोमॅटिक", "स्टेपड् व्होल्टेज स्टॅबिलायझर मॅन्युअल", "स्थिर व्होल्टेज ट्रान्सफॉर्मर", "सर्व्हो व्होल्टेज स्टॅबिलायझर"],
    answer: "D",
    explanation: "Servo voltage stabilizer.",
    explanationMarathi: "सर्व्हो व्होल्टेज स्टॅबिलायझर."
  },
  {
    id: 10004,
    chapterId: 100,
    question: "What is the advantage of on-line UPS over offline UPS?",
    questionMarathi: "ऑनलाईन यूपीएस पेक्षा ऑफलाईन यूपीएस चे फायदे कोणते?",
    options: ["Supplies constant power output", "It gives variable output frequency", "Works with transition problems", "Free from change over and transition problems"],
    optionsMarathi: ["कॉन्स्टन्ट पॉवर आउटपुट देतो", "हे व्हेरिएबल आउटपुट वारंवारता देते", "संक्रमण समस्यांसह कार्य करते", "चेंज ओव्हर आणि ट्रान्झिशन प्रॉब्लेम पासून मुक्त असतो"],
    answer: "D",
    explanation: "On-line UPS is free from change over and transition problems.",
    explanationMarathi: "ऑनलाईन यूपीएस चेंज ओव्हर आणि ट्रान्झिशन प्रॉब्लेम पासून मुक्त असतो."
  },
  {
    id: 10005,
    chapterId: 100,
    question: "Which part of the UPS supplies continuous output in case of input fails?",
    questionMarathi: "इनपुट अयशस्वी झाल्यास UPS चा कोणता भाग सतत आउटपुट पुरवतो?",
    options: ["Battery unit", "Inverter unit", "Rectifier unit", "Controller unit"],
    optionsMarathi: ["बॅटरी युनिट", "इन्व्हर्टर युनिट", "रेक्टिफायर युनिट", "कंट्रोलर युनिट"],
    answer: "A",
    explanation: "Battery unit supplies continuous output in case of input fails.",
    explanationMarathi: "इनपुट अयशस्वी झाल्यास बॅटरी युनिट सतत आउटपुट पुरवते."
  },
  {
    id: 10006,
    chapterId: 100,
    question: "What is the type of A.C voltage stabilizer?",
    questionMarathi: "A.C व्होल्टेज स्टॅबिलायझरचा प्रकार काय आहे?",
    options: ["Servo voltage stabilizer", "Automatic voltage stabilizer", "Manual stepped voltage stabilizer", "Constant voltage transformer stabilizer"],
    optionsMarathi: ["सर्व्हो व्होल्टेज स्टॅबिलायझर", "ऑटोमॅटिक व्होल्टेज स्टॅबिलायझर", "मॅन्युअल स्टेप व्होल्टेज स्टॅबिलायझर", "कॉन्स्टन्ट व्होल्टेज ट्रान्सफॉर्मर स्टॅबिलायझर"],
    answer: "C",
    explanation: "Manual stepped voltage stabilizer.",
    explanationMarathi: "मॅन्युअल स्टेप व्होल्टेज स्टॅबिलायझर."
  },
  {
    id: 10007,
    chapterId: 100,
    question: "Which term refers that the mass of a substance liberated from an electrolyte by one coulomb of electricity?",
    questionMarathi: "एक कुलंब विज प्रवाहाने इलेक्ट्रोलाइट मधून मुक्त होणाऱ्या पदार्थाचे वस्तुमान कोणत्या पदाचा संदर्भ देते?",
    options: ["Electrolysis", "Electro plating", "Electro copying", "Electro chemical equivalent"],
    optionsMarathi: ["इलेक्ट्रोलायसिस", "इलेक्ट्रोप्लेटिंग", "इलेक्ट्रोकॉपींग", "इलेक्ट्रो केमिकल इक्विव्हलंट"],
    answer: "D",
    explanation: "Electro chemical equivalent.",
    explanationMarathi: "इलेक्ट्रो केमिकल इक्विव्हलंट."
  },
  {
    id: 10008,
    chapterId: 100,
    question: "How the hard sulphation defect in the secondary cell can be removed?",
    questionMarathi: "दुय्यम पेशींतील हार्ड सल्फेशन दोष कसा दूर केला जाऊ शकतो?",
    options: ["By providing trickle charging", "By providing fresh charging", "By providing boost charging", "By providing high potential charging"],
    optionsMarathi: ["ट्रिकल चार्जिंग प्रदान करून", "ताजे चार्जिंग प्रदान करून", "बूस्ट चार्जिंग प्रदान करून", "उच्च संभाव्य चार्जिंग प्रदान करून"],
    answer: "A",
    explanation: "By providing trickle charging.",
    explanationMarathi: "ट्रिकल चार्जिंग प्रदान करून."
  },
  {
    id: 10009,
    chapterId: 100,
    question: "Calculate the voltage and ampere/hour, if four cells rated as 1.5 V and 8 A.H are in parallel?",
    questionMarathi: "व्होल्टेज आणि अँपिअर/तास मोजा, जर 1.5 V आणि 8 A.H असे रेट केलेले चार सेल समांतर असतील तर?",
    options: ["6 V and 32 AH", "3 V and 16 AH", "6 V and 8 AH", "1.5 V and 32 AH"],
    optionsMarathi: ["6 V and 32 AH", "3 V and 16 AH", "6 V and 8 AH", "1.5 V and 32 AH"],
    answer: "D",
    explanation: "In parallel, voltage remains the same (1.5V) and Ah adds up (8*4=32Ah).",
    explanationMarathi: "समांतर जोडणीत व्होल्टेज समान राहते (1.5V) आणि Ah बेरीज होते (8*4=32Ah)."
  },
  {
    id: 10010,
    chapterId: 100,
    question: "What is the reason for tripping the UPS with full load?",
    questionMarathi: "पूर्ण लोडवर UPS ट्रिप होण्याचे कारण काय?",
    options: ["Main supply failure", "Incorrect over load settings", "Input voltage is low", "Input frequency is low"],
    optionsMarathi: ["मुख्य सप्लाय फेल्युअर", "ओव्हरलोड सेटिंग चुकीची असल्यास", "इनपुट व्होल्टेज कमी आहे", "इनपुट फ्रिक्वेन्सी कमी आहे"],
    answer: "B",
    explanation: "Incorrect over load settings.",
    explanationMarathi: "ओव्हरलोड सेटिंग चुकीची असल्यास."
  },
  {
    id: 10011,
    chapterId: 100,
    question: "What is the full form of 'EVSE'?",
    questionMarathi: "'EVSE' चे पूर्ण नाव काय आहे?",
    options: ["Electronics Voltage Supply Equipment", "Electric Voltage System Equipment", "Electric Vehicle Supply Equipment", "Energy Variable Supply Equipment"],
    optionsMarathi: ["Electronics Voltage Supply Equipment", "Electric Voltage System Equipment", "Electric Vehicle Supply Equipment", "Energy Variable Supply Equipment"],
    answer: "C",
    explanation: "Electric Vehicle Supply Equipment.",
    explanationMarathi: "Electric Vehicle Supply Equipment."
  },
  {
    id: 10012,
    chapterId: 100,
    question: "Which feedback network is used for automatic voltage stabilizer?",
    questionMarathi: "ऑटोमॅटिक व्होल्टेज स्टॅबिलायझर मध्ये कोणते फीडबॅक नेटवर्क वापरतात",
    options: ["Current divider network", "Voltage divider network", "Tapped transformer network", "Resistance temperature detector network"],
    optionsMarathi: ["करंट डिव्हाइडर नेटवर्क", "व्होल्टेज डिव्हाइडर नेटवर्क", "टॅप ट्रान्सफॉर्मर नेटवर्क", "रेझिस्टन्स टेम्परेचर नेटवर्क"],
    answer: "B",
    explanation: "Voltage divider network.",
    explanationMarathi: "व्होल्टेज डिव्हाइडर नेटवर्क."
  },
  {
    id: 10014,
    chapterId: 100,
    question: "How the backup time of UPS can be increased?",
    questionMarathi: "यूपीएस चा बॅकअप टाईम कसा वाढवतात?",
    options: ["By decreasing the VA rating of UPS", "By increasing the AH capacity of battery", "By decreasing the AH capacity of battery", "Maintain the battery voltage less than 90% of its rating"],
    optionsMarathi: ["UPS चे VA रेटिंग कमी करून", "बॅटरीची एएच क्षमता वाढवून", "बॅटरीची एएच क्षमता कमी करून", "बॅटरीचे व्होल्टेज त्याच्या रेटिंगच्या 90% पेक्षा कमी ठेवा"],
    answer: "B",
    explanation: "By increasing the AH capacity of battery.",
    explanationMarathi: "बॅटरीची एएच क्षमता वाढवून."
  },
  {
    id: 10016,
    chapterId: 100,
    question: "What is the cause for the output frequency of an inverter is high?",
    questionMarathi: "इन्व्हर्टरची आउटपुट वारंवारता जास्त असण्याचे कारण काय आहे?",
    options: ["Short circuited transformer", "Low battery", "Defective oscillator", "Open circuited transformer"],
    optionsMarathi: ["शॉर्ट सर्किट केलेला ट्रान्सफॉर्मर", "बॅटरी कमी", "डिफेक्टिव्ह ऑसिलेटर", "सर्किट केलेले ट्रान्सफॉर्मर उघडा"],
    answer: "C",
    explanation: "Defective oscillator.",
    explanationMarathi: "डिफेक्टिव्ह ऑसिलेटर."
  },
  {
    id: 10017,
    chapterId: 100,
    question: "What is the cause for the fault if the output voltage of UPS is higher than normal?",
    questionMarathi: "UPS चे आउटपुट व्होल्टेज सामान्यपेक्षा जास्त असल्यास बिघाडाचे कारण काय आहे?",
    options: ["Battery gets short circuited", "Defective feedback circuit", "Input supply failure", "Defective inverter"],
    optionsMarathi: ["बॅटरी शॉर्ट सर्किट होते", "फीडबॅक सर्किट दोषयुक्त", "इनपुट सप्लाय फेल्युअर", "दोषयुक्त इन्व्हर्टर"],
    answer: "B",
    explanation: "Defective feedback circuit.",
    explanationMarathi: "फीडबॅक सर्किट दोषयुक्त."
  },
  {
    id: 10019,
    chapterId: 100,
    question: "Which transformer is used in servo voltage stabilizer?",
    questionMarathi: "सर्व्हो व्होल्टेज स्टॅबिलायझर मध्ये कोणता ट्रान्सफॉर्मर वापरतात",
    options: ["Step up transformer", "Step down transformer", "Toroidal autotransformer", "Constant voltage transformer stabilizer"],
    optionsMarathi: ["स्टेप अप ट्रान्सफॉर्मर", "स्टेप डाउन ट्रान्सफॉर्मर", "टोराइडल ऑटोट्रान्सफॉर्मर", "कॉन्स्टन्ट व्होल्टेज ट्रान्सफॉर्मर स्टॅबिलायझर"],
    answer: "C",
    explanation: "Toroidal autotransformer.",
    explanationMarathi: "टोराइडल ऑटोट्रान्सफॉर्मर."
  },
  {
    id: 10020,
    chapterId: 100,
    question: "What are the important stages in a simple inverter?",
    questionMarathi: "साध्या इन्व्हर्टर मध्ये महत्वाचे स्टेजेस कोणते?",
    options: ["Oscillator and rectifier stages", "Oscillator and amplifier stages", "Rectifier and amplifier stages", "Oscillator and filter stages"],
    optionsMarathi: ["ऑसिलेटर आणि रेक्टिफायर स्टेजेस", "ऑसिलेटर आणि ॲम्प्लिफायर स्टेजेस", "रेक्टिफायर आणि ॲम्प्लिफायर स्टेजेस", "ऑसिलेटर आणि फिल्टर स्टेजेस"],
    answer: "B",
    explanation: "Oscillator and amplifier stages.",
    explanationMarathi: "ऑसिलेटर आणि ॲम्प्लिफायर स्टेजेस."
  },
  {
    id: 10021,
    chapterId: 100,
    question: "Effect of output voltage when input voltage decreases?",
    questionMarathi: "इनपुट व्होल्टेज कमी झाल्यास आउटपुट व्होल्टेजवर काय परिणाम होतो?",
    options: ["Decrease", "Becomes zero", "Remain same", "Increase"],
    optionsMarathi: ["कमी होतो", "शून्य होतो", "तेवढाच राहतो", "वाढतो"],
    answer: "A",
    explanation: "Decrease.",
    explanationMarathi: "कमी होतो."
  },
  {
    id: 10022,
    chapterId: 100,
    question: "Which is frequency converter?",
    questionMarathi: "कोणता फ्रिक्वेन्सी कन्व्हर्टर आहे?",
    options: ["Rectifiers", "D.C choppers", "Cyclo converters", "D.C to A.C converters"],
    optionsMarathi: ["रेक्टिफायर", "डी सी चॉपर", "सायक्लो कन्व्हर्टर", "डीसी टू एसी कन्व्हर्टर"],
    answer: "C",
    explanation: "Cyclo converters.",
    explanationMarathi: "सायक्लो कन्व्हर्टर."
  },
  {
    id: 10023,
    chapterId: 100,
    question: "What is the full form of UPS?",
    questionMarathi: "UPS चा फुल फॉर्म काय आहे?",
    options: ["Uniform Power Supply", "Uninterruptible Power Supply", "Universal Power System", "Unipolar Power Source"],
    optionsMarathi: ["Uniform Power Supply", "Uninterruptible Power Supply", "Universal Power System", "Unipolar Power Source"],
    answer: "B",
    explanation: "Uninterruptible Power Supply.",
    explanationMarathi: "Uninterruptible Power Supply."
  },
  {
    id: 10025,
    chapterId: 100,
    question: "What is the minimum permissible single phase working voltage, if the declared voltage is 240V as per ISI?",
    questionMarathi: "आय एस आय प्रमाणे निर्धारित केलेले व्होल्टेज २४० V असेल तर सिंगल फेज चे कमीत कमी मान्य असलेले व्होल्टेज किती असेल?",
    options: ["233 V", "228 V", "216 V", "211 V"],
    optionsMarathi: ["233 V", "228 V", "216 V", "211 V"],
    answer: "C",
    explanation: "216 V.",
    explanationMarathi: "216 V."
  }
];
