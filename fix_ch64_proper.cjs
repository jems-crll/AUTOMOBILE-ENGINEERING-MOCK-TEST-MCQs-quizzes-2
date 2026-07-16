const fs = require('fs');

const qs = [
  {
    chapterId: 64,
    question: "What is the symbol for Magnetic Flux Density?",
    questionMarathi: "चुंबकीय फ्लक्स घनतेचे (Magnetic Flux Density) प्रतीक कोणते आहे?",
    options: ["B", "α", "Φ", "ρ"],
    optionsMarathi: ["B", "α", "Φ", "ρ"],
    answer: "A",
    explanation: "The symbol for magnetic flux density is B and its SI unit is Tesla (T).",
    explanationMarathi: "चुंबकीय फ्लक्स घनतेचे प्रतीक B असून त्याचे SI एकक Tesla (T) आहे."
  },
  {
    chapterId: 64,
    question: "In an AC circuit, if Inductive Reactance (XL) is greater than Capacitive Reactance (XC), what is the Power Factor?",
    questionMarathi: "AC परिपथात Inductive Reactance (XL) हे Capacitive Reactance (XC) पेक्षा जास्त असल्यास Power Factor कसा असतो?",
    options: ["Unity", "Zero", "Leading", "Lagging"],
    optionsMarathi: ["Unity", "Zero", "Leading", "Lagging"],
    answer: "D",
    explanation: "If XL > XC, the circuit is inductive. Therefore, the current lags behind the voltage (Lagging).",
    explanationMarathi: "XL > XC असल्यास परिपथ Inductive असतो. त्यामुळे विद्युतप्रवाह (Current) हा व्होल्टेजच्या मागे राहतो (Lagging)."
  },
  {
    chapterId: 64,
    question: "Which winding is used to keep the neutral point stable in a Star-Star connection?",
    questionMarathi: "स्टार–स्टार (Star-Star) जोडणीत न्यूट्रल बिंदू स्थिर ठेवण्यासाठी कोणती वाइंडिंग वापरली जाते?",
    options: ["Scott", "Tertiary", "Inter Star", "Delta"],
    optionsMarathi: ["Scott", "Tertiary", "Inter Star", "Delta"],
    answer: "B",
    explanation: "A Tertiary (Delta) Winding is used to stabilize the neutral in a Star-Star transformer.",
    explanationMarathi: "स्टार-स्टार ट्रान्सफॉर्मरमध्ये न्यूट्रल स्थिर ठेवण्यासाठी Tertiary (Delta) Winding वापरली जाते."
  },
  {
    chapterId: 64,
    question: "Which property in a magnetic circuit acts opposite to resistance?",
    questionMarathi: "चुंबकीय परिपथात प्रतिरोधाच्या (Resistance) विरुद्ध कार्य करणारा गुणधर्म कोणता?",
    options: ["Permeance", "Impedance", "Reactance", "Conductance"],
    optionsMarathi: ["Permeance", "Impedance", "Reactance", "Conductance"],
    answer: "A",
    explanation: "Permeance is the property opposite to Reluctance in a magnetic circuit.",
    explanationMarathi: "Magnetic Circuit मध्ये Reluctance चा उलटा गुणधर्म Permeance असतो."
  },
  {
    chapterId: 64,
    question: "How many slip rings are required in a Rotating Field type Alternator?",
    questionMarathi: "Rotating Field प्रकारच्या Alternator मध्ये किती Slip Rings लागतात?",
    options: ["Equal to Poles", "Only 2", "Equal to Phases", "Any number"],
    optionsMarathi: ["Pole इतके", "फक्त 2", "Phase इतके", "कितीही"],
    answer: "B",
    explanation: "2 slip rings are used in an alternator to supply DC to the rotor.",
    explanationMarathi: "Rotor ला DC पुरवण्यासाठी Alternator मध्ये 2 Slip Rings वापरले जातात."
  },
  {
    chapterId: 64,
    question: "Why is armouring used in an underground cable?",
    questionMarathi: "भूमिगत केबलमध्ये जाळीदार कवच (Armouring) का वापरले जाते?",
    options: ["Protection from moisture", "Protection from atmosphere", "Protection from mechanical shocks", "Protection from overload"],
    optionsMarathi: ["ओलाव्यापासून संरक्षण", "वातावरणापासून संरक्षण", "यांत्रिक धक्क्यांपासून संरक्षण", "Overload पासून संरक्षण"],
    answer: "C",
    explanation: "Armouring protects the cable from external mechanical damage.",
    explanationMarathi: "Armouring केबलला बाह्य यांत्रिक नुकसानापासून वाचवते."
  },
  {
    chapterId: 64,
    question: "Which of the following cells provides a continuous and constant voltage (EMF)?",
    questionMarathi: "खालीलपैकी कोणता सेल सतत आणि स्थिर विद्युतदाब (EMF) देतो?",
    options: ["Leclanche Cell", "Daniell Cell", "Voltaic Cell", "Silver Oxide Cell"],
    optionsMarathi: ["Leclanche Cell", "Daniell Cell", "Voltaic Cell", "Silver Oxide Cell"],
    answer: "B",
    explanation: "The Daniell Cell gives a stable EMF, so it is used in laboratories.",
    explanationMarathi: "Daniell Cell स्थिर EMF देतो म्हणून प्रयोगशाळेत वापरला जातो."
  },
  {
    chapterId: 64,
    question: "Which parameter indicates total conductance in an AC circuit?",
    questionMarathi: "AC परिपथात एकूण चालकता (Total Conductance) दर्शविणारे परिमाण कोणते?",
    options: ["Susceptance", "Admittance", "Conductance", "Reactance"],
    optionsMarathi: ["Susceptance", "Admittance", "Conductance", "Reactance"],
    answer: "B",
    explanation: "Admittance = Conductance + Susceptance.",
    explanationMarathi: "Admittance = Conductance + Susceptance"
  },
  {
    chapterId: 64,
    question: "What is the property of an AC circuit that opposes a change in current called?",
    questionMarathi: "AC परिपथाचा असा गुणधर्म जो प्रवाहातील बदलास विरोध करतो, त्याला काय म्हणतात?",
    options: ["Reactance", "Induction", "Inductance", "Permeance"],
    optionsMarathi: ["Reactance", "Induction", "Inductance", "Permeance"],
    answer: "C",
    explanation: "Inductance is the property that opposes a change in current.",
    explanationMarathi: "Inductance हा प्रवाहातील बदलास विरोध करणारा गुणधर्म आहे."
  },
  {
    chapterId: 64,
    question: "Which motor is used in wall clocks?",
    questionMarathi: "भिंतीवरील घड्याळात कोणती मोटर वापरली जाते?",
    options: ["Universal", "Shaded Pole", "Split Phase", "Capacitor Start"],
    optionsMarathi: ["Universal", "Shaded Pole", "Split Phase", "Capacitor Start"],
    answer: "B",
    explanation: "Shaded Pole Motors are used in small AC clocks.",
    explanationMarathi: "लहान AC घड्याळांमध्ये Shaded Pole Motor वापरली जाते."
  },
  {
    chapterId: 64,
    question: "In an attraction type instrument, the torque produced is proportional to what?",
    questionMarathi: "आकर्षण प्रकारच्या (Attraction Type) यंत्रात निर्माण होणारा टॉर्क कशाच्या प्रमाणात असतो?",
    options: ["Current", "Voltage", "Voltage²", "Current²"],
    optionsMarathi: ["Current", "Voltage", "Voltage²", "Current²"],
    answer: "D",
    explanation: "In an Attraction Type Instrument, torque is proportional to Current².",
    explanationMarathi: "Attraction Type Instrument मध्ये टॉर्क Current² च्या प्रमाणात असतो."
  },
  {
    chapterId: 64,
    question: "In which of the following lamps is the Stroboscopic Effect seen?",
    questionMarathi": "खालीलपैकी कोणत्या दिव्यात Stroboscopic Effect दिसतो?",
    options: ["Carbon Filament", "Fluorescent Tube", "Mercury Argon", "Mercury Argon Tungsten"],
    optionsMarathi: ["Carbon Filament", "Fluorescent Tube", "Mercury Argon", "Mercury Argon Tungsten"],
    answer: "B",
    explanation: "The Stroboscopic Effect is seen in a Fluorescent Tube.",
    explanationMarathi: "Fluorescent Tube मध्ये Stroboscopic Effect दिसतो."
  },
  {
    chapterId: 64,
    question: "What is the unit of sensitivity of a voltmeter?",
    questionMarathi": "Voltmeter च्या संवेदनशीलतेचे (Sensitivity) एकक काय आहे?",
    options: ["Ohm Meter", "Ohm × Volt", "Volt/Ohm", "Ohm/Volt"],
    optionsMarathi: ["Ohm Meter", "Ohm × Volt", "Volt/Ohm", "Ohm/Volt"],
    answer: "D",
    explanation: "Voltmeter Sensitivity = Ohm per Volt (Ω/V).",
    explanationMarathi: "Voltmeter Sensitivity = Ohm per Volt (Ω/V)"
  },
  {
    chapterId: 64,
    question: "What is the starting torque of a synchronous motor?",
    questionMarathi": "Synchronous Motor चा Starting Torque किती असतो?",
    options: ["Very High", "Zero", "Low", "Infinite"],
    optionsMarathi: ["खूप जास्त", "शून्य", "कमी", "अनंत"],
    answer: "B",
    explanation: "A Synchronous Motor is not self-starting. Therefore, its starting torque = Zero.",
    explanationMarathi: "Synchronous Motor स्वतः सुरू होत नाही. त्यामुळे तिचा Starting Torque = Zero असतो."
  },
  {
    chapterId: 64,
    question: "The no-load voltage of an alternator is 100 V and the full-load voltage is 60 V. What is the voltage regulation?",
    questionMarathi: "एका अल्टरनेटरचे नो-लोड व्होल्टेज 100 V आणि पूर्ण-लोड व्होल्टेज 60 V आहे. तर व्होल्टेज रेग्युलेशन किती?",
    options: ["100%", "66.66%", "40%", "None of these"],
    optionsMarathi: ["100%", "66.66%", "40%", "यापैकी नाही"],
    answer: "B",
    explanation: "Voltage Regulation = ((100 - 60) / 60) × 100 = 66.67%",
    explanationMarathi: "Voltage Regulation = ((100 - 60) / 60) × 100 = 66.67%"
  },
  {
    chapterId: 64,
    question: "What is the correct colour code for a 730 kΩ ±3% resistor?",
    questionMarathi: "730 kΩ ±3% प्रतिरोधासाठी योग्य रंगसंकेत (Colour Code) कोणता?",
    options: ["Yellow-Orange-Orange-Orange", "Yellow-Yellow-Orange-Yellow", "Violet-Orange-Yellow-Orange", "Grey-Orange-Brown-Red"],
    optionsMarathi: ["पिवळा–नारंगी–नारंगी–नारंगी", "पिवळा–पिवळा–नारंगी–पिवळा", "जांभळा–नारंगी–पिवळा–नारंगी", "स्लेटी–नारंगी–तपकिरी–लाल"],
    answer: "A",
    explanation: "730 kΩ = 73 × 10⁴ Ω. 7 = Violet, 3 = Orange, Multiplier = 10⁴ = Yellow.",
    explanationMarathi: "730 kΩ = 73 × 10⁴ Ω. 7 = Violet (जांभळा), 3 = Orange (नारंगी), Multiplier = 10⁴ = Yellow (पिवळा)"
  },
  {
    chapterId: 64,
    question: "How much charge is stored in a 2.15 F capacitor at 5 V?",
    questionMarathi: "5 V व्होल्टेजवर 2.15 F कॅपॅसिटरमध्ये किती चार्ज साठतो?",
    options: ["10.75 C", "2.32 C", "0.43 C", "430 C"],
    optionsMarathi: ["10.75 C", "2.32 C", "0.43 C", "430 C"],
    answer: "A",
    explanation: "Q = CV = 2.15 × 5 = 10.75 C",
    explanationMarathi: "Q = CV = 2.15 × 5 = 10.75 C"
  },
  {
    chapterId: 64,
    question: "According to Indian Standards (IS), what is the standard voltage for a three-phase supply?",
    questionMarathi": "भारतीय मानकानुसार (IS) त्रि-फेज पुरवठ्याचे मानक व्होल्टेज किती आहे?",
    options: ["440 V", "415 V", "650 V", "240 V"],
    optionsMarathi: ["440 V", "415 V", "650 V", "240 V"],
    answer: "B",
    explanation: "The standard 3-Phase Supply in India is 415 V.",
    explanationMarathi: "भारतामध्ये मानक 3-Phase Supply = 415 V."
  },
  {
    chapterId: 64,
    question: "What is the barrier potential of a silicon diode?",
    questionMarathi": "सिलिकॉन डायोडचा Barrier Potential किती असतो?",
    options: ["0.1 V", "0.5 V", "0.3 V", "0.7 V"],
    optionsMarathi: ["0.1 V", "0.5 V", "0.3 V", "0.7 V"],
    answer: "D",
    explanation: "The forward barrier potential of a silicon diode is 0.7 V.",
    explanationMarathi: "Silicon Diode चे Forward Barrier Potential = 0.7 V."
  },
  {
    chapterId: 64,
    question: "What is the resistance of an ideal voltmeter?",
    questionMarathi": "आदर्श व्होल्टमीटरचा प्रतिरोध किती असतो?",
    options: ["Low", "High", "Infinite", "Zero"],
    optionsMarathi: ["कमी", "जास्त", "अनंत", "शून्य"],
    answer: "C",
    explanation: "The resistance of an ideal voltmeter is infinite.",
    explanationMarathi: "Ideal Voltmeter चा Resistance = Infinite."
  },
  {
    chapterId: 64,
    question: "When two resistors R₁ and R₂ are connected in series, the result is 4.5 Ω and when in parallel, it is 1 Ω. What are their values?",
    questionMarathi": "दोन प्रतिरोध R₁ आणि R₂ श्रेणीत जोडल्यास 4.5 Ω आणि समांतर जोडल्यास 1 Ω मिळतो. तर त्यांची मूल्ये काय?",
    options: ["4 Ω and 0.5 Ω", "2 Ω and 2.5 Ω", "1.5 Ω and 3 Ω", "3.5 Ω and 1 Ω"],
    optionsMarathi: ["4 Ω आणि 0.5 Ω", "2 Ω आणि 2.5 Ω", "1.5 Ω आणि 3 Ω", "3.5 Ω आणि 1 Ω"],
    answer: "C",
    explanation: "Series: R₁ + R₂ = 4.5; Parallel: (R₁R₂) / (R₁ + R₂) = 1. Answer = 1.5 Ω and 3 Ω.",
    explanationMarathi: "Series: R₁ + R₂ = 4.5\nParallel: R₁R₂ / (R₁ + R₂) = 1\nउत्तर = 1.5 Ω आणि 3 Ω."
  },
  {
    chapterId: 64,
    question: "How many electrons are in the outermost shell of a semiconductor?",
    questionMarathi": "सेमीकंडक्टरच्या बाह्य कक्षेत किती इलेक्ट्रॉन्स असतात?",
    options: ["8", "7", "1", "4"],
    optionsMarathi: ["8", "7", "1", "4"],
    answer: "D",
    explanation: "Both Silicon and Germanium have 4 valence electrons.",
    explanationMarathi: "Silicon आणि Germanium या दोन्हींचे Valence Electrons = 4."
  },
  {
    chapterId: 64,
    question: "What increases when cells are connected in series in a torch?",
    questionMarathi": "टॉर्चमध्ये सेल श्रेणीत (Series) जोडल्यास काय वाढते?",
    options: ["Power", "Voltage", "Current", "Loss"],
    optionsMarathi: ["Power", "Voltage", "Current", "Loss"],
    answer: "B",
    explanation: "Connecting cells in series increases the voltage.",
    explanationMarathi: "Series Connection मध्ये Voltage वाढते."
  },
  {
    chapterId: 64,
    question: "Which of the following is temporary wiring?",
    questionMarathi": "खालीलपैकी तात्पुरती (Temporary) वायरिंग कोणती?",
    options: ["Cleat Wiring", "Batten Wiring", "Conduit Wiring", "Both 1 and 2"],
    optionsMarathi: ["Cleat Wiring", "Batten Wiring", "Conduit Wiring", "1 व 2 दोन्ही"],
    answer: "A",
    explanation: "Cleat Wiring is used for temporary purposes.",
    explanationMarathi: "तात्पुरत्या वापरासाठी Cleat Wiring केली जाते."
  },
  {
    chapterId: 64,
    question: "What is the Form Factor of an AC Current/Voltage?",
    questionMarathi": "AC Current/Voltage चा Form Factor किती असतो?",
    options: ["1.414", "0.637", "1.11", "0.707"],
    optionsMarathi: ["1.414", "0.637", "1.11", "0.707"],
    answer: "C",
    explanation: "Form Factor = RMS Value / Average Value = 1.11",
    explanationMarathi: "Form Factor = V_AVG / V_RMS = 1.11"
  },
  {
    chapterId: 64,
    question: "1 Pico Farad (pF) = ?",
    questionMarathi": "1 Pico Farad (pF) = ?",
    options: ["10⁻³ F", "10⁻⁶ F", "10⁻¹⁶ F", "10⁻¹² F"],
    optionsMarathi: ["10⁻³ F", "10⁻⁶ F", "10⁻¹⁶ F", "10⁻¹² F"],
    answer: "D",
    explanation: "1 pF = 10⁻¹² F",
    explanationMarathi: "1 pF = 10⁻¹² F"
  },
  {
    chapterId: 64,
    question: "If a 2-pole alternator is rotating at 1200 rpm, what is its frequency?",
    questionMarathi": "2 Pole Alternator जर 1200 rpm वेगाने फिरत असेल तर वारंवारता (Frequency) किती?",
    options: ["20 Hz", "40 Hz", "60 Hz", "80 Hz"],
    optionsMarathi: ["20 Hz", "40 Hz", "60 Hz", "80 Hz"],
    answer: "A",
    explanation: "f = (P × N) / 120 = (2 × 1200) / 120 = 20 Hz",
    explanationMarathi: "f = 120 / PN = 120 / (2×1200) = 20 Hz"
  },
  {
    chapterId: 64,
    question: "According to Fleming's Left Hand Rule, what does the first finger represent?",
    questionMarathi": "Fleming च्या Left Hand Rule नुसार पहिली बोट (First Finger) काय दर्शवते?",
    options: ["Force", "Current", "Magnetic Field", "Motion of conductor"],
    optionsMarathi: ["बल", "प्रवाह", "चुंबकीय क्षेत्र", "चालकाची हालचाल"],
    answer: "C",
    explanation: "First Finger = Magnetic Field, Second Finger = Current, Thumb = Motion.",
    explanationMarathi: "First Finger = Magnetic Field\nSecond Finger = Current\nThumb = Motion"
  },
  {
    chapterId: 64,
    question: "What is the capacity of an Open Delta (V-V) connection compared to a Delta-Delta connection?",
    questionMarathi": "Delta-Delta च्या तुलनेत Open Delta (V-V) जोडणीची क्षमता किती असते?",
    options: ["66%", "56%", "85%", "58%"],
    optionsMarathi: ["66%", "56%", "85%", "58%"],
    answer: "D",
    explanation: "The capacity of an Open Delta connection is 57.7% ≈ 58% of a full Delta connection.",
    explanationMarathi: "Open Delta Connection ची क्षमता पूर्ण Delta च्या 57.7% ≈ 58% असते."
  },
  {
    chapterId: 64,
    question: "If frequency is doubled, which loss increases the most?",
    questionMarathi": "वारंवारता (Frequency) दुप्पट केल्यास कोणता Loss सर्वाधिक वाढतो?",
    options: ["Hysteresis Loss", "Eddy Current Loss", "Copper Loss", "Friction Loss"],
    optionsMarathi: ["Hysteresis Loss", "Eddy Current Loss", "Copper Loss", "Friction Loss"],
    answer: "B",
    explanation: "Eddy Current Loss increases in proportion to Frequency².",
    explanationMarathi: "Eddy Current Loss हा Frequency² च्या प्रमाणात वाढतो."
  },
  {
    chapterId: 64,
    question: "What is the normal slip of a three-phase induction motor?",
    questionMarathi": "तीन-फेज इंडक्शन मोटरचा सामान्य Slip किती असतो?",
    options: ["2–10%", "5–8%", "2–5%", "1%"],
    optionsMarathi: ["2–10%", "5–8%", "2–5%", "1%"],
    answer: "C",
    explanation: "At full load, the normal slip is 2% to 5%.",
    explanationMarathi": "पूर्ण भारावर सामान्य Slip = 2% ते 5%."
  },
  {
    chapterId: 64,
    question: "Which material is used to make a shunt?",
    questionMarathi": "Shunt बनवण्यासाठी कोणता पदार्थ वापरतात?",
    options: ["Copper", "Eureka", "Diamond", "Manganin"],
    optionsMarathi: ["तांबे", "Eureka", "हिरा", "Manganin"],
    answer: "D",
    explanation: "Manganin has a low temperature coefficient, so it is used to make shunts.",
    explanationMarathi: "Manganin ला कमी तापमान गुणांक असल्यामुळे Shunt तयार करण्यासाठी वापरतात."
  },
  {
    chapterId: 64,
    question: "How many diodes are required in a Single Phase Full Wave Rectifier?",
    questionMarathi": "Single Phase Full Wave Rectifier मध्ये किती डायोड लागतात?",
    options: ["2", "1", "4", "6"],
    optionsMarathi: ["2", "1", "4", "6"],
    answer: "A",
    explanation: "A Center-Tapped Full Wave Rectifier uses 2 diodes. (A Bridge Rectifier uses 4 diodes.)",
    explanationMarathi: "Center-Tapped Full Wave Rectifier मध्ये 2 डायोड वापरले जातात. (Bridge Rectifier मध्ये 4 डायोड लागतात.)"
  },
  {
    chapterId: 64,
    question: "What is the SI unit of illumination?",
    questionMarathi": "प्रदीप्ती (Illumination) चे SI ഏകक काय आहे?",
    options: ["Lumen", "Steradian", "Lux", "Watt"],
    optionsMarathi: ["Lumen", "Steradian", "Lux", "Watt"],
    answer: "C",
    explanation: "The SI unit of Illumination is Lux (lx).",
    explanationMarathi: "Illumination चे SI एकक Lux (lx) आहे."
  }
];

const elecPath = 'src/data/questions_electrical.ts';
let elecContent = fs.readFileSync(elecPath, 'utf8');

// Find where QUESTIONS_ELEC array ends
const closingBracketIdx = elecContent.lastIndexOf(']');
if (closingBracketIdx === -1) {
  console.error("Could not find closing bracket in questions_electrical.ts");
  process.exit(1);
}

const qsStr = JSON.stringify(qs, null, 2);
const qsInnerStr = qsStr.substring(1, qsStr.length - 1).trim();

// Append
elecContent = elecContent.substring(0, closingBracketIdx).trimRight() + ',\n  ' + qsInnerStr + '\n];\n';
fs.writeFileSync(elecPath, elecContent, 'utf8');
console.log('Appended questions to questions_electrical.ts');

// Now add the chapter to questions.ts
const qsPath = 'src/data/questions.ts';
let qsContent = fs.readFileSync(qsPath, 'utf8');

const newChapter = {
  id: 64,
  name: 'Electrical Set 35 (Q 1167 - 1215)',
  nameMarathi: 'विद्युत संच 35 (प्र 1167 ते 1215)',
  description: 'Basic Electrical, Motors, Alternators and Transformers MCQs.',
  descriptionMarathi: 'मूलभूत विद्युत, मोटर्स, अल्टरनेटर आणि ट्रान्सफॉर्मर बहुपर्यायी प्रश्न.',
  icon: 'Zap',
  section: 'Electrical'
};

const chClosingIdx = qsContent.indexOf('];', qsContent.indexOf('export const CHAPTERS: Chapter[] ='));
if (chClosingIdx === -1) {
  console.error("Could not find CHAPTERS closing bracket in questions.ts");
  process.exit(1);
}

const newChStr = JSON.stringify(newChapter, null, 2).split('\n').map(line => '  ' + line).join('\n');
qsContent = qsContent.substring(0, chClosingIdx).trimRight() + ',\n' + newChStr + '\n' + qsContent.substring(chClosingIdx);
fs.writeFileSync(qsPath, qsContent, 'utf8');
console.log('Appended chapter to questions.ts');
