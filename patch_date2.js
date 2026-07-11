const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /format\(new Date\(ride\.date\),\s*'HH:mm'\)/g,
    "(ride.date && !isNaN(new Date(ride.date).getTime()) ? format(new Date(ride.date), 'HH:mm') : '--:--')"
  );
  code = code.replace(
    /format\(new Date\(ride\.date\),\s*"HH:mm"\)/g,
    "(ride.date && !isNaN(new Date(ride.date).getTime()) ? format(new Date(ride.date), \"HH:mm\") : '--:--')"
  );
  code = code.replace(
    /format\(new Date\(msg\.timestamp\),\s*'HH:mm'\)/g,
    "(msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) ? format(new Date(msg.timestamp), 'HH:mm') : '--:--')"
  );
  fs.writeFileSync(file, code);
}

patchFile('components/PassengerDashboard.tsx');
patchFile('components/AdminDashboard.tsx');
patchFile('components/Chat.tsx');
