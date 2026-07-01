const fs = require('fs');

const logPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7bb26d92-a3c7-4400-8b47-fa9cdf45b5c6\\.system_generated\\logs\\transcript.jsonl';
const fullLogPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7bb26d92-a3c7-4400-8b47-fa9cdf45b5c6\\.system_generated\\logs\\transcript_full.jsonl';

function searchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  console.log(`Searching in ${filePath} (${lines.length} lines)...`);

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const step = JSON.parse(line);
      const stepStr = JSON.stringify(step);
      if (stepStr.includes('combo_price') && stepStr.includes('null') && stepStr.includes('selectedProductIds') && step.tool_calls) {
        for (const tc of step.tool_calls) {
          if (tc.name === 'replace_file_content' || tc.name === 'write_to_file') {
            console.log(`FOUND at Step ${step.step_index} (${step.created_at}) in tool call ${tc.name}`);
            console.log("Arguments keys:", Object.keys(tc.args));
            if (tc.args.ReplacementContent) {
              console.log("ReplacementContent length:", tc.args.ReplacementContent.length);
              if (tc.args.ReplacementContent.includes('Chọn sản phẩm giảm giá')) {
                console.log("Snippet from ReplacementContent:");
                console.log(tc.args.ReplacementContent.substring(0, 500));
                // Write it to a backup file so we can read it!
                fs.writeFileSync('scratch/recovered_promotion_replacement.txt', tc.args.ReplacementContent, 'utf8');
                return true;
              }
            }
          }
        }
      }
    } catch (e) {}
  }
  return false;
}

if (!searchFile(logPath)) {
  searchFile(fullLogPath);
}
