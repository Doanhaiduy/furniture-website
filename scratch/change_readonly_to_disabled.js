const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Category
content = content.replace(
  `              <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} readOnly={true} />`,
  `              <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} disabled={true} />`
);

// 2. Showroom
content = content.replace(
  `              <AdminField label="Mã nội bộ (Đường dẫn)" name="showroom-code" value={code} onChange={setCode} readOnly={true} />`,
  `              <AdminField label="Mã nội bộ (Đường dẫn)" name="showroom-code" value={code} onChange={setCode} disabled={true} />`
);

// 3. Brand
content = content.replace(
  `          <AdminField
            label="Đường dẫn"
            name="brand-slug"
            value={slug}
            onChange={setSlug}
            readOnly={true}
          />`,
  `          <AdminField
            label="Đường dẫn"
            name="brand-slug"
            value={slug}
            onChange={setSlug}
            disabled={true}
          />`
);

// 4. Promotion
content = content.replace(
  `            <AdminField
              label="Mã khuyến mãi (Đường dẫn) *"
              name="code"
              value={code}
              onChange={setCode}
              error={fieldErrors.code}
              placeholder="Ví dụ: VALENTINE-COMBO"
              readOnly={true}
            />`,
  `            <AdminField
              label="Mã khuyến mãi (Đường dẫn) *"
              name="code"
              value={code}
              onChange={setCode}
              error={fieldErrors.code}
              placeholder="Ví dụ: VALENTINE-COMBO"
              disabled={true}
            />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Replaced all readOnly={true} with disabled={true} successfully!");
