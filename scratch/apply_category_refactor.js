const fs = require('fs');

// 1. Refactor CategoryPage in components/showroom/admin-pages.tsx
const pagesPath = 'components/showroom/admin-pages.tsx';
let pagesContent = fs.readFileSync(pagesPath, 'utf8');
pagesContent = pagesContent.replace(/\r\n/g, '\n');

const oldGroupOptions = `  const GROUP_OPTIONS = [
    { value: "furniture", label: "Nội thất" },
    { value: "sanitary", label: "Thiết bị vệ sinh" },
  ];`;

const newGroupOptions = `  const GROUP_OPTIONS = [
    { value: "wooden_furniture", label: "Đồ gỗ nội thất" },
    { value: "sanitary_equipment", label: "Thiết bị vệ sinh" },
    { value: "tiles", label: "Gạch ốp lát" },
    { value: "project_solutions", label: "Thiết bị khác" },
  ];`;

if (pagesContent.includes(oldGroupOptions)) {
  pagesContent = pagesContent.replace(oldGroupOptions, newGroupOptions);
  console.log("Updated GROUP_OPTIONS in CategoryPage!");
}

const oldGroupLabel = `          const category = item as AdminCategory & { group_key?: string | null; parent_name?: string | null };
          const groupLabel = category.group_key === "furniture" ? "Nội thất" : category.group_key === "sanitary" ? "Thiết bị vệ sinh" : "Khác";`;

const newGroupLabel = `          const category = item as AdminCategory & { group_key?: string | null; parent_name?: string | null };
          const groupLabel = category.group_key === "wooden_furniture" ? "Đồ gỗ" : category.group_key === "sanitary_equipment" ? "Thiết bị vệ sinh" : category.group_key === "tiles" ? "Gạch ốp lát" : category.group_key === "project_solutions" ? "Thiết bị khác" : "Khác";`;

if (pagesContent.includes(oldGroupLabel)) {
  pagesContent = pagesContent.replace(oldGroupLabel, newGroupLabel);
  console.log("Updated groupLabel in CategoryPage!");
}

const oldRowRendering = `              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">
                  {category.name}
                  {category.parent_name && (
                    <span className="ml-1.5 text-xs text-slate-400 font-normal">
                      &larr; {category.parent_name}
                    </span>
                  )}
                </p>`;

const newRowRendering = `              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate flex items-center gap-2">
                  {category.name}
                  {category.parent_id === null ? (
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Nhóm danh mục</span>
                  ) : (
                    <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Danh mục</span>
                  )}
                  {category.parent_name && (
                    <span className="text-xs text-slate-400 font-normal">
                      &larr; {category.parent_name}
                    </span>
                  )}
                </p>`;

if (pagesContent.includes(oldRowRendering)) {
  pagesContent = pagesContent.replace(oldRowRendering, newRowRendering);
  console.log("Updated row rendering in CategoryPage!");
}

fs.writeFileSync(pagesPath, pagesContent, 'utf8');

// 2. Refactor CategoryEntityForm & ProductBusinessFields in components/showroom/admin-workflows.tsx
const workflowsPath = 'components/showroom/admin-workflows.tsx';
let workflowsContent = fs.readFileSync(workflowsPath, 'utf8');
workflowsContent = workflowsContent.replace(/\r\n/g, '\n');

// Update CategoryEntityForm states - add default parent selection effect
workflowsContent = workflowsContent.replace(
  `  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");`,
  `  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  // Auto-set parent category ID for new categories
  useEffect(() => {
    if (!isEdit && categoriesList.length > 0 && !parentId) {
      const firstGroup = categoriesList.find(c => c.parent_id === null);
      if (firstGroup) {
        setParentId(firstGroup.id);
        setParentGroup(firstGroup.group_key || "wooden_furniture");
      }
    }
  }, [categoriesList, isEdit, parentId]);`
);

// Update Category parent select inputs in JSX
// Find the original JSX for Nhóm cha & Danh mục cha
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
              <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} disabled={true} />
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
                <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} disabled={true} />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1 justify-center bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Loại danh mục:</span>
                  <span className="text-xs font-bold text-slate-700">Nhóm danh mục (Cấp cao nhất)</span>
                </div>
                <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} disabled={true} />
              </div>
            )}`;

if (workflowsContent.includes(oldParentInputs)) {
  workflowsContent = workflowsContent.replace(oldParentInputs, newParentInputs);
  console.log("Updated parent inputs in CategoryEntityForm!");
}

// 3. Update ProductBusinessFields to only load concrete Categories and prefix with Group name
const oldProductCategoriesLoad = `        setCategoriesList(cats.map(c => ({ value: c.slug, label: c.name })));`;

const newProductCategoriesLoad = `        const concreteCats = cats.filter(c => c.parent_id !== null);
        const formattedCats = concreteCats.map(c => {
          const parent = cats.find(p => p.id === c.parent_id);
          const parentName = parent ? parent.name : "";
          return {
            value: c.slug,
            label: parentName ? \`\${parentName} → \${c.name}\` : c.name
          };
        });
        setCategoriesList(formattedCats);`;

if (workflowsContent.includes(oldProductCategoriesLoad)) {
  workflowsContent = workflowsContent.replace(oldProductCategoriesLoad, newProductCategoriesLoad);
  console.log("Updated Product categories load logic in ProductBusinessFields!");
}

fs.writeFileSync(workflowsPath, workflowsContent, 'utf8');
console.log("Done workflows adjustments!");
