/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";

/**
* Fetch a content page (e.g. home, about) by key and locale, with automatic mock fallback.
*/
export async function getContentPage(
  supabase: SupabaseClient,
  key: string,
  locale: "vi" | "en" = "vi"
) {
  try {
    // BUG 2 — locale fallback: fetch all translations, prefer requested locale then vi.
    const { data, error } = await supabase
      .from("content_pages")
      .select(`
        id,
        key,
        status,
        published_at,
        content_page_translations (
          slug,
          title,
          lead,
          body_json,
          seo_title,
          seo_description,
          locale
        )
      `)
      .eq("key", key)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (!error && data) {
      const translations = Array.isArray(data.content_page_translations) ? data.content_page_translations : [];
      const translation =
        translations.find((t: any) => t.locale === locale) ||
        translations.find((t: any) => t.locale === "vi") ||
        translations[0];
      return {
        id: data.id,
        key: data.key,
        title: translation?.title || "",
        lead: translation?.lead || "",
        bodyJson: translation?.body_json || {},
        seoTitle: translation?.seo_title || "",
        seoDescription: translation?.seo_description || "",
      };
    }
    if (error) {
      console.warn("Error fetching content page, falling back to mock:", error);
    }
  } catch (e) {
    console.warn("Exception fetching content page, falling back to mock:", e);
  }

  return null;
}

export interface PublicSiteSettings {
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
}

/**
* Fetches dynamic site settings from site_settings and site_setting_translations,
* with fallback to mock defaults if not found.
*/
export async function getPublicSiteSettings(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
): Promise<PublicSiteSettings> {

  const defaults: PublicSiteSettings = {
    brandName: locale === "vi" ? "SHOWROOM NỘI THẤT PHƯƠNG ĐÔNG" : "PHUONG DONG INTERIOR SHOWROOM",
    logoUrl: "/logo-final.svg",
    faviconUrl: "/favicon.ico",
    contactPhone: "08172 357 587",
    contactEmail: "contact@phuongdong.vn",
    contactAddress: locale === "vi"
      ? "124 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh"
      : "124 Nguyen Thi Thap, District 7, Ho Chi Minh City",
    seoDefaultTitle: locale === "vi"
      ? "Đồ Gỗ Nội Thất & Thiết Bị Vệ Sinh Phương Đông"
      : "Phuong Dong - Premium Furniture & Sanitary Ware",
    seoDefaultDescription: locale === "vi"
      ? "Showroom Phương Đông chuyên cung cấp đồ gỗ nội thất tự nhiên cao cấp và thiết bị vệ sinh nhập khẩu chính hãng."
      : "Phuong Dong Showroom specializes in premium solid natural wood furniture and genuine imported sanitary ware.",
  };

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select(`
        id,
        contact_phone,
        contact_email,
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

    if (error || !data) {
      if (error) {
        console.warn("Error fetching site settings from DB, using defaults:", error);
      }
      return defaults;
    }

    // BUG 2 — locale fallback: prefer requested locale, then vi, then any translation,
    // rather than dropping the admin-configured settings and using hardcoded defaults.
    const allTranslations = Array.isArray(data.site_setting_translations) ? data.site_setting_translations : [];
    const translation =
      allTranslations.find((t: any) => t.locale === locale) ||
      allTranslations.find((t: any) => t.locale === "vi") ||
      allTranslations[0] ||
      {};
    return {
      brandName: translation.brand_name || defaults.brandName,
      logoUrl: (data.logo_media as any)?.public_url || defaults.logoUrl,
      faviconUrl: (data.favicon_media as any)?.public_url || defaults.faviconUrl,
      contactPhone: data.contact_phone || defaults.contactPhone,
      contactEmail: data.contact_email || defaults.contactEmail,
      contactAddress: translation.contact_address || defaults.contactAddress,
      seoDefaultTitle: translation.seo_default_title || defaults.seoDefaultTitle,
      seoDefaultDescription: translation.seo_default_description || defaults.seoDefaultDescription,
    };
  } catch (e) {
    console.warn("Exception fetching site settings, using defaults:", e);
    return defaults;
  }
}

export interface PublicSocialLink {
  platform: string;
  label: string;
  url: string;
  isEnabled: boolean;
}

/**
* Fetches enabled social links from DB, with fallback to defaults.
*/
export async function getPublicSocialLinks(
  supabase: SupabaseClient
): Promise<PublicSocialLink[]> {

  const defaults: PublicSocialLink[] = [
    { platform: "facebook", label: "Facebook", url: "https://facebook.com", isEnabled: true },
    { platform: "instagram", label: "Instagram", url: "https://instagram.com", isEnabled: true },
    { platform: "zalo", label: "Zalo", url: "https://zalo.me", isEnabled: true },
  ];

  try {
    const { data, error } = await supabase
      .from("social_links")
      .select("platform, label, url, is_enabled, sort_order")
      .eq("is_enabled", true)
      .order("sort_order");

    if (error || !data) {
      if (error) {
        console.warn("Error fetching social links from DB, using defaults:", error);
      }
      return defaults;
    }

    return data
      // Skip placeholder/seed links pointing at reserved example domains
      // (e.g. https://example.test/facebook) so they never render publicly.
      .filter((d: any) => d.url && !/(?:^|[/.@])example\.(test|com|net|org)\b/i.test(d.url))
      .map((d: any) => ({
        platform: d.platform,
        label: d.label || d.platform,
        url: d.url,
        isEnabled: d.is_enabled,
      }));
  } catch (e) {
    console.warn("Exception fetching social links, using defaults:", e);
    return defaults;
  }
}
 