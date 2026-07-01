const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7bb26d92-a3c7-4400-8b47-fa9cdf45b5c6\\.system_generated\\logs\\transcript.jsonl';

try {
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.split('\n');
  console.log("Total transcript lines:", lines.length);

  // Let's find lines that mention "replace_file_content" or "write_to_file" or "refactor"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      // Let's see if this step has tool_calls or content related to apply_promo, refactor_promotion, etc.
      const queryStr = JSON.stringify(obj);
      if (queryStr.includes('apply_promo.js') || queryStr.includes('refactor_promotion.js')) {
        console.log(`Line ${i}: Step ${obj.step_index}, Type ${obj.type}, Source ${obj.source}`);
      }
    } catch (e) {
      // Ignored
    }
  }
} catch (e) {
  console.error("Error reading transcript:", e);
}
