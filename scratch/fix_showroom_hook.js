const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

const target = `  // Auto-slugify category nameVi
  useEffect(() => {
    if (!isEdit && nameVi) {
      setSlug(slugify(nameVi));
    }
  }, [nameVi, isEdit]);

  const handleAiFill = async () => {
    if (!nameVi.trim() && !addressVi.trim()) return;`;

const replacement = `  // Auto-generate showroom code from nameVi
  useEffect(() => {
    if (!isEdit && nameVi) {
      setCode(slugify(nameVi));
    }
  }, [nameVi, isEdit]);

  const handleAiFill = async () => {
    if (!nameVi.trim() && !addressVi.trim()) return;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Successfully fixed showroom auto-slug hook!");
} else {
  console.log("WARNING: target not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
