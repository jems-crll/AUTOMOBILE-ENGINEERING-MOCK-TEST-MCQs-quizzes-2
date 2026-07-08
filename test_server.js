import fetch from 'node-fetch';

async function test() {
  console.log("Fetching...");
  const res = await fetch('http://localhost:3000/api/translate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questions: [ { id: 1, question: "hello", options: ["a"] } ],
      languageCode: "hi"
    })
  });
  console.log("Status:", res.status);
  const data = await res.text();
  console.log("Data:", data);
}
test();
