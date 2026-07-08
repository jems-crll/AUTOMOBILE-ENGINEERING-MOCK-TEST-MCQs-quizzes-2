import { Question } from "../types";

export const ALTERNATOR_SYNCHRONOUS_MOTORS_QUESTIONS: Question[] = [
  {
    id: 6001,
    chapterId: 60,
    question: "What is the advantage of motor generator set?",
    questionMarathi: "मोटर जनरेटर सेटचा फायदा काय आहे?",
    options: ["Noiseless", "High efficiency", "Low maintenance required", "DC output voltage can be easily controlled"],
    optionsMarathi: ["नीरव", "हाय एफिशिएन्सी", "कमी देखभाल", "डीसी आउटपुट व्होल्टेज कंट्रोल करणे सोपे असते"],
    answer: "D",
    explanation: "DC output voltage can be easily controlled in a motor-generator set.",
    explanationMarathi: "मोटर जनरेटर सेटमध्ये डीसी आउटपुट व्होल्टेज सहजपणे नियंत्रित करता येते."
  },
  {
    id: 6002,
    chapterId: 60,
    question: "What is the effect of armature reaction at zero leading power factor in an alternator?",
    questionMarathi: "अल्टरनेटरमध्ये शून्य अग्रगण्य पॉवर फॅक्टरवर आर्मेचर प्रतिक्रियाचा काय परिणाम होतो?",
    options: ["No effect", "Cross magnetising", "Demagnetising", "Magnetising"],
    optionsMarathi: ["परिणाम नाही", "क्रॉस मॅग्नेटायझिंग", "डिमॅग्नेटायझिंग", "मॅग्नेटायझिंग"],
    answer: "D",
    explanation: "It produces magnetising effect.",
    explanationMarathi: "हे मॅग्नेटायझिंग इफेक्ट निर्माण करते."
  },
  {
    id: 6003,
    chapterId: 60,
    question: "How to compensate the de-magnetizing effect due to armature reaction in an alternator?",
    questionMarathi: "अल्टरनेटरमध्ये आर्मेचर रिएक्शनमुळे डी मॅग्नेटाइजिंग इफेक्टची भरपाई कशी करावी?",
    options: ["Reducing the speed", "Reducing field excitation", "Increasing field excitation", "Increasing speed"],
    optionsMarathi: ["अल्टरनेटरची स्पीड कमी करून", "फील्ड एक्साइटेशन करंट कमी करून", "फील्ड एक्साइटेशन करंट वाढवून", "अल्टरनेटरची स्पीड वाढवून"],
    answer: "C",
    explanation: "By increasing field excitation current.",
    explanationMarathi: "फील्ड एक्साइटेशन करंट वाढवून."
  },
  {
    id: 6004,
    chapterId: 60,
    question: "Which is the main application of synchronous motor?",
    questionMarathi: "सिंक्रोनस मोटरचा मुख्य वापर कोणता आहे?",
    options: ["Elevators", "Electric traction", "AC to DC converter", "Power factor correction device"],
    optionsMarathi: ["इलिव्हेटर्स", "इलेक्ट्रिक ट्रॅक्शन", "एसी ते डीसी कन्व्हर्टर", "पॉवर फॅक्टर करेक्शन डिव्हाइस"],
    answer: "D",
    explanation: "Used as power factor correction device.",
    explanationMarathi: "पॉवर फॅक्टर करेक्शन डिव्हाइस म्हणून वापरले जाते."
  },
  {
    id: 6005,
    chapterId: 60,
    question: "What is the name of curve of the synchronous motor as shown in the figure?",
    questionMarathi: "आकृतीत दाखवल्याप्रमाणे समकालिक मोटरच्या वक्राचे नाव काय आहे?",
    options: ["V curve", "Inverse 'V' curve", "No load characteristics curve", "Load characteristics curve"],
    optionsMarathi: ["V कर्व्ह", "इन्व्हर्स 'V' कर्व्ह", "नो लोड वैशिष्ट्ये", "लोड वैशिष्ट्ये"],
    answer: "B",
    explanation: "Inverse V curve.",
    explanationMarathi: "इन्व्हर्स 'V' कर्व्ह."
  },
  {
    id: 6006,
    chapterId: 60,
    question: "What is the voltage regulation in percentage if the load is removed from an alternator, the voltage rises from 480V to 660V.",
    questionMarathi: "अल्टरनेटरवरील लोड काढून टाकल्यास व्होल्टेज 480V वरून 660V वर वाढल्यास टक्केवारीमध्ये व्होल्टेजचे नियमन काय आहे?",
    options: ["0.272", "0.325", "0.375", "0.385"],
    optionsMarathi: ["0.272", "0.325", "0.375", "0.385"],
    answer: "C",
    explanation: "Regulation = (660-480)/480 = 180/480 = 0.375.",
    explanationMarathi: "नियमन = (660-480)/480 = 180/480 = 0.375."
  },
  {
    id: 6007,
    chapterId: 60,
    question: "What is the name of the part of alternator as shown in the figure?",
    questionMarathi: "आकृती दाखवलेल्या अल्टरनेटरच्या भागाचे नाव काय आहे?",
    options: ["Stator", "Exciter", "Salient pole rotor", "Smooth cylindrical rotor"],
    optionsMarathi: ["स्टेटर", "एक्साइटर", "सेलियन पोल रोटर", "स्मूथ सिलिंड्रिकल रोटर"],
    answer: "C",
    explanation: "Salient pole rotor.",
    explanationMarathi: "सेलियन पोल रोटर."
  },
  {
    id: 6008,
    chapterId: 60,
    question: "What is the function of inverter?",
    questionMarathi: "इन्व्हर्टर चे कार्य काय आहे?",
    options: ["Convert AC to DC", "Convert DC to AC", "Smoothening AC sine wave", "Convert pulsating DC into pure DC"],
    optionsMarathi: ["A.C चे D.C मध्ये रूपांतर करा", "D.C चे A.C मध्ये रूपांतर करा", "A.C साइन वेव्ह स्मूथिंग", "पल्सेटिंग डीसीचे शुद्ध डीसीमध्ये रूपांतर करा"],
    answer: "B",
    explanation: "Converts DC to AC.",
    explanationMarathi: "D.C चे A.C मध्ये रूपांतर करते."
  },
  {
    id: 6009,
    chapterId: 60,
    question: "Which is represented by the 'V' curve of the synchronous motor?",
    questionMarathi: "सिंक्रोनस मोटरच्या 'V' वक्र द्वारे कोणते दर्शविले जाते?",
    options: ["Relation between field current and power factor", "Relation between applied voltage and load current", "Relation between load current and power factor", "Relation between armature current and field current"],
    optionsMarathi: ["फील्ड करंट आणि पॉवर फॅक्टर संबंध", "लागू व्होल्टेज आणि लोड करंट संबंध", "लोड करंट आणि पॉवर फॅक्टर संबंध", "आर्मेचर करंट आणि फील्ड करंट संबंध"],
    answer: "D",
    explanation: "Relation between armature current and field current.",
    explanationMarathi: "आर्मेचर करंट आणि फील्ड करंट संबंध."
  },
  {
    id: 6010,
    chapterId: 60,
    question: "Why the synchronous motor fails to run at synchronous speed?",
    questionMarathi: "सिंक्रोनस मोटर सिंक्रोनस गतीने का धावू शकत नाही?",
    options: ["Insufficient excitation", "Defective pony motor", "Open in damper winding", "Short in damper winding"],
    optionsMarathi: ["पुरेशी विद्युत उत्तेजन", "दोषपूर्ण पोनी मोटर", "डँपर वाइंडिंग मध्ये उघडा", "कमकुवत वाइंडिंगमध्ये लहान"],
    answer: "A",
    explanation: "Insufficient excitation.",
    explanationMarathi: "पुरेशी विद्युत उत्तेजन नाही."
  },
  {
    id: 6011,
    chapterId: 60,
    question: "Why D.C supply is necessary for synchronous motor operation?",
    questionMarathi: "सिंक्रोनस मोटर ऑपरेशनसाठी डीसी पुरवठा का आवश्यक आहे?",
    options: ["Reduce the losses", "Start the motor initially", "Run the motor with over load", "Run the motor at synchronous speed"],
    optionsMarathi: ["लॉसेस कमी करण्यासाठी", "इनिशियली मोटार सुरू करण्यासाठी", "ओव्हरलोड वर मोटर फिरवण्यासाठी", "सिंक्रोनस स्पीड वर मोटर फिरवण्यासाठी"],
    answer: "D",
    explanation: "To run the motor at synchronous speed.",
    explanationMarathi: "सिंक्रोनस स्पीड वर मोटर फिरवण्यासाठी."
  },
  {
    id: 6012,
    chapterId: 60,
    question: "What is the function of damper windings in synchronous motor at starting?",
    questionMarathi: "सिंक्रोनस मोटर मध्ये डॅम्पर वाइंडिंग चे कार्य काय आहे?",
    options: ["Maintain the power factor", "Excite the field winding", "Maintain the constant speed", "Start the synchronous motor"],
    optionsMarathi: ["पॉवर फॅक्टर कायम ठेवणे", "फिल्ड वाइंडिंग एक्साईट करणे", "वेग कायम ठेवणे", "मोटार सुरू करणे"],
    answer: "D",
    explanation: "To start the synchronous motor.",
    explanationMarathi: "मोटार सुरू करणे."
  },
  {
    id: 6013,
    chapterId: 60,
    question: "Which method of the parallel operation of alternator is shown in the diagram?",
    questionMarathi: "आकृतीमध्ये अल्टरनेटरच्या समांतर ऑपरेशनची कोणती पद्धत दर्शविली आहे?",
    options: ["Moving iron type synchroscope method", "Western type synchroscope method", "Dark lamp method", "Dark & Bright lamp method"],
    optionsMarathi: ["मूव्हिंग आयर्न प्रकार सिंक्रोस्कोप", "वेस्टर्न प्रकार सिंक्रोस्कोप", "डार्क दिवा पद्धत", "डार्क आणि तेजस्वी दिवा पद्धत"],
    answer: "B",
    explanation: "Western type synchroscope method.",
    explanationMarathi: "वेस्टर्न प्रकार सिंक्रोस्कोप पद्धत."
  },
  {
    id: 6014,
    chapterId: 60,
    question: "What is an application of the synchronous motor?",
    questionMarathi: "सिंक्रोनस मोटरचा ॲप्लिकेशन म्हणजे काय?",
    options: ["In conveyers", "In cranes", "In elevators", "As the power factor corrector"],
    optionsMarathi: ["कन्व्हेअर्समध्ये", "क्रेन मध्ये", "लिफ्टमध्ये", "पॉवर फॅक्टर करेक्टर म्हणून"],
    answer: "D",
    explanation: "As the power factor corrector.",
    explanationMarathi: "पॉवर फॅक्टर करेक्टर म्हणून."
  },
  {
    id: 6015,
    chapterId: 60,
    question: "Which converter is having the high efficiency?",
    questionMarathi: "कोणत्या कन्व्हर्टरची कार्यक्षमता जास्त असते?",
    options: ["SCR converter", "Rotary converter", "Motor generator set", "Mercury arc rectifier"],
    optionsMarathi: ["SCR कन्व्हर्टर", "रोटरी कन्व्हर्टर", "एमजी सेट", "मर्क्युरी अर्क रेक्टिफायर"],
    answer: "A",
    explanation: "SCR converter.",
    explanationMarathi: "SCR कन्व्हर्टर."
  },
  {
    id: 6016,
    chapterId: 60,
    question: "What will be the speed of a 4 poles alternator supplies the frequency of 50 Hz at the rated voltage?",
    questionMarathi: "रेटेड व्होल्टेजवर 50 Hz ची वारंवारता पुरवणाऱ्या 4 पोल अल्टरनेटरचा वेग किती असेल?",
    options: ["1000 rpm", "1500 rpm", "3000 rpm", "4500 rpm"],
    optionsMarathi: ["1000 rpm", "1500 rpm", "3000 rpm", "4500 rpm"],
    answer: "B",
    explanation: "Speed = 120 * 50 / 4 = 1500 rpm.",
    explanationMarathi: "वेग = 120 * 50 / 4 = 1500 rpm."
  },
  {
    id: 6017,
    chapterId: 60,
    question: "What is the compensation effect of armature reaction?",
    questionMarathi: "आर्मेचर रिएक्शनचा परिणाम काय आहे?",
    options: ["Prevents the demagnetizing effect", "Generates less voltage", "Prevents the short circuit fault", "Increase the demagnetizing effect"],
    optionsMarathi: ["डी मॅग्नेट इफेक्ट कमी होतो", "ओव्हर व्होल्टेज प्रोटेक्शन", "शार्ट सर्किटसाठी प्रोटेक्शन", "अल्टरनेटर ओव्हरलोड होतो"],
    answer: "A",
    explanation: "Prevents the demagnetizing effect.",
    explanationMarathi: "डी मॅग्नेट इफेक्ट कमी होतो."
  },
  {
    id: 6018,
    chapterId: 60,
    question: "What is the use of synchroscope?",
    questionMarathi: "सिंक्रोस्कोपचा उपयोग काय आहे?",
    options: ["Adjust output voltage", "Adjust phase sequence", "Adjust supply frequency", "Indicate the correct instant for paralleling"],
    optionsMarathi: ["आउट पुट व्होल्टेज ॲडजस्ट करणे", "फेज सिक्वेन्स ॲडजस्ट करणे", "सप्लाय फ्रिक्वेन्सी ॲडजस्ट करणे", "बरोबर असलेली समांतर जोडणी इंडिकेट करणे"],
    answer: "D",
    explanation: "Indicates the correct instant for paralleling.",
    explanationMarathi: "बरोबर असलेली समांतर जोडणी इंडिकेट करणे."
  },
  {
    id: 6019,
    chapterId: 60,
    question: "Which application requires only DC?",
    questionMarathi: "कोणत्या ऍप्लिकेशनसाठी फक्त DC आवश्यक आहे?",
    options: ["Electroplating", "Stepping up of voltage", "Operating induction motor", "Operating repulsion motor"],
    optionsMarathi: ["इलेक्ट्रोप्लेटिंग", "व्होल्टेज वाढवण्यासाठी", "इंडक्शन मोटर सुरू करण्यासाठी", "रिपल्स मोटर सुरू करण्यासाठी"],
    answer: "A",
    explanation: "Electroplating.",
    explanationMarathi: "इलेक्ट्रोप्लेटिंग."
  },
  {
    id: 6020,
    chapterId: 60,
    question: "Why the LED's are avoided as converters in rectifier diodes?",
    questionMarathi: "रेक्टिफायर डायोड्समध्ये कन्व्हर्टर म्हणून एलइडी का टाळले जातात?",
    options: ["Heavily doped device", "Very low power device", "Designed for light emitting", "Very sensitive to temperature"],
    optionsMarathi: ["जोरदारपणे डोप्ड डिव्हाइस", "खूप कमी ऊर्जा उपकरण", "प्रकाश उत्सर्जनासाठी डिझाइन केलेले", "तापमान अत्यंत संवेदनशील"],
    answer: "B",
    explanation: "Very low power device.",
    explanationMarathi: "खूप कमी ऊर्जा उपकरण."
  },
  {
    id: 6021,
    chapterId: 60,
    question: "What is the name of the converter as shown in the figure?",
    questionMarathi: "आकृतीत दाखवलेल्या कन्व्हर्टरचे नाव काय आहे?",
    options: ["Metal rectifier", "Rotary converter", "Mercury arc rectifier", "Motor-Generator set"],
    optionsMarathi: ["मेटल रेक्टिफायर", "रोटरी कन्व्हर्टर", "मेटल आर्क रेक्टिफायर", "मोटर जनरेटर सेट"],
    answer: "B",
    explanation: "Rotary converter.",
    explanationMarathi: "रोटरी कन्व्हर्टर."
  },
  {
    id: 6022,
    chapterId: 60,
    question: "What is the purpose of the damper winding in a synchronous motor at starting?",
    questionMarathi: "सिंक्रो नंस मध्ये डॅम्पर वाइंडिंग ची जोडणी का केली जाते?",
    options: ["High voltage generation", "High current generation", "Produces torque to start", "Produces high magnetic field"],
    optionsMarathi: ["रोटेशन सुरू करण्यासाठी उच्च व्होल्टेज तयार करा", "मोटर फिरविणे सुरू करण्यासाठी उच्च प्रवाह निर्मिती", "टॉर्क तयार करते आणि सिंक्रोनस वेगाच्या जवळ चालते", "सतत गती कायम ठेवण्यासाठी उच्च चुंबकीय क्षेत्र तयार करा"],
    answer: "C",
    explanation: "Produces a torque and runs near the synchronous speed.",
    explanationMarathi: "टॉर्क तयार करते आणि सिंक्रोनस वेगाच्या जवळ चालते."
  },
  {
    id: 6023,
    chapterId: 60,
    question: "What is the speed in r.p.m of the 2 pole, 50Hz of an alternator?",
    questionMarathi: "2 पोलच्या r.p.m मध्ये वेग किती आहे, अल्टरनेटरचा 50Hz?",
    options: ["50 rpm", "100 rpm", "1500 rpm", "3000 rpm"],
    optionsMarathi: ["50 rpm", "100 rpm", "1500 rpm", "3000 rpm"],
    answer: "D",
    explanation: "Speed = 120 * 50 / 2 = 3000 rpm.",
    explanationMarathi: "वेग = 120 * 50 / 2 = 3000 rpm."
  },
  {
    id: 6024,
    chapterId: 60,
    question: "What is the function of the part marked as 'X' of the rotary converter as shown in the figure?",
    questionMarathi: "आकृतीत दाखवल्याप्रमाणे रोटरी कन्व्हर्टरच्या 'X' म्हणून चिन्हांकित केलेल्या भागाचे कार्य काय आहे?",
    options: ["Converts AC into DC", "Reduces voltage drop", "Collects the alternating current", "Collects the direct current"],
    optionsMarathi: ["AC चे DC मध्ये रूपांतर करते", "व्होल्टेज ड्रॉप कमी करणे", "अल्टरनेटिंग करंट गोळा करते", "डायरेक्ट करंट गोळा करतो"],
    answer: "D",
    explanation: "Collects the direct current.",
    explanationMarathi: "डायरेक्ट करंट गोळा करतो."
  },
  {
    id: 6025,
    chapterId: 60,
    question: "Which condition is to be satisfied before parallel operation of an alternators?",
    questionMarathi: "दोन अल्टरनेटर समांतर जोडण्यासाठी कोणत्या अटीचे पालन करावे?",
    options: ["Rating must be same", "Phase sequence must be same", "Rotor impedance must be same", "Stator impedance must be same"],
    optionsMarathi: ["रेटिंग सारखी असावी", "फेज सिक्वेन्स सारखा असावा", "रोटर सुधारणा समान असणे आवश्यक आहे", "स्टेटर प्रतिबद्धता समान असणे आवश्यक आहे"],
    answer: "B",
    explanation: "Phase sequence must be same.",
    explanationMarathi: "फेज सिक्वेन्स सारखा असावा."
  }
];
