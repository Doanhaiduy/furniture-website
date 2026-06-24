/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { ArrowRight, BadgePercent, Calendar, CheckCircle, Clock, CalendarRange, Sparkles, HelpCircle } from "lucide-react";
import { imageAssets } from "@/lib/showroom-constants";
import { RemoteImage } from "@/components/showroom/remote-image";
import { QuoteForm } from "@/components/showroom/quote-form";
import { ProductCard } from "@/components/showroom/product-card";
import { createPublicClient } from "@/lib/supabase/server";
import { getPromotions, getProducts, getCategories, mapDBProductToPublicProduct } from "@/lib/supabase/queries";
import { PromotionCouponButton, PromotionQuickJump } from "@/components/showroom/promotion-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("promotionsTitle"),
    description: t("promotionsDescription"),
  };
}

const getCampaignColors = (code: string) => {
  switch (code) {
    case "SUMMER-SALE-2026":
      return {
        accent: "bg-[#b28a5b]", // Warm bronze/gold
        textAccent: "text-[#9a7344]",
        bgAccent: "bg-[#b28a5b]/5",
        borderColor: "border-[#b28a5b]/20",
        badge: "bg-[#b28a5b] text-white",
      };
    case "WELLNESS-BATH-SET":
      return {
        accent: "bg-[#4a6b6c]", // Soft sage/teal
        textAccent: "text-[#3f5d5e]",
        bgAccent: "bg-[#4a6b6c]/5",
        borderColor: "border-[#4a6b6c]/20",
        badge: "bg-[#4a6b6c] text-white",
      };
    case "FINISHING-TILES-DEAL":
      return {
        accent: "bg-[#8c7b75]", // Earthy stone grey/warm slate
        textAccent: "text-[#73635d]",
        bgAccent: "bg-[#8c7b75]/5",
        borderColor: "border-[#8c7b75]/20",
        badge: "bg-[#8c7b75] text-white",
      };
    default:
      return {
        accent: "bg-primary",
        textAccent: "text-primary",
        bgAccent: "bg-primary/5",
        borderColor: "border-primary/20",
        badge: "bg-primary text-white",
      };
  }
};

export default async function PromotionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ category?: string; product?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategoryId = resolvedSearchParams.category || "";
  const selectedProductId = resolvedSearchParams.product || "";

  const t = await getTranslations("nav");
  const contact = await getTranslations("contact");
  const common = await getTranslations("common");

  const isVi = locale === "vi";

  // Database Clients & Fetching
  const supabase = createPublicClient();
  const rawPromotions = await getPromotions(supabase, locale);

  const rawProducts = await getProducts(supabase, { locale, limit: 200 }).catch(() => []);
  const productsForQuote = rawProducts
    .filter((p: any) => p.slug)
    .map((p: any) => ({
      slug: p.slug as string,
      name: (typeof p.name === "object" && p.name ? (p.name[locale] || p.name.vi || p.name.en) : (p.name as string)) || p.slug,
      summary: (typeof p.summary === "object" && p.summary ? (p.summary[locale] || p.summary.vi) : p.summary) as string | undefined,
      category_slug: p.category_slug as string | null | undefined,
      category_name: (typeof p.category_name === "object" && p.category_name ? (p.category_name[locale] || p.category_name.vi) : p.category_name) as string | null | undefined,
    }));

  const dbCategories = await getCategories(supabase, locale).catch(() => []);
  const categoriesForQuote = dbCategories.map((c: any) => ({
    slug: c.slug as string,
    name: c.name as string,
  }));

  const formatPrice = (price: number | string | null | undefined, isVn: boolean) => {
    if (!price) return "";
    const val = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(val)) return String(price);
    if (val < 10000) {
      return isVn ? `${val.toLocaleString("vi-VN")} VND / m²` : `$${val.toLocaleString("en-US")} / m²`;
    }
    if (val === 1500000 || val === 1200000 || val === 1350000) {
      return isVn ? `${val.toLocaleString("vi-VN")} VND / m²` : `$${(val / 25005).toLocaleString("en-US")} / m²`;
    }
    return isVn ? `${val.toLocaleString("vi-VN")} VND` : `$${(val / 25000).toLocaleString("en-US")}`;
  };

  let mappings: any[] = [];
  try {
    const { data } = await supabase
      .from("product_promotions")
      .select("product_id, promotion_id");
    if (data) mappings = data;
  } catch (err) {
    console.warn("Failed to fetch product_promotions:", err);
  }

  const fallbackMappings = [
    // Sofa Walnut Heritage combo links
    { promotion_id: "11111111-1111-1111-1111-111111111111", product_id: "00000001-0000-0000-0000-000000000011" },
    { promotion_id: "11111111-1111-1111-1111-111111111111", product_id: "00000001-0000-0000-0000-000000000013" },
    { promotion_id: "11111111-1111-1111-1111-111111111111", product_id: "00000001-0000-0000-0000-000000000014" },
    // Wellness Bath Set links
    { promotion_id: "22222222-2222-2222-2222-222222222222", product_id: "00000001-0000-0000-0000-000000000021" },
    { promotion_id: "22222222-2222-2222-2222-222222222222", product_id: "00000001-0000-0000-0000-000000000024" },
    { promotion_id: "22222222-2222-2222-2222-222222222222", product_id: "00000001-0000-0000-0000-000000000054" },
    // Gói Gạch Ốp Lát Luxury links
    { promotion_id: "33333333-3333-3333-3333-333333333333", product_id: "00000001-0000-0000-0000-000000000031" },
    { promotion_id: "33333333-3333-3333-3333-333333333333", product_id: "00000001-0000-0000-0000-000000000032" },
  ];

  const activeMappings = (mappings && mappings.length > 0) ? mappings : fallbackMappings;

  // Date Formatting Helper
  const formatDateStr = (dateStr: string | null | undefined, loc: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    if (loc === "vi") {
      return `${day}/${month}/${year}`;
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getMonth()]} ${day}, ${year}`;
    }
  };

  // Campaign Status Calculator relative to current system date
  // Verified: using current system date instead of hardcoded 2026-06-19 date
  const now = new Date();

  const getCampaignStatus = (startStr: string | null | undefined, endStr: string | null | undefined) => {
    if (!startStr || !endStr) {
      return {
        status: "active",
        label: isVi ? "Đang diễn ra" : "Active",
        badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        timeLeft: isVi ? "Áp dụng theo dự án" : "Applied per project scope",
        percent: 50,
      };
    }
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    if (now < start) {
      const diffTime = start.getTime() - now.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        status: "upcoming",
        label: isVi ? "Sắp diễn ra" : "Upcoming",
        badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        timeLeft: isVi ? `Bắt đầu sau ${days} ngày` : `Starts in ${days} days`,
        percent: 0,
      };
    }
    
    if (now > end) {
      return {
        status: "expired",
        label: isVi ? "Đã kết thúc" : "Expired",
        badgeColor: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        timeLeft: isVi ? "Đã hết hạn" : "Ended",
        percent: 100,
      };
    }
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const percent = Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
    
    const diffTime = end.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (days <= 30) {
      return {
        status: "active",
        label: isVi ? "Sắp hết hạn" : "Ending Soon",
        badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse",
        timeLeft: isVi ? `Chỉ còn ${days} ngày!` : `Only ${days} days left!`,
        percent,
      };
    }
    
    return {
      status: "active",
      label: isVi ? "Đang diễn ra" : "Active",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      timeLeft: isVi ? `Còn lại ${days} ngày` : `${days} days left`,
      percent,
    };
  };

  const promoCombos = rawPromotions.map((p: any) => {
    const startStr = p.startAt;
    const endStr = p.endAt;
    const statusInfo = getCampaignStatus(startStr, endStr);

    // Get product IDs linked to this promotion
    const linkedProductIds = activeMappings
      .filter((m: any) => m.promotion_id === p.id)
      .map((m: any) => m.product_id);

    const discountPercentage = parseFloat(p.discount_percentage || "0");

    // Filter products and map them with dynamic individual product discounts
    const promoProducts = rawProducts
      .filter((prod: any) => linkedProductIds.includes(prod.id))
      .map((prod: any) => {
        const prodCopy = { ...prod };
        const priceMin = prodCopy.price_min ? parseFloat(prodCopy.price_min) : null;
        const priceMax = prodCopy.price_max ? parseFloat(prodCopy.price_max) : null;

        // Apply campaign discount percentage directly to individual product min/max prices
        if (priceMin && discountPercentage > 0) {
          prodCopy.promo_price_min = priceMin * (1 - discountPercentage / 100);
          prodCopy.promo_price_max = priceMax ? priceMax * (1 - discountPercentage / 100) : prodCopy.promo_price_min;
        }

        return mapDBProductToPublicProduct(prodCopy, locale);
      });

    // Find minimum discounted price among products in this campaign
    const productPromoPrices = promoProducts
      .map((p: any) => p.promoPriceMin)
      .filter((v: any) => v !== null && v > 0) as number[];
    const minPromoPrice = productPromoPrices.length > 0 ? Math.min(...productPromoPrices) : null;

    // Custom campaign privileges/perks instead of product names (since products are shown on the right)
    const meta = p.metadata_jsonb || {};
    let campaignPerks = isVi ? (meta.items_vi || []) : (meta.items_en || []);
    if (p.code === "SUMMER-SALE-2026") {
      campaignPerks = isVi
        ? [
            "Áp dụng giảm ngay 20% trên từng sản phẩm",
            "Miễn phí vận chuyển & lắp đặt hoàn thiện",
            "Bảo hành chất lượng gỗ óc chó tự nhiên 5 năm"
          ]
        : [
            "20% discount on individual purchases of walnut furniture items",
            "Free shipping & complete on-site installation",
            "5-year quality warranty on natural walnut wood"
          ];
    } else if (p.code === "WELLNESS-BATH-SET") {
      campaignPerks = isVi
        ? [
            "Áp dụng giảm ngay 15% trên từng thiết bị vệ sinh",
            "Tặng kèm gói khảo sát đường nước và tư vấn lắp đặt",
            "Cam kết chính hãng, bảo hành chuẩn nhà sản xuất"
          ]
        : [
            "15% discount on individual purchases of premium sanitary ware",
            "Complimentary plumbing survey and installation consulting",
            "Official manufacturer warranty guarantee"
          ];
    } else if (p.code === "FINISHING-TILES-DEAL") {
      campaignPerks = isVi
        ? [
            "Áp dụng giảm ngay 10% trên đơn giá mét vuông gạch",
            "Tặng thiết kế bản vẽ phối cảnh 3D không gian phòng tắm",
            "Vận chuyển tận nơi công trình, cam kết chống sứt vỡ"
          ]
        : [
            "10% direct discount on tile square meter unit price",
            "Complimentary 3D bathroom/living room visualization design",
            "On-site delivery with anti-breakage guarantee"
          ];
    }

    // Guess category mapping for quote request prefill
    let targetCategorySlug = "interior-consulting";
    if (p.code === "SUMMER-SALE-2026") {
      targetCategorySlug = "do-go-noi-that";
    } else if (p.code === "WELLNESS-BATH-SET") {
      targetCategorySlug = "thiet-bi-ve-sinh";
    } else if (p.code === "FINISHING-TILES-DEAL") {
      targetCategorySlug = "gach-op-lat";
    } else if (promoProducts.length > 0 && promoProducts[0]) {
      targetCategorySlug = promoProducts[0].category_slug || "interior-consulting";
    }

    return {
      id: p.id,
      code: p.code,
      tag: (() => {
        const rawTag = p.tag || (isVi ? "Khuyến mãi" : "Promotion");
        if (rawTag === "Combo Độc Quyền") return isVi ? "Chương Trình Ưu Đãi" : "Special Offer";
        if (rawTag === "Exclusive Package") return "Special Offer";
        if (rawTag === "Gói Sức Khỏe") return isVi ? "Chương Trình Sức Khỏe" : "Wellness Offer";
        if (rawTag === "Wellness Package") return "Wellness Offer";
        return rawTag;
      })(),
      title: p.title,
      subtitle: p.description,
      image: p.coverImageUrl || imageAssets.sofa,
      discount: `${discountPercentage}%`,
      startAt: startStr,
      endAt: endStr,
      startFormatted: formatDateStr(startStr, locale),
      endFormatted: formatDateStr(endStr, locale),
      statusInfo,
      items: campaignPerks,
      color: p.color,
      badgeColor: p.badgeColor,
      products: promoProducts,
      minPromoPrice,
      targetCategorySlug,
    };
  });

  const quickJumpCampaigns = promoCombos.map((pc: any) => ({
    id: pc.id,
    title: pc.title,
    tag: pc.tag,
    discount: pc.discount,
    statusLabel: pc.statusInfo.label,
    status: pc.statusInfo.status,
    badgeColor: pc.badgeColor,
    startAtStr: pc.startFormatted,
    endAtStr: pc.endFormatted,
  }));

  return (
    <main className="min-h-screen bg-surface-container-lowest pb-24 font-sans antialiased">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#211816] py-20 text-white lg:py-28 border-b border-outline-variant/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#b28a5b]/15 via-[#211816] to-[#211816]" />
        <div className="container-pd relative z-10 text-center">
          <span 
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm"
            style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
          >
            <BadgePercent className="size-4" />
            {isVi ? "Ưu đãi giới hạn" : "Limited Offers"}
          </span>
          <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {isVi ? "Chương Trình Khuyến Mãi" : "Seasonal Promotions"}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/76">
            {isVi 
              ? "Trải nghiệm không gian sống thượng lưu với các đợt ưu đãi đặc biệt áp dụng trực tiếp cho từng sản phẩm thuộc bộ sưu tập nội thất gỗ óc chó cao cấp và thiết bị vệ sinh nhập khẩu Châu Âu."
              : "Experience refined living with special seasonal discounts applied directly to individual purchases from our premium walnut furniture and European-standard sanitary collections."}
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="#inquiry-section" className="button-pd">
              {isVi ? "Đăng ký nhận ưu đãi" : "Claim Promo Offer"}
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Quick Jump Timeline Sub-Navigation */}
      {quickJumpCampaigns.length > 0 && (
        <PromotionQuickJump 
          campaigns={quickJumpCampaigns} 
          title={isVi ? "Các đợt khuyến mãi" : "Active Campaigns"}
          locale={locale}
        />
      )}

      {/* Promotions List Grid */}
      <section className="container-pd py-16">
        <div className="mb-16 text-center">
          <span className="label-pd">{isVi ? "Sản phẩm theo đợt" : "Campaign Items"}</span>
          <h2 className="type-section-title mt-2 text-primary">
            {isVi ? "Chi Tiết Sản Phẩm Ưu Đãi Theo Đợt" : "Campaign Products Details"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-secondary text-sm">
            {isVi 
              ? "Các sản phẩm được áp dụng mức giá ưu đãi đặc biệt khi mua lẻ trong thời gian giới hạn dưới sự bảo trợ chính hãng từ Phương Đông."
              : "Products applied under special promotional pricing for individual purchases for a limited duration, backed by Phuong Dong showroom."}
          </p>
        </div>

        <div className="space-y-28">
          {promoCombos.map((promo: any, idx: number) => {
            const isEven = idx % 2 === 0;
            const isExpired = promo.statusInfo.status === "expired";
            const minPromoPrice = promo.minPromoPrice;
            const colors = getCampaignColors(promo.code);
            return (
              <div 
                key={promo.id} 
                id={`campaign-${promo.id}`}
                className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-start border-b border-slate-100 pb-20 last:border-b-0 last:pb-0 scroll-mt-24"
              >
                {/* Campaign Info Card Column */}
                <div 
                  className={`flex flex-col justify-between p-8 md:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300 relative overflow-hidden group ${!isEven ? 'lg:order-2' : ''} ${isExpired ? 'opacity-85 filter grayscale-[20%]' : ''}`}
                >
                  {/* Elegant top accent line using campaign color */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${colors.accent}`} />

                  {/* Floating Discount Badge */}
                  <span 
                    className="absolute top-6 right-6 flex items-center justify-center rounded-full px-4 py-2.5 text-xs font-black shadow-md tracking-tight z-10"
                    style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                  >
                    {isVi ? `GIẢM ${promo.discount}` : `${promo.discount} OFF`}
                  </span>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full ${colors.badge} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider`}>
                        {promo.tag}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${promo.statusInfo.badgeColor}`}>
                        <span className={`size-1.5 rounded-full ${promo.statusInfo.status === 'active' ? 'bg-emerald-500 animate-pulse' : promo.statusInfo.status === 'upcoming' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                        {promo.statusInfo.label}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl sm:text-3xl font-black text-slate-800 leading-snug">
                      {promo.title}
                    </h3>

                    {/* Clarification banner that products can be bought separately */}
                    <div className={`${colors.bgAccent} border ${colors.borderColor} rounded-2xl p-4 text-xs text-slate-800 space-y-1.5 shadow-sm`}>
                      <div className={`flex items-center gap-1.5 font-bold ${colors.textAccent} uppercase tracking-wider text-[11px]`}>
                        <BadgePercent className="size-4 shrink-0" />
                        {isVi ? "Áp dụng cho từng sản phẩm" : "Applied to each product"}
                      </div>
                      <p className="leading-relaxed font-light opacity-90">
                        {isVi 
                          ? `Giảm ngay ${promo.discount} trên từng sản phẩm bên dưới.`
                          : `${promo.discount} discount on each product below.`}
                      </p>
                    </div>

                    <p className="text-secondary text-sm leading-relaxed font-light">
                      {promo.subtitle}
                    </p>

                    {/* Timeline Date Ranges & Progress Tracker */}
                    <div className="space-y-3.5 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-outline">
                        <span className="flex items-center gap-1">
                          <CalendarRange className="size-3.5 text-primary" />
                          {isVi ? "Thời gian diễn ra" : "Campaign Schedule"}
                        </span>
                        <span className="font-sans normal-case text-primary font-bold">
                          {promo.statusInfo.timeLeft}
                        </span>
                      </div>
                      
                      {/* Visual Start & End Date Labels */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                        <div>
                          <span className="block text-[10px] text-outline font-semibold uppercase">{isVi ? "Bắt đầu" : "Starts"}</span>
                          <span className="text-xs font-bold text-slate-700 block mt-0.5">{promo.startFormatted || "01/06/2026"}</span>
                        </div>
                        <div className="border-l border-slate-200">
                          <span className="block text-[10px] text-outline font-semibold uppercase">{isVi ? "Kết thúc" : "Ends"}</span>
                          <span className="text-xs font-bold text-slate-700 block mt-0.5">{promo.endFormatted || "31/08/2026"}</span>
                        </div>
                      </div>

                      {/* Horizontal progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-outline uppercase tracking-wider">
                          <span>{isVi ? "Tiến độ đợt khuyến mãi" : "Campaign Progress"}</span>
                          <span>{promo.statusInfo.percent}%</span>
                        </div>
                        <div className="w-full bg-slate-150 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${isExpired ? 'bg-slate-400' : 'bg-gradient-to-r from-primary to-amber-500'}`} 
                            style={{ width: `${promo.statusInfo.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* What is included details list */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-outline block">
                        {isVi ? "Đặc quyền mua sắm & Ưu đãi" : "Shopping Privileges & Policy"}
                      </span>
                      <ul className="space-y-2.5">
                        {promo.items.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-secondary">
                            <CheckCircle className="mt-0.5 size-4 text-emerald-600 shrink-0" />
                            <span className="font-light">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Copy Coupon Trigger */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-secondary">
                      {isVi ? "Mã chương trình:" : "Promo Code:"}
                    </span>
                    <PromotionCouponButton 
                      code={promo.code} 
                      copiedLabel={isVi ? "Đã chép!" : "Copied!"}
                      copyLabel={isVi ? "Chép mã" : "Copy Code"}
                    />
                  </div>

                  {/* Price info and Inquiry trigger */}
                  <div className="mt-8 border-t border-slate-100 pt-6 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-outline">
                        {isVi ? "Giá ưu đãi mua lẻ từng món" : "Promo price per item"}
                      </span>
                      {minPromoPrice ? (
                        <span className="mt-1 block text-2xl font-black text-red-600 tracking-tight">
                          {isVi ? "chỉ từ " : "from "}{formatPrice(minPromoPrice, isVi)}
                        </span>
                      ) : (
                        <span className="mt-1 block text-xl font-black text-slate-800 tracking-tight">
                          {isVi ? "Liên hệ báo giá lẻ" : "Contact for quote"}
                        </span>
                      )}
                    </div>
                    
                    {!isExpired ? (
                      <a 
                        href={`/${locale}/promotions?category=${promo.targetCategorySlug}#inquiry-section`}
                        className="button-pd text-xs font-bold cursor-pointer"
                      >
                        {isVi ? "Đăng ký nhận ưu đãi" : "Claim Offer"}
                        <ArrowRight className="size-3.5" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 rounded-lg px-3.5 py-2">
                        {isVi ? "Đã hết hạn" : "Ended"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mapped Products Column */}
                <div className={`${!isEven ? 'lg:order-1' : ''}`}>
                  <div className="space-y-4">
                    {/* Header informing user they can buy individually */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {isVi ? "Sản phẩm ưu đãi áp dụng lẻ" : "Eligible Promo Products"}
                      </h4>
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-0.5 animate-pulse">
                        {isVi ? "Áp dụng mua lẻ từng món" : "Available individually"}
                      </span>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 items-start">
                      {promo.products && promo.products.length > 0 ? (
                        promo.products.map((product: any) => (
                          <div key={product.slug} className="relative group/card">
                            <ProductCard
                               product={product}
                               locale={locale}
                               detailsLabel={common("explore")}
                               compact={true}
                            />
                            {/* Custom promotion discount display on card */}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-24 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                          <HelpCircle className="size-8 text-outline animate-pulse" />
                          <p className="text-sm text-secondary font-light">
                            {isVi ? "Không tìm thấy sản phẩm tương ứng trong đợt khuyến mãi này." : "No matching products found for this campaign."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Campaign Highlights */}
      <section className="bg-[#211816] py-16 text-white border-y border-outline-variant/15">
        <div className="container-pd grid gap-10 md:grid-cols-2 lg:items-center">
          <div>
            <span 
              className="inline-flex items-center gap-2 rounded px-3 py-1 text-xs font-bold tracking-wider shadow-sm"
              style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
            >
              <Sparkles className="size-3.5" />
              {isVi ? "Đặc quyền Phương Đông" : "Exclusive privileges"}
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {isVi 
                ? "Dịch Vụ Tư Vấn Thiết Kế Bàn Moodboard Độc Quyền"
                : "Exclusive Moodboard Consultation Service"}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/76">
              {isVi
                ? "Khi đăng ký nhận ưu đãi của bất kỳ sản phẩm nào trong tháng 6, quý khách sẽ nhận được gói khảo sát đo đạc thực tế tại công trình và thiết kế moodboard kết hợp vật liệu (gỗ, đá, thiết bị) trị giá 15.000.000 VND hoàn toàn miễn phí từ đội ngũ chuyên gia nội thất Phương Đông."
                : "By registering for any promotional offers in June, you will receive a complimentary professional on-site measurement survey and premium moodboard combination design (wood, stone, fixtures) valued at 15,000,000 VND."}
            </p>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#18110f]">
            <RemoteImage 
              src={imageAssets.showroom2} 
              alt="Showroom consulting" 
              className="h-full w-full object-cover opacity-75"
            />
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry-section" className="container-pd py-20 scroll-mt-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="type-section-title text-primary">
              {isVi ? "Nhận Báo Giá Khuyến Mãi Ngay" : "Claim Your Promotional Offer"}
            </h2>
            <p className="mt-3 text-secondary">
              {isVi
                ? "Điền thông tin của bạn vào biểu mẫu bên dưới, đội ngũ tư vấn của chúng tôi sẽ gọi lại ngay lập tức trong vòng 2h làm việc để hướng dẫn chi tiết ưu đãi."
                : "Submit your details below and our design specialists will reach out to you within 2 business hours with promotional guidance."}
            </p>
          </div>

          <QuoteForm
            locale={locale}
            sourcePath={`/${locale}/promotions`}
            productsForQuote={productsForQuote}
            categoriesForQuote={categoriesForQuote}
            categoryId={selectedCategoryId}
            productId={selectedProductId}
            labels={{
              formTitle: isVi ? "Thông Tin Đăng Ký Nhận Ưu Đãi" : "Registration Information",
              name: contact("name"),
              phone: contact("phone"),
              email: contact("email"),
              company: contact("company"),
              service: contact("service"),
              message: contact("message"),
              submit: isVi ? "Đăng ký nhận ưu đãi" : "Submit Promotion Request",
              sending: contact("sending"),
              responseTime: contact("responseTime"),
              honeypot: contact("honeypot"),
              submitError: contact("submitError"),
            }}
          />
        </div>
      </section>
    </main>
  );
}
