const fs = require('fs');
let code = fs.readFileSync('components/LoginForm.tsx', 'utf8');

code = code.replace(
  /const foundUser = users\.find\(u => u\.email === email\);/,
  "let foundUser = users.find(u => u.email === email);"
);

code = code.replace(
  /\} else \{\s*let foundUser = users\.find\(u => u\.email === email\);/,
  "} else {\n        foundUser = users.find(u => u.email === email);"
);

code = code.replace(
  /try \{\s*if \(isSignUp\)/,
  "let foundUser = undefined;\n    try {\n      if (isSignUp)"
);

fs.writeFileSync('components/LoginForm.tsx', code);
