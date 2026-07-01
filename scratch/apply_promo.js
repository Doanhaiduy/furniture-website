const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 8. Replace PromotionEntityForm entirely
const promoTargetFunc = `function PromotionEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const editId = idOrSlug || searchParams.get("edit") || "";
  const isEdit = Boolean(editId);

  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [itemsList, setItemsList] = useState<string[]>([""]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // N-N products states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const loadPromotion = async () => {
        try {
          const { getAdminPromotionById, getProductsByIds } = await import("@/lib/supabase/admin-queries");
          const res = await getAdminPromotionById(editId);
          if (res.success && res.data) {
            const p = res.data;
            setCode(p.code || "");
            setDiscountPercentage(p.discount_percentage || 0);
            setTitleVi(p.title?.vi || p.title_vi || "");
            setTitleEn(p.title?.en || p.title_en || "");
            setDescriptionVi(p.description?.vi || p.description_vi || "");
            setDescriptionEn(p.description?.en || p.description_en || "");
            setComboPrice(p.combo_price ? String(p.combo_price) : "");
            setOriginalPrice(p.original_price ? String(p.original_price) : "");
            setCoverImage(p.cover_image_url || p.cover_image || "");
            setStartAt(p.start_at ? p.start_at.substring(0, 16) : "");
            setEndAt(p.end_at ? p.end_at.substring(0, 16) : "");
            setItemsList(p.items && p.items.length > 0 ? p.items : [""]);
            setStatus(p.status || "draft");

            if (p.productIds && p.productIds.length > 0) {
              setSelectedProductIds(p.productIds);
              const prods = await getProductsByIds(p.productIds);
              setSelectedProducts(prods);
            }
          }
        } catch (e) {
          console.error("Failed to load promotion:", e);
        }
      };
      loadPromotion();
    }
  }, [editId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFieldErrors({});
    try {
      const promotionData = {
        code,
        discount_percentage: Number(discountPercentage),
        title_vi: titleVi,
        title_en: titleEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        cover_image: coverImage,
        combo_price: comboPrice ? Number(comboPrice) : null,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        original_price: originalPrice ? Number(originalPrice) : null,
        items: itemsList.filter(i => i.trim() !== ""),
        status,
        productIds: selectedProductIds,
      };

      const { promotionSchema } = await import("@/lib/validations/admin");
      const validation = promotionSchema.safeParse(promotionData);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            errors[path] = issue.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Vui lòng sửa các lỗi nhập liệu bên dưới.");
        setFormLoading(false);
        return;
      }

      const { createAdminPromotion, updateAdminPromotion } = await import("@/lib/supabase/admin-queries");

      let res;
      if (isEdit) {
        res = await updateAdminPromotion(editId, promotionData);
      } else {
        res = await createAdminPromotion(promotionData);
      }

      if (res.success) {
        toast.success(isEdit ? "Cập nhật khuyến mãi thành công!" : "Tạo khuyến mãi thành công!");
        window.location.href = "/admin/promotions";
      } else {
        setFormError(res.error || "Có lỗi xảy ra.");
      }
    } catch (err) {
      setFormError("Lỗi kết nối.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearchProducts = async (val: string) => {
    setSearchVal(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { searchAdminProducts } = await import("@/lib/supabase/admin-queries");
      const results = await searchAdminProducts(val);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleToggleProduct = (prod: any) => {
    if (selectedProductIds.includes(prod.id)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== prod.id));
      setSelectedProducts(selectedProducts.filter(p => p.id !== prod.id));
    } else {
      setSelectedProductIds([...selectedProductIds, prod.id]);
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  const handleAddItem = () => setItemsList([...itemsList, ""]);
  const handleRemoveItem = (index: number) => setItemsList(itemsList.filter((_, idx) => idx !== index));
  const handleItemChange = (index: number, val: string) => {
    const updated = [...itemsList];
    updated[index] = val;
    setItemsList(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={BadgePercent}
          title={isEdit ? "Hiệu chỉnh chương trình khuyến mãi" : "Thêm chương trình khuyến mãi mới"}
          description="Thiết lập thông tin khuyến mãi combo, chiết khấu và sản phẩm đi kèm."
        />
        {formError && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Mã khuyến mãi *"
              name="code"
              value={code}
              onChange={setCode}
              error={fieldErrors.code}
              placeholder="Ví dụ: VALENTINE-COMBO"
            />
            <AdminField
              label="Phần trăm chiết khấu (%) *"
              name="discount_percentage"
              inputType="number"
              value={String(discountPercentage)}
              onChange={(val) => setDiscountPercentage(Number(val))}
              error={fieldErrors.discount_percentage}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Tiêu đề khuyến mãi (VI) *"
              name="title_vi"
              value={titleVi}
              onChange={setTitleVi}
              error={fieldErrors.title_vi}
            />
            <AdminField
              label="Tiêu đề khuyến mãi (EN)"
              name="title_en"
              value={titleEn}
              onChange={setTitleEn}
              error={fieldErrors.title_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Mô tả - Tiếng Việt"
              name="promo-desc-vi"
              value={descriptionVi}
              onChange={setDescriptionVi}
              multiline
              error={fieldErrors.description_vi}
            />
            <AdminField
              label="Mô tả - Tiếng Anh"
              name="promo-desc-en"
              value={descriptionEn}
              onChange={setDescriptionEn}
              multiline
              error={fieldErrors.description_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Giá Combo sản phẩm"
              name="combo_price"
              inputType="number"
              value={comboPrice}
              onChange={setComboPrice}
              placeholder="Ví dụ: 12000000"
              error={fieldErrors.combo_price}
            />
            <AdminField
              label="Giá trị ban đầu (gốc)"
              name="original_price"
              inputType="number"
              value={originalPrice}
              onChange={setOriginalPrice}
              placeholder="Ví dụ: 18000000"
              error={fieldErrors.original_price}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Thời gian bắt đầu</span>
              <input
                className={\`input-pd bg-white \${fieldErrors.start_at ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
              {fieldErrors.start_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.start_at}</span>}
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Thời gian kết thúc</span>
              <input
                className={\`input-pd bg-white \${fieldErrors.end_at ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
              {fieldErrors.end_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.end_at}</span>}
            </label>
          </div>

          <div className="grid gap-2">
            <span className="label-pd">Ảnh bìa Combo</span>
            <ImageUploadDropzone
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              label="Tải ảnh combo khuyến mãi lên"
            />
            {fieldErrors.cover_image && <span className="text-red-600 text-xs font-medium">{fieldErrors.cover_image}</span>}
          </div>

          <div className="grid gap-2">
            <span className="label-pd">Các sản phẩm đi kèm trong Combo</span>
            <div className="space-y-2">
              {itemsList.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input className="input-pd bg-white flex-1" type="text" value={item} onChange={(e) => handleItemChange(idx, e.target.value)} placeholder={\`Sản phẩm #\${idx + 1}\`} />
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="button-pd-outline py-2 px-3 text-red-500 border-red-200 hover:bg-red-50" disabled={itemsList.length <= 1}>Xóa</button>
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="button-pd-outline text-xs mt-2 py-1 px-2">
                + Thêm sản phẩm
              </button>
            </div>
          </div>

          <div className="grid gap-2 mt-4 pt-4 border-t border-slate-200">
            <span className="label-pd">Áp dụng cho các sản phẩm thật (N-N)</span>
            <div className="flex gap-2">
              <input
                className="input-pd bg-white flex-1"
                type="text"
                placeholder="Nhập tên hoặc mã sản phẩm để tìm kiếm..."
                value={searchVal}
                onChange={(e) => handleSearchProducts(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg bg-white divide-y max-h-48 overflow-y-auto mt-2">
                {searchResults.map((prod) => {
                  const isChecked = selectedProductIds.includes(prod.id);
                  return (
                    <div key={prod.id} className="flex items-center justify-between p-2 hover:bg-slate-50 text-xs">
                      <div>
                        <span className="font-semibold text-primary">{prod.name}</span>
                        <span className="text-slate-400 ml-2 font-mono">({prod.reference_code})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(prod)}
                        className={\`px-3 py-1 rounded text-xs font-semibold \${
                          isChecked ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        }\`}
                      >
                        {isChecked ? "Bỏ chọn" : "Chọn"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Products List */}
            {selectedProducts.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-500 block mb-1.5 font-heading">Sản phẩm đã chọn ({selectedProducts.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((prod) => (
                    <div key={prod.id} className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs px-2.5 py-1 rounded-full">
                      <span>{prod.name} ({prod.reference_code})</span>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(prod)}
                        className="text-indigo-400 hover:text-indigo-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="space-y-5">
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
    </form>
  );
}`;

const promoReplacementFunc = `function PromotionEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const editId = idOrSlug || searchParams.get("edit") || "";
  const isEdit = Boolean(editId);

  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [itemsList, setItemsList] = useState<string[]>([""]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // N-N products states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Auto-generate promotion code from titleVi
  useEffect(() => {
    if (!isEdit && titleVi) {
      setCode(slugify(titleVi).toUpperCase().replaceAll("-", "_"));
    }
  }, [titleVi, isEdit]);

  useEffect(() => {
    if (isEdit) {
      const loadPromotion = async () => {
        try {
          const { getAdminPromotionById, getProductsByIds } = await import("@/lib/supabase/admin-queries");
          const res = await getAdminPromotionById(editId);
          if (res.success && res.data) {
            const p = res.data;
            setCode(p.code || "");
            setDiscountPercentage(p.discount_percentage || 0);
            setTitleVi(p.title?.vi || p.title_vi || "");
            setTitleEn(p.title?.en || p.title_en || "");
            setDescriptionVi(p.description?.vi || p.description_vi || "");
            setDescriptionEn(p.description?.en || p.description_en || "");
            setComboPrice(p.combo_price ? String(p.combo_price) : "");
            setOriginalPrice(p.original_price ? String(p.original_price) : "");
            setCoverImage(p.cover_image_url || p.cover_image || "");
            setStartAt(p.start_at ? p.start_at.substring(0, 16) : "");
            setEndAt(p.end_at ? p.end_at.substring(0, 16) : "");
            setItemsList(p.items && p.items.length > 0 ? p.items : [""]);
            setStatus(p.status || "draft");

            if (p.productIds && p.productIds.length > 0) {
              setSelectedProductIds(p.productIds);
              const prods = await getProductsByIds(p.productIds);
              setSelectedProducts(prods);
            }
          }
        } catch (e) {
          console.error("Failed to load promotion:", e);
        }
      };
      loadPromotion();
    }
  }, [editId, isEdit]);

  const handleSave = async (targetStatus: "draft" | "published" | "archived") => {
    setFormLoading(true);
    setFormError("");
    setFieldErrors({});
    try {
      const promotionData = {
        code,
        discount_percentage: Number(discountPercentage),
        title_vi: titleVi,
        title_en: titleEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        cover_image: coverImage,
        combo_price: comboPrice ? Number(comboPrice) : null,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        original_price: originalPrice ? Number(originalPrice) : null,
        items: itemsList.filter(i => i.trim() !== ""),
        status: targetStatus,
        productIds: selectedProductIds,
      };

      const { promotionSchema } = await import("@/lib/validations/admin");
      const validation = promotionSchema.safeParse(promotionData);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            errors[path] = issue.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Vui lòng sửa các lỗi nhập liệu bên dưới.");
        setFormLoading(false);
        return;
      }

      const { createAdminPromotion, updateAdminPromotion } = await import("@/lib/supabase/admin-queries");

      let res;
      if (isEdit) {
        res = await updateAdminPromotion(editId, promotionData);
      } else {
        res = await createAdminPromotion(promotionData);
      }

      if (res.success) {
        toast.success(isEdit ? "Cập nhật khuyến mãi thành công!" : "Tạo khuyến mãi thành công!");
        window.location.href = "/admin/promotions";
      } else {
        setFormError(res.error || "Có lỗi xảy ra.");
      }
    } catch (err) {
      setFormError("Lỗi kết nối.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearchProducts = async (val: string) => {
    setSearchVal(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { searchAdminProducts } = await import("@/lib/supabase/admin-queries");
      const results = await searchAdminProducts(val);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleToggleProduct = (prod: any) => {
    if (selectedProductIds.includes(prod.id)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== prod.id));
      setSelectedProducts(selectedProducts.filter(p => p.id !== prod.id));
    } else {
      setSelectedProductIds([...selectedProductIds, prod.id]);
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  const handleAddItem = () => setItemsList([...itemsList, ""]);
  const handleRemoveItem = (index: number) => setItemsList(itemsList.filter((_, idx) => idx !== index));
  const handleItemChange = (index: number, val: string) => {
    const updated = [...itemsList];
    updated[index] = val;
    setItemsList(updated);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={BadgePercent}
          title={isEdit ? "Hiệu chỉnh chương trình khuyến mãi" : "Thêm chương trình khuyến mãi mới"}
          description="Thiết lập thông tin khuyến mãi combo, chiết khấu và sản phẩm đi kèm."
        />
        {formError && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Mã khuyến mãi (Đường dẫn) *"
              name="code"
              value={code}
              onChange={setCode}
              error={fieldErrors.code}
              placeholder="Ví dụ: VALENTINE-COMBO"
              readOnly={true}
            />
            <AdminField
              label="Phần trăm chiết khấu (%) *"
              name="discount_percentage"
              inputType="number"
              value={String(discountPercentage)}
              onChange={(val) => setDiscountPercentage(Number(val))}
              error={fieldErrors.discount_percentage}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Tiêu đề khuyến mãi (VI) *"
              name="title_vi"
              value={titleVi}
              onChange={setTitleVi}
              error={fieldErrors.title_vi}
            />
            <AdminField
              label="Tiêu đề khuyến mãi (EN)"
              name="title_en"
              value={titleEn}
              onChange={setTitleEn}
              error={fieldErrors.title_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Mô tả - Tiếng Việt"
              name="promo-desc-vi"
              value={descriptionVi}
              onChange={setDescriptionVi}
              multiline
              error={fieldErrors.description_vi}
            />
            <AdminField
              label="Mô tả - Tiếng Anh"
              name="promo-desc-en"
              value={descriptionEn}
              onChange={setDescriptionEn}
              multiline
              error={fieldErrors.description_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Giá Combo sản phẩm"
              name="combo_price"
              inputType="number"
              value={comboPrice}
              onChange={setComboPrice}
              placeholder="Ví dụ: 12000000"
              error={fieldErrors.combo_price}
            />
            <AdminField
              label="Giá trị ban đầu (gốc)"
              name="original_price"
              inputType="number"
              value={originalPrice}
              onChange={setOriginalPrice}
              placeholder="Ví dụ: 18000000"
              error={fieldErrors.original_price}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Thời gian bắt đầu</span>
              <input
                className={\`input-pd bg-white \${fieldErrors.start_at ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
              {fieldErrors.start_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.start_at}</span>}
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Thời gian kết thúc</span>
              <input
                className={\`input-pd bg-white \${fieldErrors.end_at ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
              {fieldErrors.end_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.end_at}</span>}
            </label>
          </div>

          <div className="grid gap-2">
            <span className="label-pd">Ảnh bìa Combo</span>
            <ImageUploadDropzone
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              label="Tải ảnh combo khuyến mãi lên"
            />
            {fieldErrors.cover_image && <span className="text-red-600 text-xs font-medium">{fieldErrors.cover_image}</span>}
          </div>

          <div className="grid gap-2">
            <span className="label-pd">Các sản phẩm đi kèm trong Combo</span>
            <div className="space-y-2">
              {itemsList.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input className="input-pd bg-white flex-1" type="text" value={item} onChange={(e) => handleItemChange(idx, e.target.value)} placeholder={\`Sản phẩm #\${idx + 1}\`} />
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="button-pd-outline py-2 px-3 text-red-500 border-red-200 hover:bg-red-50" disabled={itemsList.length <= 1}>Xóa</button>
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="button-pd-outline text-xs mt-2 py-1 px-2">
                + Thêm sản phẩm
              </button>
            </div>
          </div>

          <div className="grid gap-2 mt-4 pt-4 border-t border-slate-200">
            <span className="label-pd">Áp dụng cho các sản phẩm thật (N-N)</span>
            <div className="flex gap-2">
              <input
                className="input-pd bg-white flex-1"
                type="text"
                placeholder="Nhập tên hoặc mã sản phẩm để tìm kiếm..."
                value={searchVal}
                onChange={(e) => handleSearchProducts(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg bg-white divide-y max-h-48 overflow-y-auto mt-2">
                {searchResults.map((prod) => {
                  const isChecked = selectedProductIds.includes(prod.id);
                  return (
                    <div key={prod.id} className="flex items-center justify-between p-2 hover:bg-slate-50 text-xs">
                      <div>
                        <span className="font-semibold text-primary">{prod.name}</span>
                        <span className="text-slate-400 ml-2 font-mono">({prod.reference_code})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(prod)}
                        className={\`px-3 py-1 rounded text-xs font-semibold \${
                          isChecked ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        }\`}
                      >
                        {isChecked ? "Bỏ chọn" : "Chọn"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Products List */}
            {selectedProducts.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-500 block mb-1.5 font-heading">Sản phẩm đã chọn ({selectedProducts.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((prod) => (
                    <div key={prod.id} className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs px-2.5 py-1 rounded-full">
                      <span>{prod.name} ({prod.reference_code})</span>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(prod)}
                        className="text-indigo-400 hover:text-indigo-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <aside className="space-y-5">
        <PublishWorkflow 
          status={status}
          onStatusChange={setStatus}
          errors={[]} 
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
        />
      </aside>
    </div>
  );
}`;

if (content.includes(promoTargetFunc)) {
  content = content.replace(promoTargetFunc, promoReplacementFunc);
  console.log("Replaced PromotionEntityForm successfully!");
} else {
  console.log("WARNING: PromotionEntityForm not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
