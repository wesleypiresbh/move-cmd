const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');
code = code.replace(
  /allow update: if isSignedIn\(\) && isValidUser\(incoming\(\)\) && \([\s\S]*?\);/,
  match => match + "\n      allow delete: if isAdmin();"
);
fs.writeFileSync('firestore.rules', code);
