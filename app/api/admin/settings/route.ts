/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { encryptSecret, generateMaskedHint } from "@/lib/security/encryption";
import { env } from "@/lib/env/schema";
import { settingsSchema } from "@/lib/validations/admin";

// Helper to resolve media URLs to DB IDs
async function resolveMediaId(supabase: any, url: string | null): Promise<string | null> {
  if (!url) return null;
  const { data } = await supabase
    .from("media_assets")
    .select("id")
    .eq("public_url", url)
    .maybeSingle();
  return data?.id || null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get site settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select(`
      id,
      contact_phone,
      contact_email,
      quote_sender_email,
      logo_media_id,
      favicon_media_id,
      logo_media:media_assets!logo_media_id(public_url),
      favicon_media:media_assets!favicon_media_id(public_url),
      site_setting_translations (
        locale,
        brand_name,
        contact_address,
        seo_default_title,
        seo_default_description
      )
    `)
    .eq("singleton_key", "default")
    .maybeSingle();

  // Get integration secrets
  const { data: secrets } = await supabase
    .from("integration_secrets")
    .select("key_name, masked_hint");

  const secretsMap = new Map<string, string>();
  if (secrets) {
    secrets.forEach((s) => {
      secretsMap.set(s.key_name, s.masked_hint);
    });
  }

  // Get home page content sections
  const { data: homePage } = await supabase
    .from("content_pages")
    .select(`
      id,
      content_page_translations (
        locale,
        body_json
      )
    `)
    .eq("key", "home")
    .maybeSingle();

  const viHomeBody = homePage?.content_page_translations?.find((t: any) => t.locale === "vi")?.body_json || {};
  const enHomeBody = homePage?.content_page_translations?.find((t: any) => t.locale === "en")?.body_json || {};

  const viTrans: any = settings?.site_setting_translations?.find((t: any) => t.locale === "vi") || {};
  const enTrans: any = settings?.site_setting_translations?.find((t: any) => t.locale === "en") || {};
  const settingsAny = settings as any;

  return NextResponse.json({
    brandNameVi: viTrans.brand_name || "Showroom Nội Thất Phương Đông",
    brandNameEn: enTrans.brand_name || "Phuong Dong Interior Showroom",
    logoUrl: (Array.isArray(settingsAny?.logo_media) ? settingsAny.logo_media[0]?.public_url : settingsAny?.logo_media?.public_url) || "/logo-final.svg",
    faviconUrl: (Array.isArray(settingsAny?.favicon_media) ? settingsAny.favicon_media[0]?.public_url : settingsAny?.favicon_media?.public_url) || "/favicon.ico",
    contactPhone: settingsAny?.contact_phone || "08172 357 587",
    contactEmail: settingsAny?.contact_email || "contact@phuongdong.vn",
    quoteSenderEmail: settingsAny?.quote_sender_email || "quotes@example.test",
    addressVi: viTrans.contact_address || "124 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh",
    addressEn: enTrans.contact_address || "124 Nguyen Thi Thap, District 7, Ho Chi Minh City",
    defaultLocale: "vi",
    seoTitleVi: viTrans.seo_default_title || "Đồ Gỗ Nội Thất & Thiết Bị Vệ Sinh Phương Đông",
    seoTitleEn: enTrans.seo_default_title || "Phuong Dong - Premium Furniture & Sanitary Ware",
    seoDescVi: viTrans.seo_default_description || "Showroom Phương Đông chuyên cung cấp đồ gỗ nội thất tự nhiên cao cấp và thiết bị vệ sinh nhập khẩu chính hãng.",
    seoDescEn: enTrans.seo_default_description || "Phuong Dong Showroom specializes in premium solid natural wood furniture and genuine imported sanitary ware.",
    resendKey: secretsMap.get("resend_api_key") || "",
    geminiKey: secretsMap.get("gemini_api_key") || "",
    cloudinaryPreset: secretsMap.get("cloudinary_preset") || "phuongdong_unsigned_preset",
    slaHours: "24",

    // Home sections
    heroHeadlineVi: viHomeBody.heroHeadlineVi || "Không không gian tinh hoa nâng tầm sống",
    heroHeadlineEn: enHomeBody.heroHeadlineEn || "Exquisite spaces elevating your life",
    heroSubtitleVi: viHomeBody.heroSubtitleVi || "Showroom Phương Đông mang đến các giải pháp đồ gỗ óc chó cao cấp và thiết bị vệ sinh nhập khẩu tiêu chuẩn châu Âu cho ngôi nhà bạn.",
    heroSubtitleEn: enHomeBody.heroSubtitleEn || "Phuong Dong Showroom delivers high-end walnut furniture and European-standard sanitary fixtures to your home.",
    heroCtaLabel: viHomeBody.heroCtaLabel || "Khám phá ngay",
    heroCtaLink: viHomeBody.heroCtaLink || "/products",
    heroVisible: viHomeBody.heroVisible !== undefined ? viHomeBody.heroVisible : true,
    heroImage1: viHomeBody.heroImage1 || "/images/about-hero.jpg",
    aboutVisible: viHomeBody.aboutVisible !== undefined ? viHomeBody.aboutVisible : true,
    slide2TitleVi: viHomeBody.slide2TitleVi || "Nội thất cao cấp Phương Đông",
    slide2TitleEn: enHomeBody.slide2TitleEn || "Phuong Dong Premium Furniture",
    slide2LeadVi: viHomeBody.slide2LeadVi || "Kiến tạo tổ ấm sang trọng và tinh tế",
    slide2LeadEn: enHomeBody.slide2LeadEn || "Creating luxurious and elegant homes",
    slide2Image: viHomeBody.slide2Image || "/images/showroom.jpg",
    slide3TitleVi: viHomeBody.slide3TitleVi || "Không gian chuẩn mực châu Âu",
    slide3TitleEn: enHomeBody.slide3TitleEn || "European Standard Spaces",
    slide3LeadVi: viHomeBody.slide3LeadVi || "Vật liệu hoàn thiện cao cấp và bền vững",
    slide3LeadEn: enHomeBody.slide3LeadEn || "Premium and sustainable finishing materials",
    slide3Image: viHomeBody.slide3Image || "/images/room.jpg",
    aboutHeadingVi: viHomeBody.aboutHeadingVi || "Về chúng tôi",
    aboutHeadingEn: enHomeBody.aboutHeadingEn || "About Us",
    aboutLeadVi: viHomeBody.aboutLeadVi || "Hơn 20 năm đồng hành cùng tổ ấm Việt.",
    aboutLeadEn: enHomeBody.aboutLeadEn || "Over 20 years of crafting Vietnamese homes.",
    aboutImage: viHomeBody.aboutImage || "/images/about.jpg",
    featuredVisible: viHomeBody.featuredVisible !== undefined ? viHomeBody.featuredVisible : true,
    featuredMaxItems: viHomeBody.featuredMaxItems || "12",
    blogSectionVisible: viHomeBody.blogSectionVisible !== undefined ? viHomeBody.blogSectionVisible : true,
    blogMaxPosts: viHomeBody.blogMaxPosts || "3",
    blogHeadingVi: viHomeBody.blogHeadingVi || "Góc cảm hứng & Tin tức",
    blogHeadingEn: enHomeBody.blogHeadingEn || "Inspiration & News",
    trustBadgesVisible: viHomeBody.trustBadgesVisible !== undefined ? viHomeBody.trustBadgesVisible : true,
    badge1ValueVi: viHomeBody.badge1ValueVi || "20+",
    badge1ValueEn: enHomeBody.badge1ValueEn || "20+",
    badge1DescVi: viHomeBody.badge1DescVi || "Năm kinh nghiệm",
    badge1DescEn: enHomeBody.badge1DescEn || "Years of experience",
    badge2ValueVi: viHomeBody.badge2ValueVi || "5000+",
    badge2ValueEn: enHomeBody.badge2ValueEn || "5000+",
    badge2DescVi: viHomeBody.badge2DescVi || "Khách hàng hài lòng",
    badge2DescEn: enHomeBody.badge2DescEn || "Happy clients",
    showroomVisible: viHomeBody.showroomVisible !== undefined ? viHomeBody.showroomVisible : true,
    showroomHeadingVi: viHomeBody.showroomHeadingVi || "Hệ thống Showroom",
    showroomHeadingEn: enHomeBody.showroomHeadingEn || "Showroom Network",
    showroomLeadVi: viHomeBody.showroomLeadVi || "Trải nghiệm không gian thực tế tại các chi nhánh.",
    showroomLeadEn: enHomeBody.showroomLeadEn || "Experience actual setups at our branches.",
    showroomCtaVi: viHomeBody.showroomCtaVi || "Xem bản đồ",
    showroomCtaEn: enHomeBody.showroomCtaEn || "View Map",
    showroomBgImage: viHomeBody.showroomBgImage || "/images/showroom-bg.jpg",
    quoteVisible: viHomeBody.quoteVisible !== undefined ? viHomeBody.quoteVisible : true,
    quoteHeadingVi: viHomeBody.quoteHeadingVi || "Nhận tư vấn & Báo giá",
    quoteHeadingEn: enHomeBody.quoteHeadingEn || "Get Consultation & Quote",
    quoteLeadVi: viHomeBody.quoteLeadVi || "Để lại thông tin, đội ngũ chuyên gia của chúng tôi sẽ liên hệ trong 24 giờ.",
    quoteLeadEn: enHomeBody.quoteLeadEn || "Submit info and our experts will contact you within 24 hours.",
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json();
  const validationResult = settingsSchema.safeParse(rawBody);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Dữ liệu cấu hình không hợp lệ", details: validationResult.error.format() },
      { status: 400 }
    );
  }
  const body = validationResult.data;
  const supabase = createAdminClient();

  // Validate AI_SECRET_ENCRYPTION_KEY length
  const encryptionKey = env.AI_SECRET_ENCRYPTION_KEY || process.env.AI_SECRET_ENCRYPTION_KEY;
  if (!encryptionKey || (encryptionKey.length !== 32 && encryptionKey.length !== 64)) {
    return NextResponse.json({ error: "Server encryption key misconfigured" }, { status: 500 });
  }

  // 1. Get/Create default site_settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("id")
    .eq("singleton_key", "default")
    .maybeSingle();

  let logoMediaId: string | null = null;
  if (body.logoUrl) {
    logoMediaId = await resolveMediaId(supabase, body.logoUrl);
    if (!logoMediaId) {
      return NextResponse.json(
        { error: "Logo URL must refer to an existing uploaded media asset. Please upload the file first." },
        { status: 400 }
      );
    }
  }

  let faviconMediaId: string | null = null;
  if (body.faviconUrl) {
    faviconMediaId = await resolveMediaId(supabase, body.faviconUrl);
    if (!faviconMediaId) {
      return NextResponse.json(
        { error: "Favicon URL must refer to an existing uploaded media asset. Please upload the file first." },
        { status: 400 }
      );
    }
  }

  const settingsPayload = {
    singleton_key: "default",
    contact_phone: body.contactPhone,
    contact_email: body.contactEmail,
    quote_sender_email: body.quoteSenderEmail || "quotes@example.test",
    logo_media_id: logoMediaId,
    favicon_media_id: faviconMediaId,
    updated_by: user.id,
  };

  let settingsId = settings?.id;
  if (!settingsId) {
    const { data: newSettings, error: insertError } = await supabase
      .from("site_settings")
      .insert(settingsPayload)
      .select("id")
      .single();
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    settingsId = newSettings.id;
  } else {
    const { error: updateError } = await supabase
      .from("site_settings")
      .update(settingsPayload)
      .eq("id", settingsId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // 2. Upsert site_setting_translations
  const { error: viTransError } = await supabase
    .from("site_setting_translations")
    .upsert({
      site_settings_id: settingsId,
      locale: "vi",
      brand_name: body.brandNameVi,
      contact_address: body.addressVi,
      seo_default_title: body.seoTitleVi,
      seo_default_description: body.seoDescVi,
    }, { onConflict: "site_settings_id,locale" });

  if (viTransError) {
    return NextResponse.json({ error: viTransError.message }, { status: 500 });
  }

  const { error: enTransError } = await supabase
    .from("site_setting_translations")
    .upsert({
      site_settings_id: settingsId,
      locale: "en",
      brand_name: body.brandNameEn,
      contact_address: body.addressEn,
      seo_default_title: body.seoTitleEn,
      seo_default_description: body.seoDescEn,
    }, { onConflict: "site_settings_id,locale" });

  if (enTransError) {
    return NextResponse.json({ error: enTransError.message }, { status: 500 });
  }

  // 3. Upsert integration secrets
  const secretsToSave = [
    { key: "resend_api_key", value: body.resendKey },
    { key: "gemini_api_key", value: body.geminiKey },
    { key: "cloudinary_preset", value: body.cloudinaryPreset },
  ];

  for (const item of secretsToSave) {
    if (item.value && !item.value.startsWith("****")) {
      const encrypted = encryptSecret(item.value, encryptionKey);
      const hint = generateMaskedHint(item.value);
      const { error: secretError } = await supabase
        .from("integration_secrets")
        .upsert({
          key_name: item.key,
          encrypted_value: encrypted,
          masked_hint: hint,
          is_active: true,
          updated_by: user.id,
        }, { onConflict: "key_name" });
      if (secretError) {
        console.error(`Error saving integration secret ${item.key}:`, secretError);
      }
    }
  }

  // 4. Upsert content_page_translations for home sections
  let { data: homePage } = await supabase
    .from("content_pages")
    .select("id")
    .eq("key", "home")
    .maybeSingle();

  if (!homePage) {
    const { data: newPage } = await supabase
      .from("content_pages")
      .insert({ key: "home", status: "published" })
      .select("id")
      .single();
    homePage = newPage;
  }

  if (!homePage || !homePage.id) {
    return NextResponse.json({ error: "Failed to find or create home page" }, { status: 500 });
  }

  const viBodyJson = {
    heroHeadlineVi: body.heroHeadlineVi,
    heroSubtitleVi: body.heroSubtitleVi,
    heroCtaLabel: body.heroCtaLabel,
    heroCtaLink: body.heroCtaLink,
    heroVisible: body.heroVisible,
    heroImage1: body.heroImage1,
    slide2TitleVi: body.slide2TitleVi,
    slide2LeadVi: body.slide2LeadVi,
    slide2Image: body.slide2Image,
    slide3TitleVi: body.slide3TitleVi,
    slide3LeadVi: body.slide3LeadVi,
    slide3Image: body.slide3Image,
    aboutHeadingVi: body.aboutHeadingVi,
    aboutLeadVi: body.aboutLeadVi,
    aboutImage: body.aboutImage,
    aboutVisible: body.aboutVisible,
    featuredVisible: body.featuredVisible,
    featuredMaxItems: body.featuredMaxItems,
    blogSectionVisible: body.blogSectionVisible,
    blogMaxPosts: body.blogMaxPosts,
    blogHeadingVi: body.blogHeadingVi,
    trustBadgesVisible: body.trustBadgesVisible,
    badge1ValueVi: body.badge1ValueVi,
    badge1DescVi: body.badge1DescVi,
    badge2ValueVi: body.badge2ValueVi,
    badge2DescVi: body.badge2DescVi,
    showroomVisible: body.showroomVisible,
    showroomHeadingVi: body.showroomHeadingVi,
    showroomLeadVi: body.showroomLeadVi,
    showroomCtaVi: body.showroomCtaVi,
    showroomBgImage: body.showroomBgImage,
    quoteVisible: body.quoteVisible,
    quoteHeadingVi: body.quoteHeadingVi,
    quoteLeadVi: body.quoteLeadVi,
  };

  const enBodyJson = {
    heroHeadlineEn: body.heroHeadlineEn,
    heroSubtitleEn: body.heroSubtitleEn,
    heroVisible: body.heroVisible,
    heroImage1: body.heroImage1,
    slide2TitleEn: body.slide2TitleEn,
    slide2LeadEn: body.slide2LeadEn,
    slide2Image: body.slide2Image,
    slide3TitleEn: body.slide3TitleEn,
    slide3LeadEn: body.slide3LeadEn,
    slide3Image: body.slide3Image,
    aboutHeadingEn: body.aboutHeadingEn,
    aboutLeadEn: body.aboutLeadEn,
    aboutImage: body.aboutImage,
    aboutVisible: body.aboutVisible,
    featuredVisible: body.featuredVisible,
    featuredMaxItems: body.featuredMaxItems,
    blogSectionVisible: body.blogSectionVisible,
    blogMaxPosts: body.blogMaxPosts,
    blogHeadingEn: body.blogHeadingEn,
    trustBadgesVisible: body.trustBadgesVisible,
    badge1ValueEn: body.badge1ValueEn,
    badge1DescEn: body.badge1DescEn,
    badge2ValueEn: body.badge2ValueEn,
    badge2DescEn: body.badge2DescEn,
    showroomVisible: body.showroomVisible,
    showroomHeadingEn: body.showroomHeadingEn,
    showroomLeadEn: body.showroomLeadEn,
    showroomCtaEn: body.showroomCtaEn,
    showroomBgImage: body.showroomBgImage,
    quoteVisible: body.quoteVisible,
    quoteHeadingEn: body.quoteHeadingEn,
    quoteLeadEn: body.quoteLeadEn,
  };

  const { error: viHomeError } = await supabase
    .from("content_page_translations")
    .upsert({
      page_id: homePage.id,
      locale: "vi",
      slug: "trang-chu",
      title: body.brandNameVi || "Showroom Nội Thất Phương Đông",
      lead: body.seoDescVi || "",
      body_json: viBodyJson,
      seo_title: body.seoTitleVi || "",
      seo_description: body.seoDescVi || "",
    }, { onConflict: "page_id,locale" });

  if (viHomeError) {
    return NextResponse.json({ error: viHomeError.message }, { status: 500 });
  }

  const { error: enHomeError } = await supabase
    .from("content_page_translations")
    .upsert({
      page_id: homePage.id,
      locale: "en",
      slug: "home",
      title: body.brandNameEn || "Phuong Dong Interior Showroom",
      lead: body.seoDescEn || "",
      body_json: enBodyJson,
      seo_title: body.seoTitleEn || "",
      seo_description: body.seoDescEn || "",
    }, { onConflict: "page_id,locale" });

  if (enHomeError) {
    return NextResponse.json({ error: enHomeError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
