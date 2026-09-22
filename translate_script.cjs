
const fs = require('fs');

async function translate() {
  const languages = ["mr", "hi", "kn", "te", "ta", "gu", "bn", "pa", "ml", "or"];
  const questions = [
    {
      id: 1,
      question: "The basic automobile structure consists of the suspension system, axles, wheels and",
      options: ["steering", "brakes", "frame", "lights"],
      explanation: "The frame is the main load-carrying component that supports the engine, body, and all other components."
    },
    {
      id: 2,
      question: "Compared to framed construction, the frame less construction of automobiles is economical",
      options: ["always", "when produced in small quantities", "when produced on large scale", "never"],
      explanation: "Frame-less or monocoque construction requires high tooling cost, making it economical only for large-scale production."
    },
    {
      id: 3,
      question: "The purpose of gear box in an automobile is to",
      options: ["vary speed", "vary torque", "provide permanent speed reduction", "to disconnect the road wheels from the engine when desired"],
      explanation: "The gear box is designed to vary torque available at the wheels to overcome resistance under different driving conditions."
    }
  ];

  for (const lang of languages) {
    console.log(`Translating to ${lang}...`);
    try {
      const response = await fetch('http://localhost:3000/api/translate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, targetLanguage: lang })
      });
      const data = await response.json();
      fs.writeFileSync(`translated_${lang}.json`, JSON.stringify(data.translatedQuestions, null, 2));
    } catch (e) {
      console.error(`Failed ${lang}:`, e);
    }
  }
}

translate();
