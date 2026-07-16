const fs = require('fs');

const raw = fs.readFileSync('raw_ch64.txt', 'utf-8');

const blocks = raw.split(/\n\d{4}\n|\n\d{4}\s*\n/g).map(s => s.trim()).filter(s => s.length > 0);

// Wait, the first one might not split properly if it starts with 1167
const qData = [
  {
    "q": "What is the symbol for Magnetic Flux Density?",
    "o": ["B", "α", "Φ", "ρ"],
    "a": "A",
    "e": "The symbol for magnetic flux density is B and its SI unit is Tesla (T)."
  },
  {
    "q": "In an AC circuit, if Inductive Reactance (XL) is greater than Capacitive Reactance (XC), what is the Power Factor?",
    "o": ["Unity", "Zero", "Leading", "Lagging"],
    "a": "D",
    "e": "If XL > XC, the circuit is inductive. Therefore, the current lags behind the voltage (Lagging)."
  },
  {
    "q": "Which winding is used to keep the neutral point stable in a Star-Star connection?",
    "o": ["Scott", "Tertiary", "Inter Star", "Delta"],
    "a": "B",
    "e": "A Tertiary (Delta) Winding is used to stabilize the neutral in a Star-Star transformer."
  },
  {
    "q": "Which property in a magnetic circuit acts opposite to resistance?",
    "o": ["Permeance", "Impedance", "Reactance", "Conductance"],
    "a": "A",
    "e": "Permeance is the property opposite to Reluctance in a magnetic circuit."
  },
  {
    "q": "How many slip rings are required in a Rotating Field type Alternator?",
    "o": ["Equal to Poles", "Only 2", "Equal to Phases", "Any number"],
    "a": "B",
    "e": "2 slip rings are used in an alternator to supply DC to the rotor."
  },
  {
    "q": "Why is armouring used in an underground cable?",
    "o": ["Protection from moisture", "Protection from atmosphere", "Protection from mechanical shocks", "Protection from overload"],
    "a": "C",
    "e": "Armouring protects the cable from external mechanical damage."
  },
  {
    "q": "Which of the following cells provides a continuous and constant voltage (EMF)?",
    "o": ["Leclanche Cell", "Daniell Cell", "Voltaic Cell", "Silver Oxide Cell"],
    "a": "B",
    "e": "The Daniell Cell gives a stable EMF, so it is used in laboratories."
  },
  {
    "q": "Which parameter indicates total conductance in an AC circuit?",
    "o": ["Susceptance", "Admittance", "Conductance", "Reactance"],
    "a": "B",
    "e": "Admittance = Conductance + Susceptance."
  },
  {
    "q": "What is the property of an AC circuit that opposes a change in current called?",
    "o": ["Reactance", "Induction", "Inductance", "Permeance"],
    "a": "C",
    "e": "Inductance is the property that opposes a change in current."
  },
  {
    "q": "Which motor is used in wall clocks?",
    "o": ["Universal", "Shaded Pole", "Split Phase", "Capacitor Start"],
    "a": "B",
    "e": "Shaded Pole Motors are used in small AC clocks."
  },
  {
    "q": "In an attraction type instrument, the torque produced is proportional to what?",
    "o": ["Current", "Voltage", "Voltage²", "Current²"],
    "a": "D",
    "e": "In an Attraction Type Instrument, torque is proportional to Current²."
  },
  {
    "q": "In which of the following lamps is the Stroboscopic Effect seen?",
    "o": ["Carbon Filament", "Fluorescent Tube", "Mercury Argon", "Mercury Argon Tungsten"],
    "a": "B",
    "e": "The Stroboscopic Effect is seen in a Fluorescent Tube."
  },
  {
    "q": "What is the unit of sensitivity of a voltmeter?",
    "o": ["Ohm Meter", "Ohm × Volt", "Volt/Ohm", "Ohm/Volt"],
    "a": "D",
    "e": "Voltmeter Sensitivity = Ohm per Volt (Ω/V)."
  },
  {
    "q": "What is the starting torque of a synchronous motor?",
    "o": ["Very High", "Zero", "Low", "Infinite"],
    "a": "B",
    "e": "A Synchronous Motor is not self-starting. Therefore, its starting torque = Zero."
  },
  {
    "q": "The no-load voltage of an alternator is 100 V and the full-load voltage is 60 V. What is the voltage regulation?",
    "o": ["100%", "66.66%", "40%", "None of these"],
    "a": "B",
    "e": "Voltage Regulation = ((100 - 60) / 60) × 100 = 66.67%"
  },
  {
    "q": "What is the correct colour code for a 730 kΩ ±3% resistor?",
    "o": ["Yellow-Orange-Orange-Orange", "Yellow-Yellow-Orange-Yellow", "Violet-Orange-Yellow-Orange", "Grey-Orange-Brown-Red"],
    "a": "A",
    "e": "730 kΩ = 73 × 10⁴ Ω. 7 = Violet, 3 = Orange, Multiplier = 10⁴ = Yellow."
  },
  {
    "q": "How much charge is stored in a 2.15 F capacitor at 5 V?",
    "o": ["10.75 C", "2.32 C", "0.43 C", "430 C"],
    "a": "A",
    "e": "Q = CV = 2.15 × 5 = 10.75 C"
  },
  {
    "q": "According to Indian Standards (IS), what is the standard voltage for a three-phase supply?",
    "o": ["440 V", "415 V", "650 V", "240 V"],
    "a": "B",
    "e": "The standard 3-Phase Supply in India is 415 V."
  },
  {
    "q": "What is the barrier potential of a silicon diode?",
    "o": ["0.1 V", "0.5 V", "0.3 V", "0.7 V"],
    "a": "D",
    "e": "The forward barrier potential of a silicon diode is 0.7 V."
  },
  {
    "q": "What is the resistance of an ideal voltmeter?",
    "o": ["Low", "High", "Infinite", "Zero"],
    "a": "C",
    "e": "The resistance of an ideal voltmeter is infinite."
  },
  {
    "q": "When two resistors R₁ and R₂ are connected in series, the result is 4.5 Ω and when in parallel, it is 1 Ω. What are their values?",
    "o": ["4 Ω and 0.5 Ω", "2 Ω and 2.5 Ω", "1.5 Ω and 3 Ω", "3.5 Ω and 1 Ω"],
    "a": "C",
    "e": "Series: R₁ + R₂ = 4.5; Parallel: (R₁R₂) / (R₁ + R₂) = 1. Answer = 1.5 Ω and 3 Ω."
  },
  {
    "q": "How many electrons are in the outermost shell of a semiconductor?",
    "o": ["8", "7", "1", "4"],
    "a": "D",
    "e": "Both Silicon and Germanium have 4 valence electrons."
  },
  {
    "q": "What increases when cells are connected in series in a torch?",
    "o": ["Power", "Voltage", "Current", "Loss"],
    "a": "B",
    "e": "Connecting cells in series increases the voltage."
  },
  {
    "q": "Which of the following is temporary wiring?",
    "o": ["Cleat Wiring", "Batten Wiring", "Conduit Wiring", "Both 1 and 2"],
    "a": "A",
    "e": "Cleat Wiring is used for temporary purposes."
  },
  {
    "q": "What is the Form Factor of an AC Current/Voltage?",
    "o": ["1.414", "0.637", "1.11", "0.707"],
    "a": "C",
    "e": "Form Factor = RMS Value / Average Value = 1.11"
  },
  {
    "q": "1 Pico Farad (pF) = ?",
    "o": ["10⁻³ F", "10⁻⁶ F", "10⁻¹⁶ F", "10⁻¹² F"],
    "a": "D",
    "e": "1 pF = 10⁻¹² F"
  },
  {
    "q": "If a 2-pole alternator is rotating at 1200 rpm, what is its frequency?",
    "o": ["20 Hz", "40 Hz", "60 Hz", "80 Hz"],
    "a": "A",
    "e": "f = (P × N) / 120 = (2 × 1200) / 120 = 20 Hz"
  },
  {
    "q": "According to Fleming's Left Hand Rule, what does the first finger represent?",
    "o": ["Force", "Current", "Magnetic Field", "Motion of conductor"],
    "a": "C",
    "e": "First Finger = Magnetic Field, Second Finger = Current, Thumb = Motion."
  },
  {
    "q": "What is the capacity of an Open Delta (V-V) connection compared to a Delta-Delta connection?",
    "o": ["66%", "56%", "85%", "58%"],
    "a": "D",
    "e": "The capacity of an Open Delta connection is 57.7% ≈ 58% of a full Delta connection."
  },
  {
    "q": "If frequency is doubled, which loss increases the most?",
    "o": ["Hysteresis Loss", "Eddy Current Loss", "Copper Loss", "Friction Loss"],
    "a": "B",
    "e": "Eddy Current Loss increases in proportion to Frequency²."
  },
  {
    "q": "What is the normal slip of a three-phase induction motor?",
    "o": ["2–10%", "5–8%", "2–5%", "1%"],
    "a": "C",
    "e": "At full load, the normal slip is 2% to 5%."
  },
  {
    "q": "Which material is used to make a shunt?",
    "o": ["Copper", "Eureka", "Diamond", "Manganin"],
    "a": "D",
    "e": "Manganin has a low temperature coefficient, so it is used to make shunts."
  },
  {
    "q": "How many diodes are required in a Single Phase Full Wave Rectifier?",
    "o": ["2", "1", "4", "6"],
    "a": "A",
    "e": "A Center-Tapped Full Wave Rectifier uses 2 diodes. (A Bridge Rectifier uses 4 diodes.)"
  },
  {
    "q": "What is the SI unit of illumination?",
    "o": ["Lumen", "Steradian", "Lux", "Watt"],
    "a": "C",
    "e": "The SI unit of Illumination is Lux (lx)."
  }
];

const marathiQs = [];
const blocks2 = raw.split(/(?=\d{4}\n)/g).map(s => s.trim()).filter(s => s.length > 0);

// We'll parse the marathi text to get questionMarathi, optionsMarathi, explanationMarathi
let idx = 0;
for (let block of blocks2) {
  // block could look like:
  // 1167
  // प्रश्न: ...
  // पर्याय: A) B) C) D) ...
  // योग्य उत्तर: ...
  // स्पष्टीकरण: ...

  const qMatch = block.match(/प्रश्न:\s*(.*?)(?=\nपर्याय:)/s);
  const qStr = qMatch ? qMatch[1].trim() : "";

  const optA = block.match(/A\)\s*(.*?)(?=\nB\))/s);
  const optB = block.match(/B\)\s*(.*?)(?=\nC\))/s);
  const optC = block.match(/C\)\s*(.*?)(?=\nD\))/s);
  const optD = block.match(/D\)\s*(.*?)(?=\n✅|\n\n)/s);

  const options = [];
  if (optA) options.push(optA[1].trim());
  if (optB) options.push(optB[1].trim());
  if (optC) options.push(optC[1].trim());
  if (optD) options.push(optD[1].trim());

  const expMatch = block.match(/स्पष्टीकरण:\n([\s\S]*)/);
  const eStr = expMatch ? expMatch[1].trim() : "";

  marathiQs.push({
    q: qStr,
    o: options,
    e: eStr
  });
}

// Ensure the counts match
if (marathiQs.length !== qData.length) {
  console.log(`Mismatch lengths: Marathi=${marathiQs.length}, English=${qData.length}`);
  // We'll just zip them anyway
}

const finalQs = [];
for (let i = 0; i < qData.length; i++) {
  finalQs.push({
    chapterId: 64,
    question: qData[i].q,
    questionMarathi: marathiQs[i] ? marathiQs[i].q : "",
    options: qData[i].o,
    optionsMarathi: marathiQs[i] && marathiQs[i].o.length === 4 ? marathiQs[i].o : qData[i].o, // fallback
    answer: qData[i].a,
    explanation: qData[i].e,
    explanationMarathi: marathiQs[i] ? marathiQs[i].e : ""
  });
}

fs.writeFileSync('ch64_parsed.json', JSON.stringify(finalQs, null, 2), 'utf8');
console.log("Written ch64_parsed.json");
