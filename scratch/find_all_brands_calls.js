const fs = require('fs');
const lines = fs.readFileSync('components/showroom/admin-workflows.tsx', 'utf8').split('\n');
lines.forEach((l, idx) => {
  if (l.includes('getAdminBrands')) {
    console.log(`Line ${idx+1}: ${l}`);
    console.log(`Line ${idx+2}: ${lines[idx+1]}`);
    console.log(`Line ${idx+3}: ${lines[idx+2]}`);
    console.log('---');
  }
});
