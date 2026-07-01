const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// =============================================================
// PART 1: Category Business Refactoring
// =============================================================

// 1.1 Add useEffect to CategoryEntityForm (Auto-set parent group)
const categoryFormIdx = content.indexOf('function CategoryEntityForm');
if (categoryFormIdx !== -1) {
  const targetToken = '  // Load all categories for parent selector';
  const targetIdx = content.indexOf(targetToken, categoryFormIdx);
  if (targetIdx !== -1) {
    const replacement = `  // Auto-set parent category ID for new categories
  useEffect(() => {
    if (!isEdit && categoriesList.length > 0 && !parentId) {
      const firstGroup = categoriesList.find(c => c.parent_id === null);
      if (firstGroup) {
        setParentId(firstGroup.id);
        setParentGroup(firstGroup.group_key || "wooden_furniture");
      }
    }
  }, [categoriesList, isEdit, parentId]);

  // Load all categories for parent selector`;
    content = content.substring(0, targetIdx) + replacement + content.substring(targetIdx + targetToken.length);
    console.log("1.1 Successfully added useEffect to CategoryEntityForm!");
  } else {
    console.log("WARNING: 1.1 Target token not found!");
  }
} else {
  console.log("WARNING: CategoryEntityForm not found!");
}

// 1.2 Replace parent category selector inputs in CategoryEntityForm
const oldParentInputs = `            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="label-pd">Nhóm cha</span>
                <PremiumSelect
                  value={parentGroup}
                  onValueChange={setParentGroup}
                  ariaLabel="Nhóm cha"
                  placeholder="Nhóm cha"
                  tone="admin"
                  options={[
                    { value: "wood", label: "Nội thất gỗ" },
                    { value: "sanitary", label: "Thiết bị vệ sinh" },
                    { value: "tiles", label: "Gạch ốp lát" },
                  ]}
                />
              </label>
              <label className="grid gap-2">
                <span className="label-pd">Danh mục cha</span>
                <PremiumSelect
                  value={parentId || ""}
                  onValueChange={(val) => setParentId(val || null)}
                  ariaLabel="Danh mục cha"
                  placeholder="Danh mục cha (Tùy chọn)"
                  tone="admin"
                  options={[
                    { value: "", label: "Không có (Danh mục cấp 1)" },
                    ...categoriesList
                      .filter((c) => c.id !== categoryId) // Không chọn chính nó
                      .map((c) => ({
                        value: c.id,
                        label: c.name || c.slug,
                      })),
                  ]}
                />
              </label>
              <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} readOnly={true} />
            </div>`;

const newParentInputs = `            {(!isEdit || parentId !== null) ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="label-pd">Thuộc Nhóm danh mục *</span>
                  <PremiumSelect
                    value={parentId || ""}
                    onValueChange={(val) => {
                      setParentId(val);
                      const selectedGroup = categoriesList.find(c => c.id === val);
                      if (selectedGroup) {
                        setParentGroup(selectedGroup.group_key || "project_solutions");
                      }
                    }}
                    ariaLabel="Thuộc Nhóm danh mục"
                    placeholder="Chọn Nhóm danh mục..."
                    tone="admin"
                    options={categoriesList
                      .filter(c => c.parent_id === null)
                      .map(c => ({
                        value: c.id,
                        label: c.name
                      }))
                    }
                  />
                </label>
                <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} readOnly={true} />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1 justify-center bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Loại danh mục:</span>
                  <span className="text-xs font-bold text-slate-700">Nhóm danh mục (Cấp cao nhất)</span>
                </div>
                <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} readOnly={true} />
              </div>
            )}`;

const parentInputsIdx = content.indexOf(oldParentInputs, categoryFormIdx);
if (parentInputsIdx !== -1) {
  content = content.substring(0, parentInputsIdx) + newParentInputs + content.substring(parentInputsIdx + oldParentInputs.length);
  console.log("1.2 Successfully replaced Category parent inputs!");
} else {
  console.log("WARNING: 1.2 Category parent inputs not found!");
}

// 1.3 Update ProductBusinessFields categories load
const oldProductCatsLoad = `        setCategoriesList(cats.map(c => ({ value: c.slug, label: c.name })));`;

const newProductCatsLoad = `        const concreteCats = cats.filter(c => c.parent_id !== null);
        const formattedCats = concreteCats.map(c => {
          const parent = cats.find(p => p.id === c.parent_id);
          const parentName = parent ? parent.name : "";
          return {
            value: c.slug,
            label: parentName ? \`\${parentName} → \${c.name}\` : c.name
          };
        });
        setCategoriesList(formattedCats);`;

const productFieldsIdx = content.indexOf('function ProductBusinessFields');
if (productFieldsIdx !== -1) {
  const targetIdx = content.indexOf(oldProductCatsLoad, productFieldsIdx);
  if (targetIdx !== -1) {
    content = content.substring(0, targetIdx) + newProductCatsLoad + content.substring(targetIdx + oldProductCatsLoad.length);
    console.log("1.3 Successfully updated Product categories load logic!");
  } else {
    console.log("WARNING: 1.3 Product categories load target not found!");
  }
} else {
  console.log("WARNING: ProductBusinessFields not found!");
}

// =============================================================
// PART 2: Promotion Picker Repositioning (Scoped to PromotionEntityForm)
// =============================================================
const promoFormIdx = content.indexOf('function PromotionEntityForm');
if (promoFormIdx !== -1) {
  const commonFieldsIdx = content.indexOf('        {/* --- COMMON FIELDS (LOCKED OUTSIDE TABS) --- */}', promoFormIdx);
  const pickerStartIdx = content.indexOf('        {/* --- PREMIUM SEARCHABLE PRODUCT MULTISELECT --- */}', promoFormIdx);
  const pickerEndIdx = content.indexOf('      </div>\n\n      <aside className="space-y-5">', pickerStartIdx);

  if (commonFieldsIdx !== -1 && pickerStartIdx !== -1 && pickerEndIdx !== -1) {
    const productPickerBlock = content.substring(pickerStartIdx, pickerEndIdx);
    
    // Clean from original position
    let part1 = content.substring(0, pickerStartIdx);
    let part2 = content.substring(pickerEndIdx);
    
    // We need to adjust commonFieldsIdx in part1 (since it is before pickerStartIdx, its index remains unchanged!)
    const targetInsertIdx = part1.indexOf('        {/* --- COMMON FIELDS (LOCKED OUTSIDE TABS) --- */}', promoFormIdx);
    
    if (targetInsertIdx !== -1) {
      content = part1.substring(0, targetInsertIdx) + productPickerBlock + '\n' + part1.substring(targetInsertIdx) + part2;
      console.log("2.1 Successfully rearranged Promotion product multiselect block!");
    } else {
      console.log("WARNING: 2.1 COMMON FIELDS target not found in part1!");
    }
  } else {
    console.log("WARNING: 2.1 program targets not found in PromotionEntityForm!", {
      commonFieldsIdx,
      pickerStartIdx,
      pickerEndIdx
    });
  }
} else {
  console.log("WARNING: PromotionEntityForm not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Master refactoring run complete!");
