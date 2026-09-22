const fs = require('fs');
const axios = require('axios');

const langs = [
  { code: 'mr', name: 'Marathi' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'bn', name: 'Bengali' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' }
];

async function translate(text, targetLang) {
  try {
    const response = await axios.post('http://localhost:3000/api/translate-text', {
      text,
      targetLanguage: targetLang
    });
    return response.data.translatedText;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

async function translateQuestion(q, targetLangCode, targetLangName) {
  try {
    const response = await axios.post('http://localhost:3000/api/translate-question', {
      question: q.question.en,
      options: q.options.en,
      explanation: q.explanation.en,
      targetLanguage: targetLangName
    });
    return response.data.translated;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

async function run() {
  const data = JSON.parse(fs.readFileSync('translated_q50.json', 'utf8'));
  
  for (const lang of langs) {
    const missing = data.filter(q => !q.question[lang.code] || !q.options[lang.code] || !q.explanation[lang.code]);
    if (missing.length === 0) continue;
    
    console.log(`Fixing ${missing.length} missing translations for ${lang.code}...`);
    for (let i = 0; i < missing.length; i++) {
      const q = missing[i];
      console.log(`[${lang.code}] Translating Q ${q.id} (${i + 1}/${missing.length})...`);
      
      const translated = await translateQuestion(q, lang.code, lang.name);
      if (translated) {
        const originalQ = data.find(item => item.id === q.id);
        originalQ.question[lang.code] = translated.question;
        originalQ.options[lang.code] = translated.options;
        originalQ.explanation[lang.code] = translated.explanation;
        fs.writeFileSync('translated_q50.json', JSON.stringify(data, null, 2));
      }
      
      // Wait to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

run();
