const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Chạy git fsck để lấy danh sách dangling blobs
  const output = execSync('git fsck --lost-found', { encoding: 'utf8' });
  const lines = output.split('\n');
  const blobs = [];
  
  lines.forEach(line => {
    if (line.includes('dangling blob')) {
      const parts = line.trim().split(/\s+/);
      const hash = parts[parts.length - 1];
      blobs.push(hash);
    }
  });

  console.log(`Found ${blobs.length} dangling blobs. Scanning...`);

  let foundBlob = null;
  let foundContent = '';

  for (const hash of blobs) {
    try {
      const content = execSync(`git cat-file -p ${hash}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      
      // Kiểm tra xem đây có phải là file admin-pages.tsx 3000 dòng không
      // File này chứa định nghĩa "ProductsPage" và "productTotal" và "CategoryPage"
      if (
        content.includes('function ProductsPage') &&
        content.includes('productTotal') &&
        content.includes('function CategoryPage') &&
        content.length > 100000 // > 100KB
      ) {
        console.log(`✨ Found matching admin-pages.tsx blob: ${hash} (Size: ${content.length} bytes)`);
        foundBlob = hash;
        foundContent = content;
        break;
      }
    } catch (err) {
      // Bỏ qua lỗi đọc blob
    }
  }

  if (foundBlob) {
    const targetPath = path.join(__dirname, '..', 'components', 'showroom', 'admin-pages.tsx');
    fs.writeFileSync(targetPath, foundContent, 'utf8');
    console.log(`✅ Restored admin-pages.tsx from dangling blob ${foundBlob}!`);
  } else {
    console.log('❌ Could not find matching admin-pages.tsx in dangling blobs.');
  }

} catch (e) {
  console.error('Error running restore scanner:', e);
}
