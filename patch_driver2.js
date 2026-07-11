const fs = require('fs');
let code = fs.readFileSync('components/DriverDashboard.tsx', 'utf8');

// remove ALL existing early returns that are before useState
code = code.replace(/if \(loading\) return <div[^>]*>.*?<\/div>;/g, '');
code = code.replace(/if \(!currentUser\) return <div[^>]*>.*?<\/div>;/g, '');
code = code.replace(/if \(!currentUser\.active\) \{[\s\S]*?\n  \}/g, '');

fs.writeFileSync('components/DriverDashboard.tsx', code);
