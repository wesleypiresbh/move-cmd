const fs = require('fs');
let code = fs.readFileSync('components/DriverDashboard.tsx', 'utf8');

// remove existing early returns
code = code.replace(/if \(loading\) return \([\s\S]*?<\/div>\n  \);/g, '');
code = code.replace(/if \(!currentUser\) return \([\s\S]*?<\/div>\n  \);/g, '');
code = code.replace(/if \(currentUser\.status !== 'active'\) {[\s\S]*?<\/div>\n    \);\n  }/g, '');

code = code.replace(
  "const [locationLoading, setLocationLoading] = useState(false);",
  "const [locationLoading, setLocationLoading] = useState(false);\n  if (loading) return (\n    <div className=\"p-8 text-center flex flex-col items-center justify-center h-full\">\n      <div className=\"w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4\"></div>\n      <p className=\"text-slate-500 font-medium\">Carregando dados do motorista...</p>\n    </div>\n  );\n  if (!currentUser) return (\n    <div className=\"p-8 text-center bg-white m-4 rounded-xl shadow-sm border border-red-200 text-red-600\">\n      Perfil não encontrado.\n    </div>\n  );\n  if (currentUser.status !== 'active') {\n    return (\n      <div className=\"p-8 text-center bg-amber-50 m-4 rounded-xl shadow-sm border border-amber-200\">\n        <h3 className=\"text-lg font-bold text-amber-900 mb-2\">Acesso Restrito</h3>\n        <p className=\"text-slate-600\">Sua conta de motorista está pendente de aprovação por um administrador.</p>\n        <p className=\"text-sm text-slate-500 mt-4\">Por favor, aguarde a liberação do seu acesso.</p>\n      </div>\n    );\n  }"
);
fs.writeFileSync('components/DriverDashboard.tsx', code);
