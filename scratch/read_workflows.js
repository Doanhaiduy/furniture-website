const fs = require('fs');
const lines = fs.readFileSync('components/showroom/admin-workflows.tsx', 'utf8').split('\n');
console.log(lines.slice(5150, 5175).map((l, idx) => `${5151 + idx}: ${l}`).join('\n'));
