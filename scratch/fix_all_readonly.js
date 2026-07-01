const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences of readOnly={true} with disabled={true}
const regex = /readOnly=\{true\}/g;
if (regex.test(content)) {
  content = content.replace(regex, 'disabled={true}');
  console.log("Successfully replaced all readOnly={true} with disabled={true}!");
} else {
  console.log("No readOnly={true} occurrences found.");
}

fs.writeFileSync(filePath, content, 'utf8');
