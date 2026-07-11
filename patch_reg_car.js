const fs = require('fs');
let code = fs.readFileSync('components/RegistrationForm.tsx', 'utf8');

code = code.replace(
  /const \{ addUser \} = useAppStore\(\);/,
  "const { addUser, addCar } = useAppStore();"
);

// In handleSubmit
code = code.replace(
  /if \(activeEntity === 'driver' \|\| activeEntity === 'admin' \|\| activeEntity === 'operator'\) \{/,
  "if (activeEntity === 'car') {\n        await addCar({\n          model: formData.model || '',\n          plate: formData.plate || '',\n          capacity: parseInt(formData.capacity) || 3,\n          color: formData.color || '',\n          driverId: formData.driverId || ''\n        });\n      } else if (activeEntity === 'driver' || activeEntity === 'admin' || activeEntity === 'operator') {"
);

fs.writeFileSync('components/RegistrationForm.tsx', code);
