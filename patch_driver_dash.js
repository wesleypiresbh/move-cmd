const fs = require('fs');
let code = fs.readFileSync('components/DriverDashboard.tsx', 'utf8');

code = code.replace(
  /const \{ currentUser, rides, updateRideStatus \} = useAppStore\(\);/,
  "const { currentUser, rides, updateRideStatus, loading } = useAppStore();"
);

code = code.replace(
  /if \(!currentUser\) return <div className="p-8 text-center text-slate-500">Carregando dados do usuário\.\.\.<\/div>;/,
  "if (loading) return <div className=\"p-8 text-center text-slate-500\">Carregando dados do usuário...</div>;\n  if (!currentUser) return <div className=\"p-8 text-center bg-white m-4 rounded-xl shadow-sm border border-red-200 text-red-600\">Perfil não encontrado. Por favor, tente novamente ou contate o suporte.</div>;"
);

fs.writeFileSync('components/DriverDashboard.tsx', code);
