const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Locate the PromotionEntityForm
const promoFormIdx = content.indexOf('function PromotionEntityForm');
if (promoFormIdx === -1) {
  console.error("PromotionEntityForm not found!");
  process.exit(1);
}

// 2. Locate the picker section within PromotionEntityForm
const pickerStartToken = '        {/* --- PREMIUM SEARCHABLE PRODUCT MULTISELECT --- */}';
const pickerStartIdx = content.indexOf(pickerStartToken, promoFormIdx);
if (pickerStartIdx === -1) {
  console.error("Picker start token not found!");
  process.exit(1);
}

// Locate the closing </section> of this picker block
// It's the first </section> after pickerStartIdx, but wait, there are nested tags?
// Let's check: the section has a few divs.
// We can find the closing </section> by finding the last occurrence before the `</div>\n\n      <aside` block!
const endBoundaryToken = '      </div>\n\n      <aside className="space-y-5">';
const endBoundaryIdx = content.indexOf(endBoundaryToken, pickerStartIdx);
if (endBoundaryIdx === -1) {
  console.error("End boundary token not found!");
  process.exit(1);
}

// The last </section> before the endBoundaryIdx is the closing tag of the picker!
const pickerEndToken = '        </section>';
const pickerEndIdx = content.lastIndexOf(pickerEndToken, endBoundaryIdx);
if (pickerEndIdx === -1 || pickerEndIdx < pickerStartIdx) {
  console.error("Picker end tag not found!");
  process.exit(1);
}

const pickerBlockEnd = pickerEndIdx + pickerEndToken.length;
const pickerBlock = content.substring(pickerStartIdx, pickerBlockEnd);

// Remove the picker block from its current position
// (Note: we need to keep the closing </div> of the left column, so we keep the text between pickerBlockEnd and endBoundaryIdx!)
const spacingAndDiv = content.substring(pickerBlockEnd, endBoundaryIdx); // usually '\n      </div>\n\n'
let contentClean = content.substring(0, pickerStartIdx) + spacingAndDiv + content.substring(endBoundaryIdx);

// 3. Locate the insertion target: right before the `COMMON FIELDS` section in PromotionEntityForm
const commonFieldsToken = '        {/* --- COMMON FIELDS (LOCKED OUTSIDE TABS) --- */}';
const insertIdx = contentClean.indexOf(commonFieldsToken, promoFormIdx);
if (insertIdx === -1) {
  console.error("COMMON FIELDS target not found!");
  process.exit(1);
}

// Insert the picker block before COMMON FIELDS
const contentRefactored = contentClean.substring(0, insertIdx) + pickerBlock + '\n\n' + contentClean.substring(insertIdx);

fs.writeFileSync(filePath, contentRefactored, 'utf8');
console.log("Successfully moved Promotion Product Picker above Time/Discount section safely!");
