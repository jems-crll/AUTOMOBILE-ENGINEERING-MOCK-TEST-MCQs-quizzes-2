const fs = require('fs');

const extraEn = {
  noTestHistory: "No Test History Yet",
  noTestHistoryDesc: "You haven't completed any mock tests. Head back to the dashboard to take a test and track your progress here.",
  performanceAnalytics: "Performance Analytics",
  performanceAnalyticsDesc: "Detailed overview of test progression and target learning zones",
  confirmClearHistory: "Are you sure you want to clear your test history? This cannot be undone.",
  clearHistory: "Clear History",
  scoreProgressionTrend: "Score Progression Trend",
  strongAreas: "Strong Areas (Score ≥ 70%)",
  noStrongAreas: "No chapters identified yet. Achieve 70% or higher to list here.",
  targetZones: "Target Zones (Score < 70%)",
  noTargetZones: "No target zones identified. Keep practicing to locate improvement focus.",
  detailedAttemptLog: "Detailed Attempt Log",
  dateLabel: "Date",
  chapterLabel: "Chapter",
  scoreLabel: "Score",
  timeSpentLabel: "Time Spent"
};

const extraMr = {
  noTestHistory: "चाचणी इतिहास उपलब्ध नाही",
  noTestHistoryDesc: "तुम्ही अद्याप कोणतीही चाचणी पूर्ण केलेली नाही. डॅशबोर्डवर परत जा आणि प्रगती ट्रॅक करण्यासाठी चाचणी सुरू करा.",
  performanceAnalytics: "प्रगती आणि विश्लेषण",
  performanceAnalyticsDesc: "तुमच्या गुणांचे सविस्तर आलेख आणि प्रगती अहवाल",
  confirmClearHistory: "तुम्हाला खरोखर सर्व इतिहास पुसून टाकायचा आहे का?",
  clearHistory: "इतिहास पुसा",
  scoreProgressionTrend: "गुण प्रगती आलेख",
  strongAreas: "मजबूत विषय (Score ≥ 70%)",
  noStrongAreas: "अद्याप पुरेसा डेटा नाही.",
  targetZones: "अभ्यासाची गरज (Score < 70%)",
  noTargetZones: "अभ्यासाची गरज असलेला कोणताही विशिष्ट विषय नाही!",
  detailedAttemptLog: "सर्व चाचणी इतिहास",
  dateLabel: "तारीख",
  chapterLabel: "विषय",
  scoreLabel: "गुण",
  timeSpentLabel: "वेळ"
};

const extraHi = {
  noTestHistory: "कोई टेस्ट इतिहास नहीं",
  noTestHistoryDesc: "आपने अभी तक कोई मॉक टेस्ट पूरा नहीं किया है। टेस्ट देने और अपनी प्रगति को ट्रैक करने के लिए डैशबोर्ड पर वापस जाएं।",
  performanceAnalytics: "प्रदर्शन विश्लेषण",
  performanceAnalyticsDesc: "टेस्ट प्रगति और लक्षित अध्ययन क्षेत्रों का विस्तृत अवलोकन",
  confirmClearHistory: "क्या आप वाकई अपना टेस्ट इतिहास हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता है।",
  clearHistory: "इतिहास साफ़ करें",
  scoreProgressionTrend: "स्कोर प्रगति रुझान",
  strongAreas: "मजबूत विषय (स्कोर ≥ 70%)",
  noStrongAreas: "अभी तक पर्याप्त डेटा नहीं है।",
  targetZones: "अध्ययन की आवश्यकता (स्कोर < 70%)",
  noTargetZones: "कोई विशिष्ट विषय नहीं जिसे सुधारने की आवश्यकता हो!",
  detailedAttemptLog: "विस्तृत प्रयास लॉग",
  dateLabel: "तारीख",
  chapterLabel: "विषय",
  scoreLabel: "स्कोर",
  timeSpentLabel: "बिताया गया समय"
};

const extraKn = {
  noTestHistory: "ಇನ್ನೂ ಪರೀಕ್ಷಾ ಇತಿಹಾಸವಿಲ್ಲ",
  noTestHistoryDesc: "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಅಣಕು ಪರೀಕ್ಷೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿಲ್ಲ.",
  performanceAnalytics: "ಪ್ರಗತಿ ವಿಶ್ಲೇಷಣೆ",
  performanceAnalyticsDesc: "ಪರೀಕ್ಷಾ ಪ್ರಗತಿಯ ವಿವರವಾದ ಅವಲೋಕನ",
  confirmClearHistory: "ನಿಮ್ಮ ಪರೀಕ್ಷಾ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?",
  clearHistory: "ಇತಿಹಾಸವನ್ನು ಅಳಿಸಿ",
  scoreProgressionTrend: "ಅಂಕಗಳ ಪ್ರಗತಿ ಟ್ರೆಂಡ್",
  strongAreas: "ಬಲವಾದ ವಿಷಯಗಳು (ಸ್ಕೋರ್ ≥ 70%)",
  noStrongAreas: "ಇನ್ನೂ ಸಾಕಷ್ಟು ಡೇಟಾ ಇಲ್ಲ.",
  targetZones: "ಗುರಿ ಪ್ರದೇಶಗಳು (ಸ್ಕೋರ್ < 70%)",
  noTargetZones: "ಸುಧಾರಣೆಗಾಗಿ ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಗುರಿಗಳಿಲ್ಲ.",
  detailedAttemptLog: "ವಿವರವಾದ ಪ್ರಯತ್ನ ಲಾಗ್",
  dateLabel: "ದಿನಾಂಕ",
  chapterLabel: "ಅಧ್ಯಾಯ",
  scoreLabel: "ಅಂಕ",
  timeSpentLabel: "ಸಮಯ"
};

const extraTe = {
  noTestHistory: "పరీక్ష చరిత్ర లేదు",
  noTestHistoryDesc: "మీరు ఇంకా ఎలాంటి మాక్ పరీక్షలను పూర్తి చేయలేదు.",
  performanceAnalytics: "పనితీరు విశ్లేషణ",
  performanceAnalyticsDesc: "పరీక్ష ప్రగతి మరియు అభ్యాస రంగాల వివరణాత్మక అవలోకనం",
  confirmClearHistory: "మీ పరీక్ష చరిత్రను క్లియర్ చేయాలనుకుంటున్నారా?",
  clearHistory: "చరిత్రను క్లియర్ చేయండి",
  scoreProgressionTrend: "స్కోర్ ప్రగతి ట్రెండ్",
  strongAreas: "బలమైన విభాగాలు (స్కోర్ ≥ 70%)",
  noStrongAreas: "ఇంకా తగినంత డేటా లేదు.",
  targetZones: "లక్ష్య విభాగాలు (స్కోర్ < 70%)",
  noTargetZones: "మెరుగుపరచాల్సిన నిర్దిష్ట విభాగాలు ఏమీ లేవు.",
  detailedAttemptLog: "ప్రయత్నాల వివరాలు",
  dateLabel: "తేదీ",
  chapterLabel: "అధ్యాయం",
  scoreLabel: "స్కోర్",
  timeSpentLabel: "సమయం"
};

const extraTa = {
  noTestHistory: "தேர்வு வரலாறு இல்லை",
  noTestHistoryDesc: "நீங்கள் இன்னும் எந்த மாதிரித் தேர்வுகளையும் முடிக்கவில்லை.",
  performanceAnalytics: "செயல்திறன் பகுப்பாய்வு",
  performanceAnalyticsDesc: "தேர்வு முன்னேற்றம் மற்றும் கற்றல் மண்டலங்களின் விரிவான கண்ணோட்டம்",
  confirmClearHistory: "உங்கள் தேர்வு வரலாற்றை அழிக்க விரும்புகிறீர்களா?",
  clearHistory: "வரலாற்றை அழி",
  scoreProgressionTrend: "மதிப்பெண் முன்னேற்றப் போக்கு",
  strongAreas: "வலுவான பகுதிகள் (மதிப்பெண் ≥ 70%)",
  noStrongAreas: "இன்னும் போதுமான தரவு இல்லை.",
  targetZones: "இலக்கு மண்டலங்கள் (மதிப்பெண் < 70%)",
  noTargetZones: "மேம்படுத்துவதற்கான குறிப்பிட்ட இலக்குகள் எதுவும் இல்லை.",
  detailedAttemptLog: "முயற்சிகளின் பதிவு",
  dateLabel: "தேதி",
  chapterLabel: "அத்தியாயம்",
  scoreLabel: "மதிப்பெண்",
  timeSpentLabel: "நேரம்"
};

const extraGu = {
  noTestHistory: "હજુ સુધી કોઈ પરીક્ષણ ઇતિહાસ નથી",
  noTestHistoryDesc: "તમે હજુ સુધી કોઈપણ મોક પરીક્ષણો પૂર્ણ કર્યા નથી.",
  performanceAnalytics: "પ્રદર્શન વિશ્લેષણ",
  performanceAnalyticsDesc: "પરીક્ષણ પ્રગતિ અને લક્ષ્ય લર્નિંગ ઝોનનું વિગતવાર વિહંગાવલોકન",
  confirmClearHistory: "શું તમે તમારો પરીક્ષણ ઇતિહાસ કાઢી નાખવા માંગો છો?",
  clearHistory: "ઇતિહાસ કાઢી નાખો",
  scoreProgressionTrend: "સ્કોર પ્રગતિ વલણ",
  strongAreas: "મજબૂત વિસ્તારો (સ્કોર ≥ 70%)",
  noStrongAreas: "હજુ સુધી પૂરતો ડેટા નથી.",
  targetZones: "લક્ષ્ય ઝોન (સ્કોર < 70%)",
  noTargetZones: "સુધારણા માટે કોઈ ચોક્કસ લક્ષ્યો નથી.",
  detailedAttemptLog: "વિગતવાર પ્રયાસ લોગ",
  dateLabel: "તારીખ",
  chapterLabel: "પ્રકરણ",
  scoreLabel: "સ્કોર",
  timeSpentLabel: "સમય"
};

let i18n = fs.readFileSync('src/utils/i18n.ts', 'utf8');

function injectExtra(content, lang, extra) {
  const extraStr = Object.entries(extra).map(([k, v]) => `    ${k}: "${v}",`).join('\n');
  const regex = new RegExp(`(${lang}: \\{[\\s\\S]*?)(  \\},)`);
  return content.replace(regex, `$1${extraStr}\n$2`);
}

for (const lang of ['en', 'mr', 'hi', 'kn', 'te', 'ta', 'gu']) {
  if(i18n.includes(extraEn.noTestHistory) && lang==='en') continue;
  i18n = injectExtra(i18n, lang, eval(`extra${lang.charAt(0).toUpperCase() + lang.slice(1)}`));
}

fs.writeFileSync('src/utils/i18n.ts', i18n, 'utf8');

let analytics = fs.readFileSync('src/components/Analytics.tsx', 'utf8');

// Replace props
analytics = analytics.replace(/bilingual: boolean;/g, 'selectedLanguage: any;');
analytics = analytics.replace(/bilingual,/g, 'selectedLanguage,');

// Import t
if(!analytics.includes('import { t } from "../utils/i18n";')) {
  analytics = analytics.replace('import { QuizAttempt', 'import { t } from "../utils/i18n";\nimport { QuizAttempt');
}

// Replace Strings
analytics = analytics.replace(/\{bilingual \? "चाचणी इतिहास उपलब्ध नाही" : "No Test History Yet"\}/g, '{t(selectedLanguage.code, "noTestHistory")}');
analytics = analytics.replace(/\{bilingual\s*\?\s*"तुम्ही अद्याप कोणतीही चाचणी पूर्ण केलेली नाही\. डॅशबोर्डवर परत जा आणि प्रगती ट्रॅक करण्यासाठी चाचणी सुरू करा\."\s*:\s*"You haven't completed any mock tests\. Head back to the dashboard to take a test and track your progress here\."\s*\}/g, '{t(selectedLanguage.code, "noTestHistoryDesc")}');
analytics = analytics.replace(/\{bilingual \? "प्रगती आणि विश्लेषण" : "Performance Analytics"\}/g, '{t(selectedLanguage.code, "performanceAnalytics")}');
analytics = analytics.replace(/\{bilingual \? "तुमच्या गुणांचे सविस्तर आलेख आणि प्रगती अहवाल" : "Bilingual review of test progression and target learning zones"\}/g, '{t(selectedLanguage.code, "performanceAnalyticsDesc")}');
analytics = analytics.replace(/bilingual \? "तुम्हाला खरोखर सर्व इतिहास पुसून टाकायचा आहे का\?" : "Are you sure you want to clear your test history\? This cannot be undone\."/g, 't(selectedLanguage.code, "confirmClearHistory")');
analytics = analytics.replace(/\{bilingual \? "इतिहास पुसा" : "Clear History"\}/g, '{t(selectedLanguage.code, "clearHistory")}');
analytics = analytics.replace(/\{bilingual \? "गुण प्रगती आलेख" : "Score Progression Trend"\}/g, '{t(selectedLanguage.code, "scoreProgressionTrend")}');
analytics = analytics.replace(/\{bilingual \? "मजबूत विषय \(Score ≥ 70%\)" : "Strong Areas \(Score ≥ 70%\)"\}/g, '{t(selectedLanguage.code, "strongAreas")}');
analytics = analytics.replace(/\{bilingual \? "अद्याप पुरेसा डेटा नाही\." : "No chapters identified yet\. Achieve 70% or higher to list here\."\}/g, '{t(selectedLanguage.code, "noStrongAreas")}');
analytics = analytics.replace(/\{bilingual \? "अभ्यासाची गरज \(Score < 70%\)" : "Target Zones \(Score < 70%\)"\}/g, '{t(selectedLanguage.code, "targetZones")}');
analytics = analytics.replace(/\{bilingual \? "अभ्यासाची गरज असलेला कोणताही विशिष्ट विषय नाही!" : "No target zones identified\. Keep practicing to locate improvement focus\."\}/g, '{t(selectedLanguage.code, "noTargetZones")}');
analytics = analytics.replace(/\{bilingual \? "सर्व चाचणी इतिहास" : "Detailed Attempt Log"\}/g, '{t(selectedLanguage.code, "detailedAttemptLog")}');
analytics = analytics.replace(/\{bilingual \? "तारीख" : "Date"\}/g, '{t(selectedLanguage.code, "dateLabel")}');
analytics = analytics.replace(/\{bilingual \? "विषय" : "Chapter"\}/g, '{t(selectedLanguage.code, "chapterLabel")}');
analytics = analytics.replace(/\{bilingual \? "गुण" : "Score"\}/g, '{t(selectedLanguage.code, "scoreLabel")}');
analytics = analytics.replace(/\{bilingual \? "वेळ" : "Time Spent"\}/g, '{t(selectedLanguage.code, "timeSpentLabel")}');

// Locales
analytics = analytics.replace(/bilingual \? "mr-IN" : "en-US"/g, 'selectedLanguage.code === "mr" ? "mr-IN" : selectedLanguage.code === "hi" ? "hi-IN" : "en-US"');

// Chapter name logic
analytics = analytics.replace(/ch \? \(bilingual \? ch\.nameMarathi : ch\.name\) : \`Chapter \$\{a\.chapterId\}\`/g, 'ch ? (ch.nameTranslated || ch.name) : `Chapter ${a.chapterId}`');

fs.writeFileSync('src/components/Analytics.tsx', analytics, 'utf8');

// Also fix App.tsx to pass selectedLanguage instead of bilingual
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/bilingual=\{bilingual\}/g, 'selectedLanguage={selectedLanguage}');
fs.writeFileSync('src/App.tsx', app, 'utf8');

// Check for that stray bilingual string in QuizContainer.tsx
let quiz = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');
quiz = quiz.replace(/\{bilingual\s*\?\s*"प्रीमियम सबस्क्रिप्शनसह सर्व २०\+ प्रश्न अनलॉक करा!"\s*:\s*"Unlock all 20\+ Questions with Premium!"\}/g, '{t(selectedLanguage.code, "unlockPromptTitle")}');
quiz = quiz.replace(/\{bilingual\s*\?\s*"तुम्ही विनामूल्य आवृत्तीमध्ये फक्त ५ डेमो प्रश्न पाहिले आहेत\. संपूर्ण अभ्यासक्रम आणि सर्व सराव संच सोडवण्यासाठी आजच प्रीमियम सबस्क्रिप्शन घ्या आणि तुमची यशस्वीतेची खात्री करा!"\s*:\s*"You only practiced 5 demo questions in the free version\. Secure your success by upgrading to Premium to unlock all questions, explanation keys, and mock exams!"\}/g, '{t(selectedLanguage.code, "unlockPromptText")}');

fs.writeFileSync('src/components/QuizContainer.tsx', quiz, 'utf8');
console.log("Analytics fixed");
