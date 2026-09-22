const fs = require('fs');

function fixQuiz() {
  let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');

  // Import t if not present
  if (!content.includes('import { t } from "../utils/i18n";')) {
    content = content.replace('import { Question', 'import { t } from "../utils/i18n";\nimport { Question');
  }

  content = content.replace(/\{bilingual \? "पूर्ण अभ्यासक्रम चाचणी" : "Full Syllabus Test"\}/g, '{t(selectedLanguage.code, "fullSyllabusTest")}');
  content = content.replace(/\{bilingual \? \`विषय \$\{chapterId\} चाचणी\` : \`Chapter \$\{chapterId\} Test\`\}/g, '{t(selectedLanguage.code, "chapterTest").replace("{id}", String(chapterId))}');
  content = content.replace(/\{bilingual \? "गेलेला वेळ:" : "Elapsed"\}/g, '{t(selectedLanguage.code, "elapsed")}');
  content = content.replace(/\{bilingual \? "चाचणी पूर्ण करा" : "Finish Test"\}/g, '{t(selectedLanguage.code, "finishTest")}');
  content = content.replace(/\{bilingual \? "प्रश्न शोधा\.\.\." : "Search questions\.\.\."\}/g, '{t(selectedLanguage.code, "searchQuestions")}');
  content = content.replace(/\{bilingual \? "पुनरावलोकन" : "Flag"\}/g, '{t(selectedLanguage.code, "flag")}');
  content = content.replace(/\{bilingual \? "मागील" : "Previous"\}/g, '{t(selectedLanguage.code, "previous")}');
  content = content.replace(/\{bilingual \? "पुढील" : "Next"\}/g, '{t(selectedLanguage.code, "next")}');
  content = content.replace(/\{bilingual \? "स्पष्टीकरण" : "Explanation"\}/g, '{t(selectedLanguage.code, "explanation")}');
  content = content.replace(/\{bilingual \? "चाचणी नेव्हिगेशन" : "Test Console"\}/g, '{t(selectedLanguage.code, "testConsole")}');
  content = content.replace(/\{bilingual \? "उत्तर दिलेले" : "Answered"\}/g, '{t(selectedLanguage.code, "answered")}');
  content = content.replace(/\{bilingual \? "उत्तर न दिलेले" : "Not Answered"\}/g, '{t(selectedLanguage.code, "notAnswered")}');
  content = content.replace(/\{bilingual \? "पुनरावलोकनासाठी चिन्हांकित" : "Flagged for Review"\}/g, '{t(selectedLanguage.code, "flaggedForReview")}');
  content = content.replace(/\{bilingual \? "बरोबर उत्तर" : "Correct Answer"\}/g, '{t(selectedLanguage.code, "correctAnswer")}');
  content = content.replace(/\{bilingual \? "चूक उत्तर" : "Incorrect Answer"\}/g, '{t(selectedLanguage.code, "incorrectAnswer")}');
  
  fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
}

function fixScorecard() {
  let content = fs.readFileSync('src/components/Scorecard.tsx', 'utf8');

  if (!content.includes('import { t } from "../utils/i18n";')) {
    content = content.replace('import { Question', 'import { t } from "../utils/i18n";\nimport { Question');
  }

  content = content.replace(/bilingual \? "उत्कृष्ट! अप्रतिम कामगिरी!" : "Outstanding! Elite Performance!"/g, 't(selectedLanguage.code, "outstandingTitle")');
  content = content.replace(/bilingual \? "तुम्हाला या संकल्पनांचे उत्तम ज्ञान आहे\." : "You have excellent knowledge of these concepts\."/g, 't(selectedLanguage.code, "outstandingDesc")');
  
  content = content.replace(/bilingual \? "चांगला प्रयत्न! छान!" : "Great Effort! Well Done!"/g, 't(selectedLanguage.code, "greatTitle")');
  content = content.replace(/bilingual \? "चांगली कामगिरी, पण अजून सुधारणेला वाव आहे\." : "Good performance, but there is still room for improvement\."/g, 't(selectedLanguage.code, "greatDesc")');
  
  content = content.replace(/bilingual \? "अधिक अभ्यासाची गरज!" : "Needs More Study!"/g, 't(selectedLanguage.code, "needsStudyTitle")');
  content = content.replace(/bilingual \? "तुमचे गुण वाढवण्यासाठी सराव करत राहा\." : "Keep practicing to improve your score\."/g, 't(selectedLanguage.code, "needsStudyDesc")');

  content = content.replace(/\{bilingual \? "एकूण गुण" : "Overall"\}/g, '{t(selectedLanguage.code, "overallScore")}');
  content = content.replace(/\{bilingual \? "चाचणी निकाल" : "TEST SCORECARD"\}/g, '{t(selectedLanguage.code, "testScorecard")}');
  content = content.replace(/\{bilingual \? "तुम्ही यशस्वीरित्या चाचणी पूर्ण केली आहे\. तुमचे निकाल खालीलप्रमाणे आहेत\. तुम्ही सर्व प्रश्नांची अचूक उत्तरे आणि स्पष्टीकरणे खाली पाहू शकता\." : "You have successfully completed the mock test\. Your complete results are shown below\. You can review exact explanations for each question\."\}/g, '{t(selectedLanguage.code, "scorecardDesc")}');
  
  content = content.replace(/\{bilingual \? "पुन्हा परीक्षा द्या" : "Retake Test"\}/g, '{t(selectedLanguage.code, "retakeTest")}');
  content = content.replace(/\{bilingual \? "डॅशबोर्डवर जा" : "Back to Dashboard"\}/g, '{t(selectedLanguage.code, "backToDashboard")}');
  
  content = content.replace(/\{bilingual \? \`आता अनलॉक करा \(फक्त ₹\$\{subscriptionConfig\.amount\}\)\` : \`Unlock All Now \(Only ₹\$\{subscriptionConfig\.amount\}\)\`\}/g, '{t(selectedLanguage.code, "unlockAllNow").replace("{amount}", String(subscriptionConfig.amount))}');
  
  content = content.replace(/\{bilingual \? "एकूण प्रश्न" : "Total Qs"\}/g, '{t(selectedLanguage.code, "totalQs")}');
  content = content.replace(/\{bilingual \? "बरोबर" : "Correct"\}/g, '{t(selectedLanguage.code, "correct")}');
  content = content.replace(/\{bilingual \? "चुकीचे" : "Incorrect"\}/g, '{t(selectedLanguage.code, "incorrect")}');
  content = content.replace(/\{bilingual \? "सोडवून दिले" : "Skipped"\}/g, '{t(selectedLanguage.code, "skippedLabel")}');
  content = content.replace(/\{bilingual \? "घेतलेला वेळ" : "Time Taken"\}/g, '{t(selectedLanguage.code, "timeTaken")}');
  
  content = content.replace(/bilingual \? "सोडून दिला \(Skipped\)" : "Skipped"/g, 't(selectedLanguage.code, "skippedValue")');
  content = content.replace(/bilingual \? "बरोबर \(Correct\)" : "Correct"/g, 't(selectedLanguage.code, "correctValue")');
  content = content.replace(/bilingual \? "चुकीचे \(Incorrect\)" : "Incorrect"/g, 't(selectedLanguage.code, "incorrectValue")');
  
  content = content.replace(/\{bilingual \? "सर्व प्रश्न तपासा" : "Review Panel"\}/g, '{t(selectedLanguage.code, "reviewPanel")}');
  content = content.replace(/\{bilingual \? "स्पष्टीकरण" : "Explanation"\}/g, '{t(selectedLanguage.code, "explanation")}');
  
  fs.writeFileSync('src/components/Scorecard.tsx', content, 'utf8');
}

fixQuiz();
fixScorecard();
console.log("Replaced UI strings with i18n t()!");
