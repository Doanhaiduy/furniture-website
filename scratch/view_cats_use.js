const fs = require('fs');
const lines = fs.readFileSync('components/showroom/admin-workflows.tsx', 'utf8').split('\n');
console.log(lines.slice(4955, 5000).map((l, idx) => `${4956 + idx}: ${l}`).join('\n'));
