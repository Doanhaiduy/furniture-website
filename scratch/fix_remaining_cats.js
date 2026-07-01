const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Line 3788 replacement
const target1 = `            const { getAdminCategories } = await import("@/lib/supabase/admin-queries");
            const cats = await getAdminCategories();
            const res = await getAdminProductByIdOrSlug(editSlug);`;

const replacement1 = `            const { getAdminCategories } = await import("@/lib/supabase/admin-queries");
            const catsData = await getAdminCategories();
            const cats = Array.isArray(catsData) ? catsData : catsData?.data || [];
            const res = await getAdminProductByIdOrSlug(editSlug);`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log("Replaced target1");
} else {
  console.log("WARNING: target1 not found");
}

// 2. Line 4115 replacement
const target2 = `        const cats = await getAdminCategories();
        const catObj = cats.find(c => c.slug === category) || cats[0];`;

const replacement2 = `        const catsData = await getAdminCategories();
        const cats = Array.isArray(catsData) ? catsData : catsData?.data || [];
        const catObj = cats.find(c => c.slug === category) || cats[0];`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log("Replaced target2");
} else {
  console.log("WARNING: target2 not found");
}

// 3. Line 4961 replacement
const target3 = `        const cats = await getAdminCategories();
        const brands = await getAdminBrands();
        const rooms = await getAdminShowrooms();`;

const replacement3 = `        const catsData = await getAdminCategories();
        const cats = Array.isArray(catsData) ? catsData : catsData?.data || [];
        const brands = await getAdminBrands();
        const rooms = await getAdminShowrooms();`;

if (content.includes(target3)) {
  content = content.replace(target3, replacement3);
  console.log("Replaced target3");
} else {
  console.log("WARNING: target3 not found");
}

fs.writeFileSync(filePath, content, 'utf8');
