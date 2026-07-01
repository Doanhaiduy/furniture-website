const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Locate the PromotionEntityForm handleSubmit
const promoFormIdx = content.indexOf('function PromotionEntityForm');
if (promoFormIdx === -1) {
  console.error("PromotionEntityForm not found!");
  process.exit(1);
}

const oldSubmitBlock = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFieldErrors({});
    try {`;

const newSubmitBlock = `  const handleSave = async (targetStatus: "draft" | "published" | "archived") => {
    setFormLoading(true);
    setFormError("");
    setFieldErrors({});
    try {
      setStatus(targetStatus);`;

const targetIdx = content.indexOf(oldSubmitBlock, promoFormIdx);
if (targetIdx !== -1) {
  content = content.substring(0, targetIdx) + newSubmitBlock + content.substring(targetIdx + oldSubmitBlock.length);
  console.log("Successfully converted Promotion handleSubmit to handleSave!");
} else {
  console.log("WARNING: Promotion handleSubmit target not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
