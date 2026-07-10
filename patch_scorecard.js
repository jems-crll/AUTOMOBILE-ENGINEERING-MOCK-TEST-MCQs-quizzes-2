const fs = require('fs');

let content = fs.readFileSync('src/components/Scorecard.tsx', 'utf8');

if (!content.includes('import confetti')) {
  content = content.replace(
    'import { motion } from "motion/react";',
    'import { motion } from "motion/react";\nimport confetti from "canvas-confetti";\nimport { useEffect } from "react";'
  );
}

const useEffectHook = `
  useEffect(() => {
    if (questions && questions.length > 0) {
      const percentage = (score / questions.length) * 100;
      if (percentage >= 60) {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }
    }
  }, [score, questions]);
`;

content = content.replace(
  'const [reviewIndex, setReviewIndex] = useState<number>(0);',
  'const [reviewIndex, setReviewIndex] = useState<number>(0);\n' + useEffectHook
);

fs.writeFileSync('src/components/Scorecard.tsx', content);
