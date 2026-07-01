const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Remove from ShowroomEntityForm
const showroomWrongTarget = `  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  // Auto-set parent category ID for new categories
  useEffect(() => {
    if (!isEdit && categoriesList.length > 0 && !parentId) {
      const firstGroup = categoriesList.find(c => c.parent_id === null);
      if (firstGroup) {
        setParentId(firstGroup.id);
        setParentGroup(firstGroup.group_key || "wooden_furniture");
      }
    }
  }, [categoriesList, isEdit, parentId]);
  const [showroomId, setShowroomId] = useState<string | null>(null);`;

const showroomCorrected = `  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [showroomId, setShowroomId] = useState<string | null>(null);`;

if (content.includes(showroomWrongTarget)) {
  content = content.replace(showroomWrongTarget, showroomCorrected);
  console.log("Successfully reverted ShowroomEntityForm misplaced useEffect!");
} else {
  console.log("WARNING: Showroom wrong target not found!");
}

// 2. Add to CategoryEntityForm
const categoryTarget = `  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");`;

const categoryReplacement = `  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  // Auto-set parent category ID for new categories
  useEffect(() => {
    if (!isEdit && categoriesList.length > 0 && !parentId) {
      const firstGroup = categoriesList.find(c => c.parent_id === null);
      if (firstGroup) {
        setParentId(firstGroup.id);
        setParentGroup(firstGroup.group_key || "wooden_furniture");
      }
    }
  }, [categoriesList, isEdit, parentId]);`;

// Since we want to replace CategoryEntityForm's status state specifically, let's find it after CategoriesList load
const catListSearch = '  // Load all categories for parent selector';
const idx = content.indexOf(catListSearch);

if (idx !== -1) {
  // Find the target status state just BEFORE catListSearch
  const statusIdx = content.lastIndexOf(categoryTarget, idx);
  if (statusIdx !== -1) {
    content = content.substring(0, statusIdx) + categoryReplacement + content.substring(statusIdx + categoryTarget.length);
    console.log("Successfully added useEffect to CategoryEntityForm!");
  } else {
    console.log("WARNING: status state not found before category load!");
  }
} else {
  console.log("WARNING: categories load comments not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
