/**
 * Patch 1: Improve AdminField disabled styling
 * Make disabled fields visually clear with stripe bg, muted label, lock icon
 */
const fs = require('fs');
const path = require('path');

const workflowsPath = path.join(__dirname, '..', 'components', 'showroom', 'admin-workflows.tsx');
const pagesPath = path.join(__dirname, '..', 'components', 'showroom', 'admin-pages.tsx');

let workflows = fs.readFileSync(workflowsPath, 'utf8');
let pages = fs.readFileSync(pagesPath, 'utf8');

// ─────────────────────────────────────────────
// 1. AdminField: Improve disabled styling + add Lock icon
// ─────────────────────────────────────────────
const oldAdminField = `function AdminField({
  label,
  name,
  defaultValue,
  value,
  onChange,
  placeholder,
  inputType = "text",
  min,
  max,
  multiline,
  disabled,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  inputType?: "email" | "number" | "password" | "text" | "url";
  min?: number;
  max?: number;
  multiline?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = inputType === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : inputType;

  return (
    <label className="grid gap-2">
      <span className="label-pd">{label}</span>
      {multiline ? (
        <textarea
          className={\`input-pd min-h-24 bg-white \${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
          name={name}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
        />
      ) : (
        <div className="relative flex items-center">
          <input
            className={\`input-pd bg-white w-full pr-10 \${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
            type={currentType}
            name={name}
            defaultValue={value === undefined ? defaultValue : undefined}
            value={value}
            placeholder={placeholder}
            min={min}
            max={max}
            disabled={disabled}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-500 hover:text-slate-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
      )}
      {error && <span className="text-red-600 text-xs font-medium -mt-1">{error}</span>}
    </label>
  );
}`;

const newAdminField = `function AdminField({
  label,
  name,
  defaultValue,
  value,
  onChange,
  placeholder,
  inputType = "text",
  min,
  max,
  multiline,
  disabled,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  inputType?: "email" | "number" | "password" | "text" | "url";
  min?: number;
  max?: number;
  multiline?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = inputType === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : inputType;

  return (
    <label className={\`grid gap-1.5 \${disabled ? "opacity-60 cursor-not-allowed" : ""}\`}>
      <span className="flex items-center gap-1.5 label-pd">
        {label}
        {disabled && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
            <Lock className="size-2.5" />
            Khóa
          </span>
        )}
      </span>
      {multiline ? (
        <textarea
          className={\`input-pd min-h-24 \${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed select-none pointer-events-none" : "bg-white"} \${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
          name={name}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          placeholder={disabled ? "— Không khả dụng —" : placeholder}
          disabled={disabled}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
        />
      ) : (
        <div className="relative flex items-center">
          <input
            className={\`input-pd w-full pr-10 \${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white"} \${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
            type={currentType}
            name={name}
            defaultValue={value === undefined ? defaultValue : undefined}
            value={value}
            placeholder={disabled ? "— Không khả dụng —" : placeholder}
            min={min}
            max={max}
            disabled={disabled}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
          />
          {isPassword && !disabled && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-500 hover:text-slate-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
          {disabled && (
            <span className="absolute right-3 text-slate-300 pointer-events-none">
              <Lock className="size-3.5" />
            </span>
          )}
        </div>
      )}
      {error && <span className="text-red-600 text-xs font-medium -mt-1">{error}</span>}
    </label>
  );
}`;

if (workflows.includes(oldAdminField)) {
  workflows = workflows.replace(oldAdminField, newAdminField);
  console.log('✅ AdminField disabled styling improved!');
} else {
  console.log('❌ AdminField not found!');
}

// ─────────────────────────────────────────────
// 2. Promotion product picker: Add thumbnail image
// ─────────────────────────────────────────────
const oldProductDropdownItem = `                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              handleToggleProduct(prod);
                              setProductSearch("");
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-800">{prod.name}</span>
                              {prod.reference_code && (
                                <span className="text-[10px] text-slate-400 font-mono">Mã: {prod.reference_code}</span>
                              )}
                            </div>
                            {isSelected && (
                              <BadgeCheck className="size-4 text-emerald-600 shrink-0" />
                            )}
                          </button>`;

const newProductDropdownItem = `                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              handleToggleProduct(prod);
                              setProductSearch("");
                            }}
                            className={\`w-full text-left px-3 py-2 hover:bg-indigo-50/60 flex items-center gap-3 text-xs transition-colors \${isSelected ? "bg-indigo-50/40" : ""}\`}
                          >
                            {/* Product thumbnail */}
                            <div className="size-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/60">
                              {prod.primary_media ? (
                                <img
                                  src={prod.primary_media as string}
                                  alt={prod.name}
                                  className="size-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="size-full flex items-center justify-center">
                                  <Package className="size-4 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-800 truncate">{prod.name}</span>
                              {prod.reference_code && (
                                <span className="text-[10px] text-slate-400 font-mono">Mã: {prod.reference_code}</span>
                              )}
                            </div>
                            {isSelected && (
                              <BadgeCheck className="size-4 text-emerald-600 shrink-0 ml-auto" />
                            )}
                          </button>`;

if (workflows.includes(oldProductDropdownItem)) {
  workflows = workflows.replace(oldProductDropdownItem, newProductDropdownItem);
  console.log('✅ Promotion product picker thumbnail added!');
} else {
  console.log('❌ Promotion product picker item not found!');
}

// ─────────────────────────────────────────────
// 3. Selected products list: Add thumbnail in chips
// ─────────────────────────────────────────────
const oldSelectedProductChip = `                  {selectedProducts.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs pl-3 pr-2 py-1.5 rounded-full shadow-sm animate-in zoom-in-95 duration-100"
                    >
                      <span className="font-medium">{prod.name}</span>
                      {prod.reference_code && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                          {prod.reference_code}
                        </span>
                      )}`;

const newSelectedProductChip = `                  {selectedProducts.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs pl-1.5 pr-2 py-1 rounded-xl shadow-sm animate-in zoom-in-95 duration-100"
                    >
                      <div className="size-7 rounded-lg overflow-hidden bg-indigo-100 shrink-0">
                        {prod.primary_media ? (
                          <img src={prod.primary_media as string} alt={prod.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <Package className="size-3.5 text-indigo-400" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{prod.name}</span>
                      {prod.reference_code && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                          {prod.reference_code}
                        </span>
                      )}`;

if (workflows.includes(oldSelectedProductChip)) {
  workflows = workflows.replace(oldSelectedProductChip, newSelectedProductChip);
  console.log('✅ Promotion selected product chip thumbnail added!');
} else {
  console.log('❌ Selected product chip not found!');
}

fs.writeFileSync(workflowsPath, workflows, 'utf8');

// ─────────────────────────────────────────────
// 4. Showrooms admin pages: Remove Thứ tự column from list
// ─────────────────────────────────────────────
const oldShowroomColumns = `        columns={[
          { key: "image", label: "Hình ảnh", width: "80px", sortable: false },
          { key: "name", label: "Showroom", width: "1.5fr", sortable: false },
          { key: "hotline", label: "Hotline", width: "140px", sortable: false },
          { key: "status", label: "Trạng thái", width: "120px", sortable: true },
          { key: "sort_order", label: "Thứ tự", width: "90px", sortable: true },
          { key: "actions", label: "Thao tác", width: "100px", sortable: false },
        ]}
        renderListRow={(item) => {
          const showroom = item as AdminShowroom;
          return (
            <div key={showroom.id} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "80px 1.5fr 140px 120px 90px 100px" }}>
              {showroom.primary_media ? (
                <RemoteImage src={showroom.primary_media as string} alt={showroom.name} className="size-10 rounded-lg bg-slate-100 shrink-0 relative" />
              ) : (
                <div className="size-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center"><MapPin className="size-4 text-slate-300" /></div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{showroom.name}</p>
                <p className="text-xs text-slate-400 truncate">{showroom.address}</p>
              </div>
              <span className="text-xs text-slate-600 font-mono">{showroom.hotline}</span>
              <StatusBadge status={showroom.status} />
              <span className="text-xs text-slate-500 font-mono">#{showroom.sort_order ?? 0}</span>
              <div className="flex items-center gap-1.5">`;

const newShowroomColumns = `        columns={[
          { key: "image", label: "Hình ảnh", width: "80px", sortable: false },
          { key: "name", label: "Showroom", width: "1.5fr", sortable: false },
          { key: "hotline", label: "Hotline", width: "140px", sortable: false },
          { key: "status", label: "Trạng thái", width: "120px", sortable: true },
          { key: "actions", label: "Thao tác", width: "100px", sortable: false },
        ]}
        renderListRow={(item) => {
          const showroom = item as AdminShowroom;
          return (
            <div key={showroom.id} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "80px 1.5fr 140px 120px 100px" }}>
              {showroom.primary_media ? (
                <RemoteImage src={showroom.primary_media as string} alt={showroom.name} className="size-10 rounded-lg bg-slate-100 shrink-0 relative" />
              ) : (
                <div className="size-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center"><MapPin className="size-4 text-slate-300" /></div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{showroom.name}</p>
                <p className="text-xs text-slate-400 truncate">{showroom.address}</p>
              </div>
              <span className="text-xs text-slate-600 font-mono">{showroom.hotline}</span>
              <StatusBadge status={showroom.status} />
              <div className="flex items-center gap-1.5">`;

if (pages.includes(oldShowroomColumns)) {
  pages = pages.replace(oldShowroomColumns, newShowroomColumns);
  console.log('✅ Showroom Thứ tự column removed!');
} else {
  console.log('❌ Showroom columns not found!');
}

fs.writeFileSync(pagesPath, pages, 'utf8');
console.log('\nPatch 1 complete.');
