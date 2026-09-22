const fs = require('fs');

let quiz = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');
quiz = quiz.replace(/\{bilingual\s*\?\s*"परीक्षा मोडमध्ये, तुम्ही पूर्ण करून सबमिट करेपर्यंत कोणतीही उत्तरे उघड केली जाणार नाहीत\."\s*:\s*"In Exam mode, answers will not be revealed until you submit the test\."\}/g, '{t(selectedLanguage.code, "examModeWarning")}');
fs.writeFileSync('src/components/QuizContainer.tsx', quiz, 'utf8');

let analytics = fs.readFileSync('src/components/Analytics.tsx', 'utf8');
analytics = analytics.replace(/\{bilingual\s*\?\s*"तुम्ही अद्याप कोणतीही चाचणी पूर्ण केलेली नाही\. डॅशबोर्डवर परत जा आणि प्रगती ट्रॅक करण्यासाठी चाचणी सुरू करा\."\s*:\s*"You haven't completed any mock tests\. Head back to the dashboard to take a test and track your progress here\."\}/g, '{t(selectedLanguage.code, "noTestHistoryDesc")}');
fs.writeFileSync('src/components/Analytics.tsx', analytics, 'utf8');

// I also need to update i18n for examModeWarning
const i18n = fs.readFileSync('src/utils/i18n.ts', 'utf8');
const newI18n = i18n.replace(/noTestHistoryDesc: "You haven't completed any mock tests\. Head back to the dashboard to take a test and track your progress here\.",/g, 'noTestHistoryDesc: "You haven\'t completed any mock tests. Head back to the dashboard to take a test and track your progress here.",\n    examModeWarning: "In Exam mode, answers will not be revealed until you submit the test.",')
  .replace(/noTestHistoryDesc: "तुम्ही अद्याप कोणतीही चाचणी पूर्ण केलेली नाही\. डॅशबोर्डवर परत जा आणि प्रगती ट्रॅक करण्यासाठी चाचणी सुरू करा\.",/g, 'noTestHistoryDesc: "तुम्ही अद्याप कोणतीही चाचणी पूर्ण केलेली नाही. डॅशबोर्डवर परत जा आणि प्रगती ट्रॅक करण्यासाठी चाचणी सुरू करा.",\n    examModeWarning: "परीक्षा मोडमध्ये, तुम्ही पूर्ण करून सबमिट करेपर्यंत कोणतीही उत्तरे उघड केली जाणार नाहीत.",')
  .replace(/noTestHistoryDesc: "आपने अभी तक कोई मॉक टेस्ट पूरा नहीं किया है\. टेस्ट देने और अपनी प्रगति को ट्रैक करने के लिए डैशबोर्ड पर वापस जाएं\.",/g, 'noTestHistoryDesc: "आपने अभी तक कोई मॉक टेस्ट पूरा नहीं किया है। टेस्ट देने और अपनी प्रगति को ट्रैक करने के लिए डैशबोर्ड पर वापस जाएं।",\n    examModeWarning: "परीक्षा मोड में, जब तक आप टेस्ट सबमिट नहीं करते, उत्तर प्रकट नहीं किए जाएंगे।",')
  .replace(/noTestHistoryDesc: "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಅಣಕು ಪರೀಕ್ಷೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿಲ್ಲ\.",/g, 'noTestHistoryDesc: "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಅಣಕು ಪರೀಕ್ಷೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿಲ್ಲ.",\n    examModeWarning: "ಪರೀಕ್ಷಾ ಮೋಡ್‌ನಲ್ಲಿ, ನೀವು ಪರೀಕ್ಷೆಯನ್ನು ಸಲ್ಲಿಸುವವರೆಗೆ ಉತ್ತರಗಳನ್ನು ಬಹಿರಂಗಪಡಿಸಲಾಗುವುದಿಲ್ಲ.",')
  .replace(/noTestHistoryDesc: "మీరు ఇంకా ఎలాంటి మాక్ పరీక్షలను పూర్తి చేయలేదు\.",/g, 'noTestHistoryDesc: "మీరు ఇంకా ఎలాంటి మాక్ పరీక్షలను పూర్తి చేయలేదు.",\n    examModeWarning: "పరీక్ష మోడ్‌లో, మీరు పరీక్షను సమర్పించే వరకు సమాధానాలు వెల్లడించబడవు.",')
  .replace(/noTestHistoryDesc: "நீங்கள் இன்னும் எந்த மாதிரித் தேர்வுகளையும் முடிக்கவில்லை\.",/g, 'noTestHistoryDesc: "நீங்கள் இன்னும் எந்த மாதிரித் தேர்வுகளையும் முடிக்கவில்லை.",\n    examModeWarning: "தேர்வு முறையில், நீங்கள் தேர்வை சமர்ப்பிக்கும் வரை பதில்கள் வெளியிடப்படாது.",')
  .replace(/noTestHistoryDesc: "તમે હજુ સુધી કોઈપણ મોક પરીક્ષણો પૂર્ણ કર્યા નથી\.",/g, 'noTestHistoryDesc: "તમે હજુ સુધી કોઈપણ મોક પરીક્ષણો પૂર્ણ કર્યા નથી.",\n    examModeWarning: "પરીક્ષા મોડમાં, જ્યાં સુધી તમે પરીક્ષણ સબમિટ કરશો નહીં ત્યાં સુધી જવાબો જાહેર કરવામાં આવશે નહીં.",');
fs.writeFileSync('src/utils/i18n.ts', newI18n, 'utf8');

