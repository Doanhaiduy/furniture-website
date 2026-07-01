const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/\r\n/g, '\n');

// Fix: brands.map type error at ~line 5167
// setBrandsList(brands.map(b => ...)) -> brands needs to be an array
const target = `        setBrandsList(brands.map(b => ({ value: b.id, label: b.name.vi })));
        setShowroomsList(rooms.map(r => ({ value: r.code || r.id, label: r.name })));`;

const replacement = `        const brandsArr = Array.isArray(brands) ? brands : (brands as any)?.data || [];
        setBrandsList(brandsArr.map((b: any) => ({ value: b.id, label: b.name?.vi || b.name || "" })));
        const roomsArr = Array.isArray(rooms) ? rooms : (rooms as any)?.data || [];
        setShowroomsList(roomsArr.map((r: any) => ({ value: r.code || r.id, label: r.name?.vi || r.name || "" })));`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Successfully fixed brands.map and rooms.map type check error!");
} else {
  console.log("WARNING: Target not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
