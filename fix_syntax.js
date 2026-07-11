const fs = require('fs');
let code = fs.readFileSync('lib/StoreProvider.tsx', 'utf8');

code = code.replace(
  /\};\s*\|\s*'timestamp'>\) => Promise<void>;\s*\};/,
  "};"
);

fs.writeFileSync('lib/StoreProvider.tsx', code);
