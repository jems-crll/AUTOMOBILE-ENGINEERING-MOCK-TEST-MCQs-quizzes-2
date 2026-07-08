import fetch from 'node-fetch';

fetch('http://localhost:3000/api/translate-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questions: [
      { id: 21, question: "What is the capital of India?", options: ["Delhi", "Mumbai"] },
      { id: 22, question: "How does an engine work?", options: ["Combustion", "Magic"] }
    ],
    languageCode: "hi",
    languageName: "Hindi",
    languageState: "India"
  })
}).then(res => res.json()).then(data => {
  console.log(JSON.stringify(data, null, 2));
});
