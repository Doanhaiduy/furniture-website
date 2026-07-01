const fs = require('fs');

const logPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7bb26d92-a3c7-4400-8b47-fa9cdf45b5c6\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'components/showroom/admin-workflows.tsx';

try {
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.split('\n');
  console.log("Searching through", lines.length, "transcript steps...");

  let lastWriteContent = null;
  let lastWriteStep = null;
  let lastWriteTime = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const step = JSON.parse(line);
      
      // Look for write_to_file or replace_file_content tool calls targeting admin-workflows.tsx
      if (step.tool_calls) {
        for (const tc of step.tool_calls) {
          if (tc.name === 'write_to_file' && tc.args && tc.args.TargetFile && tc.args.TargetFile.includes('admin-workflows.tsx')) {
            lastWriteContent = tc.args.CodeContent;
            lastWriteStep = step.step_index;
            lastWriteTime = step.created_at;
          }
        }
      }
      
      // If it's a system message or a code action response that has the file content after edits
      if (step.type === 'CODE_ACTION' && step.content) {
        // CODE_ACTION shows diff or changes, might not be full file
      }

    } catch (e) {}
  }

  if (lastWriteContent) {
    console.log(`Found last full write at Step ${lastWriteStep} (${lastWriteTime})`);
    fs.writeFileSync('components/showroom/admin-workflows.tsx', lastWriteContent, 'utf8');
    console.log("Restored components/showroom/admin-workflows.tsx from transcript logs!");
  } else {
    console.log("No full write_to_file call found for admin-workflows.tsx in transcript.");
    
    // Let's search in transcript_full.jsonl!
    const fullLogPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7bb26d92-a3c7-4400-8b47-fa9cdf45b5c6\\.system_generated\\logs\\transcript_full.jsonl';
    if (fs.existsSync(fullLogPath)) {
      console.log("Searching in transcript_full.jsonl...");
      const fullContent = fs.readFileSync(fullLogPath, 'utf8');
      const fullLines = fullContent.split('\n');
      for (let i = 0; i < fullLines.length; i++) {
        const line = fullLines[i].trim();
        if (!line) continue;
        try {
          const step = JSON.parse(line);
          if (step.tool_calls) {
            for (const tc of step.tool_calls) {
              if (tc.name === 'write_to_file' && tc.args && tc.args.TargetFile && tc.args.TargetFile.includes('admin-workflows.tsx')) {
                lastWriteContent = tc.args.CodeContent;
                lastWriteStep = step.step_index;
                lastWriteTime = step.created_at;
              }
            }
          }
        } catch (e) {}
      }
      if (lastWriteContent) {
        console.log(`Found last full write in transcript_full at Step ${lastWriteStep} (${lastWriteTime})`);
        fs.writeFileSync('components/showroom/admin-workflows.tsx', lastWriteContent, 'utf8');
        console.log("Restored components/showroom/admin-workflows.tsx from transcript_full logs!");
      } else {
        console.log("Still no full write_to_file call found.");
      }
    }
  }
} catch (e) {
  console.error("Error:", e);
}
