const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// Replacement 1: categories list load in hook
const target1 = `    import("@/lib/supabase/admin-queries").then(async ({ getAdminCategories }) => {
      try {
        const res = await getAdminCategories();
        setCategoriesList(res || []);
      } catch (err) {`;

const replacement1 = `    import("@/lib/supabase/admin-queries").then(async ({ getAdminCategories }) => {
      try {
        const res = await getAdminCategories();
        const cats = Array.isArray(res) ? res : res?.data || [];
        setCategoriesList(cats);
      } catch (err) {`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log("Successfully replaced target1");
} else {
  console.log("WARNING: target1 not found!");
}

// Replacement 2: cats find in edit load hook
const target2 = `        .then(async ({ getAdminCategories }) => {
          const cats = await getAdminCategories();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const match = (cats as any[]).find((c: any) => c.slug === editSlug || c.id === editSlug);`;

const replacement2 = `        .then(async ({ getAdminCategories }) => {
          const cats = await getAdminCategories();
          const catsArr = Array.isArray(cats) ? cats : cats?.data || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const match = (catsArr as any[]).find((c: any) => c.slug === editSlug || c.id === editSlug);`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log("Successfully replaced target2");
} else {
  console.log("WARNING: target2 not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
