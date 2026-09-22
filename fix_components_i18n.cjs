const fs = require('fs');

const replaceInFile = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Insert import if not exists
  if (!content.includes('import { t } from')) {
    content = content.replace(
      /import \{ [^}]+\} from "react";/,
      `$& \nimport { t } from "../utils/i18n";`
    );
  }

  // Dashboard replacements
  content = content.replace(/selectedLanguage\.code === "mr" \? "मराठी" : "English"/g, 'selectedLanguage.nativeName');
  // I won't do full exhaustive search/replace blindly, but let's replace some common ones if they exist.
  // Actually, wait, let's just use `grep -n "selectedLanguage.code ===" src/components/*.tsx` to see what needs translation.
  
  fs.writeFileSync(file, content, 'utf8');
};

console.log("We need to check what files have explicit mr vs en strings");
