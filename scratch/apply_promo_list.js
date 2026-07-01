const fs = require('fs');

const filePath = 'components/showroom/admin-pages.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// Replace 1: Add PromoStatusPopover definition
const target1 = `  const [promoToDelete, setPromoToDelete] = useState<AdminPromotion | null>(null);

  const STATUS_OPTIONS = [`;

const replacement1 = `  const [promoToDelete, setPromoToDelete] = useState<AdminPromotion | null>(null);

  function PromoStatusPopover({ promo, onStatusChange }: { promo: AdminPromotion; onStatusChange: (status: string) => void }) {
    const [open, setOpen] = useState(false);
    
    const statusOptions = [
      { value: "draft", label: "Bản nháp", description: "Không hiển thị trên site", color: "bg-slate-400" },
      { value: "published", label: "Đã xuất bản", description: "Hiển thị công khai", color: "bg-emerald-500" },
      { value: "archived", label: "Lưu trữ", description: "Ẩn nhưng bảo toàn dữ liệu", color: "bg-amber-500" }
    ];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="cursor-pointer focus:outline-none select-none hover:opacity-80 active:scale-95 transition-all">
            <StatusBadge status={promo.status} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5 bg-white border border-slate-200 shadow-lg rounded-xl z-[200] animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="flex flex-col gap-1">
            <span className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Chuyển trạng thái
            </span>
            {statusOptions.map((opt) => {
              const isActive = promo.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={\`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-all \${
                    isActive 
                      ? "bg-slate-50 text-slate-900" 
                      : "hover:bg-slate-50/80 text-slate-600 hover:text-slate-900"
                  }\`}
                  onClick={async () => {
                    if (!isActive) {
                      onStatusChange(opt.value);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <span className={\`size-1.5 rounded-full \${opt.color}\`} />
                      {opt.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {opt.description}
                    </span>
                  </div>
                  {isActive && (
                    <Check className="size-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  const STATUS_OPTIONS = [`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log("Replaced target1 successfully!");
} else {
  console.log("WARNING: target1 not found!");
}

// Replace 2: Replace StatusBadge with PromoStatusPopover
const target2 = `              <span className="text-xs text-slate-500" suppressHydrationWarning>{start} - {end}</span>
              <StatusBadge status={promo.status} />
              <div className="flex items-center gap-1.5">`;

const replacement2 = `              <span className="text-xs text-slate-500" suppressHydrationWarning>{start} - {end}</span>
              <PromoStatusPopover
                promo={promo}
                onStatusChange={async (newStatus) => {
                  const res = await updatePromotionStatus(promo.id, newStatus);
                  if (res.success) {
                    toast.success("Cập nhật trạng thái thành công!");
                    router.refresh();
                  } else {
                    toast.error("Cập nhật thất bại: " + (res.error ?? "Không rõ"));
                  }
                }}
              />
              <div className="flex items-center gap-1.5">`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log("Replaced target2 successfully!");
} else {
  console.log("WARNING: target2 not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
