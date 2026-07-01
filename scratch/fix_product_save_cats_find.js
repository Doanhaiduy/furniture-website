const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

const target = `        const cats = await getAdminCategories();
        const catObj = cats.find(c => c.slug === category) || cats[0];
        const categoryId = catObj ? catObj.id : null;

        const brands = await getAdminBrands();
        const brandObj = brands.find(b => b.id === brand || b.name.vi === brand) || brands[0];`;

const replacement = `        const cats = await getAdminCategories();
        const catList = Array.isArray(cats) ? cats : cats?.data || [];
        const catObj = catList.find(c => c.slug === category) || catList[0];
        const categoryId = catObj ? catObj.id : null;

        const brands = await getAdminBrands();
        const brandsList = Array.isArray(brands) ? brands : (brands as any)?.data || [];
        const brandObj = brandsList.find((b: any) => b.id === brand || b.name?.vi === brand || b.name === brand) || brandsList[0];`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Successfully fixed product save categories find type check error!");
} else {
  console.log("WARNING: Target not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
