const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  // Handle rating
  code = code.replace(
    /currentUser\.rating\.toFixed\(1\)/g,
    "(currentUser.rating || 5).toFixed(1)"
  );
  // Handle ridesCompleted
  code = code.replace(
    /currentUser\.ridesCompleted/g,
    "(currentUser.ridesCompleted || 0)"
  );
  // Handle price
  code = code.replace(
    /ride\.price\.toFixed\(2\)/g,
    "(ride.price || 0).toFixed(2)"
  );
  code = code.replace(
    /activeRide\.price\.toFixed\(2\)/g,
    "(activeRide.price || 0).toFixed(2)"
  );
  code = code.replace(
    /todayEarnings\.toFixed\(2\)/g,
    "(todayEarnings || 0).toFixed(2)"
  );
  fs.writeFileSync(file, code);
}

patchFile('components/DriverDashboard.tsx');
patchFile('components/PassengerDashboard.tsx');
patchFile('components/AdminDashboard.tsx');
