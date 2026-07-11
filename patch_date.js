const fs = require('fs');
let code = fs.readFileSync('components/DriverDashboard.tsx', 'utf8');

// Replace format(new Date(ride.date), "HH:mm") with a safe format
code = code.replace(
  /format\(new Date\(ride\.date\),\s*"HH:mm"\)/g,
  "(ride.date && !isNaN(new Date(ride.date).getTime()) ? format(new Date(ride.date), \"HH:mm\") : '--:--')"
);

fs.writeFileSync('components/DriverDashboard.tsx', code);
