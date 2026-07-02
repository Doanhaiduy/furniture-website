"use client";

import { useState } from "react";
import { CheckCircle2, Download, Info, Award, Ruler, Sparkles, ChevronDown, Truck, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized } from "@/lib/showroom-data";
import { useToast } from "@/components/providers/toast-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { toast } = useToast();

  const handlePdfDownload = () => {
    toast.info(
      isVi
        ? "Bản vẽ kỹ thuật PDF đang được chuẩn bị. Quý khách vui lòng liên hệ tư vấn viên để nhận bản CAD chính xác nhất."
        : "Technical PDF sheet is being generated. Please contact showroom representatives for exact CAD files."
    );
  };

  const getProductGroup = (): "wood" | "sanitary" | "tiles" | "other" => {
    const prodCat = product.category as any;
    const catGroupKey = (prodCat?.groupKey || "").toLowerCase();
    const catSlug = (prodCat?.slug || "").toLowerCase();
    const catKey = (product.categoryKey || "").toLowerCase();

    // Check sanitary
    if (
      catGroupKey === "sanitary" ||
      catSlug === "thiet-bi-ve-sinh" ||
      catKey === "thiet-bi-ve-sinh" ||
      ["bathtub", "toilet", "basin", "shower", "faucet"].some(k => 
        catGroupKey === k || catSlug === k || catKey === k
      )
    ) {
      return "sanitary";
    }

    // Check tiles
    if (
      catGroupKey === "tiles" ||
      catSlug === "gach-op-lat" ||
      catKey === "gach-op-lat" ||
      ["floor", "wall", "tiles"].some(k => 
        catGroupKey === k || catSlug === k || catKey === k
      )
    ) {
      return "tiles";
    }

    // Check wood
    if (
      catGroupKey === "wood" ||
      catSlug === "do-go-noi-that" ||
      catKey === "do-go-noi-that" ||
      ["sofa", "coffee-table", "tv-cabinet", "dining-table", "chair", "bed", "wardrobe"].some(k => 
        catGroupKey === k || catSlug === k || catKey === k
      )
    ) {
      return "wood";
    }

    // Fallback using product name
    const nameLower = (localized(product.name, locale) || "").toLowerCase();
    if (nameLower.includes("bồn tắm") || nameLower.includes("bồn cầu") || nameLower.includes("lavabo") || nameLower.includes("sen tắm") || nameLower.includes("vòi") || nameLower.includes("kohler") || nameLower.includes("toto") || nameLower.includes("bravat") || nameLower.includes("grohe") || nameLower.includes("basin") || nameLower.includes("toilet") || nameLower.includes("bathtub")) {
      return "sanitary";
    }
    if (nameLower.includes("gạch") || nameLower.includes("mosaic") || nameLower.includes("porcelain") || nameLower.includes("tile")) {
      return "tiles";
    }

    return "wood"; // Default to wood
  };

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
              ? "Vải nỉ nhung cao cấp dệt sợi siêu mảnh kháng khuẩn, chất vải dệt dày dặn êm ái, thân thiện với làn da nhạy cảm và hạn chế bám bụi bẩn, dễ dàng vệ sinh định kỳ."
              : "Upholstered in high-grade micro-weave velour fabric. Soft, hypoallergenic, dust-resistant, and easy to clean, ensuring a premium seating experience."),
        origin: isVi ? "Châu Âu" : "Europe",
      });
    }

    if (cards.length === 0) {
      const group = getProductGroup();
      if (group === "sanitary") {
        cards.push({
          title: isVi ? "Sứ Tráng Men Cao Cấp" : "Premium Glazed Ceramic",
          desc: isVi
            ? "Vật liệu sứ cao cấp chịu nhiệt lực tốt, tráng lớp men nano chống bám bẩn ưu việt, hạn chế tối đa vi khuẩn tích tụ giúp thiết bị luôn trắng sáng bóng mịn."
            : "High-grade glazed ceramic featuring advanced stain-proof properties, preventing bacterial accumulation and ensuring a sparkling clean surface.",
          origin: isVi ? "Chất lượng cao" : "Premium Grade",
        });
      } else if (group === "tiles") {
        cards.push({
          title: isVi ? "Porcelain & Bán Sứ Cao Cấp" : "Premium Porcelain Base",
          desc: isVi
            ? "Cốt liệu bột đá nung nhiệt ép lực lớn tạo độ cứng chống mài mòn vượt trội, hệ số chống thấm cực thấp dưới 0.5% thích nghi lý tưởng với thời tiết ẩm ướt."
            : "Pressed under massive pressure for heavy-duty structural strength and low water absorption rates under 0.5%, performing beautifully in wet spaces.",
          origin: isVi ? "Chất lượng cao" : "Premium Grade",
        });
      } else {
        cards.push({
          title: isVi ? "Vật Liệu Tuyển Chọn Khắt Khe" : "Curated Materials",
          desc: isVi
            ? "Sản phẩm tuân thủ quy trình kiểm định vật liệu xuất khẩu cao cấp, kết cấu khung chắc chắn kết hợp kỹ nghệ xử lý bề mặt hoàn hảo nhất, nâng tầm vẻ sang trọng cho không gian bày trí."
            : "Built to high-end export standards, combining stable structuring and premium surface finishes to bring comfort and sophistication to your interior space.",
          origin: isVi ? "Chất lượng cao" : "Premium Grade",
        });
      }
    }
    return cards;
  };

  const materialCards = getMaterialCards();

  const getProductTags = () => {
    const cleanTags = (product.tags || []).map(t => String(t || "").trim()).filter(Boolean);
    if (cleanTags.length > 0) {
      return cleanTags;
    }
    const group = getProductGroup();
    if (group === "sanitary") {
      return isVi
        ? [
            "Men sứ cao cấp kháng khuẩn, chống bám bẩn",
            "Công nghệ xả nước tối ưu hiệu năng cao",
            "Thiết kế tinh gọn, dễ dàng vệ sinh làm sạch",
            "Độ bền cơ học vượt trội, bảo hành dài hạn"
          ]
        : [
            "Premium antibacterial, stain-resistant glaze",
            "High-efficiency water-saving flush technology",
            "Sleek minimalist design, effortless cleaning",
            "Superior structural durability, long warranty"
          ];
    }
    if (group === "tiles") {
      return isVi
        ? [
            "Xương gạch bán sứ / porcelain chịu lực tốt",
            "Chống thấm nước tuyệt đối, kháng rêu mốc",
            "Bề mặt hoàn thiện tỉ mỉ, chống trơn trượt",
            "Họa tiết vân đá sắc nét tự nhiên sang trọng"
          ]
        : [
            "Heavy-duty porcelain core with high load capacity",
            "100% waterproof, mold and mildew resistant",
            "Meticulously finished surface with anti-slip tech",
            "High-definition natural stone look for elegant spaces"
          ];
    }
    return isVi
      ? [
          "Gỗ tự nhiên tuyển chọn tẩm sấy đạt chuẩn",
          "Phủ sơn lau cao cấp bảo vệ và tôn màu vân",
          "Mộng gỗ chắc chắn liên kết kết cấu vững chãi",
          "Chi tiết góc cạnh bo tròn tinh tế an toàn"
        ]
      : [
          "Curated kiln-dried solid hardwood base",
          "Premium protective oil coating highlighting grains",
          "Robust traditional joinery for lifelong stability",
          "Softened corners and edges for safe daily use"
        ];
  };

  const getCraftsmanshipNote = () => {
    const group = getProductGroup();
    if (group === "sanitary") {
      return isVi
        ? "Mỗi thiết bị vệ sinh đều trải qua quy trình nung ở nhiệt độ cao trên 1200°C và kiểm tra áp lực nước nghiêm ngặt nhằm đảm bảo lớp men sứ không rạn nứt, bền bỉ và giữ màu trắng sáng tuyệt đối."
        : "Each sanitary fixture is fired at over 1200°C and subjected to rigorous water pressure tests to ensure a crack-free glaze, superior hygiene, and long-lasting glossy white finish.";
    }
    if (group === "tiles") {
      return isVi
        ? "Gạch được sản xuất bằng công nghệ ép lực lớn và nung nhiệt độ cao, đảm bảo độ phẳng tối đa, kích thước đồng đều và sai số tối thiểu, giúp các mạch nối hoàn hảo và chịu lực nén cực tốt."
        : "Tiles are manufactured using high-pressure pressing and high-temperature firing, ensuring maximum flatness, consistent sizing, and high load capacity for seamless tile joints.";
    }
    return labels.craftsmanshipNote;
  };

  const displayTags = getProductTags();

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

  const [activeAccordion, setActiveAccordion] = useState<string | null>("overview");

  const renderOverview = () => (
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
      </div>
      
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
  );

  const renderSpecifications = () => (
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
  );

  const renderMaterials = () => {
    const customMat = product.material ? localized(product.material, locale) : "";
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
              {getCraftsmanshipNote()}
            </p>
          </div>
        </div>
        
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
  };

  const renderCare = () => (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
      <div className="space-y-6">
        <div className="space-y-1 hidden md:block">
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
      
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 text-white flex flex-col justify-between min-h-[240px] shadow-lg relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
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
  );

  const renderDelivery = () => (
    <div className="grid gap-6 md:grid-cols-2">
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
  );

  const accordionItems = [
    { value: "overview", num: "01", label: labels.tabsOverview, render: renderOverview },
    { value: "specifications", num: "02", label: labels.tabsSpecifications, render: renderSpecifications },
    { value: "materials", num: "03", label: labels.tabsMaterials, render: renderMaterials },
    { value: "delivery", num: "04", label: labels.tabsDeliveryWarranty, render: renderDelivery },
  ];

  return (
    <div className="w-full font-sans">
      <div className="hidden md:block">
        <Tabs defaultValue="overview" className="w-full">
          <div className="relative border-b border-slate-100 pb-px">
            <TabsList variant="line" className="flex w-full gap-4 lg:gap-6 xl:gap-8 bg-transparent p-0 justify-start xl:overflow-x-visible relative pb-0 select-none">
              {accordionItems.map(({ value, num, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  style={{ boxShadow: "none", outline: "none" }}
                  className="relative !bg-transparent p-0 pb-4 text-[10px] lg:text-[11px] xl:text-[12px] font-heading font-medium tracking-[0.12em] uppercase text-slate-400 border-b-2 border-transparent transition-all duration-300 rounded-none hover:text-slate-800 data-[state=active]:text-primary data-[state=active]:!border-b-primary data-[state=active]:!border-t-transparent data-[state=active]:!border-x-transparent data-[state=active]:font-semibold !shadow-none !h-auto cursor-pointer shrink-0 flex items-center gap-1.5 focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 after:hidden"
                >
                  <span className="text-[9px] font-mono text-slate-350">{num}.</span>
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {accordionItems.map(({ value, render }) => (
            <TabsContent key={value} value={value} className="pt-8 focus-visible:outline-none">
              {render()}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="block md:hidden space-y-3.5">
        {accordionItems.map(({ value, num, label, render }) => {
          const isOpen = activeAccordion === value;
          return (
            <div
              key={value}
              className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-[0_2px_12px_rgb(0,0,0,0.015)] transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setActiveAccordion(isOpen ? null : value)}
                className="w-full flex items-center justify-between p-5 text-left bg-slate-50/50 hover:bg-slate-50/85 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{num}.</span>
                  <span className={`text-xs font-heading font-bold tracking-[0.1em] uppercase transition-colors ${isOpen ? 'text-primary' : 'text-slate-650'}`}>
                    {label}
                  </span>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="p-5 border-t border-slate-100 bg-white animate-in fade-in slide-in-from-top-2 duration-200">
                  {render()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
