const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Auto-slug hook
const target1 = `  // N-N products states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);`;

const replacement1 = `  // Auto-generate promotion code from titleVi
  useEffect(() => {
    if (!isEdit && titleVi) {
      setCode(slugify(titleVi).toUpperCase().replaceAll("-", "_"));
    }
  }, [titleVi, isEdit]);

  // N-N products states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log("Replaced target1");
} else {
  console.log("WARNING: target1 not found");
}

// 2. Change handleSubmit header to handleSave
const target2 = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);`;

const replacement2 = `  const handleSave = async (targetStatus: "draft" | "published" | "archived") => {
    setFormLoading(true);`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log("Replaced target2");
} else {
  console.log("WARNING: target2 not found");
}

// 3. Change status assignment to targetStatus
const target3 = `        original_price: originalPrice ? Number(originalPrice) : null,
        items: itemsList.filter(i => i.trim() !== ""),
        status,
        productIds: selectedProductIds,`;

const replacement3 = `        original_price: originalPrice ? Number(originalPrice) : null,
        items: itemsList.filter(i => i.trim() !== ""),
        status: targetStatus,
        productIds: selectedProductIds,`;

if (content.includes(target3)) {
  content = content.replace(target3, replacement3);
  console.log("Replaced target3");
} else {
  console.log("WARNING: target3 not found");
}

// 4. Change form tag to div tag
const target4 = `  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_320px]">`;

const replacement4 = `  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">`;

if (content.includes(target4)) {
  content = content.replace(target4, replacement4);
  console.log("Replaced target4");
} else {
  console.log("WARNING: target4 not found");
}

// 5. Change code field to readOnly
const target5 = `            <AdminField
              label="Mã khuyến mãi *"
              name="code"
              value={code}
              onChange={setCode}
              error={fieldErrors.code}
              placeholder="Ví dụ: VALENTINE-COMBO"
            />`;

const replacement5 = `            <AdminField
              label="Mã khuyến mãi (Đường dẫn) *"
              name="code"
              value={code}
              onChange={setCode}
              error={fieldErrors.code}
              placeholder="Ví dụ: VALENTINE-COMBO"
              readOnly={true}
            />`;

if (content.includes(target5)) {
  content = content.replace(target5, replacement5);
  console.log("Replaced target5");
} else {
  console.log("WARNING: target5 not found");
}

// 6. Change sidebar to PublishWorkflow
const target6 = `      <div className="space-y-5">
        <section className="surface-soft p-4">
          <label className="grid gap-2">
            <span className="label-pd">Trạng thái</span>
            <PremiumSelect
              value={status}
              onValueChange={(val) => setStatus(val as "draft" | "published" | "archived")}
              ariaLabel="Trạng thái"
              placeholder="Trạng thái"
              tone="admin"
              options={[
                { value: "draft", label: "Bản nháp" },
                { value: "published", label: "Đã xuất bản" },
                { value: "archived", label: "Đã lưu trữ" },
              ]}
            />
          </label>
          <div className="mt-6">
            <button type="submit" className="button-pd w-full" disabled={formLoading}>
              {formLoading ? "Đang lưu..." : "Lưu khuyến mãi"}
            </button>
          </div>
        </section>
      </div>
    </form>`;

const replacement6 = `      <aside className="space-y-5">
        <PublishWorkflow 
          status={status}
          onStatusChange={setStatus}
          errors={[]} 
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
        />
      </aside>
    </div>`;

if (content.includes(target6)) {
  content = content.replace(target6, replacement6);
  console.log("Replaced target6");
} else {
  console.log("WARNING: target6 not found");
}

fs.writeFileSync(filePath, content, 'utf8');
