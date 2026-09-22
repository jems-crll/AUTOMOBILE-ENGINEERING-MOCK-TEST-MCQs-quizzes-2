const fs = require('fs');
let content = fs.readFileSync('src/data/questions_electrical.ts', 'utf8');

// The file starts with:
// export const ELECTRICAL_QUESTIONS: Question[] = [
//   {
//     "id": 20000,
//     "chapterId": 34,
// ...

const prefix = 'export const QUESTIONS_ELEC: Question[] = [';
const startIndex = content.indexOf(prefix);
if (startIndex !== -1) {
    let offset = startIndex + prefix.length;
    let endOfFirstQuestion = content.indexOf('  },', offset);
    let firstQuestionText = content.substring(offset, endOfFirstQuestion + 4);
    
    // Add translations field
    let updatedQuestion = firstQuestionText.replace(
      '"explanationMarathi": "इलेक्ट्रोप्लेटिंग, सेल आणि धातू शुद्धीकरण या तिन्हीमध्ये रासायनिक प्रभावाचा वापर केला जातो."\n',
      `"explanationMarathi": "इलेक्ट्रोप्लेटिंग, सेल आणि धातू शुद्धीकरण या तिन्हीमध्ये रासायनिक प्रभावाचा वापर केला जातो.",
    "translations": {
      "hi": {
        "question": "विद्युत धारा के रासायनिक प्रभाव का उपयोग निम्नलिखित में से किस विधि में नहीं किया जाता है?",
        "options": [
          "इलेक्ट्रोप्लेटिंग (विद्युत लेपन)",
          "सेल (बैटरी)",
          "धातु शोधन",
          "इनमें से कोई नहीं"
        ],
        "explanation": "विद्युत धारा के रासायनिक प्रभावों का उपयोग इलेक्ट्रोप्लेटिंग, सेल और धातुओं के शोधन में किया जाता है।"
      },
      "gu": {
        "question": "નીચેનામાંથી કઈ પદ્ધતિમાં વર્તમાનની રાસાયણિક અસરનો ઉપયોગ થતો નથી?",
        "options": [
          "ઇલેક્ટ્રોપ્લેટિંગ",
          "કોષ (સેલ)",
          "મેટલ શુદ્ધિકરણ",
          "આમાંથી કોઈ નહીં"
        ],
        "explanation": "પ્રવાહની રાસાયણિક અસરોનો ઉપયોગ ઇલેક્ટ્રોપ્લેટિંગ, કોષો અને શુદ્ધિકરણ ધાતુઓમાં થાય છે."
      }
    }\n`
    );
    
    content = content.replace(firstQuestionText, updatedQuestion);
    fs.writeFileSync('src/data/questions_electrical.ts', content, 'utf8');
    console.log("Added Hindi and Gujarati examples to the first question.");
} else {
    console.log("Could not find the start of QUESTIONS_ELEC array.");
}
