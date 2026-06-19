"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Heart,
  Maximize2,
  ShieldCheck,
  Truck,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  MapPin,
  ArrowRight,
  ExternalLink,
  X,
  Award,
  Ruler,
  Sparkles,
} from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized } from "@/lib/showroom-data";
import { withLocale } from "@/lib/showroom-constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RemoteImage } from "./remote-image";
import { QuoteForm } from "@/components/showroom/quote-form";

type ProductDetailLabels = {
  galleryLabel: string;
  enlargeImage: string;
  galleryHelp: string;
  tabsOverview: string;
  tabsSpecifications: string;
  tabsMaterials: string;
  tabsDimensionsCare: string;
  tabsDeliveryWarranty: string;
  overviewTitle: string;
  specificationsTitle: string;
  materialsTitle: string;
  dimensionsCareTitle: string;
  deliveryWarrantyTitle: string;
  materialsLead: string;
  dimensionsCareLead: string;
  deliveryWarrantyLead: string;
  craftsmanshipNote: string;
  careNote: string;
  deliveryNote: string;
  warrantyNote: string;
};

// 1. PREMIUM GALLERY COMPONENT
export function ProductGallery({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: Locale;
  labels: Pick<ProductDetailLabels, "galleryLabel" | "enlargeImage" | "galleryHelp">;
}) {
  const images = useMemo(() => Array.from(new Set([product.image, ...product.gallery])), [product]);
  const [activeImage, setActiveImage] = useState(images[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeIndex = images.indexOf(activeImage);
  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + images.length) % images.length;
    setActiveImage(images[prevIndex]);
  };
  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % images.length;
    setActiveImage(images[nextIndex]);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(activeImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = activeImage.split("/").pop()?.split("?")[0] || "product-image.jpg";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(activeImage, "_blank");
    }
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen, activeIndex]);

  return (
    <div className="flex flex-col gap-4 w-full lg:sticky lg:top-24 h-fit">
      {/* Main Image Viewport */}
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 group shadow-sm">
        <button
          type="button"
          className="block w-full h-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10"
          onClick={() => setDialogOpen(true)}
          aria-label={labels.enlargeImage}
        >
          <RemoteImage
            src={activeImage}
            alt={localized(product.name, locale)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            priority
          />
        </button>

        {/* Floating Glassmorphic Zoom Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/60 px-3.5 py-2 text-xs font-semibold text-slate-800 backdrop-blur-md transition-all hover:bg-white/90 hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <Maximize2 className="size-3.5" />
              {labels.enlargeImage}
            </button>
          </DialogTrigger>
          <DialogContent 
            showCloseButton={false}
            className="fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen max-w-none sm:max-w-none md:max-w-none max-h-none rounded-none border-none bg-slate-950 text-white p-0 m-0 z-[var(--z-modal)] flex flex-col justify-between overflow-hidden gap-0"
          >
            <DialogTitle className="sr-only">{localized(product.name, locale)}</DialogTitle>
            <DialogDescription className="sr-only">{labels.galleryHelp}</DialogDescription>
            
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-heading text-sm md:text-base font-bold text-white/90 truncate max-w-[50vw]">
                  {localized(product.name, locale)}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/60 shrink-0">
                  {activeIndex + 1} / {images.length}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-2 rounded-full hover:bg-white/10 transition text-white/80 hover:text-white cursor-pointer"
                  title={locale === "vi" ? "Tải ảnh về" : "Download image"}
                >
                  <Download className="size-4" />
                </button>
                <a
                  href={activeImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-white/10 transition text-white/80 hover:text-white cursor-pointer"
                  title={locale === "vi" ? "Mở trong tab mới" : "Open in new tab"}
                >
                  <ExternalLink className="size-4" />
                </a>
                <DialogClose asChild>
                  <button className="p-2 rounded-full hover:bg-white/10 transition text-white/80 hover:text-white cursor-pointer">
                    <X className="size-4" />
                  </button>
                </DialogClose>
              </div>
            </div>

            {/* Main Viewport */}
            <div className="relative w-full flex-1 flex items-center justify-center p-4 overflow-hidden">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-6 z-20 p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition flex items-center justify-center cursor-pointer border border-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}

              <div className="relative max-h-full max-w-full flex items-center justify-center">
                <RemoteImage
                  src={activeImage}
                  alt={localized(product.name, locale)}
                  className="max-h-[82vh] md:max-h-[88vh] max-w-full rounded-lg object-contain select-none shadow-2xl border border-white/5"
                  sizes="90vw"
                />
              </div>

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-6 z-20 p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition flex items-center justify-center cursor-pointer border border-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div aria-label={labels.galleryLabel} className="grid grid-cols-5 gap-3.5 mt-1">
          {images.map((image, index) => {
            const selected = image === activeImage;
            return (
              <button
                key={image}
                type="button"
                aria-label={`${labels.galleryLabel} ${index + 1}`}
                aria-pressed={selected}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer ${
                  selected
                    ? "border-primary ring-2 ring-primary/10 scale-[1.03]"
                    : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400"
                }`}
                onClick={() => setActiveImage(image)}
              >
                <RemoteImage
                  src={image}
                  alt={`${localized(product.name, locale)} ${index + 1}`}
                  className="h-full w-full object-cover"
                  sizes="120px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 2. PREMIUM TRUST METRICS COMPONENT
export function ProductTrustMetrics({ locale }: { locale: Locale }) {
  const isVi = locale === "vi";
  return (
    <div className="grid gap-3 sm:grid-cols-3 border-t border-slate-100 pt-5 mt-5">
      <div className="flex items-start gap-2.5">
        <MapPin className="size-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {isVi ? "Trưng bày tại showroom" : "Showroom Availability"}
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            {isVi ? "Sẵn hàng tại Q7, TP.HCM" : "Available in District 7, HCMC"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <ShieldCheck className="size-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {isVi ? "Bảo hành cam kết" : "Authentic Warranty"}
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            {isVi ? "5 năm kết cấu bền vững" : "5-year structural warranty"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <Truck className="size-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {isVi ? "Giao hàng & Lắp đặt" : "Delivery & Install"}
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            {isVi ? "Miễn phí nội thành" : "Free in-metro shipping & setup"}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProductInformationTabs({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: Locale;
  labels: ProductDetailLabels;
}) {
  const isVi = locale === "vi";

  // Simulate PDF Download Action
  const handlePdfDownload = () => {
    alert(
      isVi
        ? "Bản vẽ kỹ thuật PDF đang được chuẩn bị. Quý khách vui lòng liên hệ tư vấn viên để nhận bản CAD chính xác nhất."
        : "Technical PDF sheet is being generated. Please contact showroom representatives for exact CAD files."
    );
  };

  // Determine material cards based on product keywords for tailored descriptions
  const getMaterialCards = () => {
    const nameLower = (localized(product.name, locale) || "").toLowerCase();
    const cards = [];

    if (
      nameLower.includes("đá") ||
      nameLower.includes("marble") ||
      nameLower.includes("calacatta") ||
      nameLower.includes("đá tự nhiên")
    ) {
      cards.push({
        title: isVi ? "Đá Cẩm Thạch Tự Nhiên (Marble)" : "Natural Marble Stone",
        desc: isVi
          ? "Bề mặt sử dụng đá cẩm thạch tự nhiên cao cấp, sở hữu đường vân mây độc bản không trùng lặp. Mỗi phiến đá là tác phẩm của tự nhiên, được xử lý chống thấm ố 5 lớp và đánh bóng thủ công tỉ mỉ để giữ độ sáng bóng bền vững."
          : "Crafted with premium natural marble featuring one-of-a-kind veining. Each slab is a work of nature, treated with a 5-layer stain-protection seal and hand-polished to a luxurious sheen.",
        origin: isVi ? "Ý (Italy)" : "Italy",
      });
    }
    if (
      nameLower.includes("gỗ") ||
      nameLower.includes("walnut") ||
      nameLower.includes("óc chó") ||
      nameLower.includes("oak") ||
      nameLower.includes("sồi") ||
      nameLower.includes("ash") ||
      nameLower.includes("tần bì")
    ) {
      const isWalnut = nameLower.includes("óc chó") || nameLower.includes("walnut");
      cards.push({
        title: isWalnut
          ? (isVi ? "Gỗ Óc Chó Bắc Mỹ Tự Nhiên" : "Natural North American Walnut")
          : (isVi ? "Gỗ Sồi Châu Âu Cao Cấp" : "Premium European Oak"),
        desc: isWalnut
          ? (isVi
              ? "Tuyển chọn từ thân gỗ óc chó Bắc Mỹ tự nhiên nhóm 1A chính ngạch, sở hữu tone màu nâu socola trầm ấm đặc trưng và đường vân dạng sóng cuộn tuyệt mỹ. Khung gỗ được sấy nhiệt độ tiêu chuẩn chống cong vênh và co ngót tối đa."
              : "Selected from FAS-grade North American walnut wood, renowned for its rich chocolate brown tones and wave-like grain patterns. Heat-treated to ensure maximum stability against warping and shrinkage.")
          : (isVi
              ? "Sử dụng gỗ sồi tự nhiên nhập khẩu Châu Âu cứng cáp, vân gỗ thẳng thớ mịn cùng khả năng chịu lực nén cực tốt. Bề mặt phủ sơn lau bóng cao cấp bảo vệ thớ gỗ tự nhiên."
              : "Built using imported solid European oak wood, featuring straight grains, fine textures, and superior strength. Protected with a premium natural oil finish to preserve the raw wood feel."),
        origin: isWalnut ? (isVi ? "Bắc Mỹ" : "North America") : (isVi ? "Châu Âu" : "Europe"),
      });
    }
    if (
      nameLower.includes("da") ||
      nameLower.includes("leather") ||
      nameLower.includes("nỉ") ||
      nameLower.includes("velour") ||
      nameLower.includes("sofa")
    ) {
      const isLeather = nameLower.includes("da") || nameLower.includes("leather");
      cards.push({
        title: isLeather
          ? (isVi ? "Da Bò Ý Nguyên Tấm" : "Genuine Italian Leather")
          : (isVi ? "Vải Nỉ Velour Nhập Khẩu" : "Imported Velour Fabric"),
        desc: isLeather
          ? (isVi
              ? "Tuyển chọn da bò thuộc nguyên tấm (top-grain) nhập khẩu trực tiếp từ Ý. Chất da mềm mại thoáng khí vượt trội, có độ đàn hồi cao, càng sử dụng lâu da càng bóng mịn tự nhiên và nâng niu xúc giác."
              : "Upholstered in top-grain genuine cowhide leather directly imported from Italy. Highly breathable and elastic, this leather develops a beautiful natural patina and grows softer with age.")
          : (isVi
              ? "Vải nỉ nhung cao cấp dệt sợi siêu mảnh kháng khuẩn, chất vải dày dặn êm ái, thân thiện với làn da nhạy cảm và hạn chế bám bụi bẩn, dễ dàng vệ sinh định kỳ."
              : "Upholstered in high-grade micro-weave velour fabric. Soft, hypoallergenic, dust-resistant, and easy to clean, ensuring a premium seating experience."),
        origin: isVi ? "Châu Âu" : "Europe",
      });
    }

    // Fallback if no matching material found
    if (cards.length === 0) {
      cards.push({
        title: isVi ? "Vật Liệu Tuyển Chọn Khắt Khe" : "Curated Materials",
        desc: isVi
          ? "Sản phẩm tuân thủ quy trình kiểm định vật liệu xuất khẩu cao cấp, kết hợp kết cấu thép gia cường chống rỉ sét cùng chất lượng sơn tĩnh điện/xi mạ PVD cao cấp nhất, nâng tầm vẻ sang trọng cho không gian bày trí."
          : "Built to high-end export standards, combining reinforced steel frames, rust-proofing treatments, and premium PVD electroplating or powder coatings for maximum aesthetic durability.",
        origin: isVi ? "Chất lượng cao" : "Premium Grade",
      });
    }
    return cards;
  };

  const materialCards = getMaterialCards();

  const getProductTags = () => {
    const cleanTags = (product.tags || []).map(t => String(t || "").trim()).filter(Boolean);
    if (cleanTags.length > 0) {
      return cleanTags;
    }
    const nameLower = (localized(product.name, locale) || "").toLowerCase();
    if (nameLower.includes("đá") || nameLower.includes("marble") || nameLower.includes("calacatta")) {
      return isVi
        ? ["Đá tự nhiên nhập khẩu nguyên tấm", "Đánh bóng thủ công tinh xảo", "Xử lý chống thấm ố 5 lớp", "Kết cấu chân chịu lực tối ưu"]
        : ["Imported natural slab marble", "Exquisite hand-polished finish", "5-layer stain-proof sealer", "Heavy-duty load bearing base"];
    }
    if (nameLower.includes("sofa") || nameLower.includes("da") || nameLower.includes("nỉ") || nameLower.includes("velour")) {
      return isVi
        ? ["Đệm mút HR đàn hồi kháng xẹp", "Khung xương tự nhiên gia cường", "Đường may thủ công chuẩn xác", "Vải/Da bọc nhập khẩu cao cấp"]
        : ["Sag-resistant HR foam cushioning", "Reinforced solid wood framing", "High-precision master stitching", "Premium imported upholstery fabric"];
    }
    return isVi
      ? ["Gỗ tự nhiên tẩm sấy tiêu chuẩn", "Phủ sơn lau cao cấp bảo vệ vân", "Liên kết mộng gỗ truyền thống", "Độ hoàn thiện bề mặt tinh xảo"]
      : ["Kiln-dried solid hardwood base", "Premium protective oil coating", "Traditional joinery craftsmanship", "Exceptional surface finishing"];
  };

  const displayTags = getProductTags();

  // Custom care directives with rich icons
  const careDirectives = [
    {
      title: isVi ? "Tránh nhiệt độ & ẩm ướt" : "Avoid Heat & Dampness",
      desc: isVi
        ? "Không đặt cốc nóng trực tiếp lên bề mặt gỗ/đá. Lau sạch chất lỏng ngay khi đổ để tránh thấm ố ẩm mốc."
        : "Do not place hot items directly on wood or stone. Wipe spills immediately to prevent stains and moisture absorption.",
    },
    {
      title: isVi ? "Hạn chế ánh nắng gắt" : "Limit Direct Sunlight",
      desc: isVi
        ? "Tránh đặt sản phẩm dưới ánh nắng mặt trời chiếu trực tiếp để bảo vệ màu sơn gỗ và độ bền của da/vải."
        : "Avoid placing furniture in direct sunlight to protect the wood finish and prevent leather or fabric fading.",
    },
    {
      title: isVi ? "Vệ sinh bằng khăn mềm" : "Clean with Soft Microfiber",
      desc: isVi
        ? "Sử dụng chổi lông gà hoặc khăn lau sợi microfiber khô/ẩm nhẹ để vệ sinh bụi bẩn hàng ngày. Không dùng chất tẩy rửa mạnh."
        : "Clean daily with a dry or lightly damp microfiber cloth. Refrain from using abrasive cleaning solvents.",
    },
  ];

  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* Premium Tab Header with right-fade scroll indicator */}
      <div className="relative border-b border-slate-100 pb-px">
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 block sm:hidden" />
        <TabsList variant="line" className="flex w-full gap-4 lg:gap-6 xl:gap-8 bg-transparent p-0 justify-start max-xl:overflow-x-auto max-xl:scrollbar-none xl:overflow-x-visible relative pb-0 select-none">
          {[
            ["overview", "01", labels.tabsOverview],
            ["specifications", "02", labels.tabsSpecifications],
            ["materials", "03", labels.tabsMaterials],
            ["care", "04", labels.tabsDimensionsCare],
            ["delivery", "05", labels.tabsDeliveryWarranty],
          ].map(([value, num, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              style={{ boxShadow: "none", outline: "none" }}
              className="relative !bg-transparent p-0 pb-4 text-[10px] lg:text-[11px] xl:text-[12px] font-heading font-medium tracking-[0.12em] uppercase text-slate-400 border-b-2 border-transparent transition-all duration-300 rounded-none hover:text-slate-800 data-[state=active]:text-primary data-[state=active]:!border-b-primary data-[state=active]:!border-t-transparent data-[state=active]:!border-x-transparent data-[state=active]:font-semibold !shadow-none !h-auto cursor-pointer shrink-0 flex items-center gap-1.5 focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 after:hidden"
            >
              <span className="text-[9px] font-mono text-slate-350 data-[state=active]:text-primary/70">{num}.</span>
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tab: Overview */}
      <TabsContent value="overview" className="pt-8 focus-visible:outline-none">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
                01 / {labels.tabsOverview}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
                {labels.overviewTitle}
              </h2>
            </div>
            
            <div className="relative pl-6 border-l-2 border-primary/30 py-2">
              <p className="text-slate-650 leading-relaxed text-sm sm:text-base font-light italic text-justify">
                &ldquo;{localized(product.description, locale)}&rdquo;
              </p>
            </div>
          </div>
          
          {/* Key Facts list */}
          <div className="bg-slate-50/50 border border-slate-100/80 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              {isVi ? "Đặc điểm chế tác" : "Key Craftsmanship Points"}
            </h3>
            <div className="grid gap-2">
              {displayTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-b-0 hover:translate-x-1 transition-transform"
                >
                  <CheckCircle2 className="size-4 text-primary shrink-0 opacity-80" />
                  <p className="text-xs sm:text-sm font-medium text-slate-700">{tag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Tab: Specifications */}
      <TabsContent value="specifications" className="pt-8 focus-visible:outline-none">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="space-y-1">
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
            className="flex items-center gap-2 text-xs text-slate-750 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer font-bold shadow-sm"
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
      </TabsContent>

      {/* Tab: Materials & Craftsmanship */}
      <TabsContent value="materials" className="pt-8 focus-visible:outline-none">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
          <div className="space-y-5">
            <div className="space-y-1">
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
      </TabsContent>

      {/* Tab: Dimensions & Care */}
      <TabsContent value="care" className="pt-8 focus-visible:outline-none">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
                04 / {labels.tabsDimensionsCare}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
                {labels.dimensionsCareTitle}
              </h2>
            </div>
            <p className="text-slate-500 leading-relaxed text-sm font-light">
              {labels.dimensionsCareLead}
            </p>
            
            {/* Structured Care Guidelines Block */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2 border-b border-slate-100 pb-3">
                <Info className="size-4 text-primary" />
                {isVi ? "Quy tắc bảo quản đồ nội thất cao cấp" : "Premium Furniture Care Guide"}
              </h3>
              <div className="grid gap-6 sm:grid-cols-3">
                {careDirectives.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-850 flex items-center gap-2">
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                        {idx + 1}
                      </span>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-light text-justify">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Blueprint CAD-style Technical Specifications Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 text-white flex flex-col justify-between min-h-[240px] shadow-lg relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            {/* Background vector decoration */}
            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none translate-x-4 translate-y-4">
              <Ruler className="size-48" />
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-3 z-10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Ruler className="size-4 text-primary shrink-0" />
                {isVi ? "Kích thước mô phỏng" : "Dimension Blueprints"}
              </h4>
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Unit: mm</span>
            </div>
            
            <div className="py-4 space-y-3 font-mono text-xs z-10">
              {product.specs.filter(s => {
                const label = localized(s.label, locale).toLowerCase();
                return label.includes("thước") || label.includes("rộng") || label.includes("cao") || label.includes("dài") || label.includes("sâu") || label.includes("dimension") || label.includes("size");
              }).map(s => (
                <div key={localized(s.label, locale)} className="flex justify-between border-b border-white/5 pb-1.5 last:border-0">
                  <span className="text-slate-400">{localized(s.label, locale)}</span>
                  <span className="font-bold text-primary">{localized(s.value, locale)}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-2.5 z-10">
              <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-450 leading-relaxed font-light">
                {labels.careNote}
              </p>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Tab: Delivery & Warranty */}
      <TabsContent value="delivery" className="pt-8 focus-visible:outline-none">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card: Delivery */}
          <div className="border border-slate-100/80 p-6 rounded-2xl bg-white shadow-sm space-y-6 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[280px]">
            <div className="space-y-4">
              <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center">
                <Truck className="size-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-lg font-bold text-slate-800">
                  {isVi ? "Vận chuyển lắp đặt tận nhà" : "White-glove Home Delivery"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {labels.deliveryWarrantyLead}
                </p>
              </div>
              
              {/* Detailed checkmarks */}
              <div className="space-y-2 pt-2 border-t border-slate-50">
                {[
                  isVi ? "Giao hàng bằng xe chuyên dụng an toàn" : "Secure delivery via specialized vehicles",
                  isVi ? "Lắp đặt & tinh chỉnh tại chỗ bởi kỹ thuật viên" : "On-site assembly & calibration by specialists",
                  isVi ? "Hỗ trợ thu hồi vỏ hộp & vệ sinh khu vực bàn giao" : "Post-assembly cleaning & packaging removal",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0 opacity-70" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-[10px] text-slate-405 leading-relaxed border-t border-slate-100 pt-3 mt-4">
              {labels.deliveryNote}
            </p>
          </div>
          
          {/* Card: Warranty */}
          <div className="border border-slate-100/80 p-6 rounded-2xl bg-white shadow-sm space-y-6 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[280px]">
            <div className="space-y-4">
              <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-lg font-bold text-slate-800">
                  {isVi ? "Cam kết bảo hành chính hãng" : "Product Warranty Policies"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {isVi 
                    ? "Bảo hành kết cấu 5 năm và 2 năm cho đệm/vải nỉ bọc. Hỗ trợ kiểm định chất lượng định kỳ tại nhà miễn phí."
                    : "5-year structural warranty and 2-year warranty on cushions/textiles. Includes free home quality inspections."}
                </p>
              </div>

              {/* Detailed checkmarks */}
              <div className="space-y-2 pt-2 border-t border-slate-50">
                {[
                  isVi ? "Bảo hành kết cấu khung gỗ/khung thép 5 năm" : "5-year structural warranty (frame/wood)",
                  isVi ? "Bảo hành 2 năm mặt sơn, đệm mút và vải nỉ bọc" : "2-year surface, cushion, and textile warranty",
                  isVi ? "Hỗ trợ sửa chữa, bọc mới trọn đời ưu đãi" : "Lifetime refurbishment support at client rates",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0 opacity-70" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-[10px] text-slate-405 leading-relaxed border-t border-slate-100 pt-3 mt-4">
              {labels.warrantyNote}
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// 4. HEART / WISHLIST SAVE BUTTON
export function SaveSelectionButton({ label, savedLabel }: { label: string; savedLabel: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      className={`button-pd-outline flex items-center justify-center gap-2 cursor-pointer py-2.5 text-xs font-bold transition-all border ${
        saved
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
      }`}
      type="button"
      aria-pressed={saved}
      onClick={() => setSaved((value) => !value)}
    >
      <Heart className={`size-3.5 transition-all ${saved ? "fill-red-600 text-red-600 scale-[1.1]" : "text-slate-500"}`} />
      {saved ? savedLabel : label}
    </button>
  );
}

// 5. CLIENT-SIDE ACTION GROUP TO TRIGGER MODAL FORM
export function ProductActionGroup({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: Locale;
  labels: {
    quoteNow: string;
    saveSelection: string;
    savedSelection: string;
    viewInShowroom: string;
    formTitle: string;
    name: string;
    phone: string;
    email: string;
    company: string;
    service: string;
    message: string;
    submit: string;
    sending: string;
    responseTime: string;
    honeypot: string;
    submitError: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isVi = locale === "vi";

  // Extract category info from product
  const categoryId = typeof product.category === "object" && "id" in product.category 
    ? String(product.category.id) 
    : "";

  return (
    <div className="mt-8 space-y-3">
      {/* Dialog containing QuoteForm */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] w-full text-center cursor-pointer border border-transparent"
          >
            {labels.quoteNow}
            <ArrowRight className="size-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-xl sm:max-w-2xl bg-white p-0 overflow-y-auto max-h-[90vh] rounded-2xl border shadow-2xl">
          <DialogTitle className="sr-only">{labels.formTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {isVi ? "Vui lòng nhập thông tin liên hệ để nhận báo giá chi tiết sản phẩm." : "Please fill out contact information to receive detailed product quote."}
          </DialogDescription>
          
          <div className="p-1">
            <QuoteForm
              locale={locale}
              productId={product.slug}
              categoryId={product.categoryKey}
              sourcePath={`/${locale}/products/${product.slug}`}
              productsForQuote={[
                {
                  slug: product.slug,
                  name: localized(product.name, locale),
                  category_slug: product.categoryKey,
                  category_name: localized(product.category, locale),
                }
              ]}
              categoriesForQuote={
                product.categoryKey
                  ? [{ slug: product.categoryKey, name: localized(product.category, locale) }]
                  : []
              }
              labels={{
                formTitle: labels.formTitle,
                name: labels.name,
                phone: labels.phone,
                email: labels.email,
                company: labels.company,
                service: labels.service,
                message: labels.message,
                submit: labels.submit,
                sending: labels.sending,
                responseTime: labels.responseTime,
                honeypot: labels.honeypot,
                submitError: labels.submitError,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <SaveSelectionButton label={labels.saveSelection} savedLabel={labels.savedSelection} />
        <Link
          href={withLocale(locale, "/showrooms")}
          className="button-pd-outline flex items-center justify-center gap-2 cursor-pointer py-2.5 text-xs font-bold transition-all border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
        >
          <MapPin className="size-3.5 text-slate-500" />
          {labels.viewInShowroom}
        </Link>
      </div>
    </div>
  );
}
