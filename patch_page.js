const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');
if (!code.includes("'use client'")) {
  code = "'use client';\n" + code;
  fs.writeFileSync('app/page.tsx', code);
}
