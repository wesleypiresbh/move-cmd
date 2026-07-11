const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
console.log(`Starting Next.js standalone server from ${serverPath}`);

const child = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || 3000,
  }
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
});
