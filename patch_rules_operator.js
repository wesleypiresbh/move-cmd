const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  /get\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\)\.data\.role == 'admin'/g,
  "get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'operator']"
);

fs.writeFileSync('firestore.rules', code);
