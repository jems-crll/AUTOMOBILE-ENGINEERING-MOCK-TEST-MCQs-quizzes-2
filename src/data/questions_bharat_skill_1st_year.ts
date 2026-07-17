// @ts-nocheck
import { Question } from "../types.js";

export const QUESTIONS_BHARAT_SKILL_1ST_YR: Question[] = [
  {
    "id": 1801,
    "chapterId": 74,
    "question": "What electrical quantities are related with the Ohm’s law?",
    "questionMarathi": "ओमच्या नियमाशी कोणत्या विद्युत राशी संबंधित आहेत?",
    "options": ["Current, resistance and power", "Current, voltage and resistivity", "Current, voltage and resistance", "Voltage, resistance and current density"],
    "optionsMarathi": ["करंट, रेझिस्टन्स आणि पॉवर", "करंट, व्होल्टेज आणि रेजिस्टिव्हिटी", "करंट, व्होल्टेज आणि रेझिस्टन्स", "व्होल्टेज, रेझिस्टन्स आणि करंट डेन्सिटी"],
    "answer": "C",
    "explanation": "Ohm's law states that the current flowing through a conductor is directly proportional to the voltage applied across it, provided physical conditions remain constant (V = IR). Thus, it relates Voltage, Current, and Resistance.",
    "explanationMarathi": "ओमचा नियम सांगतो की वाहकामधून वाहणारा करंट हा त्याला दिलेल्या व्होल्टेजच्या थेट प्रमाणात असतो (V = IR). म्हणजेच व्होल्टेज, करंट आणि रेझिस्टन्स या राशी संबंधित आहेत."
  },
  {
    "id": 1802,
    "chapterId": 74,
    "question": "What is the SI unit of resistivity?",
    "questionMarathi": "रेजिस्टिव्हिटी (Resistivity) चे SI एकक काय आहे?",
    "options": ["ohm / cm", "ohm / cm2", "ohm - metre", "ohm / metre"],
    "optionsMarathi": ["ओहम / सेमी", "ओहम / सेमी२", "ओहम - मीटर", "ओहम / मीटर"],
    "answer": "C",
    "explanation": "Resistivity (ρ) is measured in Ohm-metre (Ωm) in the SI system.",
    "explanationMarathi": "रेजिस्टिव्हिटी (ρ) चे SI एकक 'ओहम-मीटर' (Ωm) आहे."
  },
  {
    "id": 1803,
    "chapterId": 74,
    "question": "Which is an application of the series circuit?",
    "questionMarathi": "खालीलपैकी कोणता सिरीज सर्किटचा (Series Circuit) उपयोग आहे?",
    "options": ["Voltmeter connection", "Lighting circuits in home", "Shunt resistor in ammeter", "Multiplier resistor of a voltmeter"],
    "optionsMarathi": ["व्होल्टमीटर कनेक्शन", "घरातील लाइटिंग सर्किट", "अमीटरमधील शंट रेझिस्टन्स", "व्होल्टमीटरचा मल्टिप्लायर रेझिस्टन्स"],
    "answer": "D",
    "explanation": "A multiplier resistor is connected in series with a voltmeter moving coil to increase its voltage measuring range.",
    "explanationMarathi": "व्होल्टमीटरची रेंज वाढवण्यासाठी त्याच्या सिरीजमध्ये 'मल्टिप्लायर रेझिस्टन्स' जोडला जातो, जो सिरीज सर्किटचा एक उपयोग आहे."
  },
  {
    "id": 1804,
    "chapterId": 74,
    "question": "What is the effect of the circuit, if points ‘ab’ are shorted as shown in the figure?",
    "questionMarathi": "आकृतीत दर्शविल्याप्रमाणे जर 'ab' बिंदू शॉर्ट केले, तर सर्किटवर काय परिणाम होईल?",
    "options": ["Circuit resistance will become zero", "Same current will flow in all branches", "Supply voltage will increase in each branch", "Each branch current is equal to total current"],
    "optionsMarathi": ["सर्किटचा रेझिस्टन्स शून्य होईल", "सर्व शाखांमध्ये सारखाच करंट वाहेल", "प्रत्येक शाखेतील सप्लाय व्होल्टेज वाढेल", "प्रत्येक शाखेचा करंट एकूण करंटइतका असेल"],
    "answer": "A",
    "explanation": "Shorting the points 'ab' provides a zero-resistance path across the supply, making the effective circuit resistance zero and potentially causing a heavy current flow or fuse blow.",
    "explanationMarathi": "जर 'ab' बिंदू शॉर्ट केले, तर करंटला वाहण्यासाठी शून्य रेझिस्टन्सचा मार्ग मिळेल, ज्यामुळे सर्किटचा एकूण रेझिस्टन्स शून्य होईल.",
    "imageSvg": `<svg viewBox=\"0 0 400 200\" className=\"w-full h-auto text-slate-800 dark:text-slate-200\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">
      <rect x=\"40\" y=\"40\" width=\"40\" height=\"120\" />
      <text x=\"45\" y=\"105\" fill=\"currentColor\" stroke=\"none\" font-size=\"10\" font-weight=\"bold\">SUPPLY</text>
      <line x1=\"80\" y1=\"60\" x2=\"320\" y2=\"60\" />
      <line x1=\"80\" y1=\"140\" x2=\"320\" y2=\"140\" />
      
      <rect x=\"130\" y=\"80\" width=\"20\" height=\"40\" />
      <text x=\"132\" y=\"105\" fill=\"currentColor\" stroke=\"none\" font-size=\"10\">R1</text>
      <line x1=\"140\" y1=\"60\" x2=\"140\" y2=\"80\" />
      <line x1=\"140\" y1=\"120\" x2=\"140\" y2=\"140\" />

      <rect x=\"190\" y=\"80\" width=\"20\" height=\"40\" />
      <text x=\"192\" y=\"105\" fill=\"currentColor\" stroke=\"none\" font-size=\"10\">R2</text>
      <line x1=\"200\" y1=\"60\" x2=\"200\" y2=\"80\" />
      <line x1=\"200\" y1=\"120\" x2=\"200\" y2=\"140\" />

      <rect x=\"250\" y=\"80\" width=\"20\" height=\"40\" />
      <text x=\"252\" y=\"105\" fill=\"currentColor\" stroke=\"none\" font-size=\"10\">R3</text>
      <line x1=\"260\" y1=\"60\" x2=\"260\" y2=\"80\" />
      <line x1=\"260\" y1=\"120\" x2=\"260\" y2=\"140\" />

      <circle cx=\"320\" cy=\"60\" r=\"3\" fill=\"currentColor\" />
      <text x=\"325\" y=\"55\" fill=\"currentColor\" stroke=\"none\" font-size=\"12\">a</text>
      <circle cx=\"320\" cy=\"140\" r=\"3\" fill=\"currentColor\" />
      <text x=\"325\" y=\"155\" fill=\"currentColor\" stroke=\"none\" font-size=\"12\">b</text>
      
      <path d=\"M 320 60 Q 350 100 320 140\" stroke=\"currentColor\" stroke-dasharray=\"4 2\" />
    </svg>`
  }
];
