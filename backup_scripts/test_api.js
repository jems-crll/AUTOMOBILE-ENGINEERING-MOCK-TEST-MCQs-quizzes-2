import fetch from 'node-fetch';

fetch('http://localhost:3000/api/translate-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questions: [
      { id: 1, question: "What is the capital of India?", options: ["Delhi", "Mumbai"] }
    ],
    languageCode: "hi",
    languageName: "Hindi",
    languageState: "India"
  })
}).then(res => res.json()).then(data => {
  console.log(JSON.stringify(data, null, 2));
});
