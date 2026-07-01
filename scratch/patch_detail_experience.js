const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../components/showroom/product-detail-experience.tsx');

let content = fs.readFileSync(targetPath, 'utf8');

// Normalize line endings to LF (\n) for reliable matching
content = content.replace(/\r\n/g, '\n');

// Patch 1: renderOverview
const target1 = `  const renderOverview = () => (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-start">
      <div className="space-y-6">
        <div className="space-y-2 hidden md:block">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
            01 / {labels.tabsOverview}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
            {labels.overviewTitle}
          </h2>
        </div>
        
        <div className="relative pl-6 border-l-2 border-primary/30 py-2">
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-light italic text-justify">
            &ldquo;{localized(product.description, locale)}&rdquo;
          </p>
        </div>
      </div>`;

const replacement1 = `  const renderOverview = () => (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-start">
      <div className="space-y-6">
        <div className="space-y-2 hidden md:block">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
            01 / {labels.tabsOverview}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
            {labels.overviewTitle}
          </h2>
        </div>
        
        <div className="relative pl-6 border-l-2 border-primary/30 py-2">
          <div 
            className="text-slate-600 leading-relaxed text-sm sm:text-base font-light italic text-justify prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: localized(product.description, locale) || localized(product.summary, locale) }}
          />
        </div>
      </div>`;

// Patch 2: renderSpecifications
const target2 = `  const renderSpecifications = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="space-y-1 hidden md:block">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
            02 / {labels.tabsSpecifications}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
            {labels.specificationsTitle}
          </h2>
        </div>
        {/* Spec PDF Download button */}
        <button
          type="button"
          onClick={handlePdfDownload}
          className="flex items-center gap-2 text-xs text-slate-750 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer font-bold shadow-sm w-full sm:w-auto justify-center"
        >
          <Download className="size-3.5 shrink-0" />
          {isVi ? "Tải bản vẽ kỹ thuật (PDF)" : "Download CAD Details (PDF)"}
        </button>
      </div>

      <div className="grid gap-x-12 gap-y-1 sm:grid-cols-2 max-w-5xl border-t border-slate-100 pt-6">
        {product.specs.map((spec) => (
          <div
            key={localized(spec.label, locale)}
            className="flex items-center justify-between py-3.5 border-b border-slate-100 group hover:border-slate-350 transition-colors"
          >
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
              {localized(spec.label, locale)}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 text-right">
              {localized(spec.value, locale)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );`;

const replacement2 = `  const renderSpecifications = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="space-y-1 hidden md:block">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
            02 / {labels.tabsSpecifications}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
            {labels.specificationsTitle}
          </h2>
        </div>
        {/* Spec PDF Download button */}
        <button
          type="button"
          onClick={handlePdfDownload}
          className="flex items-center gap-2 text-xs text-slate-750 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer font-bold shadow-sm w-full sm:w-auto justify-center"
        >
          <Download className="size-3.5 shrink-0" />
          {isVi ? "Tải bản vẽ kỹ thuật (PDF)" : "Download CAD Details (PDF)"}
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="px-6 py-3.5 font-semibold w-1/3">{isVi ? "Thông số" : "Specification"}</th>
              <th className="px-6 py-3.5 font-semibold w-2/3">{isVi ? "Chi tiết" : "Details"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {product.specs.map((spec) => (
              <tr key={localized(spec.label, locale)} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-550 whitespace-nowrap">
                  {localized(spec.label, locale)}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800 leading-relaxed">
                  {localized(spec.value, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );`;

// Patch 3: renderMaterials
const target3 = `  const renderMaterials = () => (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
      <div className="space-y-5">
        <div className="space-y-1 hidden md:block">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
            03 / {labels.tabsMaterials}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
            {labels.materialsTitle}
          </h2>
        </div>
        <p className="text-slate-500 leading-relaxed text-sm font-light">
          {labels.materialsLead}
        </p>
        
        <div className="bg-slate-900 text-white border border-slate-900 p-6 rounded-2xl flex gap-4 shadow-lg hover:bg-slate-950 transition-colors duration-300">
          <Sparkles className="size-5 text-primary shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs leading-relaxed text-slate-300 font-light">
            {labels.craftsmanshipNote}
          </p>
        </div>
      </div>
      
      {/* Material Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {materialCards.map((card, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F6]/60 shadow-sm flex flex-col justify-between min-h-[190px] relative overflow-hidden group hover:border-primary/20 hover:shadow-md transition-all duration-300">
            {/* Visual badge top right */}
            <span className="absolute top-4 right-4 bg-primary/5 text-primary border border-primary/20 font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded">
              {card.origin}
            </span>
            
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="size-4 text-primary shrink-0" />
                {card.title}
              </h4>
              <p className="text-xs text-slate-500 font-light mt-3 leading-relaxed text-justify">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );`;

const replacement3 = `  const renderMaterials = () => {
    // Check if we have database-driven material/craftsmanship specifications
    const customMat = localized(product.material, locale);
    const specMat = product.specifications ? (isVi ? product.specifications.material_vi : product.specifications.material_en) : "";
    const specFinish = product.specifications ? (isVi ? product.specifications.finish_vi : product.specifications.finish_en) : "";
    
    const hasDbMaterials = Boolean(customMat || specMat || specFinish);
    
    return (
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
        <div className="space-y-5">
          <div className="space-y-1 hidden md:block">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
              03 / {labels.tabsMaterials}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
              {labels.materialsTitle}
            </h2>
          </div>
          <p className="text-slate-500 leading-relaxed text-sm font-light">
            {hasDbMaterials 
              ? (isVi 
                  ? "Chi tiết về nguồn gốc vật liệu, chất lượng hoàn thiện bề mặt và quy chuẩn chế tác tỉ mỉ của sản phẩm."
                  : "Detailed information about material origins, surface finishes, and meticulous craftsmanship standards.")
              : labels.materialsLead}
          </p>
          
          <div className="bg-slate-900 text-white border border-slate-900 p-6 rounded-2xl flex gap-4 shadow-lg hover:bg-slate-950 transition-colors duration-300">
            <Sparkles className="size-5 text-primary shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs leading-relaxed text-slate-300 font-light">
              {labels.craftsmanshipNote}
            </p>
          </div>
        </div>
        
        {/* Material Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {hasDbMaterials ? (
            <>
              {customMat && (
                <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F6]/60 shadow-sm flex flex-col justify-between min-h-[190px] relative overflow-hidden group hover:border-primary/20 hover:shadow-md transition-all duration-300">
                  <span className="absolute top-4 right-4 bg-primary/5 text-primary border border-primary/20 font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded">
                    {isVi ? "Hoàn thiện" : "Finishing"}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Award className="size-4 text-primary shrink-0" />
                      {isVi ? "Chất liệu & Hoàn thiện" : "Material & Finish"}
                    </h4>
                    <p className="text-xs text-slate-500 font-light mt-3 leading-relaxed text-justify">
                      {customMat}
                    </p>
                  </div>
                </div>
              )}
              {specMat && (
                <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F6]/60 shadow-sm flex flex-col justify-between min-h-[190px] relative overflow-hidden group hover:border-primary/20 hover:shadow-md transition-all duration-300">
                  <span className="absolute top-4 right-4 bg-primary/5 text-primary border border-primary/20 font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded">
                    {isVi ? "Cốt vật liệu" : "Core Material"}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Award className="size-4 text-primary shrink-0" />
                      {isVi ? "Vật liệu chế tác" : "Craftsmanship Material"}
                    </h4>
                    <p className="text-xs text-slate-500 font-light mt-3 leading-relaxed text-justify">
                      {specMat}
                    </p>
                  </div>
                </div>
              )}
              {specFinish && (
                <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F6]/60 shadow-sm flex flex-col justify-between min-h-[190px] relative overflow-hidden group hover:border-primary/20 hover:shadow-md transition-all duration-300 col-span-1 sm:col-span-2">
                  <span className="absolute top-4 right-4 bg-primary/5 text-primary border border-primary/20 font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded">
                    {isVi ? "Kỹ thuật" : "Technical"}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Award className="size-4 text-primary shrink-0" />
                      {isVi ? "Hoàn thiện bề mặt" : "Surface Coating"}
                    </h4>
                    <p className="text-xs text-slate-500 font-light mt-3 leading-relaxed text-justify">
                      {specFinish}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            materialCards.map((card, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F6]/60 shadow-sm flex flex-col justify-between min-h-[190px] relative overflow-hidden group hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <span className="absolute top-4 right-4 bg-primary/5 text-primary border border-primary/20 font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded">
                  {card.origin}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Award className="size-4 text-primary shrink-0" />
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-light mt-3 leading-relaxed text-justify">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };`;

// Patch 4: accordionItems
const target4 = `  const accordionItems = [
    { value: "overview", num: "01", label: labels.tabsOverview, render: renderOverview },
    { value: "specifications", num: "02", label: labels.tabsSpecifications, render: renderSpecifications },
    { value: "materials", num: "03", label: labels.tabsMaterials, render: renderMaterials },
    { value: "care", num: "04", label: labels.tabsDimensionsCare, render: renderCare },
    { value: "delivery", num: "05", label: labels.tabsDeliveryWarranty, render: renderDelivery },
  ];`;

const replacement4 = `  const accordionItems = [
    { value: "overview", num: "01", label: labels.tabsOverview, render: renderOverview },
    { value: "specifications", num: "02", label: labels.tabsSpecifications, render: renderSpecifications },
    { value: "materials", num: "03", label: labels.tabsMaterials, render: renderMaterials },
    { value: "delivery", num: "04", label: labels.tabsDeliveryWarranty, render: renderDelivery },
  ];`;

// Apply the patches
if (!content.includes(target1)) {
  console.error("Target 1 not found!");
  process.exit(1);
}
content = content.replace(target1, replacement1);

if (!content.includes(target2)) {
  console.error("Target 2 not found!");
  process.exit(1);
}
content = content.replace(target2, replacement2);

if (!content.includes(target3)) {
  console.error("Target 3 not found!");
  process.exit(1);
}
content = content.replace(target3, replacement3);

if (!content.includes(target4)) {
  console.error("Target 4 not found!");
  process.exit(1);
}
content = content.replace(target4, replacement4);

fs.writeFileSync(targetPath, content, 'utf8');
console.log("SUCCESSFULLY PATCHED product-detail-experience.tsx!");
