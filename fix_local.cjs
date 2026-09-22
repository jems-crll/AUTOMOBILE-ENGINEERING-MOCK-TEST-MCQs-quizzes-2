const fs = require('fs');

if (fs.existsSync('src/utils/localTranslator.ts')) {
    fs.unlinkSync('src/utils/localTranslator.ts');
    console.log("Deleted localTranslator.ts");
}
