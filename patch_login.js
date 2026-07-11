const fs = require('fs');
let code = fs.readFileSync('components/LoginForm.tsx', 'utf8');

code = code.replace(
  /if \(type === 'admin'\) \{\s*if \(email\.includes\('operator'\)\) onLogin\('operator'\);\s*else onLogin\('admin'\);\s*\} else if \(type === 'motorista'\) \{\s*onLogin\('driver'\);\s*\} else \{\s*onLogin\('passenger'\);\s*\}/,
  `if (type === 'admin') {
        if (foundUser) {
          if (foundUser.role === 'admin' || foundUser.role === 'operator') {
            onLogin(foundUser.role);
          } else {
            auth.signOut();
            throw new Error('Acesso negado. Esta conta não possui privilégios administrativos.');
          }
        } else {
          onLogin('admin'); // Fallback for masteradmin or first-time
        }
      } else if (type === 'motorista') {
        if (foundUser && foundUser.role !== 'driver') {
          auth.signOut();
          throw new Error('Acesso negado. Esta conta não é de um motorista.');
        }
        onLogin('driver');
      } else {
        if (foundUser && foundUser.role !== 'passenger') {
          auth.signOut();
          throw new Error('Acesso negado. Tipo de conta incorreto.');
        }
        onLogin('passenger');
      }`
);

fs.writeFileSync('components/LoginForm.tsx', code);
