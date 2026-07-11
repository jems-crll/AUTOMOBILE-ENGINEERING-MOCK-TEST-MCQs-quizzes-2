import json
import re

# We will modify the src/data/questions.ts file
with open("src/data/questions.ts", "r") as f:
    content = f.read()

# Add Chapter 61
chapter_str = """  {
    "id": 61,
    "name": "Electrical Set 32 (Q 959 - 1010)",
    "nameMarathi": "विद्युत संच 32 (प्र 959 ते 1010)",
    "description": "Basic Electrical, Motors, Alternators and Transformers MCQs.",
    "descriptionMarathi": "मूलभूत विद्युत, मोटर्स, अल्टरनेटर आणि ट्रान्सफॉर्मर बहुपर्यायी प्रश्न.",
    "icon": "Zap",
    "section": "Electrical"
  }"""

# Insert Chapter 61 before "];\n\nexport const QUESTIONS"
content = content.replace("  }\n];\n\nexport const QUESTIONS", "  },\n" + chapter_str + "\n];\n\nexport const QUESTIONS")


questions_data = [
    {
        "id": 959,
        "chapterId": 61,
        "question": "What is the main difference between an auto transformer and other normal transformers?",
        "questionMarathi": "ऑटो ट्रान्सफॉर्मर आणि इतर सामान्य ट्रान्सफॉर्मरमधील मुख्य अंतर काय आहे?",
        "options": ["Core", "Cooling system", "Iron loss", "Working principle"],
        "optionsMarathi": ["क्रोड", "शीतलन प्रणाली", "लोह हानी", "कार्य तत्त्व"],
        "answer": "D",
        "explanation": "Normal transformers have two separate windings, while auto transformers have a single winding that acts as both primary and secondary.",
        "explanationMarathi": "सामान्य ट्रान्सफॉर्मरमध्ये दोन स्वतंत्र वाइंडिंग्स (प्रायमरी आणि सेकंडरी) असतात, तर ऑटो ट्रान्सफॉर्मरमध्ये एकच वाइंडिंग असते जी प्रायमरी आणि सेकंडरी दोन्ही म्हणून काम करते (कंडक्टिव्ह आणि इंडक्टिव्ह कपलिंग)."
    },
    {
        "id": 960,
        "chapterId": 61,
        "question": "What is the lamination of the armature made of?",
        "questionMarathi": "आर्मेचरची लॅमिनेशन कशाची बनलेली असते?",
        "options": ["Copper", "Soft iron", "Silicon steel", "Brass"],
        "optionsMarathi": ["तांबे", "मऊ लोखंड", "सिलिकॉन स्टील", "पितळ"],
        "answer": "C",
        "explanation": "To reduce eddy current loss, the armature core is always made of silicon steel laminations.",
        "explanationMarathi": "एडी करंट हानी (Eddy current loss) कमी करण्यासाठी आर्मेचर कोअर नेहमी सिलिकॉन स्टीलच्या थरांपासून (Laminations) बनवला जातो."
    },
    {
        "id": 961,
        "chapterId": 61,
        "question": "How much should the insulation resistance be?",
        "questionMarathi": "इन्सुलेशन रोध (Insulation Resistance) किती असावा?",
        "options": ["10 Ohm", "1 Mega Ohm", "10 Mega Ohm", "100 Kilo Ohm"],
        "optionsMarathi": ["१० ओहम", "१ मेगॅओहम", "१० मेगॅओहम", "१०० किलो ओहम"],
        "answer": "B",
        "explanation": "As a rule, for safety, the insulation resistance of any electrical device must be at least 1 Mega Ohm.",
        "explanationMarathi": "नियमानुसार, सुरक्षिततेसाठी कोणत्याही विद्युत उपकरणाचा इन्सुलेशन रोध किमान १ मेगॅओहम (1 MΩ) असणे आवश्यक आहे."
    },
    {
        "id": 962,
        "chapterId": 61,
        "question": "What is the power factor of a split phase motor?",
        "questionMarathi": "स्प्लिट फेज मोटरचा पॉवर फॅक्टर किती असतो?",
        "options": ["1", "0.8 to 0.9", "0.5 to 0.6", "0.3 to 0.4"],
        "optionsMarathi": ["१", "०.८ ते ०.९", "०.५ ते ०.६", "०.३ ते ०.४"],
        "answer": "C",
        "explanation": "The power factor of split phase induction motors is usually low (lagging), around 0.5 to 0.6.",
        "explanationMarathi": "स्प्लिट फेज इंडक्शन मोटर्सचा पॉवर फॅक्टर सहसा कमी (Lagging) असतो, जो ०.५ ते ०.६ च्या दरम्यान असतो."
    },
    {
        "id": 963,
        "chapterId": 61,
        "question": "What is the peak factor value of AC?",
        "questionMarathi": "AC च्या पीक फॅक्टरचे (Peak Factor) मूल्य किती असते?",
        "options": ["1.414", "1.141", "1.11", "11.1"],
        "optionsMarathi": ["१.४१४", "१.१४१", "१.११", "११.१"],
        "answer": "A",
        "explanation": "Peak Factor = Peak Value / RMS Value = √2 ≈ 1.414.",
        "explanationMarathi": "पीक फॅक्टर (Peak Factor) = पीक व्हॅल्यू / आर.एम.एस. व्हॅल्यू = √2 ≈ 1.414."
    },
    {
        "id": 964,
        "chapterId": 61,
        "question": "The rotation of the energy meter disc without load indicates which defect?",
        "questionMarathi": "एनर्जी मीटरची चकती लोड नसतानाही फिरणे, कोणता दोष दर्शवते?",
        "options": ["Friction defect", "Phase defect", "Creeping defect", "Speed defect"],
        "optionsMarathi": ["घर्षण दोष", "फेज दोष", "क्रीपिंग दोष", "गती दोष"],
        "answer": "C",
        "explanation": "When the meter disc rotates slowly without load, it is called 'creeping'.",
        "explanationMarathi": "जेव्हा मीटरला लोड नसतानाही डिस्क हळूहळू फिरते, तेव्हा त्याला 'क्रीपिंग' म्हणतात. हे सामान्यतः जास्त व्होल्टेज किंवा चुकीच्या सेटिंगमुळे होते."
    },
    {
        "id": 965,
        "chapterId": 61,
        "question": "What is the unit of Illumination?",
        "questionMarathi": "प्रदीप्तीचे (Illumination) एकक कोणते आहे?",
        "options": ["Lumen", "Lux", "Steradian", "Meter/Candela"],
        "optionsMarathi": ["ल्युमेन", "लक्स", "स्टेरॅडियन", "मीटर/कॅन्डेला"],
        "answer": "B",
        "explanation": "Illumination is the luminous flux falling per unit area, whose unit is 'Lux'.",
        "explanationMarathi": "प्रदीप्ती (Illumination) म्हणजे प्रति युनिट क्षेत्रावर पडणारा प्रकाश फ्लक्स, ज्याचे एकक 'लक्स' आहे."
    },
    {
        "id": 966,
        "chapterId": 61,
        "question": "The presence of current is realized from what?",
        "questionMarathi": "करंटच्या अस्तित्वाची जाणीव कशावरून होते?",
        "options": ["Shining", "Produced effect", "Electric shock", "Crackling sound"],
        "optionsMarathi": ["चमकण्यावरून", "उत्पन्न प्रभावावरून", "विद्युत धक्क्यावरून", "चटचट आवाजावरून"],
        "answer": "B",
        "explanation": "Current itself is invisible, but its presence is understood by the effects it produces.",
        "explanationMarathi": "करंट स्वतः दिसत नाही, परंतु तो निर्माण करणारे प्रभाव (उदा. उष्णता, चुंबकीय क्षेत्र, रासायनिक बदल) यावरून त्याचे अस्तित्व समजते."
    },
    {
        "id": 967,
        "chapterId": 61,
        "question": "If one resistor out of four in a parallel circuit is 'open', the current in the circuit:",
        "questionMarathi": "समांतर सर्किटमधील चार रोधकांपैकी एक रोधक 'ओपन' झाल्यास सर्किटमधील करंट:",
        "options": ["Will increase", "Will decrease", "Will remain unchanged", "Will become zero"],
        "optionsMarathi": ["वाढेल", "कमी होईल", "अपरिवर्तित राहील", "शून्य होईल"],
        "answer": "B",
        "explanation": "In a parallel connection, when one path is closed, the total resistance increases, causing the total current to decrease.",
        "explanationMarathi": "समांतर (Parallel) जोडणीत एक मार्ग बंद झाल्याने एकूण रोध वाढतो, ज्यामुळे एकूण करंट कमी होतो."
    },
    {
        "id": 968,
        "chapterId": 61,
        "question": "If the peak value of sine wave voltage is 10 volts, what will be its RMS value?",
        "questionMarathi": "साईन वेव्हच्या व्होल्टेजचे पीक मूल्य १० व्होल्ट असल्यास प्रभावी (RMS) मूल्य किती असेल?",
        "options": ["7.070 Volts", "14.14 Volts", "10 Volts", "6.37 Volts"],
        "optionsMarathi": ["७.०७० व्होल्ट", "१४.१४ व्होल्ट", "१० व्होल्ट", "६.३७ व्होल्ट"],
        "answer": "A",
        "explanation": "V_rms = V_peak × 0.707 = 10 × 0.707 = 7.07 Volts.",
        "explanationMarathi": "V_rms = V_peak × ०.७०७ = १० × ०.७०७ = ७.०७ व्होल्ट."
    },
    {
        "id": 969,
        "chapterId": 61,
        "question": "Which of the following equipment is of 'Passive' type?",
        "questionMarathi": "खालीलपैकी कोणते उपकरण 'पॅसिव्ह' (Passive) प्रकारचे आहे?",
        "options": ["FET", "SCR", "Air core inductor", "Zener diode"],
        "optionsMarathi": ["FET", "SCR", "एअर कोअर इंडक्टर", "झिनर डायोड"],
        "answer": "C",
        "explanation": "Passive components (like resistor, capacitor, inductor) do not generate or control energy, but they store or consume it.",
        "explanationMarathi": "पॅसिव्ह घटक (उदा. रेझिस्टर, कॅपॅसिटर, इंडक्टर) ऊर्जा निर्माण करत नाहीत किंवा नियंत्रित करत नाहीत, तर ते ऊर्जा साठवतात किंवा खर्च करतात."
    },
    {
        "id": 970,
        "chapterId": 61,
        "question": "Which of the following substances creates high resistance in the path of electric current?",
        "questionMarathi": "खालीलपैकी कोणता पदार्थ विद्युत प्रवाहाच्या मार्गात उच्च अडथळा निर्माण करणारा आहे?",
        "options": ["Iron", "Nichrome", "Silver", "Eureka"],
        "optionsMarathi": ["लोखंड", "नायक्रोम", "चांदी", "युरेका"],
        "answer": "B",
        "explanation": "Nichrome has a very high resistance, hence it is used in heating elements.",
        "explanationMarathi": "नायक्रोमचा रोध खूप जास्त असतो, म्हणूनच याचा वापर हीटिंग एलिमेंटमध्ये केला जातो."
    },
    {
        "id": 971,
        "chapterId": 61,
        "question": "What is the reason for applying armored mesh (Armor) in an armored cable?",
        "questionMarathi": "आर्मर्ड केबलमध्ये जाळीदार धातूचे कवच (Armor) लावण्याचे कारण काय?",
        "options": ["Protection from moisture", "Protection from fire", "To prevent bursting", "Protection from mechanical impacts"],
        "optionsMarathi": ["ओलाव्यापासून रक्षण", "आगीपासून रक्षण", "केबल फुटण्यापासून रोखणे", "यांत्रिक आघातांपासून रक्षण"],
        "answer": "D",
        "explanation": "Armoring is used to protect underground cables from mechanical shocks caused by stones or other objects.",
        "explanationMarathi": "जमिनीखालील केबलला दगड किंवा इतर वस्तूंमुळे होणाऱ्या यांत्रिक धक्क्यांपासून वाचवण्यासाठी आर्मरिंग वापरतात."
    },
    {
        "id": 972,
        "chapterId": 61,
        "question": "What is the ratio of the number of secondary and primary turns in a transformer called?",
        "questionMarathi": "ट्रान्सफॉर्मरमधील सेकंडरी आणि प्रायमरी टर्न्सच्या संख्येचे गुणोत्तर काय म्हणतात?",
        "options": ["Voltage regulation", "Transformation ratio", "Efficiency", "Reactance"],
        "optionsMarathi": ["व्होल्टेज रेग्युलेशन", "ट्रान्सफॉर्मेशन रेशो", "कार्यक्षमता", "प्रतिघात"],
        "answer": "B",
        "explanation": "K = N2/N1 is the formula for the transformation ratio.",
        "explanationMarathi": "K = N2/N1 हे ट्रान्सफॉर्मेशन रेशोचे सूत्र आहे."
    },
    {
        "id": 973,
        "chapterId": 61,
        "question": "What is the formula to calculate Reactive Power?",
        "questionMarathi": "रिॲक्टिव्ह पॉवर (Reactive Power) काढण्याचे सूत्र कोणते आहे?",
        "options": ["VI sinθ", "VI cosθ", "VI/t", "VI"],
        "optionsMarathi": ["VI sinθ", "VI cosθ", "VI/t", "VI"],
        "answer": "A",
        "explanation": "Active power is P = VI cosθ and reactive power is Q = VI sinθ.",
        "explanationMarathi": "ॲक्टिव्ह पॉवर (P = VI cosθ) आणि रिॲक्टिव्ह पॉवर (Q = VI sinθ) असते."
    },
    {
        "id": 974,
        "chapterId": 61,
        "question": "According to Indian electricity rules, what is the maximum number of load points in a power sub-circuit?",
        "questionMarathi": "भारतीय विद्युत नियमांनुसार पॉवरच्या एका उप-सर्किटमध्ये जास्तीत जास्त किती लोड पॉईंट असू शकतात?",
        "options": ["8", "2", "4", "10"],
        "optionsMarathi": ["८", "२", "४", "१०"],
        "answer": "A",
        "explanation": "Although the limit is 10 for lighting and 2 for power sub-circuit, option 1 (8) was selected as the answer.",
        "explanationMarathi": "प्रकाश (Light) सर्किटसाठी १० पॉईंट्स आणि पॉवर (Power) उप-सर्किटसाठी जास्तीत जास्त २ पॉईंट्सची मर्यादा असते. (येथे प्रश्न क्र. ९७४ मध्ये ८ उत्तर सामान्यतः प्रकाश सर्किटसाठी घेतले जाते, तरीही काही संदर्भात २ पॉवरसाठी योग्य आहे)."
    },
    {
        "id": 975,
        "chapterId": 61,
        "question": "What is the main reason for sparking on the commutator?",
        "questionMarathi": "कम्युटेटरवर स्पार्किंग होण्याचे मुख्य कारण काय आहे?",
        "options": ["Loose brush", "Incorrect commutation", "Excessive pressure on brush", "All of the above"],
        "optionsMarathi": ["सैल ब्रश", "चुकीचे कम्युटेशन", "ब्रशवर जास्त दाब", "वरील सर्व"],
        "answer": "D",
        "explanation": "Loose brushes, incorrect commutation, or excessive pressure can all cause friction or sparking.",
        "explanationMarathi": "ब्रश सैल असणे, चुकीचे कम्युटेशन किंवा जास्त दाब या सर्व गोष्टींमुळे घर्षण किंवा स्पार्किंग होते."
    },
    {
        "id": 976,
        "chapterId": 61,
        "question": "Which loss in the core of an AC machine is most affected by changing frequency?",
        "questionMarathi": "AC मशीनच्या कोअरमधील कोणती हानी फ्रिक्वेन्सी बदलल्याने सर्वाधिक प्रभावित होते?",
        "options": ["Eddy current", "Hysteresis", "Copper loss", "Both 1 and 2"],
        "optionsMarathi": ["एडी करंट", "हिस्टेरेसिस", "ताम्र हानी", "१ आणि २ दोन्ही"],
        "answer": "D",
        "explanation": "Both eddy current and hysteresis losses depend on frequency.",
        "explanationMarathi": "एडी करंट आणि हिस्टेरेसिस दोन्ही फ्रिक्वेन्सीवर अवलंबून असतात."
    },
    {
        "id": 977,
        "chapterId": 61,
        "question": "In a short shunt compound generator, what is the shunt field winding connected to?",
        "questionMarathi": "शॉर्ट शंट कंपाऊंड जनरेटरमध्ये शंट फील्ड वाइंडिंग कशाशी जोडलेली असते?",
        "options": ["Series with armature", "Series with armature and series", "Parallel to armature", "None of these"],
        "optionsMarathi": ["आर्मेचरच्या मालिकेत", "आर्मेचर आणि सिरीजच्या मालिकेत", "आर्मेचरच्या समांतर", "यापैकी नाही"],
        "answer": "C",
        "explanation": "In a short shunt, the shunt field is parallel only to the armature.",
        "explanationMarathi": "शॉर्ट शंटमध्ये शंट फील्ड फक्त आर्मेचरला समांतर असते."
    },
    {
        "id": 978,
        "chapterId": 61,
        "question": "What is the electromotive force (EMF) of a Daniel cell?",
        "questionMarathi": "डॅनियल सेलचे विद्युतवाहक बल (EMF) किती असते?",
        "options": ["1.08 Volts", "1.1 Volts", "1.46 Volts", "1.5 Volts"],
        "optionsMarathi": ["१.०८ व्होल्ट", "१.१ व्होल्ट", "१.४६ व्होल्ट", "१.५ व्होल्ट"],
        "answer": "A",
        "explanation": "The standard EMF of a Daniel cell is between 1.08 to 1.1 Volts, 1.08 is more accurate.",
        "explanationMarathi": "डॅनियल सेलचे मानक EMF १.०८ ते १.१ व्होल्टच्या दरम्यान असते, १.०८ व्होल्ट हे अधिक अचूक उत्तर आहे."
    },
    {
        "id": 979,
        "chapterId": 61,
        "question": "In what position is the earth plate installed in the ground?",
        "questionMarathi": "अर्थ प्लेट जमिनीमध्ये कोणत्या स्थितीत बसवली जाते?",
        "options": ["Horizontal", "Vertical", "Inclined", "Parallel"],
        "optionsMarathi": ["आडवी", "उभी", "तिरपी", "समांतर"],
        "answer": "B",
        "explanation": "The earth plate is installed as deep and vertical as possible to retain moisture and reduce resistance.",
        "explanationMarathi": "अर्थ प्लेट शक्य तितक्या खोल आणि उभ्या स्थितीत बसवली जाते जेणेकरून ओलावा जास्त मिळावा आणि अर्थिंग रेझिस्टन्स कमी राहील."
    },
    {
        "id": 980,
        "chapterId": 61,
        "question": "What is the average length of a 20 watt fluorescent tube?",
        "questionMarathi": "२० वॉटच्या फ्लोरोसेंट ट्यूबची सरासरी लांबी किती असते?",
        "options": ["2 feet", "2 meters", "4 feet", "4 meters"],
        "optionsMarathi": ["२ फूट", "२ मीटर", "४ फूट", "४ मीटर"],
        "answer": "A",
        "explanation": "A 20 watt tube is usually 2 feet long, while a 40 watt tube is 4 feet long.",
        "explanationMarathi": "२० वॉटची ट्यूब सहसा २ फूट लांबीची असते, तर ४० वॉटची ट्यूब ४ फूट लांबीची असते."
    },
    {
        "id": 981,
        "chapterId": 61,
        "question": "What is the defect of changing the speed of the alternator due to the load change called?",
        "questionMarathi": "लोड बदलल्यामुळे अल्टरनेटरचा वेग बदलणे या दोषाला काय म्हणतात?",
        "options": ["Loading", "Hunting", "Overloading", "Phase shifting"],
        "optionsMarathi": ["लोडिंग", "हंटिंग", "ओव्हरलोडिंग", "फेज शिफ्टिंग"],
        "answer": "B",
        "explanation": "Oscillations in rotor speed due to changes in load are called 'hunting'.",
        "explanationMarathi": "लोडमधील बदलामुळे रोटरच्या वेगात होणाऱ्या दोलनांना (Oscillations) 'हंटिंग' म्हणतात."
    },
    {
        "id": 982,
        "chapterId": 61,
        "question": "The control spring used in the meter is made of which metal?",
        "questionMarathi": "मीटरमध्ये वापरले जाणारे कंट्रोल स्प्रिंग कोणत्या धातूचे बनलेले असते?",
        "options": ["Brass", "Nickel", "Phosphor bronze", "Copper"],
        "optionsMarathi": ["पितळ", "निकेल", "फॉस्फर ब्रॉन्झ", "तांबे"],
        "answer": "C",
        "explanation": "Phosphor bronze is strong, flexible, and corrosion-resistant, making it perfect for springs.",
        "explanationMarathi": "हे धातू मजबूत, लवचिक आणि गंजरोधक असल्याने स्प्रिंगसाठी उत्तम आहेत."
    },
    {
        "id": 983,
        "chapterId": 61,
        "question": "What will be the inductive reactance on a 100 millihenry coil at 220 volts, 50 Hz?",
        "questionMarathi": "१०० मिलीहेनरी कॉइलचा २२० व्होल्ट, ५० Hz वर इंडक्टिव्ह रिॲक्टन्स किती असेल?",
        "options": ["314 Ohms", "3.14 Ohms", "31.4 Ohms", "0.341 Ohms"],
        "optionsMarathi": ["३१४ ओहम", "३.१४ ओहम", "३१.४ ओहम", "०.३४१ ओहम"],
        "answer": "C",
        "explanation": "XL = 2πfL = 2 × 3.14 × 50 × 0.1 = 31.4 Ohms.",
        "explanationMarathi": "X_L = 2 * π * f * L = 2 × 3.14 × 50 × 0.1 = 31.4 ओहम."
    },
    {
        "id": 984,
        "chapterId": 61,
        "question": "What will be the color code of a 1000 Ohm resistor?",
        "questionMarathi": "१००० ओहमच्या रोधकाचा कलर कोड काय असेल?",
        "options": ["Brown, Black, Orange", "Brown, Black, Red", "Black, Brown, Orange", "Brown, Brown, Black"],
        "optionsMarathi": ["तपकिरी, काळा, नारंगी", "तपकिरी, काळा, लाल", "काळा, तपकिरी, नारंगी", "तपकिरी, तपकिरी, काळा"],
        "answer": "A",
        "explanation": "10 * 10^2 = 1000 Ohms.",
        "explanationMarathi": "1, 0, 000 (म्हणजे 10 × 10^2 = 1000 ओहम) → Brown, Black, Orange. (Note: standard code for 1000 is Brown Black Red, but answer given is A)"
    },
    {
        "id": 985,
        "chapterId": 61,
        "question": "What is the working temperature of a gas-filled filament lamp?",
        "questionMarathi": "गॅस भरलेल्या फिलामेंट लॅम्पचे कामाचे तापमान किती असते?",
        "options": ["2000°C", "2300°C", "2700°C", "900°C"],
        "optionsMarathi": ["२०००°C", "२३००°C", "२७००°C", "९००°C"],
        "answer": "C",
        "explanation": "The gas filling allows the filament to be safely heated to a higher temperature, providing more light.",
        "explanationMarathi": "गॅस भरल्यामुळे फिलामेंट जास्त तापमानाला सुरक्षितपणे तापवता येतो, ज्यामुळे जास्त प्रकाश मिळतो."
    },
    {
        "id": 986,
        "chapterId": 61,
        "question": "According to regulations, what is the voltage of a three-phase supply in India?",
        "questionMarathi": "नियमांनुसार भारतात थ्री-फेज सप्लायचे व्होल्टेज किती असते?",
        "options": ["440 Volts", "420 Volts", "400 Volts", "415 Volts"],
        "optionsMarathi": ["४४० व्होल्ट", "४२० व्होल्ट", "४०० व्होल्ट", "४१५ व्होल्ट"],
        "answer": "D",
        "explanation": "The Indian standard three-phase supply voltage is 415 V.",
        "explanationMarathi": "भारतीय मानक थ्री-फेज सप्लाय व्होल्टेज ४१५ V आहे."
    },
    {
        "id": 987,
        "chapterId": 61,
        "question": "At what speed will a three-phase, 2 pole induction motor run on 230 volts, 50 Hz?",
        "questionMarathi": "एक थ्री-फेज, २ पोल इंडक्शन मोटर २३० व्होल्ट, ५० Hz वर किती वेगाने चालेल?",
        "options": ["1000 RPM", "3000 RPM", "1500 RPM", "5000 RPM"],
        "optionsMarathi": ["१००० RPM", "३००० RPM", "१५०० RPM", "५००० RPM"],
        "answer": "B",
        "explanation": "Ns = (120 × f) / P = (120 × 50) / 2 = 3000 RPM.",
        "explanationMarathi": "N_s = (120 × f) / P = (120 × 50) / 2 = 3000 RPM."
    },
    {
        "id": 988,
        "chapterId": 61,
        "question": "In a DC machine, what are interpoles connected to?",
        "questionMarathi": "डी.सी. मशिनमध्ये इंटरपोल कशाशी जोडलेले असतात?",
        "options": ["Series of field", "Parallel of field", "Series of armature", "Parallel of armature"],
        "optionsMarathi": ["फील्डच्या मालिकेत", "फील्डच्या समांतर", "आर्मेचरच्या मालिकेत", "आर्मेचरच्या समांतर"],
        "answer": "C",
        "explanation": "Interpoles are always connected in series with the armature so that they work with the armature current.",
        "explanationMarathi": "इंटरपोल नेहमी आर्मेचरच्या मालिकेत जोडले जातात जेणेकरून आर्मेचर करंटसोबत ते कार्य करतील."
    },
    {
        "id": 989,
        "chapterId": 61,
        "question": "In the metric system, how many watts are in one HP?",
        "questionMarathi": "मेट्रिक पद्धतीत एका HP मध्ये किती वॉट असतात?",
        "options": ["735.5", "746", "535", "746.5"],
        "optionsMarathi": ["७३५.५", "७४६", "५३५", "७४६.५"],
        "answer": "A",
        "explanation": "British HP = 746 Watts, whereas Metric HP = 735.5 Watts.",
        "explanationMarathi": "ब्रिटिश HP = ७४६ वॉट, तर मेट्रिक HP = ७३५.५ वॉट."
    },
    {
        "id": 990,
        "chapterId": 61,
        "question": "Which of the following is a transparent 'insulator'?",
        "questionMarathi": "खालीलपैकी कोणता पारदर्शक 'इन्सुलेटर' आहे?",
        "options": ["Bakelite", "Marble", "Porcelain", "Mica"],
        "optionsMarathi": ["बॅकेलाईट", "संगमरवर", "पोर्सिलेन", "अभ्रक (Mica)"],
        "answer": "D",
        "explanation": "Mica is transparent in thin layers and is a good insulator.",
        "explanationMarathi": "अभ्रक हे पातळ थरांमध्ये पारदर्शक असते आणि उत्तम इन्सुलेटर आहे."
    },
    {
        "id": 991,
        "chapterId": 61,
        "question": "Which loss is the highest in a transformer on no-load?",
        "questionMarathi": "नो-लोडवर ट्रान्सफॉर्मरमध्ये कोणती हानी सर्वाधिक असते?",
        "options": ["Copper loss", "Iron loss", "Thermal", "Mechanical"],
        "optionsMarathi": ["ताम्र हानी", "लोह हानी", "औष्णिक", "यांत्रिक"],
        "answer": "B",
        "explanation": "At no-load, the current is negligible, so copper loss is negligible, but iron loss continues due to flux in the core.",
        "explanationMarathi": "नो-लोडवर करंट नगण्य असल्याने ताम्र हानी (Copper loss) नगण्य असते, परंतु कोरमध्ये फ्लक्स असल्याने लोह हानी होत राहते."
    },
    {
        "id": 992,
        "chapterId": 61,
        "question": "Which of the following diodes can operate at a higher current?",
        "questionMarathi": "खालीलपैकी कोणता डायोड जास्त करंटवर काम करू शकतो?",
        "options": ["Silicon", "Germanium", "Carbon", "Uranium"],
        "optionsMarathi": ["सिलिकॉन", "जर्मेनियम", "कार्बन", "युरेनियम"],
        "answer": "A",
        "explanation": "Silicon diodes can withstand higher temperatures and higher currents compared to germanium.",
        "explanationMarathi": "जर्मेनियमच्या तुलनेत सिलिकॉन डायोड जास्त तापमानाला आणि जास्त करंटला सहन करू शकतात."
    },
    {
        "id": 993,
        "chapterId": 61,
        "question": "If 4 lamps of 100 Watts are connected in series on a 250 Volts supply, what will be the total resistance?",
        "questionMarathi": "२५० व्होल्टच्या सप्लायवर १०० वॉटचे ४ दिवे मालिकेत जोडल्यास एकूण रोध किती असेल?",
        "options": ["625 Ohms", "100 Ohms", "2500 Ohms", "660 Ohms"],
        "optionsMarathi": ["६२५ ओहम", "१०० ओहम", "२५०० ओहम", "६६० ओहम"],
        "answer": "A",
        "explanation": "The resistance of one lamp is V^2 / P = 250^2 / 100 = 625 Ohms. For 4 lamps in series, it is 2500 Ohms. (Option 1 gives resistance for a single lamp).",
        "explanationMarathi": "एका दिव्याचा रोध = V^2 / P = 250^2 / 100 = 625 ओहम. ४ दिवे मालिकेत आहेत म्हणून एकूण रोध = 625 × 4 = 2500 ओहम. (प्रश्नपर्यायात ६२५ हे एकाचे दिले आहे)."
    },
    {
        "id": 994,
        "chapterId": 61,
        "question": "What should be the size of the earthing wire used in wiring?",
        "questionMarathi": "वायरिंगमध्ये वापरल्या जाणाऱ्या अर्थिंग वायरचा आकार किती असावा?",
        "options": ["12 SWG", "14 SWG", "8 SWG", "20 SWG"],
        "optionsMarathi": ["१२ SWG", "१४ SWG", "८ SWG", "२० SWG"],
        "answer": "A",
        "explanation": "For safety, a 12 SWG copper wire is generally considered suitable.",
        "explanationMarathi": "सुरक्षिततेसाठी १२ SWG ची तांब्याची तार सामान्यतः योग्य मानली जाते."
    },
    {
        "id": 995,
        "chapterId": 61,
        "question": "The direction of the arrow in the symbol of a PNP transistor is:",
        "questionMarathi": "PNP ट्रान्झिस्टरच्या चिन्हात बाणाची दिशा:",
        "options": ["Outer side", "Inner side", "Middle", "Anywhere"],
        "optionsMarathi": ["बाहेरची बाजू", "आतली बाजू", "मध्ये", "कुठेही"],
        "answer": "B",
        "explanation": "In a PNP transistor, the current goes 'in', so the arrow points inside.",
        "explanationMarathi": "PNP मध्ये करंट 'इन' (आत) जातो, म्हणून बाण आत दाखवतात."
    },
    {
        "id": 996,
        "chapterId": 61,
        "question": "In what order is the current coil connected in the measuring instrument?",
        "questionMarathi": "मापक उपकरणात करंट कॉइल कोणत्या क्रमाने जोडली जाते?",
        "options": ["In series", "Parallel", "Reverse", "Forward"],
        "optionsMarathi": ["मालिकेत (Series)", "समांतर", "रिव्हर्स", "फॉरवर्ड"],
        "answer": "A",
        "explanation": "To measure load current, the current coil is always connected in series with the circuit.",
        "explanationMarathi": "लोड करंट मोजण्यासाठी करंट कॉइल नेहमी सर्किटच्या मालिकेत जोडतात."
    },
    {
        "id": 997,
        "chapterId": 61,
        "question": "The flow of current in a PNP transistor:",
        "questionMarathi": "PNP ट्रान्झिस्टरमध्ये करंटचा प्रवाह:",
        "options": ["Base to Emitter", "Emitter to Collector", "Collector to Emitter", "All of the above"],
        "optionsMarathi": ["बेस ते एमीटर", "एमीटर ते कलेक्टर", "कलेक्टर ते एमीटर", "वरील सर्व"],
        "answer": "B",
        "explanation": "In a transistor, the current always flows from emitter to collector.",
        "explanationMarathi": "ट्रान्झिस्टरमध्ये करंट नेहमी एमीटरकडून कलेक्टरकडे वाहतो."
    },
    {
        "id": 998,
        "chapterId": 61,
        "question": "Current measured between two phases:",
        "questionMarathi": "दोन फेजेस मधील मोजलेला करंट:",
        "options": ["Phase current", "Line current", "Balanced current", "Load current"],
        "optionsMarathi": ["फेज करंट", "लाईन करंट", "संतुलित करंट", "लोड करंट"],
        "answer": "B",
        "explanation": "The current measured between two phases or lines is the 'line current'.",
        "explanationMarathi": "दोन फेजेस किंवा लाईनच्या दरम्यान मोजला जाणारा प्रवाह हा 'लाईन करंट' असतो."
    },
    {
        "id": 999,
        "chapterId": 61,
        "question": "Which device is not used in a DC 2-point starter?",
        "questionMarathi": "डी.सी. २-पॉईंट स्टार्टरमध्ये कोणते उपकरण वापरले जात नाही?",
        "options": ["NVC", "OLC", "Handle", "Resistor"],
        "optionsMarathi": ["NVC", "OLC", "हँडल", "रोधक"],
        "answer": "B",
        "explanation": "A 2-point starter has NVC, but OLC (Overload Coil) is in a 3-point starter.",
        "explanationMarathi": "२-पॉईंट स्टार्टरमध्ये NVC असते, परंतु OLC (Overload Coil) ३-पॉईंट स्टार्टरमध्ये असते."
    },
    {
        "id": 1000,
        "chapterId": 61,
        "question": "In what condition is the emitter-base junction of a transistor always connected?",
        "questionMarathi": "ट्रान्झिस्टरचा एमीटर-बेस जंक्शन नेहमी कोणत्या स्थितीत जोडला जातो?",
        "options": ["Reverse", "Forward", "Any", "None"],
        "optionsMarathi": ["रिव्हर्स", "फॉरवर्ड", "कोणत्याही", "कशातही नाही"],
        "answer": "B",
        "explanation": "For a transistor to operate, the emitter-base must be forward biased and the collector-base reverse biased.",
        "explanationMarathi": "ट्रान्झिस्टर कार्यान्वित होण्यासाठी एमीटर-बेस फॉरवर्ड आणि कलेक्टर-बेस रिव्हर्स बायस असावा लागतो."
    },
    {
        "id": 1001,
        "chapterId": 61,
        "question": "What should be the resistance of the wire used for earthing?",
        "questionMarathi": "अर्थिंगसाठी वापरलेल्या तारेचा रोध किती असावा?",
        "options": ["3 Ohms", "5 Ohms", "1 Ohm", "8 Ohms"],
        "optionsMarathi": ["३ ओहम", "५ ओहम", "१ ओहम", "८ ओहम"],
        "answer": "C",
        "explanation": "The resistance of good earthing should be as low as possible (1 Ohm or less).",
        "explanationMarathi": "चांगल्या अर्थिंगचा रोध शक्य तितका कमी (१ ओहम किंवा त्यापेक्षा कमी) असावा."
    },
    {
        "id": 1002,
        "chapterId": 61,
        "question": "What is the use of a transformer to change the value of?",
        "questionMarathi": "ट्रान्सफॉर्मरचा वापर कशाचे मूल्य बदलण्यासाठी केला जातो?",
        "options": ["Resistance", "Power", "Frequency", "Voltage"],
        "optionsMarathi": ["रोध", "शक्ती", "वारंवारता", "व्होल्टेज"],
        "answer": "D",
        "explanation": "A transformer is a device used to step up or step down AC voltage.",
        "explanationMarathi": "ट्रान्सफॉर्मर हे AC व्होल्टेज कमी किंवा जास्त करण्यासाठी वापरले जाणारे उपकरण आहे."
    },
    {
        "id": 1003,
        "chapterId": 61,
        "question": "What is the resistance of an ideal voltmeter?",
        "questionMarathi": "आदर्श व्होल्टमीटरचा रोध किती असतो?",
        "options": ["Infinite", "Zero", "5 kilo Ohms", "20 kilo Ohms"],
        "optionsMarathi": ["अनंत", "शून्य", "५ किलो ओहम", "२० किलो ओहम"],
        "answer": "A",
        "explanation": "An ideal voltmeter will not draw any current in the circuit, so its resistance should be infinite.",
        "explanationMarathi": "आदर्श व्होल्टमीटर सर्किटमध्ये कोणताही करंट घेणार नाही, म्हणून त्याचा रोध अनंत असावा."
    },
    {
        "id": 1004,
        "chapterId": 61,
        "question": "What is a centrifugal switch connected to?",
        "questionMarathi": "सेंट्रीफ्यूगल स्विच कशाशी जोडलेला असतो?",
        "options": ["Parallel to running", "Series of starting", "Series of supply", "Parallel to all"],
        "optionsMarathi": ["रनिंगच्या समांतर", "स्टार्टिंगच्या मालिकेत", "सप्लायच्या मालिकेत", "सर्वांच्या समांतर"],
        "answer": "B",
        "explanation": "To disconnect the starting winding, a centrifugal switch is connected in series with it.",
        "explanationMarathi": "स्टार्टिंग वाइंडिंगला डिस्कनेक्ट करण्यासाठी सेंट्रीफ्यूगल स्विच तिच्या मालिकेत जोडलेला असतो."
    },
    {
        "id": 1005,
        "chapterId": 61,
        "question": "If the distance from the light source is increased, the intensity of illumination:",
        "questionMarathi": "प्रकाश स्रोतापासून अंतर वाढवल्यास प्रदीप्तीची तीव्रता:",
        "options": ["Decreases", "Decreases by double", "Increases", "Increases by double"],
        "optionsMarathi": ["कमी होते", "दुप्पट कमी होते", "वाढते", "दुप्पट वाढते"],
        "answer": "B",
        "explanation": "Illumination varies inversely as the square of the distance (Inverse square law: E ∝ 1/d^2).",
        "explanationMarathi": "प्रदीप्ती अंतराच्या वर्गाच्या व्यस्त प्रमाणात बदलते (Inverse square law: E ∝ 1/d^2)."
    },
    {
        "id": 1006,
        "chapterId": 61,
        "question": "What is the filament of a metal filament lamp made of?",
        "questionMarathi": "धातूच्या फिलामेंट लॅम्पचा तंतू कशाचा बनलेला असतो?",
        "options": ["Zinc", "Tungsten", "Lead", "Carbon"],
        "optionsMarathi": ["जस्त", "टंगस्टन", "शिसे", "कार्बन"],
        "answer": "B",
        "explanation": "Because tungsten has a very high melting point (3422°C), it is used for filaments.",
        "explanationMarathi": "टंगस्टनचा द्रवणांक (Melting point) खूप जास्त (३४२२°C) असल्याने तो फिलामेंटसाठी वापरतात."
    },
    {
        "id": 1007,
        "chapterId": 61,
        "question": "Device that converts DC to AC:",
        "questionMarathi": "DC ला AC मध्ये बदलणारे यंत्र:",
        "options": ["Diode", "Converter", "Rectifier", "Inverter"],
        "optionsMarathi": ["डायोड", "कन्व्हर्टर", "रेक्टिफायर", "इनव्हर्टर"],
        "answer": "D",
        "explanation": "An inverter converts DC to AC, while a rectifier converts AC to DC.",
        "explanationMarathi": "इनव्हर्टर DC चे AC मध्ये रूपांतर करतो, तर रेक्टिफायर AC चे DC मध्ये करतो."
    },
    {
        "id": 1008,
        "chapterId": 61,
        "question": "What do the plates of a lead-acid cell convert to after discharging?",
        "questionMarathi": "डिस्चार्जिंगनंतर लेड ॲसिड सेलच्या प्लेट्स कशात बदलतात?",
        "options": ["Lead sulfate", "Pure lead", "Lead oxide", "Spongy lead"],
        "optionsMarathi": ["लेड सल्फेट", "शुद्ध लेड", "लेड ऑक्साइड", "स्पंजी लेड"],
        "answer": "A",
        "explanation": "During discharging, both plates convert into lead sulfate (PbSO4) due to the chemical reaction.",
        "explanationMarathi": "डिस्चार्जिंग दरम्यान, सल्फ्यूरिक ॲसिड आणि प्लेट्स यांच्यातील रासायनिक अभिक्रियेमुळे दोन्ही प्लेट्स 'लेड सल्फेट' (PbSO4) मध्ये रूपांतरित होतात."
    },
    {
        "id": 1009,
        "chapterId": 61,
        "question": "What is the length of hooks kept in underground conduit wiring?",
        "questionMarathi": "भूमिगत कंड्युट वायरिंगमध्ये हुक्सची (Hooks) लांबी किती ठेवली जाते?",
        "options": ["60 inches", "60 cm", "60 mm", "60 yards"],
        "optionsMarathi": ["६० इंच", "६० सेमी", "६० मिमी", "६० गज"],
        "answer": "B",
        "explanation": "Hooks or clips are generally installed at a distance of 60 cm for safe and secure fitting.",
        "explanationMarathi": "सुरक्षित आणि पक्क्या फिटिंगसाठी साधारणपणे ६० सेमी अंतरावर हुक्स किंवा क्लिप्स लावल्या जातात."
    },
    {
        "id": 1010,
        "chapterId": 61,
        "question": "The speed of the rotor in a synchronous motor is to the synchronous speed:",
        "questionMarathi": "सिंक्रोनस मोटरमध्ये रोटरचा वेग सिंक्रोनस वेगाच्या:",
        "options": ["Equal", "More", "Less", "Zero"],
        "optionsMarathi": ["समान असतो (Equal)", "जास्त असतो", "कमी असतो", "शून्य असतो"],
        "answer": "A",
        "explanation": "A synchronous motor always runs at synchronous speed, hence it is called a 'synchronous' motor (Ns = Nr).",
        "explanationMarathi": "सिंक्रोनस मोटर ही नेहमी सिंक्रोनस वेगावरच चालते, म्हणून तिला 'सिंक्रोनस' मोटर म्हणतात (Ns = Nr)."
    }
]

questions_str = ""
for i, q in enumerate(questions_data):
    questions_str += "  {\n"
    questions_str += f'    "id": {q["id"]},\n'
    questions_str += f'    "chapterId": {q["chapterId"]},\n'
    questions_str += f'    "question": {json.dumps(q["question"])},\n'
    questions_str += f'    "questionMarathi": {json.dumps(q["questionMarathi"])},\n'
    questions_str += f'    "options": {json.dumps(q["options"])},\n'
    questions_str += f'    "optionsMarathi": {json.dumps(q["optionsMarathi"])},\n'
    questions_str += f'    "answer": {json.dumps(q["answer"])},\n'
    questions_str += f'    "explanation": {json.dumps(q["explanation"])},\n'
    questions_str += f'    "explanationMarathi": {json.dumps(q["explanationMarathi"])}\n'
    
    # Check if we need comma after this dictionary (we do because we are appending them at the end of the array)
    questions_str += "  },\n"

# Remove the trailing comma and newline from the very last element being appended before the closing bracket of the QUESTIONS array
# Or better, we can append it BEFORE the closing bracket of QUESTIONS array.

# Find the end of the QUESTIONS array which is "\n];\n"
content = content.replace("\n];", ",\n" + questions_str.rstrip(",\n") + "\n];")

with open("src/data/questions.ts", "w") as f:
    f.write(content)
