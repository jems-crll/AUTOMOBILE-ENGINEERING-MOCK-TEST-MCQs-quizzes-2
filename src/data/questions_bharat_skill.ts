// @ts-nocheck
import { Question } from "../types.js";

export const QUESTIONS_BHARAT_SKILL: Question[] = [
  {
    "id": 1701,
    "chapterId": 73,
    "question": "Which motor has this characteristics curve as shown in the figure?",
    "questionMarathi": "आकृतीत दर्शविल्याप्रमाणे हे वैशिष्ट्य वक्र (Characteristics Curve) कोणत्या मोटरचे आहे?",
    "options": ["Series motor", "Shunt motor", "Cumulative compound motor", "Differential compound motor"],
    "optionsMarathi": ["सिरीज मोटर (Series motor)", "शंट मोटर (Shunt motor)", "क्युम्युलेटिव्ह कंपाउंड मोटर", "डिफरेंशियल कंपाउंड मोटर"],
    "answer": "A",
    "explanation": "The torque of a DC series motor is proportional to the square of armature current, which gives it a high starting torque and a speed-torque curve that drops rapidly as torque increases.",
    "explanationMarathi": "डीसी सिरीज मोटरचा टॉर्क आर्मेचर करंटच्या वर्गाशी प्रमाणात असतो, ज्यामुळे तिचा सुरुवातीचा टॉर्क खूप जास्त असतो आणि टॉर्क वाढल्यास गती वेगाने कमी होते.",
    "imageSvg": `<svg viewBox="0 0 400 200" className="w-full h-auto text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="50" y1="20" x2="50" y2="170" />
      <line x1="50" y1="170" x2="350" y2="170" />
      <path d="M 70 40 Q 110 130 310 150" stroke="currentColor" stroke-width="3" />
      <text x="20" y="95" fill="currentColor" stroke="none" font-size="12" font-weight="bold" font-family="monospace">SPEED</text>
      <text x="180" y="190" fill="currentColor" stroke="none" font-size="12" font-weight="bold" font-family="monospace">TORQUE</text>
    </svg>`
  },
  {
    "id": 1702,
    "chapterId": 73,
    "question": "Which type of speed control of D.C series motor as shown in the figure?",
    "questionMarathi": "आकृतीत दर्शविलेली डीसी सिरीज मोटरची गती नियंत्रण (Speed Control) पद्धत कोणती आहे?",
    "options": ["Field parallel method", "Field diverter method", "Field tapping method", "Armature diverter method"],
    "optionsMarathi": ["फील्ड पॅरेलल पद्धत (Field parallel method)", "फील्ड डायव्हर्टर पद्धत (Field diverter method)", "फील्ड टॅपिंग पद्धत (Field tapping method)", "आर्मेचर डायव्हर्टर पद्धत"],
    "answer": "A",
    "explanation": "In the field parallel method, the field coils are divided into two parallel paths, which reduces the flux per pole, thereby increasing the speed of the motor.",
    "explanationMarathi": "फील्ड पॅरेलल पद्धतीमध्ये, चुंबकीय क्षेत्राचे दोन समांतर मार्ग केले जातात, ज्यामुळे चुंबकीय फ्लक्स कमी होऊन मोटरची गती वाढते.",
    "imageSvg": `<svg viewBox="0 0 400 220" className="w-full h-auto text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="50" y1="50" x2="100" y2="50" />
      <line x1="100" y1="50" x2="100" y2="120" />
      <line x1="50" y1="170" x2="250" y2="170" />
      <path d="M 100 80 L 120 80 M 120 70 L 120 90 M 130 70 L 130 90 M 130 80 L 160 80" />
      <circle cx="200" cy="110" r="25" stroke-width="3" />
      <text x="190" y="115" fill="currentColor" stroke="none" font-size="14" font-weight="bold">A</text>
      <line x1="200" y1="50" x2="200" y2="85" />
      <line x1="200" y1="135" x2="200" y2="170" />
      <line x1="100" y1="120" x2="200" y2="120" />
      <line x1="200" y1="50" x2="350" y2="50" />
      <text x="310" y="40" fill="currentColor" stroke="none" font-size="12" font-weight="bold">L+</text>
      <text x="310" y="190" fill="currentColor" stroke="none" font-size="12" font-weight="bold">L-</text>
    </svg>`
  },
  {
    "id": 1703,
    "chapterId": 73,
    "question": "Which DC Motor is designed to work with the full load limits?",
    "questionMarathi": "कोणती डीसी मोटर पूर्ण लोड मर्यादेसह (Full Load Limits) काम करण्यासाठी डिझाइन केलेली आहे?",
    "options": ["Shunt motor", "Series motor", "Cumulative compound motor", "Differential compound motor"],
    "optionsMarathi": ["शंट मोटर (Shunt motor)", "सिरीज मोटर (Series motor)", "क्युम्युलेटिव्ह कंपाउंड मोटर", "डिफरेंशियल कंपाउंड मोटर"],
    "answer": "D",
    "explanation": "Differential compound motors are designed to operate within strict limits under full load conditions to prevent unstability.",
    "explanationMarathi": "डिफरेंशियल कंपाउंड मोटर पूर्ण लोड परिस्थितीत कठोर मर्यादेत कार्य करण्यासाठी डिझाइन केलेली आहे."
  },
  {
    "id": 1704,
    "chapterId": 73,
    "question": "Where D.C compound motors are preferred?",
    "questionMarathi": "डीसी कंपाउंड मोटर्सना (D.C Compound Motors) कोठे प्राधान्य दिले जाते?",
    "options": ["Constant load requirements", "Constant speed requirements", "High starting torque requirements", "Constant speed under varying load requirements"],
    "optionsMarathi": ["सतत लोड आवश्यकतेसाठी", "स्थिर गती आवश्यकतेसाठी", "उच्च स्टार्टिंग टॉर्क आवश्यकतेसाठी", "बदलत्या लोडवर स्थिर गती आवश्यकतेसाठी"],
    "answer": "D",
    "explanation": "D.C. compound motors are preferred when constant speed under varying load requirements is desired.",
    "explanationMarathi": "बदलत्या लोडच्या आवश्यकतेनुसार स्थिर गती मिळवण्यासाठी डीसी कंपाउंड मोटर्स योग्य मानल्या जातात."
  },
  {
    "id": 1705,
    "chapterId": 73,
    "question": "Which type of DC motor is used for sudden application of heavy loads?",
    "questionMarathi": "अचानक जड लोड लागू करण्यासाठी कोणत्या प्रकारची डीसी मोटर वापरली जाते?",
    "options": ["Shunt motor", "Series motor", "Differential compound motor", "Cumulative compound motor"],
    "optionsMarathi": ["शंट मोटर", "सिरीज मोटर", "डिफरेंशियल कंपाउंड मोटर", "क्युम्युलेटिव्ह कंपाउंड मोटर"],
    "answer": "D",
    "explanation": "Cumulative compound motors provide high starting torque and safely handle sudden heavy loads.",
    "explanationMarathi": "क्युम्युलेटिव्ह कंपाउंड मोटर्स उच्च सुरवातीचा टॉर्क देतात आणि अचानक जड लोड सुरक्षितपणे हाताळू शकतात."
  },
  {
    "id": 1706,
    "chapterId": 73,
    "question": "Which speed control method is used in food mixture motors?",
    "questionMarathi": "फूड मिक्सर मोटर्समध्ये कोणती गती नियंत्रण (Speed Control) पद्धत वापरली जाते?",
    "options": ["Voltage control method", "Field diverter control method", "Armature diverter method", "Series field tapping method"],
    "optionsMarathi": ["व्होल्टेज नियंत्रण पद्धत", "फील्ड डायव्हर्टर नियंत्रण पद्धत", "आर्मेचर डायव्हर्टर पद्धत", "सिरीज फील्ड टॅपिंग पद्धत"],
    "answer": "D",
    "explanation": "Universal motors in food mixers use a series field tapping method to adjust speeds.",
    "explanationMarathi": "फूड मिक्सरमधील युनिव्हर्सल मोटर्स गती बदलण्यासाठी सिरीज फील्ड टॅपिंग पद्धत वापरतात."
  },
  {
    "id": 1707,
    "chapterId": 73,
    "question": "What is the purpose of tapes in winding?",
    "questionMarathi": "वाइंडिंगमध्ये टेप वापरण्याचा मुख्य उद्देश काय आहे?",
    "options": ["Insulate slots", "Bind the coils", "Wrap the conductor", "Insulate exposed conductors"],
    "optionsMarathi": ["स्लॉट्स इन्सुलेट करणे", "कॉइल्स बांधणे", "कंडक्टर लपेटणे", "उघड्या कंडक्टरला इन्सुलेट करणे"],
    "answer": "C",
    "explanation": "Winding tapes are used to wrap the conductor to provide physical binding and electrical insulation.",
    "explanationMarathi": "कंडक्टर लपेटण्यासाठी टेप वापरतात ज्यामुळे वाइंडिंगला सुरक्षितपणे बांधून ठेवता येते आणि इन्सुलेशन मिळते."
  },
  {
    "id": 1708,
    "chapterId": 73,
    "question": "What is the operation in rewinding process as shown in the figure?",
    "questionMarathi": "रिवाइंडिंग प्रक्रियेत आकृतीमध्ये दर्शविलेले ऑपरेशन कोणते आहे?",
    "options": ["Cleaning of slots", "Removing of winding", "Removing of wedges", "Cutting of winding wire"],
    "optionsMarathi": ["खाचांची साफसफाई करणे", "वाइंडिंग काढणे", "वेजेस (Wedges) काढणे", "वाइंडिंग वायर कापणे"],
    "answer": "C",
    "explanation": "The diagram illustrates the removal of stator wedges from slots during rewinding process using a custom wedge remover chisel.",
    "explanationMarathi": "आकृतीत रिवाइंडिंग करताना स्लॉट्समधून वेजेस (Wedges) सुरक्षितपणे बाहेर काढण्याची पद्धत दर्शविली आहे.",
    "imageSvg": `<svg viewBox="0 0 400 200" className="w-full h-auto text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="80" y="40" width="240" height="120" rx="10" stroke-dasharray="5 5" />
      <path d="M 120 100 L 280 100 M 120 70 L 280 70 M 120 130 L 280 130" />
      <path d="M 150 50 L 170 120 L 190 120 L 170 50 Z" fill="currentColor" fill-opacity="0.2" />
      <circle cx="170" cy="50" r="15" />
      <text x="210" y="115" fill="currentColor" stroke="none" font-size="12" font-weight="bold">WEDGE REMOVAL</text>
    </svg>`
  },
  {
    "id": 1709,
    "chapterId": 73,
    "question": "Which type of armature winding is illustrated as shown in the figure?",
    "questionMarathi": "आकृतीत कोणत्या प्रकारची आर्मेचर वाइंडिंग दर्शविली आहे?",
    "options": ["Triplex wave winding", "Duplex wave winding", "Progressive lap winding", "Retrogressive lap winding"],
    "optionsMarathi": ["ट्रिपलेक्स वेव्ह वाइंडिंग", "ड्युपलेक्स वेव्ह वाइंडिंग", "प्रोग्रेसिव्ह लॅप वाइंडिंग", "रेट्रोग्रेसिव्ह लॅप वाइंडिंग"],
    "answer": "C",
    "explanation": "In progressive lap winding, connections progress forward around the commutator (pitch Yc = +1).",
    "explanationMarathi": "प्रोग्रेसिव्ह लॅप वाइंडिंगमध्ये कम्युटेटर जोडण्या पुढील दिशेने पुढे जातात.",
    "imageSvg": `<svg viewBox="0 0 400 200" className="w-full h-auto text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 50 120 L 100 50 L 150 120 M 100 50 L 200 50 L 250 120" />
      <rect x="40" y="140" width="40" height="30" />
      <rect x="90" y="140" width="40" height="30" />
      <rect x="140" y="140" width="40" height="30" />
      <text x="55" y="160" fill="currentColor" stroke="none" font-size="12">1</text>
      <text x="105" y="160" fill="currentColor" stroke="none" font-size="12">2</text>
      <text x="155" y="160" fill="currentColor" stroke="none" font-size="12">3</text>
    </svg>`
  },
  {
    "id": 1710,
    "chapterId": 73,
    "question": "Which type of test is illustrated for the armature after rewound?",
    "questionMarathi": "रिवाइंड केल्यानंतर आर्मेचरची कोणती चाचणी आकृतीत दर्शविली आहे?",
    "options": ["Open coil test", "Shorted coil test", "Voltage drop test", "Grounded coil test"],
    "optionsMarathi": ["ओपन कॉइल टेस्ट", "शॉर्टेड कॉइल टेस्ट", "व्होल्टेज營ड्रॉप टेस्ट", "ग्राउंडेड कॉइल टेस्ट"],
    "answer": "B",
    "explanation": "A growler test with a thin hacksaw blade is used to check for shorted coils in a rewound armature; the blade vibrates over shorted coils.",
    "explanationMarathi": "ग्रॉवलर आणि हॅक्सॉ ब्लेडच्या मदतीने आर्मेचरमधील शॉर्टेड कॉइल तपासली जात आहे.",
    "imageSvg": `<svg viewBox="0 0 400 200" className="w-full h-auto text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 120 160 L 150 110 L 250 110 L 280 160" stroke-width="3" />
      <circle cx="200" cy="80" r="30" fill="currentColor" fill-opacity="0.1" />
      <line x1="200" y1="80" x2="200" y2="40" stroke-width="4" stroke-dasharray="3 3" />
      <rect x="150" y="25" width="100" height="10" rx="3" fill="currentColor" />
      <text x="210" y="20" fill="currentColor" stroke="none" font-size="10">BLADE</text>
      <text x="110" y="185" fill="currentColor" stroke="none" font-size="12">GROWLER BLOCK</text>
    </svg>`
  },
  {
    "id": 1711,
    "chapterId": 73,
    "question": "Which type of winding wire is used to wind submersible pump motors?",
    "questionMarathi": "सबमर्सिबल पंप मोटर्स वाइंडिंग करण्यासाठी कोणत्या प्रकारची वाइंडिंग वायर वापरली जाते?",
    "options": ["PVC covered type", "Terylene thread type", "Super enamelled type", "Double cotton covered type"],
    "optionsMarathi": ["पीव्हीसी कव्हर्ड प्रकार", "टेरिलीन थ्रेड प्रकार", "सुपर इनॅमल्ड प्रकार", "डबल कॉटन कव्हर्ड प्रकार"],
    "answer": "A",
    "explanation": "Submersible pump motor windings must be waterproof, which is why PVC covered copper wires are used.",
    "explanationMarathi": "पाण्यात कार्य करणाऱ्या सबमर्सिबल पंपाच्या वाइंडिंगसाठी पूर्णपणे वॉटरप्रूफ अशी पीव्हीसी कव्हर्ड कॉपर वायर वापरली जाते."
  },
  {
    "id": 1712,
    "chapterId": 73,
    "question": "Why it is better to change the direction of armature current to change the direction of rotation of DC compound motor?",
    "questionMarathi": "डीसी कंपाउंड मोटरच्या फिरण्याची दिशा बदलण्यासाठी फक्त आर्मेचर करंटची दिशा बदलणे का चांगले असते?",
    "options": ["To increase the rated speed", "To maintain the motor characteristics", "To increase the output power", "To increase the efficiency"],
    "optionsMarathi": ["रेटेड गती वाढवण्यासाठी", "मोटरची मूळ वैशिष्ट्ये राखण्यासाठी", "आउटपुट पॉवर वाढवण्यासाठी", "कार्यक्षमता वाढवण्यासाठी"],
    "answer": "B",
    "explanation": "Changing only the armature current maintains the cumulative or differential magnetic characteristics of the compound motor safely.",
    "explanationMarathi": "आर्मेचर प्रवाह बदलल्याने सिरीज आणि शंत फील्डचा परस्पर संबंध कायम राहतो, ज्यामुळे मोटरचे गुणधर्म बदलत नाहीत."
  },
  {
    "id": 1713,
    "chapterId": 73,
    "question": "What happens if the starting resistance of four point starter opens while DC compound motor is running?",
    "questionMarathi": "डीसी कंपाउंड मोटर चालू असताना फोर पॉइंट स्टार्टरचा स्टार्टिंग रेझिस्टन्स उघडला (Open झाला) तर काय होईल?",
    "options": ["Motor stopped", "Runs at slow speed", "Runs at very high speed", "Runs at reverse direction"],
    "optionsMarathi": ["मोटर थांबेल", "कमी गतीने चालेल", "खूप जास्त गतीने चालेल", "विरुद्ध दिशेने चालेल"],
    "answer": "A",
    "explanation": "An open starting resistor breaks the armature supply path, causing the motor to stop immediately.",
    "explanationMarathi": "फोर पॉइंट स्टार्टरचा स्टार्टिंग रेझिस्टन्स ओपन झाल्यास प्रवाह खंडित होतो आणि मोटर त्वरित थांबते."
  },
  {
    "id": 1714,
    "chapterId": 73,
    "question": "How the opposite polarity of adjacent poles of a 4 pole DC motor is obtained?",
    "questionMarathi": "४ पोल डीसी मोटरच्या शेजारील पोल्सची विरुद्ध ध्रुवता (Opposite Polarity) कशी मिळवली जाते?",
    "options": ["By increasing the number of turns in coil", "By decreasing the number of turns in coil", "By making the current flow in same direction", "By making the current flow in opposite direction"],
    "optionsMarathi": ["कॉइलच्या फेऱ्यांची संख्या वाढवून", "कॉइलच्या फेऱ्यांची संख्या कमी करून", "करंट एकाच दिशेने प्रवाहित करून", "करंट विरुद्ध दिशेने प्रवाहित करून"],
    "answer": "D",
    "explanation": "Making current flow in opposite directions in adjacent coils creates alternate North and South poles.",
    "explanationMarathi": "शेजारील कॉइल्समधील प्रवाहाची दिशा परस्पर विरुद्ध ठेवून आलटून-पालटून एन (N) आणि एस (S) पोल्स मिळवले जातात."
  },
  {
    "id": 1715,
    "chapterId": 73,
    "question": "Why shunt field coil is connected in series with holding coil in D.C three point starter?",
    "questionMarathi": "डीसी थ्री पॉइंट स्टार्टरमध्ये शंट फील्ड कॉइल होल्डिंग कॉइल (No-Volt Coil) च्या सिरीजमध्ये का जोडली जाते?",
    "options": ["Increase the holding coil current", "Decrease the holding coil current", "Protect the shunt field from over current", "Protect the motor in case of open in shunt field"],
    "optionsMarathi": ["होल्डिंग कॉइल करंट वाढवण्यासाठी", "होल्डिंग कॉइल करंट कमी करण्यासाठी", "शंट फील्डला ओव्हर करंटपासून वाचवण्यासाठी", "शंट फील्ड सर्किट ओपन झाल्यास मोटरचे रक्षण करण्यासाठी"],
    "answer": "D",
    "explanation": "Connecting the holding coil in series with the shunt field protects the motor from runaway speeds if the field circuit becomes open.",
    "explanationMarathi": "फील्ड ओपन झाल्यास होल्डिंग कॉइलचे चुंबकीय बल संपते आणि ती हँडल सोडते, ज्यामुळे मोटर अतिवेगाने धावण्यापासून वाचते."
  },
  {
    "id": 1716,
    "chapterId": 73,
    "question": "Which method of speed control offers the speed below the rated speed of DC shunt motor?",
    "questionMarathi": "डीसी शंट मोटरची गती तिच्या नेहमीच्या (Rated) गतीपेक्षा कमी करण्यासाठी कोणती पद्धत वापरली जाते?",
    "options": ["Field control method", "Connecting additional winding in series with field", "Armature control method", "Connecting additional resistance in series with field"],
    "optionsMarathi": ["फील्ड नियंत्रण पद्धत", "फील्डच्या सिरीजमध्ये अतिरिक्त वाइंडिंग जोडणे", "आर्मेचर नियंत्रण पद्धत", "फील्डच्या सिरीजमध्ये अतिरिक्त रेझिस्टन्स जोडणे"],
    "answer": "C",
    "explanation": "Armature control (adding resistance in the armature circuit) lowers the voltage across the armature, reducing speed below rated values.",
    "explanationMarathi": "आर्मेचर कंट्रोल पद्धतीमध्ये आर्मेचरला मिळणारे व्होल्टेज कमी करून गती रेटेड गतीपेक्षा कमी केली जाते."
  },
  {
    "id": 1717,
    "chapterId": 73,
    "question": "Which method of speed control offers the speed below the rated speed of DC series motor?",
    "questionMarathi": "डीसी सिरीज मोटरची गती तिच्या नेहमीच्या (Rated) गतीपेक्षा कमी करण्यासाठी कोणती पद्धत वापरली जाते?",
    "options": ["Field diverter method", "Tapped field method", "Connecting additional winding in series with field", "Armature diverter method"],
    "optionsMarathi": ["फील्ड डायव्हर्टर पद्धत", "टॅप्ड FIELD पद्धत", "सिरीज फील्ड अतिरिक्त वाइंडिंग", "आर्मेचर डायव्हर्टर पद्धत"],
    "answer": "D",
    "explanation": "The armature diverter method controls series motor speed by bypassing current around the armature, reducing speed below normal.",
    "explanationMarathi": "सिरीज मोटरची गती रेटेड गतीपेक्षा कमी करण्यासाठी आर्मेचर डायव्हर्टर पद्धत वापरली जाते."
  },
  {
    "id": 1718,
    "chapterId": 73,
    "question": "Why the series field is short circuited at the time of starting in the differential compound motor?",
    "questionMarathi": "डिफरेंशियल कंपाउंड मोटर सुरू करताना तिची सिरीज फील्ड शॉर्ट सर्किट का केली जाते?",
    "options": ["To reduce the starting current", "To decrease the back EMF", "To decrease the speed of motor", "To maintain the proper direction of rotation"],
    "optionsMarathi": ["स्टार्टिंग करंट कमी करण्यासाठी", "बॅक EMF कमी करण्यासाठी", "मोटरची गती कमी करण्यासाठी", "फिरण्याची योग्य दिशा राखण्यासाठी"],
    "answer": "D",
    "explanation": "Differential motors start with series fields shorted to prevent high starting currents from reversing the motor rotation due to opposing fluxes.",
    "explanationMarathi": "डिफरेंशियल मोटर सुरू करताना सिरीज फील्ड शॉर्ट केल्याने मोटर विरुद्ध दिशेने फिरण्याचा धोका टळतो आणि योग्य गती व दिशा राखली जाते."
  },
  {
    "id": 1719,
    "chapterId": 73,
    "question": "Which DC motor can be operated at constant speed under varying load?",
    "questionMarathi": "कोणती डीसी मोटर बदलत्या लोडवर स्थिर गतीने चालविली जाऊ शकते?",
    "options": ["Differential long shunt compound motor", "Cumulative long shunt compound motor", "Differential short shunt compound motor", "Series motor"],
    "optionsMarathi": ["डिफरेंशियल लाँग शंट कंपाउंड मोटर", "क्युम्युलेटिव्ह लाँग शंट कंपाउंड मोटर", "डिफरेंशियल शॉर्ट शंट कंपाउंड मोटर", "सिरीज मोटर"],
    "answer": "B",
    "explanation": "Cumulative long shunt compound motors provide near-constant speed under varying loads because the cumulative fields balance speed drop.",
    "explanationMarathi": "क्युम्युलेटिव्ह लाँग शंट कंपाउंड मोटर बदलत्या लोडवर अत्यंत उत्कृष्टपणे स्थिर गती राखते."
  },
  {
    "id": 1720,
    "chapterId": 73,
    "question": "How the no volt coil is connected in a three point starter with DC shunt motor?",
    "questionMarathi": "डीसी शंट मोटरच्या थ्री पॉइंट स्टार्टरमध्ये नो व्होल्ट कॉइल (NVC) कशी जोडली जाते?",
    "options": ["Directly connected to the supply", "Connected in series with the armature", "Connected in parallel with the armature", "Connected in series with the shunt field"],
    "optionsMarathi": ["थेट सप्लायला जोडली जाते", "आर्मेचरच्या सिरीजमध्ये", "आर्मेचरच्या पॅरेललमध्ये", "शंट फील्डच्या सिरीजमध्ये"],
    "answer": "D",
    "explanation": "The NVC in a three-point starter is connected in series with the shunt field to trip the starter if the field current drops to zero.",
    "explanationMarathi": "नो व्होल्ट कॉइल (NVC) शंट फील्डच्या सिरीजमध्ये जोडल्यामुळे फील्ड खंडित झाल्यास स्टार्टर हँडल मुक्त करतो."
  },
  {
    "id": 1721,
    "chapterId": 73,
    "question": "Which speed control method is applied to obtain both below normal and above normal speed in DC motor?",
    "questionMarathi": "डीसी मोटरमध्ये नेहमीच्या गतीपेक्षा कमी आणि जास्त दोन्ही प्रकारच्या गती मिळवण्यासाठी कोणती पद्धत वापरतात?",
    "options": ["Field control method", "Armature control method", "Tapped field speed control method", "Ward Leonard speed control method"],
    "optionsMarathi": ["फील्ड नियंत्रण पद्धत", "आर्मेचर नियंत्रण पद्धत", "टॅप्ड फील्ड गती नियंत्रण", "वार्ड लिओनार्ड गती नियंत्रण पद्धत"],
    "answer": "D",
    "explanation": "The Ward Leonard speed control method is used to control motor speeds in both directions smoothly from zero to maximum, above and below normal.",
    "explanationMarathi": "वार्ड लिओनार्ड नियंत्रण पद्धत मोटरची गती सामान्यपेक्षा कमी आणि जास्त अशा दोन्ही दिशांमध्ये अतिशय नियंत्रितपणे बदलू शकते."
  },
  {
    "id": 1722,
    "chapterId": 73,
    "question": "Why the holding coil of a 3 point starter is connected in series with shunt field?",
    "questionMarathi": "३ पॉइंट स्टार्टरची होल्डिंग कॉइल शंट फील्डच्या सिरीजमध्ये का जोडलेली असते?",
    "options": ["To limit the load current", "To run motor at low voltage", "To hold the handle firmly", "To protect the motor if the field opens"],
    "optionsMarathi": ["लोड करंट मर्यादित करण्यासाठी", "कमी व्होल्टेजवर मोटर चालवण्यासाठी", "हँडल घट्ट पकडण्यासाठी", "शंट फील्ड ओपन झाल्यास मोटरचे रक्षण करण्यासाठी"],
    "answer": "D",
    "explanation": "Holding coil series connection ensures the motor is automatically disconnected if the shunt field winding breaks or opens.",
    "explanationMarathi": "शंट फील्ड ओपन किंवा खंडित झाल्यास होल्डिंग कॉइल डी-मॅग्नेटाइज होते, ज्यामुळे मोटर तात्काळ बंद होऊन सुरक्षित राहते."
  },
  {
    "id": 1723,
    "chapterId": 73,
    "question": "What is the better method to change the DOR of a compound motor without changing its characteristics?",
    "questionMarathi": "कंपाउंड मोटरचे गुणधर्म न बदलता तिच्या फिरण्याची दिशा (DOR) बदलण्याची उत्तम पद्धत कोणती?",
    "options": ["Change the direction of armature current", "Change the direction of shunt field current", "Change the direction of series field current", "Change the direction of both the armature and shunt field current"],
    "optionsMarathi": ["फक्त आर्मेचर करंटची दिशा बदलणे", "शंट फील्ड करंटची दिशा बदलणे", "सिरीज फील्ड करंटची दिशा बदलणे", "आर्मेचर आणि शंट फील्ड दोन्हीची दिशा बदलणे"],
    "answer": "A",
    "explanation": "Changing armature current direction reverses the rotation without altering compound characteristics (cumulative/differential).",
    "explanationMarathi": "फक्त आर्मेचर करंटची दिशा बदलल्यास मोटरचे मूळ गुणधर्म (क्युम्युलेटिव्ह/डिफरेंशियल) न बदलता तिची दिशा बदलते."
  },
  {
    "id": 1724,
    "chapterId": 73,
    "question": "What is the purpose of no volt coil in 3 point starter?",
    "questionMarathi": "३ पॉइंट स्टार्टरमध्ये नो व्होल्ट कॉइल (NVC) चा मुख्य उद्देश काय आहे?",
    "options": ["To improve the torque", "To increase the field current", "To increase the back emf", "To disconnect the motor if power fails"],
    "optionsMarathi": ["टॉर्क सुधारणे", "फील्ड करंट वाढवणे", "बॅक EMF वाढवणे", "सप्लाय खंडित झाल्यास मोटर डिस्कनेक्ट करणे"],
    "answer": "D",
    "explanation": "The No Volt Coil (NVC) releases the starter arm to the OFF position when the power supply fails, protecting the motor.",
    "explanationMarathi": "वीज पुरवठा खंडित झाल्यास स्टार्टरचे हँडल मूळ स्थितीत आणणे आणि मोटर बंद करणे हा NVC चा मुख्य उद्देश असतो."
  },
  {
    "id": 1725,
    "chapterId": 73,
    "question": "Which speed control system provides a smooth variation of speed from zero to above normal?",
    "questionMarathi": "शून्यापासून सामान्यपेक्षा अधिक गतीपर्यंत अतिशय गुळगुळीत बदल देणारी गती नियंत्रण प्रणाली कोणती आहे?",
    "options": ["Field control", "Armature control", "Field diverter control", "Ward-Leonard system control"],
    "optionsMarathi": ["फील्ड नियंत्रण", "आर्मेचर नियंत्रण", "फील्ड डायव्हर्टर नियंत्रण", "वार्ड-लिओनार्ड सिस्टम नियंत्रण"],
    "answer": "D",
    "explanation": "Ward-Leonard system control provides smooth, high-precision, and wide range of speed variations in both directions.",
    "explanationMarathi": "वार्ड-लिओनार्ड पद्धतीमुळे शून्यापासून कमाल गतीपर्यंत अतिशय गुळगुळीत आणि अचूक गती नियंत्रण मिळते."
  },
  {
    "id": 1726,
    "chapterId": 73,
    "question": "What is the name of rule as shown in figure?",
    "questionMarathi": "आकृतीत दर्शविलेल्या नियमाचे नाव काय आहे?",
    "options": ["Fleming's right hand rule", "Palm rule", "Fleming's left hand rule", "Thumb rule"],
    "optionsMarathi": ["फ्लेमिंगचा उजव्या हाताचा नियम", "पाम (Palm) नियम", "फ्लेमिंगचा डाव्या हाताचा नियम", "थम्ब (Thumb) नियम"],
    "answer": "C",
    "explanation": "The left-hand rule displays: Thumb = Force/Motion, Index = Magnetic Field/Flux, Middle = Current. This represents Fleming's Left-Hand Rule for motors.",
    "explanationMarathi": "आकृतीत अंगठा मोशन (गति), तर्जनी फ्लक्स आणि मधले बोट करंट दर्शवत आहेत, जो फ्लेमिंगचा डाव्या हाताचा नियम आहे.",
    "imageSvg": `<svg viewBox="0 0 400 200" className="w-full h-auto text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="150" y1="120" x2="150" y2="40" stroke-width="3" />
      <polygon points="150,30 145,45 155,45" fill="currentColor" />
      <line x1="150" y1="120" x2="250" y2="120" stroke-width="3" />
      <polygon points="260,120 245,115 245,125" fill="currentColor" />
      <line x1="150" y1="120" x2="100" y2="160" stroke-width="3" />
      <polygon points="95,164 102,152 110,158" fill="currentColor" />
      <text x="135" y="25" fill="currentColor" stroke="none" font-size="11" font-weight="bold">MOTION</text>
      <text x="240" y="110" fill="currentColor" stroke="none" font-size="11" font-weight="bold">FLUX</text>
      <text x="70" y="180" fill="currentColor" stroke="none" font-size="11" font-weight="bold">CURRENT</text>
    </svg>`
  },
  {
    "id": 1727,
    "chapterId": 73,
    "question": "Which is used to insulate the winding leads of a motor?",
    "questionMarathi": "मोटरच्या वाइंडिंग लीड्सला इन्सुलेट करण्यासाठी खालीलपैकी कशाचा उपयोग केला जातो?",
    "options": ["Cotton tape", "Fibre sleeve", "Pressphan paper", "Leatheroid paper"],
    "optionsMarathi": ["कॉटन टेप", "फायबर स्लीव्ह", "प्रेसफॅन पेपर", "लेदरॉयड पेपर"],
    "answer": "B",
    "explanation": "Fibre sleeves are robust tubular insulation materials threaded over motor output leads to insulate them safely.",
    "explanationMarathi": "वाइंडिंगच्या टोकांना (Leads) जोडण्यासाठी आणि सुरक्षित ठेवण्यासाठी फायबर स्लीव्ह (Fibre sleeve) चा उपयोग केला जातो."
  },
  {
    "id": 1728,
    "chapterId": 73,
    "question": "What is the name of the test as shown in the figure?",
    "questionMarathi": "चित्रामध्ये दाखविलेल्या चाचणीचे नाव काय आहे?",
    "options": ["Test for Grounded coil", "Test for Shorted coil", "Test for open coil", "Drop test"],
    "optionsMarathi": ["ग्राउंडेड कॉइल टेस्ट", "शॉर्टेड कॉइल टेस्ट", "ओपन कॉइल टेस्ट", "ड्रॉप टेस्ट"],
    "answer": "A",
    "explanation": "The diagram illustrates testing the armature conductors against the shaft for a ground/insulation fault using a supply probe.",
    "explanationMarathi": "आर्मेचर फिरकीच्या आणि शाफ्टच्या दरम्यान होणाऱ्या इन्सुलेशन गळतीची (ग्राउंड फॉल्ट) चाचणी आकृतीत दर्शविली आहे.",
    "imageSvg": `<svg viewBox="0 0 400 200" className="w-full h-auto text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="100" y="70" width="200" height="40" rx="5" />
      <circle cx="200" cy="90" r="30" fill="currentColor" fill-opacity="0.1" />
      <line x1="80" y1="90" x2="320" y2="90" stroke-width="4" />
      <circle cx="200" cy="90" r="5" />
      <path d="M 230 90 L 260 150" stroke="currentColor" stroke-width="2" />
      <path d="M 80 90 L 100 150" stroke="currentColor" stroke-width="2" />
      <text x="150" y="170" fill="currentColor" stroke="none" font-size="11" font-weight="bold">GROUND TEST PROBES</text>
    </svg>`
  },
  {
    "id": 1729,
    "chapterId": 73,
    "question": "Choose the symbol for main fuse board without switches.",
    "questionMarathi": "विना स्विचच्या मुख्य फ्युज बोर्डसाठी (Main Fuse Board without switches) योग्य चिन्ह निवडा.",
    "options": ["Plain rectangle", "Half shaded rectangle", "Fully black shaded rectangle", "Striped rectangle"],
    "optionsMarathi": ["कोरा चौकोन", "अर्धा काळा चौकोन", "पूर्ण काळा भरलेला चौकोन", "रेषा असलेला चौकोन"],
    "answer": "C",
    "explanation": "A completely filled black rectangle is the standard graphical symbol representing a main fuse board without switches.",
    "explanationMarathi": "पूर्णपणे काळा रंगवलेला आयातकृती चौकोन हा मुख्य फ्युज बोर्डचे (विना स्विचचे) प्रतिनिधित्व करतो.",
    "imageSvg": `<svg viewBox="0 0 400 150" className="w-full h-auto text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <g transform="translate(160, 25)">
        <rect x="0" y="0" width="80" height="100" fill="currentColor" />
        <text x="-40" y="120" fill="currentColor" stroke="none" font-size="12" font-weight="bold">FUSE BOARD (WITHOUT SWITCH)</text>
      </g>
    </svg>`
  },
  {
    "id": 1730,
    "chapterId": 73,
    "question": "Which of the following are some informal situations within the workplace?",
    "questionMarathi": "खालीलपैकी कोणती वर्कप्लेसच्या आतील एक अनौपचारिक (Informal) स्थिती आहे?",
    "options": ["Working with files", "Working with a desk top", "Working in a laptop", "Having a meal in the office canteen"],
    "optionsMarathi": ["फायलींसोबत काम करणे", "डेस्कटॉपवर काम करणे", "लॅपटॉपवर काम करणे", "ऑफिसच्या कॅन्टीनमध्ये एकत्र जेवण करणे"],
    "answer": "D",
    "explanation": "Sharing a meal in the canteen creates an informal social atmosphere, unlike regular desk tasks which are formal.",
    "explanationMarathi": "ऑफिसच्या कॅन्टीनमध्ये एकत्र जेवण करणे किंवा गप्पा मारणे हे वर्कप्लेसच्या अंतर्गत अनौपचारिक (Informal) संबंधांमध्ये येते."
  }
];
