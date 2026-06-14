import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { ArrowRight, BadgePercent, Calendar, CheckCircle, Clock } from "lucide-react";
import { imageAssets } from "@/lib/showroom-constants";
import { RemoteImage } from "@/components/showroom/remote-image";
import { QuoteForm } from "@/components/showroom/quote-form";
import { createClient } from "@/lib/supabase/server";
import { getPromotions } from "@/lib/supabase/queries";

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

export default async function PromotionsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("nav");
  const contact = await getTranslations("contact");
  const common = await getTranslations("common");

  const isVi = locale === "vi";

  const supabase = await createClient();
  const rawPromotions = await getPromotions(supabase, locale);

  const formatPrice = (price: number | string | null | undefined, isVn: boolean) => {
    if (!price) return "";
    const val = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(val)) return String(price);
    if (val < 10000) {
      return isVn ? `${val.toLocaleString("vi-VN")} VND / m²` : `$${val.toLocaleString("en-US")} / m²`;
    }
    if (val === 1500000 || val === 1200000) {
      return isVn ? `${val.toLocaleString("vi-VN")} VND / m²` : `$${(val / 25000).toLocaleString("en-US")} / m²`;
    }
    return isVn ? `${val.toLocaleString("vi-VN")} VND` : `$${(val / 25000).toLocaleString("en-US")}`;
  };

  const promoCombos = rawPromotions.map((p: {
    id: string;
    tag?: string;
    title: string;
    description?: string;
    coverImageUrl?: string;
    originalPrice?: number | string;
    comboPrice?: number | string;
    discount_percentage?: number;
    period?: string;
    items?: string[];
    color?: string;
    badgeColor?: string;
  }) => ({
    id: p.id,
    tag: p.tag || (isVi ? "Khuyến mãi" : "Promotion"),
    title: p.title,
    subtitle: p.description,
    image: p.coverImageUrl || imageAssets.sofa,
    originalPrice: formatPrice(p.originalPrice, isVi),
    promoPrice: formatPrice(p.comboPrice, isVi),
    discount: `${p.discount_percentage}%`,
    period: p.period,
    items: p.items || [],
    color: p.color,
    badgeColor: p.badgeColor,
  }));

  return (
    <main className="min-h-screen bg-surface-container-lowest pb-24 font-sans">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#211816] py-20 text-white lg:py-28 border-b border-outline-variant/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#b28a5b]/15 via-[#211816] to-[#211816]" />
        <div className="container-pd relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <BadgePercent className="size-4" />
            {isVi ? "Ưu đãi đặc quyền" : "Exclusive Campaigns"}
          </span>
          <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {isVi ? "Chương Trình Khuyến Mãi" : "Seasonal Promotions"}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/76">
            {isVi 
              ? "Trải nghiệm không gian sống thượng lưu với các chương trình ưu đãi đặc biệt dành cho combo sản phẩm nội thất gỗ óc chó cao cấp và thiết bị vệ sinh nhập khẩu Châu Âu."
              : "Experience refined living with our special promotional packages for premium walnut furniture suites and European-standard sanitary ware."}
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="#inquiry-section" className="button-pd">
              {isVi ? "Nhận báo giá ưu đãi" : "Get Promo Quote"}
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Promotions List Grid */}
      <section className="container-pd py-20">
        <div className="mb-12 text-center">
          <p className="label-pd">{isVi ? "Bộ sưu tập ưu đãi" : "Special Offers"}</p>
          <h2 className="type-section-title mt-2 text-primary">
            {isVi ? "Các Gói Combo Trọn Gói Tiêu Biểu" : "Featured Signature Combos"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-secondary">
            {isVi 
              ? "Được phối hợp tỉ mỉ bởi các nhà thiết kế và kiến trúc sư của Phương Đông để mang lại sự đồng bộ tối đa cho ngôi nhà của bạn."
              : "Meticulously coordinated by Phuong Dong designers and architects to bring maximum harmony to your home."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {promoCombos.map((promo: {
            id: string;
            tag: string;
            title: string;
            subtitle?: string;
            image: string;
            originalPrice: string;
            promoPrice: string;
            discount: string;
            period?: string;
            items: string[];
            color?: string;
            badgeColor?: string;
          }) => (
            <article 
              key={promo.id} 
              className={`flex flex-col overflow-hidden rounded-2xl border border-outline-variant/35 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/45`}
            >
              {/* Media Section with Discount Badge */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <RemoteImage 
                  src={promo.image} 
                  alt={promo.title} 
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className={`absolute top-4 left-4 rounded-md ${promo.badgeColor || "bg-[#b28a5b] text-white"} px-3 py-1 text-xs font-bold uppercase tracking-wider`}>
                  {promo.tag}
                </span>
                <span className="absolute top-4 right-4 flex items-center justify-center rounded-full bg-red-650 px-3 py-2 text-sm font-bold text-white shadow-md">
                  -{promo.discount}
                </span>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {promo.period}
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-heading text-xl font-bold text-primary transition-colors">
                  {promo.title}
                </h3>
                <p className="mt-2 text-sm text-secondary leading-relaxed">
                  {promo.subtitle}
                </p>

                {/* Included Items */}
                <div className="mt-6 flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-outline">
                    {isVi ? "Các sản phẩm đi kèm:" : "Included in this combo:"}
                  </h4>
                  <ul className="mt-3 space-y-2.5">
                    {promo.items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-secondary">
                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price and CTA */}
                <div className="mt-8 border-t border-outline-variant/30 pt-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="block text-xs text-outline line-through">
                        {promo.originalPrice}
                      </span>
                      <span className="mt-1 block text-2xl font-black text-red-650">
                        {promo.promoPrice}
                      </span>
                    </div>
                    <a 
                      href={`#inquiry-section`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-container transition-colors"
                    >
                      {isVi ? "Nhận ưu đãi" : "Inquire Now"}
                      <ArrowRight className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Campaign Highlights */}
      <section className="bg-[#211816] py-16 text-white border-y border-outline-variant/15">
        <div className="container-pd grid gap-10 md:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary">
              <Calendar className="size-3.5" />
              {isVi ? "Lưu ý thời gian" : "Limited Time"}
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {isVi 
                ? "Dịch Vụ Tư Vấn Thiết Kế Bàn Moodboard Độc Quyền"
                : "Exclusive Moodboard Consultation Service"}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/76">
              {isVi
                ? "Khi đăng ký bất kỳ combo ưu đãi nào trong tháng 6, quý khách sẽ nhận được gói khảo sát đo đạc thực tế tại công trình và thiết kế moodboard kết hợp vật liệu (gỗ, đá, thiết bị) trị giá 15.000.000 VND hoàn toàn miễn phí từ đội ngũ chuyên gia nội thất Phương Đông."
                : "By registering for any promotional packages in June, you will receive a complimentary professional on-site measurement survey and premium moodboard combination design (wood, stone, fixtures) valued at 15,000,000 VND."}
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
      <section id="inquiry-section" className="container-pd py-20">
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
