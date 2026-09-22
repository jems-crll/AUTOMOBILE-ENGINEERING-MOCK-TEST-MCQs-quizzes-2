const fs = require('fs');

const files = [
    'src/data/questions_automobile.ts',
    'src/data/questions_electrical.ts',
    'src/data/questions_bharat_skill.ts',
    'src/data/questions_bharat_skill_1st_year.ts'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let prefix = '= [';
    let startIndex = content.indexOf(prefix);
    if (startIndex !== -1) {
        startIndex += prefix.length - 1;
        let endIndex = content.lastIndexOf('];') + 1;
        let arrayString = content.substring(startIndex, endIndex);
        try {
            let questions = eval('(' + arrayString + ')');
            let missing = questions.filter(q => q.id === undefined || q.id === null);
            console.log(file, 'Missing IDs:', missing.length);
        } catch (e) {
            console.log(file, 'Error parsing array', e.message);
        }
    }
});
