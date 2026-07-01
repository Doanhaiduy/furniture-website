const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Locate the product picker section
const pickerStartToken = '        {/* --- PREMIUM SEARCHABLE PRODUCT MULTISELECT --- */}';
const pickerStartIdx = content.indexOf(pickerStartToken);

if (pickerStartIdx === -1) {
  console.log("WARNING: product picker start token not found!");
  process.exit(1);
}

// The section ends right before `      </div>\n\n      <aside className="space-y-5">`
const pickerEndToken = '      </div>\n\n      <aside className="space-y-5">';
const pickerEndIdx = content.indexOf(pickerEndToken, pickerStartIdx);

if (pickerEndIdx === -1) {
  console.log("WARNING: product picker end token not found!");
  process.exit(1);
}

// Extract the product picker section block
const productPickerBlock = content.substring(pickerStartIdx, pickerEndIdx);

// Remove the product picker section from its original position
let contentClean = content.substring(0, pickerStartIdx) + content.substring(pickerEndIdx);

// 2. Locate the insertion target: right before the `COMMON FIELDS` section
const commonFieldsToken = '        {/* --- COMMON FIELDS (LOCKED OUTSIDE TABS) --- */}';
const insertIdx = contentClean.indexOf(commonFieldsToken);

if (insertIdx === -1) {
  console.log("WARNING: COMMON FIELDS section token not found in cleaned content!");
  process.exit(1);
}

// Insert the product picker section block before `COMMON FIELDS`
const contentRefactored = contentClean.substring(0, insertIdx) + productPickerBlock + '\n' + contentClean.substring(insertIdx);

fs.writeFileSync(filePath, contentRefactored, 'utf8');
console.log("Successfully moved Product Multiselect section above Time/Discount section!");
