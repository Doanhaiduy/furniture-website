"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  ChevronRight,
  ChevronDown,
  Eye,
  Globe2,
  Heart,
  ImageUp,
  MapPin,
  Menu,
  Phone,
  Ruler,
  Share2,
  Store,
  X,
} from "lucide-react";


import {
  localized,
  productGroups,
  trustBadges,
} from "@/lib/showroom-data";
import {
  blogPosts,
  imageAssets,
  showrooms,
} from "@/tests/fixtures/showroom-data-fixture";
import viMessages from "@/messages/vi.json";
import { blogRichTextToHtml, normalizeBlogRichText } from "@/lib/blog-rich-text";
import { BlogRichTextRenderer, getBlogTocItems } from "@/components/showroom/blog-rich-text";
import { ArticleToc } from "@/components/showroom/article-toc";


import {
  type ContentKind,
  type EntityKind,
  settingsHomepageDefaults,
  settingsPreviewProducts,
  getPreviewLimit,
  type PreviewData,
} from "../admin-workflows";

export function DetailPreviewModal({
  kind,
  isOpen,
  onClose,
  data,
}: {
  kind: ContentKind | EntityKind;
  isOpen: boolean;
  onClose: () => void;
  data: PreviewData;
}) {
  const [locale, setLocale] = useState<"vi" | "en">("vi");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  const t = (vi: string | undefined, en: string | undefined) => locale === "vi" ? (vi || "") : (en || vi || "");
  const tBody = (vi: PreviewData["viBody"], en: PreviewData["enBody"]) => {
    const selected = locale === "vi" ? vi : (en || vi);
    return typeof selected === "string" ? selected : blogRichTextToHtml(selected);
  };

  const tabs = [
    { id: "overview", label: locale === "vi" ? "Mô tả chi tiết" : "Overview" },
    { id: "specs", label: locale === "vi" ? "Thông số kỹ thuật" : "Specifications" },
    { id: "materials", label: locale === "vi" ? "Chất liệu & Gia công" : "Materials" },
    { id: "care", label: locale === "vi" ? "Bảo quản & Kích thước" : "Dimensions & Care" },
  ];

  const renderMockHeader = () => {
    const brandName = locale === "vi" ? "Nội Thất Phương Đông" : "Phuong Dong Furniture";
    const tagline = locale === "vi" ? "ĐỒ GỖ NỘI THẤT & THIẾT BỊ VỆ SINH" : "PREMIUM FURNITURE & SANITARY";
    const navItems = [
      { label: locale === "vi" ? "Trang chủ" : "Home", active: false },
      { label: locale === "vi" ? "Sản phẩm" : "Products", active: kind === "product" || kind === "category" },
      { label: locale === "vi" ? "Showrooms" : "Showrooms", active: kind === "showroom" },
      { label: locale === "vi" ? "Tin tức" : "Blog", active: kind === "blog" },
      { label: locale === "vi" ? "Về chúng tôi" : "About Us", active: false },
      { label: locale === "vi" ? "Liên hệ" : "Contact", active: false },
    ];
    return (
      <header className="public-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 sm:h-20 items-center justify-between gap-6">
          <div className="flex shrink-0 flex-col">
            <span className="font-sans text-lg sm:text-xl font-bold leading-none text-[#1b3d35]">
              {brandName}
            </span>
            <span className="mt-1 text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {tagline}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5">
            {navItems.map((item, idx) => (
              <span
                key={idx}
                className={`text-xs sm:text-sm font-semibold cursor-default transition-colors relative py-1 ${
                  item.active ? "text-[#1b3d35] font-bold" : "text-slate-600 hover:text-[#1b3d35]"
                }`}
              >
                {item.label}
                {item.active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1b3d35]" />
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex rounded-md overflow-hidden border border-slate-200 p-0.5 bg-slate-100">
              <button
                type="button"
                onClick={() => setLocale("vi")}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                  locale === "vi" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                  locale === "en" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
            </div>
            <span className="inline-flex items-center gap-2 bg-[#1b3d35] text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-default">
              <Phone className="size-3" />
              {locale === "vi" ? "0912.345.678" : "+84 912 345 678"}
            </span>
          </div>
        </div>
        
        {/* Catalog Subnav Bar */}
        <div className="bg-[#1b3d35] text-white select-none hidden sm:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-10 items-center gap-4">
            <div className="inline-flex h-full items-center gap-1.5 px-4 bg-[#234c42] text-xs font-bold cursor-default">
              <Menu className="size-3.5" />
              {locale === "vi" ? "Danh mục sản phẩm" : "Product Catalog"}
              <ChevronDown className="size-3" />
            </div>
            <div className="flex items-center gap-5 overflow-x-auto text-[10px] sm:text-xs font-semibold text-white/90">
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Bàn ghế gỗ" : "Wooden Tables & Chairs"}</span>
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Tủ thờ, sập thờ" : "Altars & Worship Beds"}</span>
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Thiết bị vệ sinh" : "Sanitary Equipment"}</span>
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Gạch ốp lát" : "Wall & Floor Tiles"}</span>
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Gỗ xuất khẩu" : "Exported Woodwork"}</span>
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderMockFooter = () => {
    const brandName = locale === "vi" ? "Nội Thất Phương Đông" : "Phuong Dong Furniture";
    return (
      <footer className="bg-[#0b1614] text-slate-400 py-12 border-t border-slate-800 mt-16 shrink-0 w-full animate-fade-in">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-4 text-left">
          <div className="space-y-4">
            <h2 className="text-white font-bold text-base sm:text-lg">{brandName}</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              {locale === "vi"
                ? "Nội thất, thiết bị vệ sinh và gạch ốp lát cao cấp. Không gian chuẩn mực cho mọi ngôi nhà Việt."
                : "Premium furniture, sanitary ware and tiles for refined living spaces."}
            </p>
            <div className="flex gap-2">
              <span className="p-1.5 rounded bg-slate-800 text-white cursor-default">
                <Globe2 className="size-4" />
              </span>
              <span className="p-1.5 rounded bg-slate-800 text-white cursor-default">
                <Share2 className="size-4" />
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{locale === "vi" ? "Liên kết nhanh" : "Quick Links"}</h3>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Sản phẩm" : "Products"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Showrooms" : "Showrooms"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Tin tức" : "News & Blog"}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{locale === "vi" ? "Chính sách" : "Policies"}</h3>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Chính sách bảo mật" : "Privacy Policy"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Điều khoản dịch vụ" : "Terms of Service"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Chính sách vận chuyển" : "Delivery Policy"}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{locale === "vi" ? "Đăng ký nhận tin" : "Newsletter"}</h3>
            <p className="text-xs mb-3 text-slate-400">
              {locale === "vi"
                ? "Nhận thông tin cập nhật mới nhất về sản phẩm và ưu đãi."
                : "Subscribe to get our latest news and deals."}
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-l text-xs outline-none text-white w-full"
                readOnly
              />
              <button type="button" className="bg-[#1b3d35] text-white px-3 py-1.5 rounded-r text-xs font-bold">
                {locale === "vi" ? "Gửi" : "Send"}
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-900 text-xs text-center text-slate-500">
          © 2026 Showroom Nội Thất Phương Đông. All rights reserved.
        </div>
      </footer>
    );
  };

  const renderProductPreview = () => {
    const allImages = [
      ...(data.coverImage ? [data.coverImage] : []),
      ...(data.galleryImages || []),
    ];

    const specsList = [
      { label: locale === "vi" ? "Kích thước" : "Dimensions", value: t(data.dimensionsVi, data.dimensionsEn) },
      { label: locale === "vi" ? "Chất liệu chính" : "Core Material", value: t(data.specMaterialVi, data.specMaterialEn) },
      { label: locale === "vi" ? "Hoàn thiện" : "Finish", value: t(data.specFinishVi, data.specFinishEn) },
      { label: locale === "vi" ? "Bảo quản" : "Care Instructions", value: t(data.specCareVi, data.specCareEn) },
      ...(data.customAttributes?.map(attr => ({
        label: locale === "vi" ? attr.nameVi : attr.nameEn,
        value: locale === "vi" ? attr.valueVi : attr.valueEn
      })) || [])
    ].filter(item => item.value);

    const relatedProducts = [
      {
        nameVi: "Bàn trà nguyên khối Gõ Đỏ",
        nameEn: "Solid Afzelia Wood Coffee Table",
        priceVi: "Liên hệ báo giá",
        priceEn: "Contact for pricing",
        code: "PD-RT01",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80"
      },
      {
        nameVi: "Ghế sofa da hoàng gia Châu Âu",
        nameEn: "Royal European Leather Sofa",
        priceVi: "18.500.000₫",
        priceEn: "18,500,000₫",
        code: "PD-SF02",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"
      },
      {
        nameVi: "Tủ thờ gỗ Hương cao cấp",
        nameEn: "Premium Sandalwood Altar Cabinet",
        priceVi: "35.000.000₫",
        priceEn: "35,000,000₫",
        code: "PD-TH03",
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80"
      }
    ];

    return (
      <div className="space-y-0 text-left">
        {/* Breadcrumbs */}
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span>
            <ChevronRight className="size-3" />
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Sản phẩm" : "Products"}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">{t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || (locale === "vi" ? "Chi tiết sản phẩm" : "Product details")}</span>
          </div>
        </div>

        {/* Section 1: Main product detail container */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-inner flex items-center justify-center relative">
              {allImages[selectedImageIndex] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={allImages[selectedImageIndex]}
                  alt="Product view"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center justify-center">
                  <ImageUp className="size-16 stroke-[1.5]" />
                  <p className="text-xs mt-2 font-medium">{locale === "vi" ? "Chưa có ảnh sản phẩm" : "No product image uploaded"}</p>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`shrink-0 size-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedImageIndex ? "border-[#1b3d35] ring-2 ring-[#1b3d35]/25" : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${i+1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info Panel */}
          <div className="surface-panel rounded-xl border border-slate-100 bg-slate-50/50 p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1b3d35]">
                  {locale === "vi" ? "Sản phẩm độc quyền" : "Exclusive Collection"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 leading-tight">
                  {t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || (locale === "vi" ? "Tên sản phẩm" : "Product Name")}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                  {data.refCode || "PD-000"} · {data.category || (locale === "vi" ? "Chưa phân loại" : "Uncategorized")}
                </p>
              </div>

              {/* Price Panel */}
              <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/60 border border-amber-100 rounded-xl p-4.5">
                {data.quoteOnly ? (
                  <div className="space-y-1">
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">{locale === "vi" ? "Liên hệ báo giá" : "Contact for Quote"}</p>
                    {data.price ? (
                      <p className="text-xl font-extrabold text-[#1b3d35]">
                        {Number(data.price.replace(/[^0-9]/g, "")).toLocaleString("vi-VN")}₫
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">{locale === "vi" ? "Giá thương lượng theo kích thước và chất liệu gỗ" : "Negotiated price based on dimensions and wood types"}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">{locale === "vi" ? "Giá bán lẻ đề xuất" : "Suggested Retail Price"}</p>
                    <p className="text-2xl font-extrabold text-[#1b3d35]">
                      {data.price ? `${Number(data.price.replace(/[^0-9]/g, "")).toLocaleString("vi-VN")}₫` : (locale === "vi" ? "Chưa cập nhật giá" : "Price not updated")}
                    </p>
                  </div>
                )}
              </div>

              {/* Summary Description */}
              {(data.viSummary || data.enSummary) && (
                <p className="text-sm leading-relaxed text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm italic">
                  &quot;{t(data.viSummary, data.enSummary)}&quot;
                </p>
              )}

              {/* Quick Specs Grid */}
              {specsList.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {specsList.slice(0, 4).map((spec, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-3 rounded-lg flex gap-3 shadow-sm">
                      <Ruler className="size-5 text-[#1b3d35] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{spec.label}</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-8 space-y-3">
              <span className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#1b3d35] text-white rounded-xl font-bold text-sm shadow-md cursor-default">
                {locale === "vi" ? "Liên hệ ngay để nhận ưu đãi" : "Contact now for deals"}
                <ArrowRight className="size-4" />
              </span>
              <div className="grid gap-3 grid-cols-2">
                <span className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-default">
                  <Heart className="size-3.5 text-red-500 fill-red-500" />
                  {locale === "vi" ? "Đã lưu sản phẩm" : "Saved"}
                </span>
                <span className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-default">
                  <MapPin className="size-3.5 text-emerald-600" />
                  {locale === "vi" ? "Xem tại Showroom" : "View Showroom"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Tabs System */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-100">
          <div className="flex border-b border-slate-200 overflow-x-auto select-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#1b3d35] text-[#1b3d35] font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6 min-h-[160px]">
            {activeTab === "overview" && (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600">
            {tBody(data.viBody, data.enBody) ? (
              <div dangerouslySetInnerHTML={{ __html: tBody(data.viBody, data.enBody) }} />
                ) : (
                  <p className="italic text-slate-400">{locale === "vi" ? "Thông tin mô tả chi tiết sản phẩm đang được biên soạn..." : "Detailed product description is currently being compiled..."}</p>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 font-bold text-slate-600 w-1/3">{locale === "vi" ? "Thông số" : "Parameter"}</th>
                      <th className="p-4 font-bold text-slate-600">{locale === "vi" ? "Chi tiết giá trị" : "Details"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {specsList.map((spec, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-medium text-slate-500">{spec.label}</td>
                        <td className="p-4 font-semibold text-slate-700">{spec.value}</td>
                      </tr>
                    ))}
                    {specsList.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-8 text-center italic text-slate-400">
                          {locale === "vi" ? "Không có thông số kỹ thuật nào được nhập" : "No specifications have been entered"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "materials" && (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <h4 className="font-bold text-slate-800 text-base">{locale === "vi" ? "Quy chuẩn chất liệu gỗ" : "Wood Material Standards"}</h4>
                {t(data.materialsVi, data.materialsEn) ? (
                  <p>{t(data.materialsVi, data.materialsEn)}</p>
                ) : (
                  <p>
                    {locale === "vi"
                      ? "Sản phẩm được gia công từ 100% gỗ tự nhiên cao cấp đã qua quy trình tẩm sấy chống cong vênh mối mọt tiêu chuẩn xuất khẩu. Bề mặt sơn hoàn thiện phủ bóng bảo vệ vân gỗ tự nhiên sang trọng."
                      : "The product is crafted from 100% premium natural hardwood, treated through kiln-drying to prevent warping and woodworms under export standards. The finished surface is coated with protective lacquer highlighting natural luxury."}
                  </p>
                )}
              </div>
            )}

            {activeTab === "care" && (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <h4 className="font-bold text-slate-800 text-base">{locale === "vi" ? "Hướng dẫn bảo quản sản phẩm" : "Care Instructions"}</h4>
                {t(data.specCareVi, data.specCareEn) ? (
                  <p>{t(data.specCareVi, data.specCareEn)}</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>{locale === "vi" ? "Tránh đặt sản phẩm tiếp xúc trực tiếp dưới ánh nắng mặt trời." : "Avoid direct sunlight exposure on the product."}</li>
                    <li>{locale === "vi" ? "Không dùng hóa chất tẩy rửa mạnh để lau bề mặt gỗ." : "Do not use strong chemical cleansers on the wood surface."}</li>
                    <li>{locale === "vi" ? "Sử dụng khăn mềm ẩm để vệ sinh bụi bẩn định kỳ." : "Clean periodically with a soft damp cloth."}</li>
                    <li>{locale === "vi" ? "Đảm bảo độ ẩm phòng cân đối giúp giữ cấu trúc gỗ bền bỉ." : "Maintain balanced room humidity to prolong wood durability."}</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Contact Form Layout */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[#0b1614] text-white p-8 rounded-xl flex flex-col justify-center space-y-4">
            <span className="inline-block px-3 py-1 bg-[#1b3d35] text-xs font-bold rounded-full text-white w-fit uppercase tracking-wider">
              {locale === "vi" ? "Nhận báo giá riêng" : "Personalized Quote"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{locale === "vi" ? "Yêu cầu báo giá đặc biệt" : "Request a Special Quote"}</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {locale === "vi"
                ? "Quý khách vui lòng cung cấp thông tin liên hệ. Đội ngũ chuyên viên tư vấn thiết kế của Nội Thất Phương Đông sẽ liên hệ tư vấn kích thước phong thủy và gửi bảng báo giá cụ thể trong vòng 2 giờ làm việc."
                : "Please submit your contact details. Phuong Dong design experts will consult on feng-shui measurements and provide a customized quote within 2 business hours."}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase">{locale === "vi" ? "Họ và tên" : "Full Name"}</label>
                <input type="text" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs outline-none" readOnly placeholder={locale === "vi" ? "Nguyễn Văn A" : "John Doe"} />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase">{locale === "vi" ? "Số điện thoại" : "Phone Number"}</label>
                <input type="text" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs outline-none" readOnly placeholder="0901234567" />
              </div>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-bold uppercase">{locale === "vi" ? "Địa chỉ Email" : "Email Address"}</label>
              <input type="email" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs outline-none" readOnly placeholder="name@domain.com" />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-bold uppercase">{locale === "vi" ? "Nội dung lời nhắn" : "Message details"}</label>
              <textarea rows={3} className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs outline-none resize-none" readOnly defaultValue={locale === "vi" ? `Tôi muốn nhận báo giá sản phẩm ${t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || "này"}.` : `I am interested in getting a quote for ${t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || "this product"}.`} />
            </div>
            <button type="button" className="w-full py-2.5 bg-[#1b3d35] text-white font-bold text-xs rounded-lg hover:bg-[#15302a] transition-all">
              {locale === "vi" ? "Gửi thông tin yêu cầu" : "Submit Quote Request"}
            </button>
          </div>
        </section>

        {/* Section 4: Related products grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
          <h2 className="text-xl font-bold text-[#1b3d35] mb-6">{locale === "vi" ? "Sản phẩm liên quan" : "Related Products"}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedProducts.map((p, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="aspect-square bg-slate-50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.nameVi} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-4 space-y-1.5 text-left">
                  <span className="text-[9px] text-[#1b3d35] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">{p.code}</span>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{locale === "vi" ? p.nameVi : p.nameEn}</h3>
                  <p className="text-xs font-semibold text-amber-700">{locale === "vi" ? p.priceVi : p.priceEn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderCategoryPreview = () => {
    const mockCatProducts = [
      { nameVi: "Bàn ăn tròn xoay xoan đào", nameEn: "Round Cherry Wood Dining Table", priceVi: "24.000.000₫", priceEn: "24,000,000₫", img: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=300&q=80" },
      { nameVi: "Ghế gỗ sồi bọc nệm", nameEn: "Oak Dining Chair with Cushions", priceVi: "2.100.000₫", priceEn: "2,100,000₫", img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=300&q=80" },
      { nameVi: "Tủ rượu âm tường gỗ sồi", nameEn: "Built-in Oak Wine Cabinet", priceVi: "Liên hệ báo giá", priceEn: "Contact for pricing", img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80" },
    ];

    return (
      <div className="space-y-0 text-left">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span>
            <ChevronRight className="size-3" />
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Danh mục" : "Categories"}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">{t(data.nameVi, data.nameEn) || (locale === "vi" ? "Xem trước" : "Preview")}</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative h-64 overflow-hidden w-full">
          {data.coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.coverImage} alt="Category Banner" className="h-full w-full object-cover animate-fade-in" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1b3d35] to-[#2d5d51]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded">
                {locale === "vi" ? "Khám phá danh mục" : "Explore Category"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{t(data.nameVi, data.nameEn) || (locale === "vi" ? "Tên danh mục" : "Category Name")}</h1>
            </div>
          </div>
        </div>

        {/* Description & Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {(data.descriptionVi || data.descriptionEn) && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-sm text-slate-600 leading-relaxed shadow-sm">
              {t(data.descriptionVi, data.descriptionEn)}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{locale === "vi" ? "Sản phẩm trong danh mục" : "Products in this Category"}</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {mockCatProducts.map((p, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition">
                  <div className="aspect-square bg-slate-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt={p.nameVi} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div className="p-4 space-y-1.5 text-left">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{locale === "vi" ? p.nameVi : p.nameEn}</h3>
                    <p className="text-xs font-semibold text-amber-700">{locale === "vi" ? p.priceVi : p.priceEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShowroomPreview = () => {
    return (
      <div className="space-y-0 text-left">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span>
            <ChevronRight className="size-3" />
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Hệ thống Showroom" : "Showrooms"}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">{t(data.nameVi, data.nameEn) || (locale === "vi" ? "Xem trước" : "Preview")}</span>
          </div>
        </div>

        {/* Hero banner */}
        <div className="relative h-64 overflow-hidden w-full">
          {data.coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.coverImage} alt="Showroom Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1b3d35] to-[#234c42]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 py-8 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">{locale === "vi" ? "Cửa hàng Phương Đông" : "Showroom Branch"}</span>
              <h1 className="text-3xl font-extrabold text-white">{t(data.nameVi, data.nameEn) || (locale === "vi" ? "Tên Showroom" : "Showroom Name")}</h1>
            </div>
          </div>
        </div>

        {/* Detail cards and maps */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
                <Store className="size-4 text-[#1b3d35]" />
                {locale === "vi" ? "Địa chỉ cửa hàng" : "Showroom Address"}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t(data.addressVi, data.addressEn) || (locale === "vi" ? "Chưa cập nhật địa chỉ" : "Address not updated")}</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
                <CalendarClock className="size-4 text-emerald-600" />
                {locale === "vi" ? "Thời gian hoạt động" : "Opening Hours"}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t(data.hoursVi, data.hoursEn) || (locale === "vi" ? "Chưa cập nhật giờ mở cửa" : "Hours not updated")}</p>
            </div>

            {data.hotline && (
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3 shadow-sm">
                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
                  <Phone className="size-4 text-amber-600" />
                  {locale === "vi" ? "Đường dây nóng" : "Hotline Helpline"}
                </div>
                <p className="text-lg font-extrabold text-[#1b3d35]">{data.hotline}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden p-2 shadow-sm min-h-[300px] flex flex-col">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 text-xs font-bold text-slate-700 flex items-center gap-1.5 select-none">
              <Globe2 className="size-3.5 text-[#1b3d35]" />
              {locale === "vi" ? "Bản đồ vệ tinh" : "Google Maps Location"}
            </div>
            <div className="flex-1 w-full relative min-h-[260px] flex items-center justify-center bg-slate-50">
              {(() => {
                const getSafeMapUrl = (embedCode: string | undefined | null): string | null => {
                  if (!embedCode) return null;
                  let url = embedCode.trim();
                  if (url.startsWith("<iframe") || url.includes("<iframe")) {
                    const match = url.match(/src=["'](https:\/\/[^"']+)["']/i);
                    if (match && match[1]) {
                      url = match[1];
                    } else {
                      return null;
                    }
                  }
                  try {
                    const parsed = new URL(url);
                    if (
                      parsed.protocol === "https:" &&
                      (parsed.hostname === "www.google.com" || parsed.hostname === "maps.google.com") &&
                      parsed.pathname.includes("maps")
                    ) {
                      return url;
                    }
                  } catch (e) {
                    return null;
                  }
                  return null;
                };

                const safeUrl = getSafeMapUrl(data.mapsEmbed);
                if (safeUrl) {
                  return (
                    <iframe
                      src={safeUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={t(data.nameVi as string | undefined, data.nameEn as string | undefined) || "Showroom Map"}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  );
                }

                return (
                  <div className="text-center p-6 text-slate-400 space-y-2">
                    <MapPin className="size-10 mx-auto text-red-500 animate-bounce" />
                    <p className="text-xs font-bold">{locale === "vi" ? "Bản đồ không hợp lệ hoặc đang tải..." : "Invalid map or locating..."}</p>
                    <p className="text-[10px] text-slate-400 max-w-xs">{locale === "vi" ? "Nhập mã nhúng iFrame từ Google Maps để tải bản đồ thật." : "Enter iframe embed code from Google Maps to display actual maps."}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlogPreview = () => {
    const body = normalizeBlogRichText(
      locale === "vi" ? data.viBody : (data.enBody || data.viBody),
      locale,
    );
    const tocItems = getBlogTocItems(body);
    return (
      <div className="space-y-0 text-left">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span>
            <ChevronRight className="size-3" />
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Tin tức" : "News & Blog"}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">{t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || (locale === "vi" ? "Xem trước" : "Preview")}</span>
          </div>
        </div>

        {/* Article content */}
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex items-center gap-3 select-none">
            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase tracking-wider">
              {locale === "vi" ? "Cẩm nang nội thất" : "Interior Guide"}
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
            {t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || (locale === "vi" ? "Tiêu đề bài viết" : "Article Title")}
          </h1>

          {(data.viSummary || data.enSummary) && (
            <div className="border-l-4 border-rose-500 bg-rose-50/50 p-4 rounded-r-lg text-sm text-slate-600 font-medium italic">
              &quot;{t(data.viSummary, data.enSummary)}&quot;
            </div>
          )}

          <div className="public-image-panel overflow-hidden bg-slate-100">
            {data.coverImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={data.coverImage} alt={t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || "Blog cover"} className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[500px]" />
            ) : (
              <div className="flex h-[300px] w-full items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 text-slate-300 sm:h-[420px] lg:h-[500px]">
                <ImageUp className="size-16 stroke-[1.5]" />
              </div>
            )}
          </div>

          {tocItems.length > 0 && (
            <details className="surface-soft p-5 lg:hidden">
              <summary className="cursor-pointer font-heading text-lg font-semibold text-primary">
                {locale === "vi" ? "Mục lục" : "Table of contents"}
              </summary>
              <ArticleToc items={tocItems} title={locale === "vi" ? "Mục lục" : "Table of contents"} className="mt-5" />
            </details>
          )}

          <div className="grid gap-10 pt-4 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start lg:justify-center">
            <div className="prose prose-slate min-w-0 max-w-none text-sm leading-relaxed text-slate-600 sm:text-base">
            {body.content.length > 0 ? (
              <BlogRichTextRenderer document={body} className="text-base leading-8 text-secondary md:text-[1.05rem]" />
            ) : (
              <p className="italic text-slate-400">{locale === "vi" ? "Nội dung bài viết đang được soạn thảo..." : "Article body content is currently being drafted..."}</p>
            )}
            </div>
            {tocItems.length > 0 && (
              <aside className="hidden w-[320px] shrink-0 lg:sticky lg:top-24 lg:block lg:self-start">
                <div className="public-content-card p-5">
                  <ArticleToc items={tocItems} title={locale === "vi" ? "Mục lục" : "Table of contents"} />
                </div>
              </aside>
            )}
          </div>
        </article>
      </div>
    );
  };

  const renderContent = () => {
    switch (kind) {
      case "product": return renderProductPreview();
      case "category": return renderCategoryPreview();
      case "showroom": return renderShowroomPreview();
      case "blog": return renderBlogPreview();
      default: return <p className="p-6 text-sm text-slate-500">Chưa có chế độ xem trước cho loại nội dung này.</p>;
    }
  };

  const kindLabels: Record<string, { vi: string; en: string }> = {
    product: { vi: "Sản phẩm", en: "Sản phẩm" },
    category: { vi: "Danh mục", en: "Danh mục" },
    showroom: { vi: "Showroom", en: "Showroom" },
    blog: { vi: "Bài viết", en: "Bài viết" },
  };

  return createPortal(
    <div className="fixed inset-0 z-[calc(var(--z-modal)+2)]">
      <button
        type="button"
        aria-label="Đóng lớp phủ xem trước"
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 flex flex-col -translate-x-1/2 -translate-y-1/2 w-[98vw] max-w-[1440px] h-[94vh] max-h-[94vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1b3d35] text-white shrink-0 border-b border-[#234c42]">
          <div className="flex items-center gap-3">
            <Eye className="size-4 text-sky-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold tracking-wide">
              Chế độ xem trước trang công khai: {kindLabels[kind]?.[locale] || kind}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-emerald-300 font-bold bg-[#234c42] px-2.5 py-1 rounded border border-[#2d5d51] hidden sm:block">
              Đồng bộ CMS trực tiếp
            </p>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-white"
              aria-label="Đóng xem trước"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          {renderMockHeader()}
          {renderContent()}
          {renderMockFooter()}
        </div>
      </div>
    </div>,
    document.body
  );
}

// --- HOMEPAGE LIVE PREVIEW (for Settings) ---
export function HomepageLivePreview({
  testId,
  device,
  heroVisible, heroHeadlineVi, heroSubtitleVi, heroCtaLabel, heroImage1,
  heroCtaLink,
  slide2TitleVi, slide2LeadVi, slide2Image,
  slide3TitleVi, slide3LeadVi, slide3Image,
  aboutHeadingVi, aboutLeadVi, aboutImage,
  featuredVisible, featuredMaxItems,
  showroomVisible, showroomHeadingVi, showroomLeadVi, showroomCtaVi, showroomBgImage,
  quoteVisible, quoteHeadingVi, quoteLeadVi,
  blogSectionVisible, blogHeadingVi, blogMaxPosts,
  trustBadgesVisible, badge1ValueVi, badge1DescVi, badge2ValueVi, badge2DescVi,
  brandNameVi, contactPhone,
}: {
  testId?: string;
  device: "desktop" | "mobile";
  heroVisible: boolean;
  heroHeadlineVi: string;
  heroSubtitleVi: string;
  heroCtaLabel: string;
  heroCtaLink: string;
  heroImage1: string;
  slide2TitleVi: string;
  slide2LeadVi: string;
  slide2Image: string;
  slide3TitleVi: string;
  slide3LeadVi: string;
  slide3Image: string;
  aboutHeadingVi: string;
  aboutLeadVi: string;
  aboutImage: string;
  featuredVisible: boolean;
  featuredMaxItems: string;
  showroomVisible: boolean;
  showroomHeadingVi: string;
  showroomLeadVi: string;
  showroomCtaVi: string;
  showroomBgImage: string;
  quoteVisible: boolean;
  quoteHeadingVi: string;
  quoteLeadVi: string;
  blogSectionVisible: boolean;
  blogHeadingVi: string;
  blogMaxPosts: string;
  trustBadgesVisible: boolean;
  badge1ValueVi: string;
  badge1DescVi: string;
  badge2ValueVi: string;
  badge2DescVi: string;
  brandNameVi: string;
  contactPhone: string;
}) {
  const isMobile = device === "mobile";
  const containerClass = isMobile ? "mx-auto w-[360px] min-w-[360px] max-w-[360px]" : "w-full min-w-[720px]";
  const scale = isMobile ? "text-[11px]" : "text-xs";
  const featuredItems = settingsPreviewProducts.slice(
    0,
    getPreviewLimit(featuredMaxItems, Number(settingsHomepageDefaults.featuredMaxItems), settingsPreviewProducts.length)
  );
  const editorialPosts = blogPosts.slice(
    0,
    getPreviewLimit(blogMaxPosts, Number(settingsHomepageDefaults.blogMaxPosts), blogPosts.length)
  );
  const featuredGridClass = isMobile ? "grid-cols-2" : featuredItems.length >= 5 ? "grid-cols-5" : "grid-cols-4";
  const previewTrustBadges = [
    { value: badge1ValueVi || trustBadges[0].value, label: badge1DescVi || localized(trustBadges[0].label, "vi") },
    { value: badge2ValueVi || trustBadges[1].value, label: badge2DescVi || localized(trustBadges[1].label, "vi") },
    { value: trustBadges[2].value, label: localized(trustBadges[2].label, "vi") },
  ];
  const heroSlides = [
    { title: heroHeadlineVi || viMessages.home.heroTitle, lead: heroSubtitleVi || viMessages.home.heroLead, image: heroImage1 || imageAssets.aboutHero },
    { title: slide2TitleVi || viMessages.home.heroSlide2Title, lead: slide2LeadVi || viMessages.home.heroSlide2Lead, image: slide2Image || imageAssets.showroom },
    { title: slide3TitleVi || viMessages.home.heroSlide3Title, lead: slide3LeadVi || viMessages.home.heroSlide3Lead, image: slide3Image || imageAssets.room },
  ];

  // Mirrors the public shell in a compact frame without mounting route navigation logic.
  const renderHeader = () => (
    <header className="public-header sticky top-0 z-10 w-full shrink-0">
      <div className={`flex items-center justify-between gap-3 ${isMobile ? "h-14 px-4" : "h-16 px-5"}`}>
        <div className="flex min-w-0 flex-col">
          <span className={`${isMobile ? "max-w-[150px] text-sm" : "text-lg"} truncate font-heading font-bold leading-none text-primary`}>
            {brandNameVi || viMessages.common.brand}
          </span>
          <span className="mt-1 text-[7px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            {viMessages.common.tagline}
          </span>
        </div>
        {isMobile ? (
          <button type="button" className="btn-pd-icon size-9" aria-label={viMessages.nav.menu}>
            <Menu className="size-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-[10px] font-semibold text-secondary">
              <span>{viMessages.nav.products}</span>
              <span>{viMessages.nav.showrooms}</span>
              <span>{viMessages.nav.blog}</span>
            </div>
            <span className="button-pd min-h-8 px-3 py-1 text-[10px]">
              <Phone className="size-3" />
              {viMessages.nav.quote}
            </span>
          </div>
        )}
      </div>
      {!isMobile ? (
        <div className="public-catalog-bar">
          <div className="flex h-11 items-center gap-3 px-5">
            <span className="inline-flex h-full min-w-[170px] items-center gap-2 bg-primary-container/90 px-3 text-[10px] font-bold text-white">
              <Menu className="size-4" />
              {viMessages.nav.catalog}
            </span>
            {productGroups.map((group) => (
              <span key={group.key} className="rounded-[var(--radius-control)] px-2.5 py-1 text-[10px] font-bold text-white/86">
                {localized(group.title, "vi")}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );

  const renderFooter = () => (
    <footer className="public-footer w-full shrink-0 border-t border-white/10 p-4 text-[9px] text-white/62">
      <div className={`grid gap-4 text-left ${isMobile ? "grid-cols-1" : "grid-cols-[1.2fr_1fr_1fr]"}`}>
        <div className="space-y-1">
          <p className="font-heading text-sm font-bold text-white">{brandNameVi || viMessages.common.brand}</p>
          <p className="text-[8px] leading-normal text-white/58">{viMessages.meta.homeDescription}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-white">{viMessages.nav.products}</p>
          <p>{localized(productGroups[0].title, "vi")}</p>
          <p>{localized(productGroups[1].title, "vi")}</p>
        </div>
        {!isMobile ? (
          <div className="space-y-1">
            <p className="font-bold text-white">{viMessages.nav.showrooms}</p>
            <p>{localized(showrooms[0].name, "vi")}</p>
            <p>{contactPhone || showrooms[0].hotline}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-3 border-t border-white/10 pt-2 text-center text-[7px] text-white/40">
        © 2026 {brandNameVi || viMessages.common.brand}. All rights reserved.
      </div>
    </footer>
  );

  return (
    <div
      data-testid={testId}
      data-preview-device={device}
      className={`${containerClass} ${scale} bg-white rounded-xl border border-slate-200 shadow-inner overflow-hidden flex flex-col max-h-[85vh]`}
    >
      {renderHeader()}

      {/* Main Homepage content scroll viewport */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* 1. Hero Showcase */}
        {heroVisible && (
          <section
            data-preview-section="hero"
            data-primary-cta={heroCtaLabel}
            data-primary-cta-href={heroCtaLink}
            className="public-hero relative isolate overflow-hidden text-white"
          >
            <div className={`relative mx-auto overflow-hidden ${isMobile ? "h-[360px]" : "h-[440px]"}`}>
              {!isMobile && heroSlides.slice(1).map((slide, index) => (
                <div
                  key={slide.title}
                  className={`absolute top-1/2 hidden h-[72%] w-[28%] -translate-y-1/2 overflow-hidden rounded-[var(--radius-section)] opacity-55 md:block ${
                    index === 0 ? "-left-14" : "-right-14"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/45" />
                </div>
              ))}
              <div className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[var(--radius-section)] shadow-[0_24px_70px_rgba(38,49,45,0.2)] ${
                isMobile ? "h-[calc(100%-1.5rem)] w-[calc(100%-1rem)]" : "h-[calc(100%-2rem)] w-[min(88%,640px)]"
              }`}>
                {heroSlides[0].image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
                  <img data-preview-image="hero-primary" src={heroSlides[0].image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-white/20">
                    <Store className="size-16 stroke-[1]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/62 via-black/20 to-black/24" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/16" />
              </div>
              <div className="absolute inset-0 z-20 flex items-center justify-center px-5 pb-10 pt-12 text-center">
                <div className="mx-auto max-w-xl">
                  <p className="label-pd text-white/74">{viMessages.home.heroEyebrow}</p>
                  <h1 className={`mx-auto mt-3 max-w-[12ch] font-heading font-bold leading-none text-white ${isMobile ? "text-4xl" : "text-5xl"}`}>
                    {heroSlides[0].title}
                  </h1>
                  <p className={`mx-auto mt-4 max-w-md text-white/82 ${isMobile ? "text-[11px] leading-5" : "text-sm leading-6"}`}>
                    {heroSlides[0].lead}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {productGroups.slice(0, 2).map((group) => (
                      <span key={group.key} data-preview-hero-group className="public-hero-group-link min-h-8 px-3 py-1.5 text-[10px]">
                        {localized(group.title, "vi")}
                        <ChevronRight className="size-3" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. Bento Product Groups */}
        <section data-preview-section="product-groups" className="px-4 py-8">
          <div className={`mb-5 grid gap-3 text-left ${isMobile ? "" : "grid-cols-[0.8fr_1fr] items-end"}`}>
            <div>
              <p className="label-pd">{viMessages.common.tagline}</p>
              <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-primary">{viMessages.home.groupsTitle}</h2>
            </div>
            {!isMobile ? (
              <p className="text-[11px] leading-5 text-secondary">{viMessages.home.groupsLead}</p>
            ) : null}
          </div>
          <div className={`grid gap-2.5 ${isMobile ? "grid-cols-1" : "grid-cols-[1.2fr_0.8fr_0.8fr]"}`}>
            {productGroups.map((group) => (
              <div
                key={group.key}
                data-preview-card="product-group"
                className={`interactive-card public-image-panel relative min-h-36 ${!isMobile && group.key === "wood" ? "row-span-2 min-h-[300px]" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={group.image} alt={localized(group.title, "vi")} className="image-lift h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-0 p-4 text-left text-white">
                  <h3 className="font-heading text-lg font-bold leading-tight text-white">{localized(group.title, "vi")}</h3>
                  <p className="mt-1 text-[10px] leading-4 text-white/80">{localized(group.summary, "vi")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Featured Products */}
        {featuredVisible && (
          <section
            data-preview-section="featured-products"
            data-preview-available-products={settingsPreviewProducts.length}
            className="bg-surface-container-low px-4 py-8"
          >
            <div className="mb-4 flex justify-between gap-3">
              <div className="text-left">
                <p className="label-pd">{viMessages.common.tagline}</p>
                <h2 className="mt-2 font-heading text-xl font-bold leading-tight text-primary">{viMessages.home.featuredTitle}</h2>
                {!isMobile ? <p className="mt-2 max-w-md text-[11px] leading-5 text-secondary">{viMessages.home.featuredLead}</p> : null}
              </div>
              {!isMobile ? <span className="text-[10px] font-bold text-primary">{viMessages.common.viewAll}</span> : null}
            </div>
            <div className={`grid gap-3 ${featuredGridClass}`}>
              {featuredItems.map((product) => (
                <div key={product.slug} data-preview-card="featured-product" className="card-pd interactive-card overflow-hidden text-left">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={localized(product.name, "vi")} className="image-lift h-full w-full object-cover" />
                    <div className="reference-chip-pd absolute left-2 top-2 px-2 py-0.5 text-[7px]">{product.referenceCode}</div>
                  </div>
                  <div className="p-2.5">
                    <p className="label-pd text-[7px]">{localized(product.category, "vi")}</p>
                    <h3 className="mt-1 line-clamp-2 font-heading text-[11px] font-bold leading-tight text-primary">{localized(product.name, "vi")}</h3>
                    {!isMobile ? <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-secondary">{localized(product.summary, "vi")}</p> : null}
                    <p className="mt-2 truncate text-[10px] font-bold text-primary">{localized(product.price, "vi")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Blog & Trust Badges Section */}
        <section data-preview-section="editorial-trust" className={`grid gap-5 px-4 py-8 ${isMobile ? "grid-cols-1" : "grid-cols-[1.05fr_0.95fr]"}`}>
          {blogSectionVisible && (
            <div className="space-y-2 text-left">
              <p className="label-pd">{blogHeadingVi || viMessages.home.editorialTitle}</p>
              <h2 className="mb-4 font-heading text-xl font-bold leading-tight text-primary">{viMessages.home.editorialLead}</h2>
              <div className="space-y-2">
                {editorialPosts.map((post) => (
                  <div key={post.slug} data-preview-card="blog-post" className="card-pd interactive-card grid grid-cols-[86px_1fr] gap-3 overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.image} alt={localized(post.title, "vi")} className="h-full min-h-20 rounded-lg object-cover" />
                    <div className="min-w-0 py-1">
                      <p className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.12em] text-outline">
                        <BookOpen className="size-3" />
                        {localized(post.readTime, "vi")}
                      </p>
                      <h3 className="mt-2 line-clamp-2 font-heading text-[12px] font-bold leading-tight text-primary">{localized(post.title, "vi")}</h3>
                      <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-secondary">{localized(post.excerpt, "vi")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Badges */}
          {trustBadgesVisible && (
            <div className="surface-soft p-4 text-left">
              <p className="label-pd">{viMessages.home.trustTitle}</p>
              <h2 className="mt-2 font-heading text-xl font-bold leading-tight text-primary">{viMessages.home.trustLead}</h2>
              <div className={`mt-5 grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
                {previewTrustBadges.map((badge) => (
                  <div key={`${badge.value}-${badge.label}`} data-preview-card="trust-badge" className="surface-card p-4">
                    <BadgeCheck className="size-5 text-primary" />
                    <strong className="mt-3 block font-heading text-xl font-bold text-primary">{badge.value}</strong>
                    <p className="mt-1 text-[10px] leading-4 text-secondary">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 5. Showroom Section */}
        {showroomVisible && (
          <section data-preview-section="showroom" className={`relative isolate overflow-hidden bg-surface-inverse text-white ${isMobile ? "p-5" : "min-h-[360px] p-7"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-preview-image="showroom-background" src={showroomBgImage || imageAssets.showroom} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-inverse/92 via-surface-inverse/64 to-surface-inverse/24" />
            <div className={`relative z-10 grid gap-5 ${isMobile ? "grid-cols-1" : "grid-cols-[1fr_0.9fr] items-center"}`}>
              <div className="text-left">
                <p className="label-pd text-white/65">{viMessages.common.tagline}</p>
                <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-white">{showroomHeadingVi || viMessages.home.showroomTitle}</h2>
                <p className="mt-3 max-w-md text-[11px] leading-5 text-white/75">{showroomLeadVi || viMessages.home.showroomLead}</p>
                <div className="mt-5 space-y-4">
                  {showrooms.slice(0, 2).map((showroom) => (
                    <div key={showroom.code} className="border-l border-white/25 pl-4">
                      <h3 className="font-heading text-sm font-bold text-white">{localized(showroom.name, "vi")}</h3>
                      <p className="mt-1 flex gap-1.5 text-[10px] leading-4 text-white/75">
                        <MapPin className="mt-0.5 size-3 shrink-0" />
                        {localized(showroom.address, "vi")}
                      </p>
                      <p className="mt-1 flex gap-1.5 text-[10px] leading-4 text-white/75">
                        <Phone className="mt-0.5 size-3 shrink-0" />
                        {viMessages.home.hotlineLabel}: {showroom.hotline}
                      </p>
                    </div>
                  ))}
                </div>
                <span className="public-inverse-button mt-5 min-h-8 px-3 py-2 text-[10px]">{showroomCtaVi || viMessages.home.showroomCta}</span>
              </div>
              {!isMobile ? (
                <div className="public-glass-panel p-4 text-left">
                  <p className="label-pd text-white/60">{showroomCtaVi || viMessages.home.showroomCta}</p>
                  <p className="mt-3 font-heading text-2xl font-bold text-white">{localized(showrooms[0].name, "vi")}</p>
                  <p className="mt-2 flex gap-2 text-[11px] leading-5 text-white/72">
                    <MapPin className="mt-0.5 size-3 shrink-0" />
                    {localized(showrooms[0].address, "vi")}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* 6. Story Section */}
        <section data-preview-section="story" className={`grid gap-5 px-4 py-8 ${isMobile ? "grid-cols-1" : "grid-cols-[0.9fr_1.1fr] items-center"}`}>
                  <div className="surface-inverse relative min-h-64 overflow-hidden text-white">
            {aboutImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img data-preview-image="story" src={aboutImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary text-white/20">
                <Store className="size-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/72 to-primary/20" />
            <div className="absolute bottom-0 p-5 text-left">
              <p className="label-pd text-white/65">{viMessages.home.storyTitle}</p>
              <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-white">{slide3TitleVi || viMessages.home.heroSlide3Title}</h2>
            </div>
          </div>
          <div className="text-left">
            <p className="label-pd">{viMessages.home.storyTitle}</p>
            <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-primary">{aboutHeadingVi || viMessages.home.heroSlide3Title}</h2>
            <p className="mt-3 text-[11px] leading-5 text-secondary">{aboutLeadVi || viMessages.home.storyLead}</p>
          </div>
        </section>

        {/* 7. Quote Banner / Form */}
        {quoteVisible && (
          <section data-preview-section="quote" className="px-4 py-8">
            <div className="surface-soft mx-auto max-w-lg p-4 text-left">
              <p className="label-pd">{viMessages.nav.quote}</p>
              <h2 className="mt-2 font-heading text-xl font-bold leading-tight text-primary">{quoteHeadingVi || viMessages.home.quoteTitle}</h2>
              <p className="mt-2 text-[11px] leading-5 text-secondary">{quoteLeadVi || viMessages.home.quoteLead}</p>
              <div className="mt-4 grid gap-2">
                <div className="input-pd h-9 text-[10px] text-outline">{viMessages.contact.name}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="input-pd h-9 text-[10px] text-outline">{viMessages.contact.phone}</div>
                  <div className="input-pd h-9 text-[10px] text-outline">{viMessages.contact.email}</div>
                </div>
                <div className="input-pd h-16 text-[10px] text-outline">{viMessages.contact.message}</div>
                <span className="button-pd min-h-9 justify-center text-[10px]">{viMessages.contact.submit}</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {renderFooter()}
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
}

// --- IMAGE UPLOAD DROPZONE ---
