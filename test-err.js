const fs = require('fs');
let code = fs.readFileSync('components/LoginForm.tsx', 'utf8');
console.log(code.includes('setLoading(false)'));
