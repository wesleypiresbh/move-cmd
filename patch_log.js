const fs = require('fs');
let code = fs.readFileSync('lib/StoreProvider.tsx', 'utf8');

code = code.replace(
  /const unsubscribeAuth = onAuthStateChanged\(auth, \(firebaseUser\) => \{/,
  "const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {\n      console.log('onAuthStateChanged', firebaseUser?.uid);"
);

code = code.replace(
  /if \(userDoc\.exists\(\)\) \{/,
  "console.log('userDoc exists?', userDoc.exists());\n          if (userDoc.exists()) {"
);

code = code.replace(
  /handleFirestoreError\(error, OperationType\.GET, \`users\/\$\{firebaseUser\.uid\}\`\);/,
  "console.log('userDoc ERROR', error);\n          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);"
);

fs.writeFileSync('lib/StoreProvider.tsx', code);
