const fs = require('fs');

const workflowsPath = 'components/showroom/admin-workflows.tsx';
let workflowsContent = fs.readFileSync(workflowsPath, 'utf8');

// Normalize to LF
workflowsContent = workflowsContent.replace(/\r\n/g, '\n');

// Load apply_all.js to extract the promotion replacement function
const applyAllPath = 'scratch/apply_all.js';
const applyAllContent = fs.readFileSync(applyAllPath, 'utf8').replace(/\r\n/g, '\n');

const token = 'const promoReplacementFunc = `';
const startIdx = applyAllContent.indexOf(token);
if (startIdx === -1) {
  console.error("Failed to find promoReplacementFunc token in apply_all.js!");
  process.exit(1);
}

const endIdx = applyAllContent.indexOf('`;\n\nif (content.includes(promoTargetFunc)) {', startIdx);
if (endIdx === -1) {
  console.error("Failed to find end index of promoReplacementFunc in apply_all.js!");
  process.exit(1);
}

const promoReplacementFunc = applyAllContent.substring(startIdx + token.length, endIdx);

// Locate the original PromotionEntityForm in workflows Content
// Let's find the original PromotionEntityForm function definition block
const originalPromoStartToken = 'function PromotionEntityForm({ idOrSlug }: { idOrSlug?: string }) {';
const originalPromoStartIdx = workflowsContent.indexOf(originalPromoStartToken);

if (originalPromoStartIdx === -1) {
  console.error("Failed to find original PromotionEntityForm signature in admin-workflows.tsx!");
  process.exit(1);
}

// Find the end of original PromotionEntityForm - it ends right before `function ProductBusinessFields`
const nextFuncToken = 'function ProductBusinessFields';
const originalPromoEndIdx = workflowsContent.indexOf(nextFuncToken, originalPromoStartIdx);

if (originalPromoEndIdx === -1) {
  console.error("Failed to find original PromotionEntityForm end boundary!");
  process.exit(1);
}

// Reassemble the workflows content by replacing the original block
const beforePromo = workflowsContent.substring(0, originalPromoStartIdx);
const afterPromo = workflowsContent.substring(originalPromoEndIdx);

workflowsContent = beforePromo + promoReplacementFunc + '\n' + afterPromo;

fs.writeFileSync(workflowsPath, workflowsContent, 'utf8');
console.log("Successfully replaced PromotionEntityForm with bilingual tabs and searchable product picker!");
