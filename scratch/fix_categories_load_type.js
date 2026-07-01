const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

const target = `  // Load all categories for parent selector
  useEffect(() => {
    import("@/lib/supabase/admin-queries").then(async ({ getAdminCategories }) => {
      try {
        const res = await getAdminCategories();
        setCategoriesList(res || []);
      } catch (err) {
        console.error("Failed to load categories list:", err);
      }
    });
  }, []);`;

const replacement = `  // Load all categories for parent selector
  useEffect(() => {
    import("@/lib/supabase/admin-queries").then(async ({ getAdminCategories }) => {
      try {
        const res = await getAdminCategories();
        const cats = Array.isArray(res) ? res : res?.data || [];
        setCategoriesList(cats);
      } catch (err) {
        console.error("Failed to load categories list:", err);
      }
    });
  }, []);`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Successfully fixed categories list load type check error!");
} else {
  console.log("WARNING: Target not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
