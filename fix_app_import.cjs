const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
if (!content.includes('import { t }')) {
  content = content.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { t } from "./utils/i18n";'
  );
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log("Added import to App.tsx");
}
