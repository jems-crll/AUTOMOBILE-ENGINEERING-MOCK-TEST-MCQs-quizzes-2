const fs = require('fs');

let content = fs.readFileSync('src/components/Scorecard.tsx', 'utf8');

content = content.replace(/bilingual\s*\?\s*"तुमची ऑटोमोबाईल इंजिनिअरिंग संकल्पनांवर मजबूत पकड आहे\. अशीच तयारी सुरू ठेवा!"\s*:\s*"You have an outstanding grip on Automobile Engineering concepts\. Keep it up!"/g, 't(selectedLanguage.code, "outstandingDesc")');
content = content.replace(/bilingual\s*\?\s*"तुमची कामगिरी चांगली आहे, परंतु परिपूर्णतेसाठी अजून काही भागांवर लक्ष केंद्रित करण्याची गरज आहे\."\s*:\s*"Good performance, but there is still room to sharpen specific details for perfection\."/g, 't(selectedLanguage.code, "greatDesc")');
content = content.replace(/bilingual\s*\?\s*"चिंता करू नका! प्रश्नांची उत्तरे तपासा, संकल्पना समजून घ्या आणि पुन्हा प्रयत्न करा\."\s*:\s*"Don't worry! Review the incorrect answers, understand concepts, and try again\."/g, 't(selectedLanguage.code, "needsStudyDesc")');

const pText = 't(selectedLanguage.code, "unlockPromptText")';
const pTitle = 't(selectedLanguage.code, "unlockPromptTitle")';

content = content.replace(/\{bilingual\s*\?\s*"प्रीमियम सबस्क्रिप्शनसह सर्व २०\+ प्रश्न अनलॉक करा!"\s*:\s*"Unlock all 20\+ Questions with Premium!"\}/g, '{' + pTitle + '}');
content = content.replace(/\{bilingual\s*\?\s*"तुम्ही विनामूल्य आवृत्तीमध्ये फक्त ५ डेमो प्रश्न पाहिले आहेत\. संपूर्ण अभ्यासक्रम आणि सर्व सराव संच सोडवण्यासाठी आजच प्रीमियम सबस्क्रिप्शन घ्या आणि तुमची यशस्वीतेची खात्री करा!"\s*:\s*"You only practiced 5 demo questions in the free version\. Secure your success by upgrading to Premium to unlock all questions, explanation keys, and mock exams!"\}/g, '{' + pText + '}');

fs.writeFileSync('src/components/Scorecard.tsx', content, 'utf8');
console.log("Fixed Scorecard strings");
