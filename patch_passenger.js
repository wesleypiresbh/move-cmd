const fs = require('fs');
let code = fs.readFileSync('components/PassengerDashboard.tsx', 'utf8');
code = code.replace(
  "const [locationLoading, setLocationLoading] = useState(false);",
  "const [locationLoading, setLocationLoading] = useState(false);\n  if (loading) return <div className=\"p-8 text-center text-slate-500\">Carregando dados do usuário...</div>;\n  if (!currentUser) return <div className=\"p-8 text-center bg-white m-4 rounded-xl shadow-sm border border-red-200 text-red-600\">Perfil não encontrado.</div>;"
);
fs.writeFileSync('components/PassengerDashboard.tsx', code);
