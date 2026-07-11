const fs = require('fs');
const files = ['components/AdminDashboard.tsx', 'components/PassengerDashboard.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('const { currentUser')) {
    code = code.replace(
      /const \{ currentUser(.*?)\} = useAppStore\(\);/,
      "const { currentUser$1, loading } = useAppStore();"
    );
    code = code.replace(
      /if \(!currentUser\) return <div className="p-8 text-center text-slate-500">Carregando\.\.\.<\/div>;/g,
      "if (loading) return <div className=\"p-8 text-center text-slate-500\">Carregando...</div>;\n  if (!currentUser) return <div className=\"p-8 text-center bg-white m-4 rounded-xl shadow-sm border border-red-200 text-red-600\">Perfil não encontrado.</div>;"
    );
    code = code.replace(
      /if \(!currentUser\) return <div className="p-8 text-center text-slate-500">Carregando dados do usuário\.\.\.<\/div>;/g,
      "if (loading) return <div className=\"p-8 text-center text-slate-500\">Carregando dados do usuário...</div>;\n  if (!currentUser) return <div className=\"p-8 text-center bg-white m-4 rounded-xl shadow-sm border border-red-200 text-red-600\">Perfil não encontrado.</div>;"
    );
    fs.writeFileSync(file, code);
  }
}
