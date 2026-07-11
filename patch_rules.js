const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');
code = code.replace(
  /function isAdmin\(\) \{\s*return isSignedIn\(\) && \(request\.auth\.token\.email == 'masteradmin@movecms\.com' \|\| \(exists\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\) && get\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\)\.data\.role in \['admin', 'operator'\]\)\);\s*\}/,
  "function isAdmin() { return isSignedIn() && (request.auth.token.email == 'masteradmin@movecms.com' || (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'operator'))); }"
);
fs.writeFileSync('firestore.rules', code);
