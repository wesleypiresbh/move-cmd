const fs = require('fs');
let code = fs.readFileSync('components/RegistrationForm.tsx', 'utf8');

code = code.replace(
  "if (activeEntity === 'driver' || activeEntity === 'admin' || activeEntity === 'operator') {",
  "if (activeEntity === 'driver' && (!formData.name || !formData.email || !formData.phone || !formData.cnh)) {\n        alert('Todos os campos são de preenchimento obrigatório para motoristas.');\n        return;\n      }\n      if (activeEntity === 'driver' || activeEntity === 'admin' || activeEntity === 'operator') {"
);

fs.writeFileSync('components/RegistrationForm.tsx', code);
