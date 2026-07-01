const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Line 4121 replacement (brands)
const target1 = `        const brands = await getAdminBrands();
        const brandObj = brands.find(b => b.id === brand || b.name.vi === brand) || brands[0];`;

const replacement1 = `        const brandsData = await getAdminBrands();
        const brands = Array.isArray(brandsData) ? brandsData : brandsData?.data || [];
        const brandObj = brands.find(b => b.id === brand || b.name.vi === brand) || brands[0];`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log("Replaced target1");
} else {
  console.log("WARNING: target1 not found");
}

// 2. Line 4965 replacement (brands and rooms)
const target2 = `        const brands = await getAdminBrands();
        const rooms = await getAdminShowrooms();`;

const replacement2 = `        const brandsData = await getAdminBrands();
        const brands = Array.isArray(brandsData) ? brandsData : brandsData?.data || [];
        const roomsData = await getAdminShowrooms();
        const rooms = Array.isArray(roomsData) ? roomsData : roomsData?.data || [];`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log("Replaced target2");
} else {
  console.log("WARNING: target2 not found");
}

fs.writeFileSync(filePath, content, 'utf8');
