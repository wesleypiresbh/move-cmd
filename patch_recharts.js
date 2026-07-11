const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (code.includes('import { BarChart')) {
    code = code.replace(
      "import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';",
      "import dynamic from 'next/dynamic';\nconst BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });\nconst Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });\nconst XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });\nconst YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });\nconst CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });\nconst Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });\nconst ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });"
    );
  }
  
  if (code.includes('import { AreaChart')) {
    code = code.replace(
      "import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';",
      "import dynamic from 'next/dynamic';\nconst AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });\nconst Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });\nconst XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });\nconst YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });\nconst CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });\nconst Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });\nconst ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });"
    );
  }
  
  fs.writeFileSync(file, code);
}

patchFile('components/DriverDashboard.tsx');
patchFile('components/AdminDashboard.tsx');
