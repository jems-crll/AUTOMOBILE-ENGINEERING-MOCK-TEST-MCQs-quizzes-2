const fs = require('fs');

const extras = {
  en: {
    unlockPromptTitle: "Unlock all 20+ Questions with Premium!",
    unlockPromptText: "You only practiced 5 demo questions in the free version. Secure your success by upgrading to Premium to unlock all questions, explanation keys, and mock exams!"
  },
  mr: {
    unlockPromptTitle: "प्रीमियम सबस्क्रिप्शनसह सर्व २०+ प्रश्न अनलॉक करा!",
    unlockPromptText: "तुम्ही विनामूल्य आवृत्तीमध्ये फक्त ५ डेमो प्रश्न पाहिले आहेत. संपूर्ण अभ्यासक्रम आणि सर्व सराव संच सोडवण्यासाठी आजच प्रीमियम सबस्क्रिप्शन घ्या आणि तुमची यशस्वीतेची खात्री करा!"
  },
  hi: {
    unlockPromptTitle: "प्रीमियम के साथ सभी 20+ प्रश्न अनलॉक करें!",
    unlockPromptText: "आपने मुफ्त संस्करण में केवल 5 डेमो प्रश्नों का अभ्यास किया है। पूर्ण पाठ्यक्रम और सभी मॉक टेस्ट अनलॉक करने के लिए आज ही प्रीमियम प्राप्त करें!"
  },
  kn: {
    unlockPromptTitle: "ಪ್ರೀಮಿಯಂ ಮೂಲಕ ಎಲ್ಲಾ 20+ ಪ್ರಶ್ನೆಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಿ!",
    unlockPromptText: "ಉಚಿತ ಆವೃತ್ತಿಯಲ್ಲಿ ನೀವು ಕೇವಲ 5 ಡೆಮೊ ಪ್ರಶ್ನೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿದ್ದೀರಿ. ಪೂರ್ಣ ಪಠ್ಯಕ್ರಮ ಮತ್ತು ಎಲ್ಲಾ ಅಣಕು ಪರೀಕ್ಷೆಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಲು ಇಂದೇ ಪ್ರೀಮಿಯಂ ಪಡೆಯಿರಿ!"
  },
  te: {
    unlockPromptTitle: "ప్రీమియంతో మొత్తం 20+ ప్రశ్నలను అన్‌లాక్ చేయండి!",
    unlockPromptText: "ఉచిత వెర్షన్‌లో మీరు 5 డెమో ప్రశ్నలను మాత్రమే సాధన చేసారు. పూర్తి సిలబస్ మరియు అన్ని మాక్ పరీక్షలను అన్‌లాక్ చేయడానికి ఈరోజే ప్రీమియం పొందండి!"
  },
  ta: {
    unlockPromptTitle: "பிரீமியம் மூலம் அனைத்து 20+ கேள்விகளையும் திறக்கவும்!",
    unlockPromptText: "இலவச பதிப்பில் நீங்கள் 5 மாதிரி கேள்விகளை மட்டுமே பயிற்சி செய்தீர்கள். முழு பாடத்திட்டம் மற்றும் அனைத்து மாதிரி தேர்வுகளையும் திறக்க இன்றே பிரீமியம் பெறுங்கள்!"
  },
  gu: {
    unlockPromptTitle: "પ્રીમિયમ સાથે તમામ 20+ પ્રશ્નોને અનલૉક કરો!",
    unlockPromptText: "તમે મફત સંસ્કરણમાં માત્ર 5 ડેમો પ્રશ્નોનો જ અભ્યાસ કર્યો છે. સંપૂર્ણ અભ્યાસક્રમ અને તમામ મોક પરીક્ષણો અનલૉક કરવા માટે આજે જ પ્રીમિયમ મેળવો!"
  }
};

let content = fs.readFileSync('src/utils/i18n.ts', 'utf8');

function injectExtra(content, lang, extra) {
  const extraStr = Object.entries(extra).map(([k, v]) => `    ${k}: "${v}",`).join('\n');
  const regex = new RegExp(`(${lang}: \\{[\\s\\S]*?)(  \\},)`);
  return content.replace(regex, `$1${extraStr}\n$2`);
}

for (const lang of ['en', 'mr', 'hi', 'kn', 'te', 'ta', 'gu']) {
  content = injectExtra(content, lang, extras[lang]);
}

fs.writeFileSync('src/utils/i18n.ts', content, 'utf8');
console.log("Updated i18n with unlock prompts");
