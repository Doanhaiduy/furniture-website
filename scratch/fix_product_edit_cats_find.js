const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

const target = `            const cats = await getAdminCategories();
            const res = await getAdminProductByIdOrSlug(editSlug);
            if (res.success && res.data) {
              const p = res.data;
              setEntityId(p.id);
              setViTitle(p.name_vi || "");
              setEnTitle(p.name_en || "");
              setViSlug(p.slug || "");
              setEnSlug(p.slug || "");
              setViSummary(p.summary_vi || "");
              setEnSummary(p.summary_en || "");
              setViBody(p.description_json_vi || "");
              setEnBody(p.description_json_en || "");
              setEnglishEnabled(!!p.name_en);
              
              setPrice(p.price_min ? String(p.price_min) : "");
              setQuoteOnly(p.price_display_text_vi === "Liên hệ" || !p.price_min);
              
              const catSlug = cats.find(c => c.id === p.category_id)?.slug || "wood";`;

const replacement = `            const cats = await getAdminCategories();
            const catList = Array.isArray(cats) ? cats : cats?.data || [];
            const res = await getAdminProductByIdOrSlug(editSlug);
            if (res.success && res.data) {
              const p = res.data;
              setEntityId(p.id);
              setViTitle(p.name_vi || "");
              setEnTitle(p.name_en || "");
              setViSlug(p.slug || "");
              setEnSlug(p.slug || "");
              setViSummary(p.summary_vi || "");
              setEnSummary(p.summary_en || "");
              setViBody(p.description_json_vi || "");
              setEnBody(p.description_json_en || "");
              setEnglishEnabled(!!p.name_en);
              
              setPrice(p.price_min ? String(p.price_min) : "");
              setQuoteOnly(p.price_display_text_vi === "Liên hệ" || !p.price_min);
              
              const catSlug = catList.find(c => c.id === p.category_id)?.slug || "wood";`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Successfully fixed product edit categories find type check error!");
} else {
  console.log("WARNING: Target not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
