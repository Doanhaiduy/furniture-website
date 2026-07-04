"use client";

import { useState } from "react";
import { CheckCircle2, Download, Award, Sparkles, ChevronDown, Truck, ShieldCheck, Image as ImageIcon } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized } from "@/lib/showroom-data";
import { useToast } from "@/components/providers/toast-provider";
import { RemoteImage } from "@/components/showroom/remote-image";
import { ZoomableImage } from "@/components/ui/zoomable-image";
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

  // Highlights come straight from the database tags — no fabricated fallback copy.
  const displayTags = (product.tags || []).map((t) => String(t || "").trim()).filter(Boolean);
  // Gallery images (used to enrich the overview when there are no tags).
  const galleryImages = (product.gallery || []).filter(Boolean);

  const [activeAccordion, setActiveAccordion] = useState<string | null>("overview");

  const overviewHtml = localized(product.description, locale) || localized(product.summary, locale) || "";

  // Real product imagery pulled from the DB (primary media + gallery), used to
  // illustrate the Overview and Materials tabs. Clickable → full-screen lightbox.
  const hasRealPrimary = Boolean(product.image) && !product.image.includes("placeholder");
  const overviewImage = galleryImages[0] || (hasRealPrimary ? product.image : "");
  const materialImage = galleryImages[1] || galleryImages[0] || (hasRealPrimary ? product.image : "");
  const productName = localized(product.name, locale);

  const renderOverview = () => {
    const hasSideContent = Boolean(overviewImage) || displayTags.length > 0;
    return (
      <div className={`grid gap-10 items-start ${hasSideContent ? "lg:grid-cols-[1.15fr_0.85fr]" : "grid-cols-1"}`}>
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
            {overviewHtml ? (
              <div
                className="text-slate-600 leading-relaxed text-sm sm:text-base font-light text-justify prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: overviewHtml }}
              />
            ) : (
              <p className="text-slate-500 text-sm font-light italic">
                {isVi ? "Nội dung mô tả đang được cập nhật." : "Product description is being updated."}
              </p>
            )}
          </div>
        </div>

        {hasSideContent && (
          <div className="space-y-4">
            {overviewImage && (
              <figure className="space-y-2">
                <ZoomableImage
                  src={overviewImage}
                  alt={productName}
                  className="w-full rounded-2xl border border-slate-100 shadow-sm"
                >
                  <RemoteImage
                    src={overviewImage}
                    alt={productName}
                    className="aspect-[4/3] w-full object-cover"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </ZoomableImage>
                <figcaption className="flex items-center gap-1.5 text-[11px] font-light text-slate-400">
                  <ImageIcon className="size-3.5" />
                  {isVi ? "Nhấn vào ảnh để xem toàn màn hình" : "Click the image to view full screen"}
                </figcaption>
              </figure>
            )}

            {displayTags.length > 0 && (
              <div className="bg-slate-50/50 border border-slate-100/80 p-5 rounded-2xl space-y-3 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  {isVi ? "Đặc điểm nổi bật" : "Highlights"}
                </h3>
                <div className="grid gap-2">
                  {displayTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-b-0"
                    >
                      <CheckCircle2 className="size-4 text-primary shrink-0 opacity-80" />
                      <p className="text-xs sm:text-sm font-medium text-slate-700">{tag}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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

      {product.specs.length > 0 ? (
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
      ) : (
        <p className="text-slate-500 text-sm font-light border border-dashed border-slate-200 rounded-xl p-6 text-center">
          {isVi ? "Thông số kỹ thuật chi tiết đang được cập nhật." : "Detailed specifications are being updated."}
        </p>
      )}
    </div>
  );

  const renderMaterials = () => {
    const customMat = product.material ? localized(product.material, locale) : "";
    const specMat = product.specifications ? (isVi ? product.specifications.material_vi : product.specifications.material_en) : "";
    const specFinish = product.specifications ? (isVi ? product.specifications.finish_vi : product.specifications.finish_en) : "";
    // Real per-product care / craftsmanship note (from DB specifications), replacing
    // the previous generic hard-coded copy on the left column.
    const specCare = product.specifications ? (isVi ? product.specifications.care_vi : product.specifications.care_en) : "";

    const dbCards = [
      customMat && {
        badge: isVi ? "Hoàn thiện" : "Finishing",
        title: isVi ? "Chất liệu & Hoàn thiện" : "Material & Finish",
        text: customMat,
        wide: false,
      },
      specMat && {
        badge: isVi ? "Cốt vật liệu" : "Core Material",
        title: isVi ? "Vật liệu chế tác" : "Craftsmanship Material",
        text: specMat,
        wide: false,
      },
      specFinish && {
        badge: isVi ? "Kỹ thuật" : "Technical",
        title: isVi ? "Hoàn thiện bề mặt" : "Surface Coating",
        text: specFinish,
        wide: true,
      },
    ].filter(Boolean) as { badge: string; title: string; text: string; wide: boolean }[];

    return (
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
        {/* LEFT — real per-product content: material imagery + care/craftsmanship note */}
        <div className="space-y-5">
          <div className="space-y-1 hidden md:block">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
              03 / {labels.tabsMaterials}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-tight">
              {labels.materialsTitle}
            </h2>
          </div>

          {materialImage ? (
            <ZoomableImage
              src={materialImage}
              alt={productName}
              className="w-full rounded-2xl border border-slate-100 shadow-sm"
            >
              <RemoteImage
                src={materialImage}
                alt={productName}
                className="aspect-[4/3] w-full object-cover"
                sizes="(min-width: 1024px) 34vw, 100vw"
              />
            </ZoomableImage>
          ) : null}

          {specCare ? (
            <div className="bg-slate-900 text-white border border-slate-900 p-6 rounded-2xl flex gap-4 shadow-lg">
              <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary font-mono">
                  {isVi ? "Bảo quản & Chế tác" : "Care & Craftsmanship"}
                </p>
                <p className="text-xs leading-relaxed text-slate-300 font-light">{specCare}</p>
              </div>
            </div>
          ) : customMat ? (
            <p className="text-slate-500 leading-relaxed text-sm font-light border-l-2 border-primary/30 pl-4">
              {customMat}
            </p>
          ) : (
            <p className="text-slate-400 leading-relaxed text-sm font-light italic">
              {isVi
                ? "Thông tin chất liệu chi tiết đang được cập nhật cho sản phẩm này."
                : "Detailed material information is being updated for this product."}
            </p>
          )}
        </div>

        {/* RIGHT — material / finish specifics from the database */}
        <div className="grid gap-4 sm:grid-cols-2">
          {dbCards.length > 0 ? (
            dbCards.map((card, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border border-slate-100 bg-[#FAF9F6]/60 shadow-sm flex flex-col justify-between min-h-[190px] relative overflow-hidden group hover:border-primary/20 hover:shadow-md transition-all duration-300 ${card.wide ? "sm:col-span-2" : ""}`}
              >
                <span className="absolute top-4 right-4 bg-primary/5 text-primary border border-primary/20 font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded">
                  {card.badge}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Award className="size-4 text-primary shrink-0" />
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-light mt-3 leading-relaxed text-justify">{card.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-[#FAF9F6]/60 shadow-sm min-h-[190px] flex flex-col justify-center text-center sm:col-span-2">
              <Award className="size-6 text-primary/60 mx-auto mb-3" />
              <p className="text-sm text-slate-600 font-light leading-relaxed max-w-md mx-auto">
                {isVi
                  ? "Thông tin chi tiết về chất liệu và hoàn thiện của sản phẩm sẽ được tư vấn viên cung cấp theo từng dòng sản phẩm."
                  : "Detailed material and finish information is provided by our consultants for each product line."}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDelivery = () => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="border border-slate-100/80 p-6 rounded-2xl bg-white shadow-sm space-y-6 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[280px]">
        <div className="space-y-4">
          <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center">
            <Truck className="size-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-bold text-slate-800">
              {isVi ? "Giao hàng & lắp đặt toàn quốc" : "Nationwide Delivery & Installation"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">{labels.deliveryWarrantyLead}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-50">
            {[
              isVi ? "Giao hàng nhanh toàn quốc bằng xe chuyên dụng" : "Fast nationwide delivery via specialized vehicles",
              isVi ? "Lắp đặt & tinh chỉnh tại chỗ bởi kỹ thuật viên" : "On-site assembly & calibration by specialists",
              isVi ? "Thu hồi vỏ hộp & vệ sinh khu vực sau bàn giao" : "Post-assembly cleaning & packaging removal",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 opacity-70" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-405 leading-relaxed border-t border-slate-100 pt-3 mt-4">{labels.deliveryNote}</p>
      </div>

      <div className="border border-slate-100/80 p-6 rounded-2xl bg-white shadow-sm space-y-6 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[280px]">
        <div className="space-y-4">
          <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-bold text-slate-800">
              {isVi ? "Bảo hành chính hãng" : "Manufacturer Warranty"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              {isVi
                ? "Sản phẩm được bảo hành theo chính sách của nhà sản xuất, kèm hỗ trợ bảo trì và kiểm tra sau bàn giao."
                : "Products are covered under the manufacturer's warranty policy, with maintenance and post-handover inspection support."}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-50">
            {[
              isVi ? "Bảo hành theo chính sách nhà sản xuất" : "Coverage per manufacturer policy",
              isVi ? "Hỗ trợ bảo trì, kiểm tra chất lượng sau bàn giao" : "Maintenance & quality checks after handover",
              isVi ? "Tư vấn sửa chữa, bảo dưỡng khi cần" : "Repair & servicing guidance when needed",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 opacity-70" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-405 leading-relaxed border-t border-slate-100 pt-3 mt-4">{labels.warrantyNote}</p>
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
                  <span className={`text-xs font-heading font-bold tracking-[0.1em] uppercase transition-colors ${isOpen ? "text-primary" : "text-slate-650"}`}>
                    {label}
                  </span>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
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
