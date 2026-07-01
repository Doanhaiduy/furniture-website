const fs = require('fs');

const fullLogPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7bb26d92-a3c7-4400-8b47-fa9cdf45b5c6\\.system_generated\\logs\\transcript_full.jsonl';

try {
  const content = fs.readFileSync(fullLogPath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;
    const step = JSON.parse(line);
    if (step.step_index === 2372 || step.step_index === 2380) {
      console.log(`Step ${step.step_index}: Type ${step.type}`);
      if (step.tool_calls) {
        for (const tc of step.tool_calls) {
          if (tc.args && tc.args.CodeContent) {
            const outPath = `scratch/step_${step.step_index}_code.txt`;
            fs.writeFileSync(outPath, tc.args.CodeContent, 'utf8');
            console.log(`Wrote code to ${outPath} (length: ${tc.args.CodeContent.length})`);
          }
        }
      }
    }
  }
} catch (e) {
  console.error(e);
}
