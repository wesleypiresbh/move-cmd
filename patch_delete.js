const fs = require('fs');
let code = fs.readFileSync('lib/StoreProvider.tsx', 'utf8');

code = code.replace(
  /handleFirestoreError\(error, OperationType\.DELETE, \`users\/\$\{id\}\`\);/g,
  "handleFirestoreError(error, OperationType.DELETE, `users/${id}`);\n      throw error;"
);

fs.writeFileSync('lib/StoreProvider.tsx', code);
