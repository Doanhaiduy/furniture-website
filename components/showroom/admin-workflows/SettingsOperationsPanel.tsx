"use client";

import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { useEffect, useId, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Globe2,
  LayoutDashboard,
  Loader2,
  Lock,
  Monitor,
  Search,
  Settings2,
  Share2,
  Smartphone,
  Sparkles,
  Store,
} from "lucide-react";
import { PremiumSelect } from "../premium-select";
import { VietnamAddressPicker } from "../vietnam-address-picker";




import {
  blogPosts,
} from "@/tests/fixtures/showroom-data-fixture";


import {
  type SettingsTab,
  settingsHomepageDefaults,
  settingsPreviewProducts,
  AdminField,
  ImageUploadDropzone,
  HomepageLivePreview,
  SectionVisibilityCard,
} from "../admin-workflows";

type SocialPlatform = "facebook" | "zalo" | "youtube" | "tiktok" | "instagram" | "other";
type SocialLinkState = { platform: SocialPlatform; label: string; url: string; isEnabled: boolean };

// About page timeline & stats (bilingual, editable as dynamic lists)
type AboutMilestone = { yearVi: string; yearEn: string; titleVi: string; titleEn: string; textVi: string; textEn: string };
type AboutStat = { valueVi: string; valueEn: string; labelVi: string; labelEn: string };
const EMPTY_MILESTONE: AboutMilestone = { yearVi: "", yearEn: "", titleVi: "", titleEn: "", textVi: "", textEn: "" };
const EMPTY_STAT: AboutStat = { valueVi: "", valueEn: "", labelVi: "", labelEn: "" };
// Loaded arrays may contain null fields (empty values are stored as null); coerce to "" for controlled inputs.
const normalizeMilestones = (arr: unknown): AboutMilestone[] =>
  Array.isArray(arr) ? arr.map((m: any) => ({ ...EMPTY_MILESTONE, yearVi: m?.yearVi ?? "", yearEn: m?.yearEn ?? "", titleVi: m?.titleVi ?? "", titleEn: m?.titleEn ?? "", textVi: m?.textVi ?? "", textEn: m?.textEn ?? "" })) : [];
const normalizeStats = (arr: unknown): AboutStat[] =>
  Array.isArray(arr) ? arr.map((s: any) => ({ ...EMPTY_STAT, valueVi: s?.valueVi ?? "", valueEn: s?.valueEn ?? "", labelVi: s?.labelVi ?? "", labelEn: s?.labelEn ?? "" })) : [];

// Fixed set of configurable public links. "other" is used for the general website URL.
const SOCIAL_PLATFORMS: { platform: SocialPlatform; label: string; placeholder: string }[] = [
  { platform: "facebook", label: "Facebook", placeholder: "https://facebook.com/tentrang" },
  { platform: "zalo", label: "Zalo", placeholder: "https://zalo.me/0908xxxxxx" },
  { platform: "youtube", label: "YouTube", placeholder: "https://youtube.com/@kenh" },
  { platform: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tentrang" },
  { platform: "instagram", label: "Instagram", placeholder: "https://instagram.com/tentrang" },
  { platform: "other", label: "Website / Liên kết khác", placeholder: "https://phuongdong.vn" },
];

const DEFAULT_SOCIAL_LINKS: SocialLinkState[] = SOCIAL_PLATFORMS.map((p) => ({
  platform: p.platform,
  label: p.label,
  url: "",
  isEnabled: true,
}));

export function SettingsOperationsPanel({ role }: { role?: string } = {}) {
  const { toast } = useToast();
  // Integration secrets (e.g. Gemini key) are admin-only. This is defense-in-depth on top of
  // the server guards (/admin/settings redirects editors; /api/admin/settings returns 401).
  const isAdmin = role !== "editor";
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTabRaw: SettingsTab = requestedTab === "contact" || requestedTab === "seo" || requestedTab === "integrations" || requestedTab === "sections"
    ? requestedTab
    : "identity";
  const initialTab: SettingsTab = initialTabRaw === "integrations" && !isAdmin ? "identity" : initialTabRaw;
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const desktopPreviewId = useId();
  const mobilePreviewId = useId();
  
  // Settings States
  const [brandNameVi, setBrandNameVi] = useState(settingsHomepageDefaults.brandNameVi);
  const [brandNameEn, setBrandNameEn] = useState(settingsHomepageDefaults.brandNameEn);
  const [logoUrl, setLogoUrl] = useState("https://phuongdong.vn/logo.png");
  const [faviconUrl, setFaviconUrl] = useState("https://phuongdong.vn/favicon.ico");
  
  const [contactPhone, setContactPhone] = useState("0908 247 688");
  const [contactEmail, setContactEmail] = useState("contact@phuongdong.vn");
  const [quoteSenderEmail, setQuoteSenderEmail] = useState("");
  const [addressVi, setAddressVi] = useState("124 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh");
  const [addressEn, setAddressEn] = useState("124 Nguyen Thi Thap, District 7, Ho Chi Minh City");
  const [contactProvinceCode, setContactProvinceCode] = useState("");
  const [contactProvinceName, setContactProvinceName] = useState("");
  const [contactWardCode, setContactWardCode] = useState("");
  const [contactWardName, setContactWardName] = useState("");
  const [contactStreet, setContactStreet] = useState("");
  const [defaultLocale, setDefaultLocale] = useState("vi");
  const [socialLinks, setSocialLinks] = useState<SocialLinkState[]>(DEFAULT_SOCIAL_LINKS);

  const updateSocialLink = (platform: SocialPlatform, patch: Partial<SocialLinkState>) => {
    setSocialLinks((prev) =>
      prev.map((link) => (link.platform === platform ? { ...link, ...patch } : link))
    );
    markDirty();
  };

  // Merge server-provided links over the fixed platform template so every row renders.
  const mergeSocialLinks = (incoming: unknown): SocialLinkState[] => {
    const list = Array.isArray(incoming) ? incoming : [];
    return DEFAULT_SOCIAL_LINKS.map((base) => {
      const found = list.find((l: any) => l?.platform === base.platform);
      return found
        ? {
            platform: base.platform,
            label: found.label || base.label,
            url: found.url || "",
            isEnabled: found.isEnabled !== false,
          }
        : base;
    });
  };

  const [seoTitleVi, setSeoTitleVi] = useState("Đồ Gỗ Nội Thất & Thiết Bị Vệ Sinh Phương Đông");
  const [seoTitleEn, setSeoTitleEn] = useState("Phuong Dong - Premium Furniture & Sanitary Ware");
  const [seoDescVi, setSeoDescVi] = useState("Showroom Phương Đông chuyên cung cấp đồ gỗ nội thất tự nhiên cao cấp và thiết bị vệ sinh nhập khẩu chính hãng.");
  const [seoDescEn, setSeoDescEn] = useState("Phuong Dong Showroom specializes in premium solid natural wood furniture and genuine imported sanitary ware.");

  const [brevoSmtpLogin, setBrevoSmtpLogin] = useState("");
  const [brevoSmtpKey, setBrevoSmtpKey] = useState("");
  const [cloudinaryPreset, setCloudinaryPreset] = useState("phuongdong_unsigned_preset");
  const [geminiKey, setGeminiKey] = useState("AIzaSy••••••••••••••••");
  const [slaHours, setSlaHours] = useState("24");
  const [verifyingGemini, setVerifyingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleVerifyGemini() {
    setVerifyingGemini(true);
    setGeminiStatus(null);
    try {
      const res = await fetch("/api/admin/settings/verify-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: geminiKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setGeminiStatus({ ok: true, message: data.message || "Khóa hợp lệ." });
        toast.success(data.message || "Khóa Gemini hợp lệ.");
      } else {
        setGeminiStatus({ ok: false, message: data.error || "Khóa không hợp lệ." });
        toast.error(data.error || "Khóa Gemini không hợp lệ.");
      }
    } catch {
      setGeminiStatus({ ok: false, message: "Lỗi kết nối khi kiểm tra khóa." });
      toast.error("Lỗi kết nối khi kiểm tra khóa Gemini.");
    } finally {
      setVerifyingGemini(false);
    }
  }

  // Site Sections State
  const [heroHeadlineVi, setHeroHeadlineVi] = useState(settingsHomepageDefaults.heroHeadlineVi);
  const [heroHeadlineEn, setHeroHeadlineEn] = useState(settingsHomepageDefaults.heroHeadlineEn);
  const [heroSubtitleVi, setHeroSubtitleVi] = useState(settingsHomepageDefaults.heroSubtitleVi);
  const [heroSubtitleEn, setHeroSubtitleEn] = useState(settingsHomepageDefaults.heroSubtitleEn);
  const [heroCtaLabel, setHeroCtaLabel] = useState(settingsHomepageDefaults.heroCtaLabel);
  const [heroCtaLink, setHeroCtaLink] = useState(settingsHomepageDefaults.heroCtaLink);
  const [heroVisible, setHeroVisible] = useState(true);
  const [heroImage1, setHeroImage1] = useState(settingsHomepageDefaults.heroImage1);
  const [aboutVisible, setAboutVisible] = useState(true);
  const [featuredVisible, setFeaturedVisible] = useState(true);
  const [featuredMaxItems, setFeaturedMaxItems] = useState(settingsHomepageDefaults.featuredMaxItems);
  const [blogSectionVisible, setBlogSectionVisible] = useState(true);
  const [blogMaxPosts, setBlogMaxPosts] = useState(settingsHomepageDefaults.blogMaxPosts);
  const [blogHeadingVi, setBlogHeadingVi] = useState(settingsHomepageDefaults.blogHeadingVi);
  const [blogHeadingEn, setBlogHeadingEn] = useState(settingsHomepageDefaults.blogHeadingEn);
  const [trustBadgesVisible, setTrustBadgesVisible] = useState(true);

  // Additional Homepage Section States (Issue 7)
  const [slide2TitleVi, setSlide2TitleVi] = useState(settingsHomepageDefaults.slide2TitleVi);
  const [slide2TitleEn, setSlide2TitleEn] = useState(settingsHomepageDefaults.slide2TitleEn);
  const [slide2LeadVi, setSlide2LeadVi] = useState(settingsHomepageDefaults.slide2LeadVi);
  const [slide2LeadEn, setSlide2LeadEn] = useState(settingsHomepageDefaults.slide2LeadEn);
  const [slide2Image, setSlide2Image] = useState(settingsHomepageDefaults.slide2Image);

  const [slide3TitleVi, setSlide3TitleVi] = useState(settingsHomepageDefaults.slide3TitleVi);
  const [slide3TitleEn, setSlide3TitleEn] = useState(settingsHomepageDefaults.slide3TitleEn);
  const [slide3LeadVi, setSlide3LeadVi] = useState(settingsHomepageDefaults.slide3LeadVi);
  const [slide3LeadEn, setSlide3LeadEn] = useState(settingsHomepageDefaults.slide3LeadEn);
  const [slide3Image, setSlide3Image] = useState(settingsHomepageDefaults.slide3Image);

  const [aboutHeadingVi, setAboutHeadingVi] = useState(settingsHomepageDefaults.aboutHeadingVi);
  const [aboutHeadingEn, setAboutHeadingEn] = useState(settingsHomepageDefaults.aboutHeadingEn);
  const [aboutLeadVi, setAboutLeadVi] = useState(settingsHomepageDefaults.aboutLeadVi);
  const [aboutLeadEn, setAboutLeadEn] = useState(settingsHomepageDefaults.aboutLeadEn);
  const [aboutImage, setAboutImage] = useState(settingsHomepageDefaults.aboutImage);
  const [aboutEyebrowVi, setAboutEyebrowVi] = useState(settingsHomepageDefaults.aboutEyebrowVi);
  const [aboutEyebrowEn, setAboutEyebrowEn] = useState(settingsHomepageDefaults.aboutEyebrowEn);
  const [aboutJourneyEyebrowVi, setAboutJourneyEyebrowVi] = useState(settingsHomepageDefaults.aboutJourneyEyebrowVi);
  const [aboutJourneyEyebrowEn, setAboutJourneyEyebrowEn] = useState(settingsHomepageDefaults.aboutJourneyEyebrowEn);
  const [aboutJourneyHeadingVi, setAboutJourneyHeadingVi] = useState(settingsHomepageDefaults.aboutJourneyHeadingVi);
  const [aboutJourneyHeadingEn, setAboutJourneyHeadingEn] = useState(settingsHomepageDefaults.aboutJourneyHeadingEn);
  const [aboutMilestones, setAboutMilestones] = useState<AboutMilestone[]>(settingsHomepageDefaults.aboutMilestones);
  const [aboutStats, setAboutStats] = useState<AboutStat[]>(settingsHomepageDefaults.aboutStats);

  const [badge1ValueVi, setBadge1ValueVi] = useState<string>(settingsHomepageDefaults.badge1ValueVi);
  const [badge1ValueEn, setBadge1ValueEn] = useState<string>(settingsHomepageDefaults.badge1ValueEn);
  const [badge1DescVi, setBadge1DescVi] = useState<string>(settingsHomepageDefaults.badge1DescVi);
  const [badge1DescEn, setBadge1DescEn] = useState<string>(settingsHomepageDefaults.badge1DescEn);

  const [badge2ValueVi, setBadge2ValueVi] = useState<string>(settingsHomepageDefaults.badge2ValueVi);
  const [badge2ValueEn, setBadge2ValueEn] = useState<string>(settingsHomepageDefaults.badge2ValueEn);
  const [badge2DescVi, setBadge2DescVi] = useState<string>(settingsHomepageDefaults.badge2DescVi);
  const [badge2DescEn, setBadge2DescEn] = useState<string>(settingsHomepageDefaults.badge2DescEn);

  // Showroom & Quote Section States
  const [showroomVisible, setShowroomVisible] = useState(true);
  const [showroomHeadingVi, setShowroomHeadingVi] = useState(settingsHomepageDefaults.showroomHeadingVi);
  const [showroomHeadingEn, setShowroomHeadingEn] = useState(settingsHomepageDefaults.showroomHeadingEn);
  const [showroomLeadVi, setShowroomLeadVi] = useState(settingsHomepageDefaults.showroomLeadVi);
  const [showroomLeadEn, setShowroomLeadEn] = useState(settingsHomepageDefaults.showroomLeadEn);
  const [showroomCtaVi, setShowroomCtaVi] = useState(settingsHomepageDefaults.showroomCtaVi);
  const [showroomCtaEn, setShowroomCtaEn] = useState(settingsHomepageDefaults.showroomCtaEn);
  const [showroomBgImage, setShowroomBgImage] = useState(settingsHomepageDefaults.showroomBgImage);

  const [quoteVisible, setQuoteVisible] = useState(true);
  const [quoteHeadingVi, setQuoteHeadingVi] = useState(settingsHomepageDefaults.quoteHeadingVi);
  const [quoteHeadingEn, setQuoteHeadingEn] = useState(settingsHomepageDefaults.quoteHeadingEn);
  const [quoteLeadVi, setQuoteLeadVi] = useState(settingsHomepageDefaults.quoteLeadVi);
  const [quoteLeadEn, setQuoteLeadEn] = useState(settingsHomepageDefaults.quoteLeadEn);

  // Track Unsaved Changes
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [clientReady, setClientReady] = useState(false);

  const markDirty = () => {
    setIsDirty(true);
    setSaveSuccess(false);
  };

  // Load from server settings API on mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setClientReady(true);
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) {
          throw new Error("Không thể tải cấu hình từ server");
        }
        const data = await res.json();
        if (data.brandNameVi !== undefined) setBrandNameVi(data.brandNameVi);
        if (data.brandNameEn !== undefined) setBrandNameEn(data.brandNameEn);
        if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        if (data.faviconUrl !== undefined) setFaviconUrl(data.faviconUrl);
        if (data.contactPhone !== undefined) setContactPhone(data.contactPhone);
        if (data.contactEmail !== undefined) setContactEmail(data.contactEmail);
        if (data.quoteSenderEmail !== undefined) setQuoteSenderEmail(data.quoteSenderEmail);
        if (data.addressVi !== undefined) setAddressVi(data.addressVi);
        if (data.addressEn !== undefined) setAddressEn(data.addressEn);
        setContactProvinceCode(data.contactProvinceCode || "");
        setContactProvinceName(data.contactProvinceName || "");
        setContactWardCode(data.contactWardCode || "");
        setContactWardName(data.contactWardName || "");
        // Fallback: seed street with the legacy composed address if no structured data yet.
        setContactStreet(data.contactStreet || (!data.contactProvinceCode ? (data.addressVi || "") : ""));
        if (data.defaultLocale !== undefined) setDefaultLocale(data.defaultLocale);
        if (data.seoTitleVi !== undefined) setSeoTitleVi(data.seoTitleVi);
        if (data.seoTitleEn !== undefined) setSeoTitleEn(data.seoTitleEn);
        if (data.seoDescVi !== undefined) setSeoDescVi(data.seoDescVi);
        if (data.seoDescEn !== undefined) setSeoDescEn(data.seoDescEn);
        if (data.brevoSmtpLogin !== undefined) setBrevoSmtpLogin(data.brevoSmtpLogin);
        if (data.brevoSmtpKey !== undefined) setBrevoSmtpKey(data.brevoSmtpKey);
        if (data.cloudinaryPreset !== undefined) setCloudinaryPreset(data.cloudinaryPreset);
        if (data.geminiKey !== undefined) setGeminiKey(data.geminiKey);
        if (data.slaHours !== undefined) setSlaHours(data.slaHours);
        if (data.heroHeadlineVi !== undefined) setHeroHeadlineVi(data.heroHeadlineVi);
        if (data.heroHeadlineEn !== undefined) setHeroHeadlineEn(data.heroHeadlineEn);
        if (data.heroSubtitleVi !== undefined) setHeroSubtitleVi(data.heroSubtitleVi);
        if (data.heroSubtitleEn !== undefined) setHeroSubtitleEn(data.heroSubtitleEn);
        if (data.heroCtaLabel !== undefined) setHeroCtaLabel(data.heroCtaLabel);
        if (data.heroCtaLink !== undefined) setHeroCtaLink(data.heroCtaLink);
        if (data.heroVisible !== undefined) setHeroVisible(data.heroVisible);
        if (data.heroImage1 !== undefined) setHeroImage1(data.heroImage1);
        if (data.aboutVisible !== undefined) setAboutVisible(data.aboutVisible);
        if (data.slide2TitleVi !== undefined) setSlide2TitleVi(data.slide2TitleVi);
        if (data.slide2TitleEn !== undefined) setSlide2TitleEn(data.slide2TitleEn);
        if (data.slide2LeadVi !== undefined) setSlide2LeadVi(data.slide2LeadVi);
        if (data.slide2LeadEn !== undefined) setSlide2LeadEn(data.slide2LeadEn);
        if (data.slide2Image !== undefined) setSlide2Image(data.slide2Image);
        if (data.slide3TitleVi !== undefined) setSlide3TitleVi(data.slide3TitleVi);
        if (data.slide3TitleEn !== undefined) setSlide3TitleEn(data.slide3TitleEn);
        if (data.slide3LeadVi !== undefined) setSlide3LeadVi(data.slide3LeadVi);
        if (data.slide3LeadEn !== undefined) setSlide3LeadEn(data.slide3LeadEn);
        if (data.slide3Image !== undefined) setSlide3Image(data.slide3Image);
        if (data.aboutHeadingVi !== undefined) setAboutHeadingVi(data.aboutHeadingVi);
        if (data.aboutHeadingEn !== undefined) setAboutHeadingEn(data.aboutHeadingEn);
        if (data.aboutLeadVi !== undefined) setAboutLeadVi(data.aboutLeadVi);
        if (data.aboutLeadEn !== undefined) setAboutLeadEn(data.aboutLeadEn);
        if (data.aboutImage !== undefined) setAboutImage(data.aboutImage);
        if (data.aboutEyebrowVi !== undefined) setAboutEyebrowVi(data.aboutEyebrowVi);
        if (data.aboutEyebrowEn !== undefined) setAboutEyebrowEn(data.aboutEyebrowEn);
        if (data.aboutJourneyEyebrowVi !== undefined) setAboutJourneyEyebrowVi(data.aboutJourneyEyebrowVi);
        if (data.aboutJourneyEyebrowEn !== undefined) setAboutJourneyEyebrowEn(data.aboutJourneyEyebrowEn);
        if (data.aboutJourneyHeadingVi !== undefined) setAboutJourneyHeadingVi(data.aboutJourneyHeadingVi);
        if (data.aboutJourneyHeadingEn !== undefined) setAboutJourneyHeadingEn(data.aboutJourneyHeadingEn);
        if (Array.isArray(data.aboutMilestones) && data.aboutMilestones.length > 0) setAboutMilestones(normalizeMilestones(data.aboutMilestones));
        if (Array.isArray(data.aboutStats) && data.aboutStats.length > 0) setAboutStats(normalizeStats(data.aboutStats));
        if (data.featuredVisible !== undefined) setFeaturedVisible(data.featuredVisible);
        if (data.featuredMaxItems !== undefined) setFeaturedMaxItems(data.featuredMaxItems);
        if (data.blogSectionVisible !== undefined) setBlogSectionVisible(data.blogSectionVisible);
        if (data.blogMaxPosts !== undefined) setBlogMaxPosts(data.blogMaxPosts);
        if (data.blogHeadingVi !== undefined) setBlogHeadingVi(data.blogHeadingVi);
        if (data.blogHeadingEn !== undefined) setBlogHeadingEn(data.blogHeadingEn);
        if (data.trustBadgesVisible !== undefined) setTrustBadgesVisible(data.trustBadgesVisible);
        if (data.badge1ValueVi !== undefined) setBadge1ValueVi(data.badge1ValueVi);
        if (data.badge1ValueEn !== undefined) setBadge1ValueEn(data.badge1ValueEn);
        if (data.badge1DescVi !== undefined) setBadge1DescVi(data.badge1DescVi);
        if (data.badge1DescEn !== undefined) setBadge1DescEn(data.badge1DescEn);
        if (data.badge2ValueVi !== undefined) setBadge2ValueVi(data.badge2ValueVi);
        if (data.badge2ValueEn !== undefined) setBadge2ValueEn(data.badge2ValueEn);
        if (data.badge2DescVi !== undefined) setBadge2DescVi(data.badge2DescVi);
        if (data.badge2DescEn !== undefined) setBadge2DescEn(data.badge2DescEn);
        
        if (data.showroomVisible !== undefined) setShowroomVisible(data.showroomVisible);
        if (data.showroomHeadingVi !== undefined) setShowroomHeadingVi(data.showroomHeadingVi);
        if (data.showroomHeadingEn !== undefined) setShowroomHeadingEn(data.showroomHeadingEn);
        if (data.showroomLeadVi !== undefined) setShowroomLeadVi(data.showroomLeadVi);
        if (data.showroomLeadEn !== undefined) setShowroomLeadEn(data.showroomLeadEn);
        if (data.showroomCtaVi !== undefined) setShowroomCtaVi(data.showroomCtaVi);
        if (data.showroomCtaEn !== undefined) setShowroomCtaEn(data.showroomCtaEn);
        if (data.showroomBgImage !== undefined) setShowroomBgImage(data.showroomBgImage);
        
        if (data.quoteVisible !== undefined) setQuoteVisible(data.quoteVisible);
        if (data.quoteHeadingVi !== undefined) setQuoteHeadingVi(data.quoteHeadingVi);
        if (data.quoteHeadingEn !== undefined) setQuoteHeadingEn(data.quoteHeadingEn);
        if (data.quoteLeadVi !== undefined) setQuoteLeadVi(data.quoteLeadVi);
        if (data.quoteLeadEn !== undefined) setQuoteLeadEn(data.quoteLeadEn);
        if (data.socialLinks !== undefined) setSocialLinks(mergeSocialLinks(data.socialLinks));
      } catch (e) {
        console.error("Lỗi khi tải cấu hình settings:", e);
      }
    };
    loadSettings();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = async () => {
    // Validate Email
    if (!contactEmail.includes("@") || !contactEmail.includes(".")) {
      setEmailError("Vui lòng nhập email liên hệ hợp lệ.");
      return;
    }
    setEmailError("");

    // Validate hotline/phone format (digits + optional + - ( ) space; 8–15 digits).
    // Mirrors the server-side settingsSchema so invalid hotlines can't be saved.
    const phoneDigits = contactPhone.replace(/\D/g, "");
    if (!/^[0-9+().\-\s]+$/.test(contactPhone.trim()) || phoneDigits.length < 8 || phoneDigits.length > 15) {
      setPhoneError("Số điện thoại không hợp lệ (chỉ gồm chữ số, có thể kèm + - ( ) và khoảng trắng; 8–15 chữ số).");
      return;
    }
    setPhoneError("");

    setIsSaving(true);
    try {
      const settingsData = {
        brandNameVi,
        brandNameEn,
        logoUrl,
        faviconUrl,
        contactPhone,
        contactEmail,
        quoteSenderEmail,
        addressVi,
        addressEn,
        contactProvinceCode,
        contactProvinceName,
        contactWardCode,
        contactWardName,
        contactStreet,
        defaultLocale,
        seoTitleVi,
        seoTitleEn,
        seoDescVi,
        seoDescEn,
        brevoSmtpLogin,
        brevoSmtpKey,
        cloudinaryPreset,
        geminiKey,
        slaHours,
        heroHeadlineVi,
        heroHeadlineEn,
        heroSubtitleVi,
        heroSubtitleEn,
        heroCtaLabel,
        heroCtaLink,
        heroVisible,
        heroImage1,
        aboutVisible,
        slide2TitleVi,
        slide2TitleEn,
        slide2LeadVi,
        slide2LeadEn,
        slide2Image,
        slide3TitleVi,
        slide3TitleEn,
        slide3LeadVi,
        slide3LeadEn,
        slide3Image,
        aboutHeadingVi,
        aboutHeadingEn,
        aboutLeadVi,
        aboutLeadEn,
        aboutImage,
        aboutEyebrowVi,
        aboutEyebrowEn,
        aboutJourneyEyebrowVi,
        aboutJourneyEyebrowEn,
        aboutJourneyHeadingVi,
        aboutJourneyHeadingEn,
        aboutMilestones,
        aboutStats,
        featuredVisible,
        featuredMaxItems,
        blogSectionVisible,
        blogMaxPosts,
        blogHeadingVi,
        blogHeadingEn,
        trustBadgesVisible,
        badge1ValueVi,
        badge1ValueEn,
        badge1DescVi,
        badge1DescEn,
        badge2ValueVi,
        badge2ValueEn,
        badge2DescVi,
        badge2DescEn,
        showroomVisible,
        showroomHeadingVi,
        showroomHeadingEn,
        showroomLeadVi,
        showroomLeadEn,
        showroomCtaVi,
        showroomCtaEn,
        showroomBgImage,
        quoteVisible,
        quoteHeadingVi,
        quoteHeadingEn,
        quoteLeadVi,
        quoteLeadEn,
        socialLinks,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });

      if (!res.ok) {
        throw new Error("Lỗi mạng khi cập nhật settings");
      }

      const resData = await res.json();
      if (resData.success) {
        setIsDirty(false);
        setSaveSuccess(true);
        // Tải lại settings để cập nhật các key đã được masked (ví dụ: ****5678)
        const getRes = await fetch("/api/admin/settings");
        if (getRes.ok) {
          const freshData = await getRes.json();
          if (freshData.brevoSmtpLogin !== undefined) setBrevoSmtpLogin(freshData.brevoSmtpLogin);
          if (freshData.brevoSmtpKey !== undefined) setBrevoSmtpKey(freshData.brevoSmtpKey);
          if (freshData.geminiKey !== undefined) setGeminiKey(freshData.geminiKey);
        }
      } else {
        toast.error("Lỗi lưu cấu hình: " + (resData.error || "Không rõ nguyên nhân"));
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi: " + (err instanceof Error ? err.message : err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        throw new Error("Không thể tải cấu hình");
      }
      const data = await res.json();
      setBrandNameVi(data.brandNameVi || settingsHomepageDefaults.brandNameVi);
      setBrandNameEn(data.brandNameEn || settingsHomepageDefaults.brandNameEn);
      setLogoUrl(data.logoUrl || "https://phuongdong.vn/logo.png");
      setFaviconUrl(data.faviconUrl || "https://phuongdong.vn/favicon.ico");
      setContactPhone(data.contactPhone || "0908 247 688");
      setContactEmail(data.contactEmail || "contact@phuongdong.vn");
      setQuoteSenderEmail(data.quoteSenderEmail || "");
      setAddressVi(data.addressVi || "124 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh");
      setAddressEn(data.addressEn || "124 Nguyen Thi Thap, District 7, Ho Chi Minh City");
      setContactProvinceCode(data.contactProvinceCode || "");
      setContactProvinceName(data.contactProvinceName || "");
      setContactWardCode(data.contactWardCode || "");
      setContactWardName(data.contactWardName || "");
      setContactStreet(data.contactStreet || (!data.contactProvinceCode ? (data.addressVi || "") : ""));
      setDefaultLocale(data.defaultLocale || "vi");
      setSeoTitleVi(data.seoTitleVi || "Đồ Gỗ Nội Thất & Thiết Bị Vệ Sinh Phương Đông");
      setSeoTitleEn(data.seoTitleEn || "Phuong Dong - Premium Furniture & Sanitary Ware");
      setSeoDescVi(data.seoDescVi || "Showroom Phương Đông chuyên cung cấp đồ gỗ nội thất tự nhiên cao cấp và thiết bị vệ sinh nhập khẩu chính hãng.");
      setSeoDescEn(data.seoDescEn || "Phuong Dong Showroom specializes in premium solid natural wood furniture and genuine imported sanitary ware.");
      setBrevoSmtpLogin(data.brevoSmtpLogin || "");
      setBrevoSmtpKey(data.brevoSmtpKey || "");
      setCloudinaryPreset(data.cloudinaryPreset || "phuongdong_unsigned_preset");
      setGeminiKey(data.geminiKey || "AIzaSy••••••••••••••••");
      setSlaHours(data.slaHours || "24");
      
      setHeroHeadlineVi(data.heroHeadlineVi || settingsHomepageDefaults.heroHeadlineVi);
      setHeroHeadlineEn(data.heroHeadlineEn || settingsHomepageDefaults.heroHeadlineEn);
      setHeroSubtitleVi(data.heroSubtitleVi || settingsHomepageDefaults.heroSubtitleVi);
      setHeroSubtitleEn(data.heroSubtitleEn || settingsHomepageDefaults.heroSubtitleEn);
      setHeroCtaLabel(data.heroCtaLabel || settingsHomepageDefaults.heroCtaLabel);
      setHeroCtaLink(data.heroCtaLink || settingsHomepageDefaults.heroCtaLink);
      setHeroVisible(data.heroVisible !== undefined ? data.heroVisible : true);
      setHeroImage1(data.heroImage1 || settingsHomepageDefaults.heroImage1);
      
      setAboutVisible(data.aboutVisible !== undefined ? data.aboutVisible : true);
      setSlide2TitleVi(data.slide2TitleVi || settingsHomepageDefaults.slide2TitleVi);
      setSlide2TitleEn(data.slide2TitleEn || settingsHomepageDefaults.slide2TitleEn);
      setSlide2LeadVi(data.slide2LeadVi || settingsHomepageDefaults.slide2LeadVi);
      setSlide2LeadEn(data.slide2LeadEn || settingsHomepageDefaults.slide2LeadEn);
      setSlide2Image(data.slide2Image || settingsHomepageDefaults.slide2Image);
      
      setSlide3TitleVi(data.slide3TitleVi || settingsHomepageDefaults.slide3TitleVi);
      setSlide3TitleEn(data.slide3TitleEn || settingsHomepageDefaults.slide3TitleEn);
      setSlide3LeadVi(data.slide3LeadVi || settingsHomepageDefaults.slide3LeadVi);
      setSlide3LeadEn(data.slide3LeadEn || settingsHomepageDefaults.slide3LeadEn);
      setSlide3Image(data.slide3Image || settingsHomepageDefaults.slide3Image);
      
      setAboutHeadingVi(data.aboutHeadingVi || settingsHomepageDefaults.aboutHeadingVi);
      setAboutHeadingEn(data.aboutHeadingEn || settingsHomepageDefaults.aboutHeadingEn);
      setAboutLeadVi(data.aboutLeadVi || settingsHomepageDefaults.aboutLeadVi);
      setAboutLeadEn(data.aboutLeadEn || settingsHomepageDefaults.aboutLeadEn);
      setAboutImage(data.aboutImage || settingsHomepageDefaults.aboutImage);
      setAboutEyebrowVi(data.aboutEyebrowVi || settingsHomepageDefaults.aboutEyebrowVi);
      setAboutEyebrowEn(data.aboutEyebrowEn || settingsHomepageDefaults.aboutEyebrowEn);
      setAboutJourneyEyebrowVi(data.aboutJourneyEyebrowVi || settingsHomepageDefaults.aboutJourneyEyebrowVi);
      setAboutJourneyEyebrowEn(data.aboutJourneyEyebrowEn || settingsHomepageDefaults.aboutJourneyEyebrowEn);
      setAboutJourneyHeadingVi(data.aboutJourneyHeadingVi || settingsHomepageDefaults.aboutJourneyHeadingVi);
      setAboutJourneyHeadingEn(data.aboutJourneyHeadingEn || settingsHomepageDefaults.aboutJourneyHeadingEn);
      setAboutMilestones(Array.isArray(data.aboutMilestones) && data.aboutMilestones.length > 0 ? normalizeMilestones(data.aboutMilestones) : settingsHomepageDefaults.aboutMilestones);
      setAboutStats(Array.isArray(data.aboutStats) && data.aboutStats.length > 0 ? normalizeStats(data.aboutStats) : settingsHomepageDefaults.aboutStats);

      setFeaturedVisible(data.featuredVisible !== undefined ? data.featuredVisible : true);
      setFeaturedMaxItems(data.featuredMaxItems || settingsHomepageDefaults.featuredMaxItems);
      setBlogSectionVisible(data.blogSectionVisible !== undefined ? data.blogSectionVisible : true);
      setBlogMaxPosts(data.blogMaxPosts || settingsHomepageDefaults.blogMaxPosts);
      setBlogHeadingVi(data.blogHeadingVi || settingsHomepageDefaults.blogHeadingVi);
      setBlogHeadingEn(data.blogHeadingEn || settingsHomepageDefaults.blogHeadingEn);
      
      setTrustBadgesVisible(data.trustBadgesVisible !== undefined ? data.trustBadgesVisible : true);
      setBadge1ValueVi(data.badge1ValueVi || settingsHomepageDefaults.badge1ValueVi);
      setBadge1ValueEn(data.badge1ValueEn || settingsHomepageDefaults.badge1ValueEn);
      setBadge1DescVi(data.badge1DescVi || settingsHomepageDefaults.badge1DescVi);
      setBadge1DescEn(data.badge1DescEn || settingsHomepageDefaults.badge1DescEn);
      setBadge2ValueVi(data.badge2ValueVi || settingsHomepageDefaults.badge2ValueVi);
      setBadge2ValueEn(data.badge2ValueEn || settingsHomepageDefaults.badge2ValueEn);
      setBadge2DescVi(data.badge2DescVi || settingsHomepageDefaults.badge2DescVi);
      setBadge2DescEn(data.badge2DescEn || settingsHomepageDefaults.badge2DescEn);
      
      setShowroomVisible(data.showroomVisible !== undefined ? data.showroomVisible : true);
      setShowroomHeadingVi(data.showroomHeadingVi || settingsHomepageDefaults.showroomHeadingVi);
      setShowroomHeadingEn(data.showroomHeadingEn || settingsHomepageDefaults.showroomHeadingEn);
      setShowroomLeadVi(data.showroomLeadVi || settingsHomepageDefaults.showroomLeadVi);
      setShowroomLeadEn(data.showroomLeadEn || settingsHomepageDefaults.showroomLeadEn);
      setShowroomCtaVi(data.showroomCtaVi || settingsHomepageDefaults.showroomCtaVi);
      setShowroomCtaEn(data.showroomCtaEn || settingsHomepageDefaults.showroomCtaEn);
      setShowroomBgImage(data.showroomBgImage || settingsHomepageDefaults.showroomBgImage);
      
      setQuoteVisible(data.quoteVisible !== undefined ? data.quoteVisible : true);
      setQuoteHeadingVi(data.quoteHeadingVi || settingsHomepageDefaults.quoteHeadingVi);
      setQuoteHeadingEn(data.quoteHeadingEn || settingsHomepageDefaults.quoteHeadingEn);
      setQuoteLeadVi(data.quoteLeadVi || settingsHomepageDefaults.quoteLeadVi);
      setQuoteLeadEn(data.quoteLeadEn || settingsHomepageDefaults.quoteLeadEn);
      setSocialLinks(mergeSocialLinks(data.socialLinks));

      setIsDirty(false);
      setEmailError("");
      setSaveSuccess(false);
    } catch (err) {
      toast.error("Không thể hủy thay đổi: " + (err instanceof Error ? err.message : err));
    } finally {
      setIsSaving(false);
    }
  };

  const homepagePreviewProps = {
    heroVisible,
    heroHeadlineVi,
    heroSubtitleVi,
    heroCtaLabel,
    heroCtaLink,
    heroImage1,
    slide2TitleVi,
    slide2LeadVi,
    slide2Image,
    slide3TitleVi,
    slide3LeadVi,
    slide3Image,
    aboutHeadingVi,
    aboutHeadingEn,
    aboutLeadVi,
    aboutLeadEn,
    aboutImage,
    aboutEyebrowVi,
    aboutEyebrowEn,
    aboutJourneyEyebrowVi,
    aboutJourneyEyebrowEn,
    aboutJourneyHeadingVi,
    aboutJourneyHeadingEn,
    aboutMilestones,
    aboutStats,
    featuredVisible,
    featuredMaxItems,
    showroomVisible,
    showroomHeadingVi,
    showroomLeadVi,
    showroomCtaVi,
    showroomBgImage,
    quoteVisible,
    quoteHeadingVi,
    quoteLeadVi,
    blogSectionVisible,
    blogHeadingVi,
    blogMaxPosts,
    trustBadgesVisible,
    badge1ValueVi,
    badge1DescVi,
    badge2ValueVi,
    badge2DescVi,
    brandNameVi,
    contactPhone,
  };
  const renderLegacySectionDetails = false;
  const renderHomepagePreview = false;

  // --- About page timeline (milestones) list handlers ---
  const updateMilestone = (idx: number, key: keyof AboutMilestone, val: string) => {
    setAboutMilestones((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: val } : m)));
    markDirty();
  };
  const addMilestone = () => { setAboutMilestones((prev) => [...prev, { ...EMPTY_MILESTONE }]); markDirty(); };
  const removeMilestone = (idx: number) => { setAboutMilestones((prev) => prev.filter((_, i) => i !== idx)); markDirty(); };
  const moveMilestone = (idx: number, dir: -1 | 1) => {
    setAboutMilestones((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    markDirty();
  };

  // --- About/home stats list handlers ---
  const updateStat = (idx: number, key: keyof AboutStat, val: string) => {
    setAboutStats((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s)));
    markDirty();
  };
  const addStat = () => { setAboutStats((prev) => [...prev, { ...EMPTY_STAT }]); markDirty(); };
  const removeStat = (idx: number) => { setAboutStats((prev) => prev.filter((_, i) => i !== idx)); markDirty(); };
  const moveStat = (idx: number, dir: -1 | 1) => {
    setAboutStats((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    markDirty();
  };

  return (
    <div className="space-y-5">
        <span
          aria-hidden="true"
          className="sr-only"
          data-ready={clientReady ? "true" : "false"}
          data-testid="settings-client-ready"
        />
        
        {/* --- SETTINGS TABS NAV --- */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3" role="tablist" aria-label="Các phần cài đặt">
          {([
            { id: "identity", label: "Nhận diện trang", icon: Store },
            { id: "contact", label: "Liên hệ", icon: Sparkles },
            { id: "seo", label: "SEO mặc định", icon: Sparkles },
            { id: "integrations", label: "Tích hợp", icon: Settings2 },
            { id: "sections", label: "Khu vực trang chủ", icon: LayoutDashboard },
          ] as const).filter((tab) => isAdmin || tab.id !== "integrations").map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- UNSAVED CHANGES FLOATING BAR --- */}
        {isDirty && (
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-sm text-yellow-800 font-semibold">
              <AlertTriangle className="size-4 text-yellow-600" />
              Bạn có thay đổi chưa lưu trong Cài đặt hệ thống.
            </div>
            <div className="flex gap-2">
              <button
                className="button-pd-outline py-1.5 px-3 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                type="button"
                onClick={handleDiscard}
                disabled={isSaving}
              >
                Bỏ qua
              </button>
              <button
                className="button-pd py-1.5 px-4 text-xs bg-slate-900 text-white hover:bg-slate-800"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1.5 inline" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu cài đặt"
                )}
              </button>
            </div>
          </div>
        )}

        {saveSuccess && (
          <p className="text-emerald-700 text-xs font-semibold bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Đã cập nhật cài đặt hệ thống thành công!
          </p>
        )}

        {/* --- TAB CONTENT: SITE IDENTITY --- */}
        {activeTab === "identity" && (
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <Store className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Nhận diện trang và thương hiệu</h3>
                <p className="text-xs text-secondary">Tên thương hiệu song ngữ, logo chính thức hiển thị trên header và các favicon.</p>
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 bg-white p-4 rounded-xl border">
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField 
                  label="Tên thương hiệu (Tiếng Việt) *" 
                  name="brand-vi" 
                  value={brandNameVi} 
                  onChange={(val) => { setBrandNameVi(val); markDirty(); }} 
                />
                <AdminField 
                  label="Tên thương hiệu (Tiếng Anh) *" 
                  name="brand-en" 
                  value={brandNameEn} 
                  onChange={(val) => { setBrandNameEn(val); markDirty(); }} 
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ImageUploadDropzone
                  label="Tải logo lên"
                  value={logoUrl}
                  onChange={(url) => { setLogoUrl(url); markDirty(); }}
                />
                <ImageUploadDropzone
                  label="Tải favicon lên"
                  value={faviconUrl}
                  onChange={(url) => { setFaviconUrl(url); markDirty(); }}
                />
              </div>
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: CONTACT & LOCALES --- */}
        {activeTab === "contact" && (
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <Globe2 className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Thông tin liên hệ và ngôn ngữ</h3>
                <p className="text-xs text-secondary">Số điện thoại liên hệ, email hỗ trợ báo giá và ngôn ngữ mặc định của trang web công cộng.</p>
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 bg-white p-4 rounded-xl border">
              <div className="grid gap-4 md:grid-cols-2 items-start">
                <div className="flex flex-col gap-1">
                  <AdminField
                    label="Hotline tư vấn *"
                    name="contact-phone"
                    value={contactPhone}
                    onChange={(val) => { setContactPhone(val); setPhoneError(""); markDirty(); }}
                    error={phoneError}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <AdminField
                    label="Email nhận báo giá *"
                    name="contact-email"
                    value={contactEmail}
                    onChange={(val) => { setContactEmail(val); setEmailError(""); markDirty(); }}
                    error={emailError}
                  />
                  <p className="text-xs text-slate-500">Vừa hiển thị trên trang Liên hệ, vừa là nơi <strong>nhận email thông báo</strong> mỗi khi khách gửi yêu cầu báo giá. Lưu cài đặt sẽ cập nhật luôn địa chỉ nhận này.</p>
                </div>
              </div>
              <div className="grid gap-4">
                <VietnamAddressPicker
                  label="Địa chỉ trụ sở chính (Tỉnh/Thành phố → Phường/Xã)"
                  value={{ provinceCode: contactProvinceCode, provinceName: contactProvinceName, wardCode: contactWardCode, wardName: contactWardName, street: contactStreet }}
                  onChange={(v) => {
                    setContactProvinceCode(v.provinceCode);
                    setContactProvinceName(v.provinceName);
                    setContactWardCode(v.wardCode);
                    setContactWardName(v.wardName);
                    setContactStreet(v.street);
                    setAddressVi(v.fullAddress);
                    // Vietnamese place names are not translated; keep EN address in sync.
                    setAddressEn(v.fullAddress);
                    markDirty();
                  }}
                />
              </div>
              <label className="grid gap-2">
                <span className="label-pd">Ngôn ngữ hiển thị mặc định</span>
                <PremiumSelect
                  value={defaultLocale}
                  onValueChange={(val) => { setDefaultLocale(val); markDirty(); }}
                  ariaLabel="Ngôn ngữ mặc định của trang công khai"
                  placeholder="Mặc định"
                  tone="admin"
                  options={[
                    { value: "vi", label: "Tiếng Việt" },
                    { value: "en", label: "Tiếng Anh" },
                  ]}
                />
              </label>
            </div>

            {/* Social / contact links */}
            <div className="flex items-start gap-3 pt-2">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <Share2 className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Mạng xã hội &amp; liên kết website</h3>
                <p className="text-xs text-secondary">Các liên kết này hiển thị ở footer và widget liên hệ của trang công khai. Để trống để ẩn một nền tảng.</p>
              </div>
            </div>

            <div className="grid gap-3 bg-white p-4 rounded-xl border">
              {socialLinks.map((link) => {
                const meta = SOCIAL_PLATFORMS.find((p) => p.platform === link.platform);
                return (
                  <div key={link.platform} className="grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-center">
                    <span className="text-sm font-semibold text-slate-700">{meta?.label || link.platform}</span>
                    <input
                      type="url"
                      inputMode="url"
                      className="input-pd"
                      placeholder={meta?.placeholder || "https://..."}
                      value={link.url}
                      onChange={(e) => updateSocialLink(link.platform, { url: e.target.value })}
                    />
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 justify-self-start md:justify-self-end">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={link.isEnabled}
                        onChange={(e) => updateSocialLink(link.platform, { isEnabled: e.target.checked })}
                      />
                      <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                      {link.isEnabled ? "Hiển thị" : "Ẩn"}
                    </label>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: SEO DEFAULTS --- */}
        {activeTab === "seo" && (
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <Search className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Mặc định SEO và chia sẻ</h3>
                <p className="text-xs text-secondary">Cấu hình thẻ meta mặc định cho các trang công cộng khi không được ghi đè riêng biệt.</p>
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 bg-white p-4 rounded-xl border">
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-xs font-bold text-slate-700 mb-2">Thẻ SEO Tiếng Việt</p>
                <div className="space-y-3">
                  <AdminField 
                    label="Tiêu đề SEO mặc định (Tiếng Việt) *" 
                    name="seo-title-vi" 
                    value={seoTitleVi} 
                    onChange={(val) => { setSeoTitleVi(val); markDirty(); }} 
                  />
                  <AdminField 
                    label="Mô tả meta mặc định (Tiếng Việt) *" 
                    name="seo-desc-vi" 
                    value={seoDescVi} 
                    onChange={(val) => { setSeoDescVi(val); markDirty(); }} 
                    multiline 
                  />
                </div>
              </div>
              
              <div className="p-3 bg-indigo-50/10 rounded-lg border border-indigo-100">
                <p className="text-xs font-bold text-indigo-950 mb-2">Thẻ SEO tiếng Anh</p>
                <div className="space-y-3">
                  <AdminField 
                    label="Tiêu đề SEO mặc định (Tiếng Anh) *" 
                    name="seo-title-en" 
                    value={seoTitleEn} 
                    onChange={(val) => { setSeoTitleEn(val); markDirty(); }} 
                  />
                  <AdminField 
                    label="Mô tả meta mặc định (Tiếng Anh) *" 
                    name="seo-desc-en" 
                    value={seoDescEn} 
                    onChange={(val) => { setSeoDescEn(val); markDirty(); }} 
                    multiline 
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: WORKFLOW & INTEGRATIONS (admin-only) --- */}
        {isAdmin && activeTab === "integrations" && (
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                  <Lock className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-800">Quy trình và khóa hệ thống</h3>
                  <p className="text-xs text-secondary">Cấu hình khóa API Google Gemini dùng cho trợ lý AI soạn nội dung.</p>
                </div>
              </div>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200">
                Chỉ quản trị viên
              </span>
            </div>
            
            <div className="mt-4 grid gap-4 bg-white p-4 rounded-xl border">
              <div className="max-w-md grid content-start gap-2">
                <AdminField
                  label="Khóa API Google Gemini"
                  name="gemini-key"
                  value={geminiKey}
                  onChange={(val) => { setGeminiKey(val); markDirty(); setGeminiStatus(null); }}
                  placeholder="AIzaSy..."
                  inputType="password"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyGemini}
                    disabled={verifyingGemini}
                    className="button-pd-outline py-1.5 px-3 text-xs disabled:opacity-60"
                  >
                    {verifyingGemini ? "Đang kiểm tra..." : "Kiểm tra khóa"}
                  </button>
                  {geminiStatus && (
                    <span className={`text-xs font-semibold ${geminiStatus.ok ? "text-emerald-600" : "text-red-600"}`}>
                      {geminiStatus.ok ? "✓ " : "✕ "}{geminiStatus.message}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400 font-semibold italic">
                * Khóa API được lưu trữ và truy cập an toàn trong cơ sở dữ liệu phía máy chủ.
              </p>
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: SITE SECTIONS --- */}
        {activeTab === "sections" && (
          <div className="grid grid-cols-1 gap-5">
          {/* Left Column: Settings Inputs */}
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <LayoutDashboard className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Khu vực trang chủ</h3>
                <p className="text-xs text-secondary">Quản lý nội dung hiển thị trên trang chủ: slide hero, câu chuyện thương hiệu, sản phẩm nổi bật, tin tức và huy hiệu tin cậy.</p>
              </div>
            </div>

            {/* Hero Configuration */}
            <div className="mt-4 bg-white p-4 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-xs font-bold text-slate-700">Hero và slide banner</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={heroVisible}
                    onChange={(e) => { setHeroVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {heroVisible ? "Hiển thị" : "Ẩn"}
                </label>
              </div>

              {heroVisible && (
                <div className="space-y-6 pt-2">
                  {/* Slide 1 */}
                  <div className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 space-y-3.5">
                    <p className="text-xs font-bold text-slate-600 border-l-2 border-indigo-500 pl-2">Slide 1: Banner chính</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Tiêu đề slide 1 (Tiếng Việt) *"
                        name="hero-headline-vi"
                        value={heroHeadlineVi}
                        onChange={(val) => { setHeroHeadlineVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Tiêu đề slide 1 (Tiếng Anh) *"
                        name="hero-headline-en"
                        value={heroHeadlineEn}
                        onChange={(val) => { setHeroHeadlineEn(val); markDirty(); }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Mô tả slide 1 (Tiếng Việt)"
                        name="hero-subtitle-vi"
                        value={heroSubtitleVi}
                        onChange={(val) => { setHeroSubtitleVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Mô tả slide 1 (Tiếng Anh)"
                        name="hero-subtitle-en"
                        value={heroSubtitleEn}
                        onChange={(val) => { setHeroSubtitleEn(val); markDirty(); }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Nhãn nút CTA"
                        name="hero-cta-label"
                        value={heroCtaLabel}
                        onChange={(val) => { setHeroCtaLabel(val); markDirty(); }}
                      />
                      <AdminField
                        label="Liên kết CTA"
                        name="hero-cta-link"
                        value={heroCtaLink}
                        onChange={(val) => { setHeroCtaLink(val); markDirty(); }}
                      />
                    </div>
                    <ImageUploadDropzone
                      label="Tải ảnh slide 1 hero"
                      value={heroImage1}
                      onChange={(url) => { setHeroImage1(url); markDirty(); }}
                    />
                  </div>

                  {/* Slide 2 */}
                  <div className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 space-y-3.5">
                    <p className="text-xs font-bold text-slate-600 border-l-2 border-indigo-500 pl-2">Slide 2: Phong cách di sản hiện đại</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Tiêu đề slide 2 (Tiếng Việt) *"
                        name="slide2-title-vi"
                        value={slide2TitleVi}
                        onChange={(val) => { setSlide2TitleVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Tiêu đề slide 2 (Tiếng Anh) *"
                        name="slide2-title-en"
                        value={slide2TitleEn}
                        onChange={(val) => { setSlide2TitleEn(val); markDirty(); }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Mô tả slide 2 (Tiếng Việt)"
                        name="slide2-lead-vi"
                        value={slide2LeadVi}
                        onChange={(val) => { setSlide2LeadVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Mô tả slide 2 (Tiếng Anh)"
                        name="slide2-lead-en"
                        value={slide2LeadEn}
                        onChange={(val) => { setSlide2LeadEn(val); markDirty(); }}
                      />
                    </div>
                    <ImageUploadDropzone
                      label="Tải ảnh slide 2 hero"
                      value={slide2Image}
                      onChange={(url) => { setSlide2Image(url); markDirty(); }}
                    />
                  </div>

                  {/* Slide 3 */}
                  <div className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 space-y-3.5">
                    <p className="text-xs font-bold text-slate-600 border-l-2 border-indigo-500 pl-2">Slide 3: Bền vững & Tối giản</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Tiêu đề slide 3 (Tiếng Việt) *"
                        name="slide3-title-vi"
                        value={slide3TitleVi}
                        onChange={(val) => { setSlide3TitleVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Tiêu đề slide 3 (Tiếng Anh) *"
                        name="slide3-title-en"
                        value={slide3TitleEn}
                        onChange={(val) => { setSlide3TitleEn(val); markDirty(); }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Mô tả slide 3 (Tiếng Việt)"
                        name="slide3-lead-vi"
                        value={slide3LeadVi}
                        onChange={(val) => { setSlide3LeadVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Mô tả slide 3 (Tiếng Anh)"
                        name="slide3-lead-en"
                        value={slide3LeadEn}
                        onChange={(val) => { setSlide3LeadEn(val); markDirty(); }}
                      />
                    </div>
                    <ImageUploadDropzone
                      label="Tải ảnh slide 3 hero"
                      value={slide3Image}
                      onChange={(url) => { setSlide3Image(url); markDirty(); }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-700">Hiển thị khu vực</p>
                <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                  Nội dung chi tiết của các khu vực trang chủ lấy từ dữ liệu API. Cài đặt trang chỉ điều khiển việc hiển thị hoặc ẩn từng khu vực.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SectionVisibilityCard
                  title="Khu vực giới thiệu / câu chuyện thương hiệu"
                  description="Dùng nội dung API của trang chủ hoặc trang giới thiệu."
                  checked={aboutVisible}
                  onChange={(checked) => { setAboutVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực sản phẩm nổi bật"
                  description="Dùng các sản phẩm nổi bật trả về từ API danh mục."
                  checked={featuredVisible}
                  onChange={(checked) => { setFeaturedVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực bài viết / tin tức"
                  description="Dùng các bài viết đã xuất bản mới nhất trả về từ API bài viết."
                  checked={blogSectionVisible}
                  onChange={(checked) => { setBlogSectionVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực showroom"
                  description="Dùng các showroom đang hoạt động trả về từ API showroom."
                  checked={showroomVisible}
                  onChange={(checked) => { setShowroomVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực yêu cầu báo giá"
                  description="Dùng form báo giá công khai và cấu hình API liên hệ."
                  checked={quoteVisible}
                  onChange={(checked) => { setQuoteVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực huy hiệu tin cậy / đối tác"
                  description="Dùng chỉ số uy tín và dữ liệu đối tác trả về từ API trang chủ."
                  checked={trustBadgesVisible}
                  onChange={(checked) => { setTrustBadgesVisible(checked); markDirty(); }}
                />
              </div>
            </div>

            {/* About / Brand Story — content (VISIBLE editor) */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <p className="text-xs font-bold text-slate-700 border-b pb-2">📖 Khu Giới thiệu (trang chủ)</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label='Nhãn nhỏ "Về Phương Đông" (VI)'
                  name="about-eyebrow-vi-v"
                  value={aboutEyebrowVi}
                  onChange={(val) => { setAboutEyebrowVi(val); markDirty(); }}
                />
                <AdminField
                  label="About eyebrow (EN)"
                  name="about-eyebrow-en-v"
                  value={aboutEyebrowEn}
                  onChange={(val) => { setAboutEyebrowEn(val); markDirty(); }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label='Tiêu đề "Về chúng tôi" (VI)'
                  name="about-heading-vi-v"
                  value={aboutHeadingVi}
                  onChange={(val) => { setAboutHeadingVi(val); markDirty(); }}
                />
                <AdminField
                  label="Story heading (EN)"
                  name="about-heading-en-v"
                  value={aboutHeadingEn}
                  onChange={(val) => { setAboutHeadingEn(val); markDirty(); }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Mô tả ngắn (VI)"
                  name="about-lead-vi-v"
                  value={aboutLeadVi}
                  onChange={(val) => { setAboutLeadVi(val); markDirty(); }}
                  multiline
                />
                <AdminField
                  label="Story lead (EN)"
                  name="about-lead-en-v"
                  value={aboutLeadEn}
                  onChange={(val) => { setAboutLeadEn(val); markDirty(); }}
                  multiline
                />
              </div>
            </div>

            {/* About page timeline eyebrow + heading (VISIBLE editor) */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <p className="text-xs font-bold text-slate-700 border-b pb-2">🗺️ Trang Giới thiệu — Hành trình phát triển</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label='Nhãn nhỏ "Hành trình phát triển" (VI)'
                  name="about-journey-eyebrow-vi-v"
                  value={aboutJourneyEyebrowVi}
                  onChange={(val) => { setAboutJourneyEyebrowVi(val); markDirty(); }}
                />
                <AdminField
                  label="Journey eyebrow (EN)"
                  name="about-journey-eyebrow-en-v"
                  value={aboutJourneyEyebrowEn}
                  onChange={(val) => { setAboutJourneyEyebrowEn(val); markDirty(); }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label='Tiêu đề "Chặng đường hơn 20 năm" (VI)'
                  name="about-journey-heading-vi-v"
                  value={aboutJourneyHeadingVi}
                  onChange={(val) => { setAboutJourneyHeadingVi(val); markDirty(); }}
                />
                <AdminField
                  label="Journey heading (EN)"
                  name="about-journey-heading-en-v"
                  value={aboutJourneyHeadingEn}
                  onChange={(val) => { setAboutJourneyHeadingEn(val); markDirty(); }}
                />
              </div>

              {/* Milestones — dynamic list */}
              <div className="flex items-center justify-between border-t pt-3">
                <p className="text-xs font-bold text-slate-700">🕰️ Các mốc thời gian</p>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-600"
                >
                  + Thêm mốc
                </button>
              </div>
              {aboutMilestones.length === 0 && (
                <p className="text-xs text-slate-400">Chưa có mốc nào. Bấm “+ Thêm mốc” để thêm.</p>
              )}
              <div className="space-y-3">
                {aboutMilestones.map((m, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Mốc #{idx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" disabled={idx === 0} onClick={() => moveMilestone(idx, -1)} className="rounded border border-slate-300 px-1.5 text-xs disabled:opacity-30" aria-label="Lên">↑</button>
                        <button type="button" disabled={idx === aboutMilestones.length - 1} onClick={() => moveMilestone(idx, 1)} className="rounded border border-slate-300 px-1.5 text-xs disabled:opacity-30" aria-label="Xuống">↓</button>
                        <button type="button" onClick={() => removeMilestone(idx)} className="rounded border border-red-200 px-1.5 text-xs font-bold text-red-500 hover:bg-red-50">Xóa</button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <AdminField label="Năm / nhãn mốc (VI)" name={`ms-${idx}-year-vi`} value={m.yearVi} onChange={(val) => updateMilestone(idx, "yearVi", val)} />
                      <AdminField label="Year / label (EN)" name={`ms-${idx}-year-en`} value={m.yearEn} onChange={(val) => updateMilestone(idx, "yearEn", val)} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <AdminField label="Tiêu đề (VI)" name={`ms-${idx}-title-vi`} value={m.titleVi} onChange={(val) => updateMilestone(idx, "titleVi", val)} />
                      <AdminField label="Title (EN)" name={`ms-${idx}-title-en`} value={m.titleEn} onChange={(val) => updateMilestone(idx, "titleEn", val)} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <AdminField label="Mô tả (VI)" name={`ms-${idx}-text-vi`} value={m.textVi} onChange={(val) => updateMilestone(idx, "textVi", val)} multiline />
                      <AdminField label="Description (EN)" name={`ms-${idx}-text-en`} value={m.textEn} onChange={(val) => updateMilestone(idx, "textEn", val)} multiline />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats — dynamic list */}
              <div className="flex items-center justify-between border-t pt-3">
                <p className="text-xs font-bold text-slate-700">🔢 Con số nổi bật (số liệu)</p>
                <button
                  type="button"
                  onClick={addStat}
                  className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-600"
                >
                  + Thêm số liệu
                </button>
              </div>
              {aboutStats.length === 0 && (
                <p className="text-xs text-slate-400">Chưa có số liệu nào. Bấm “+ Thêm số liệu” để thêm.</p>
              )}
              <div className="space-y-3">
                {aboutStats.map((s, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Số liệu #{idx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" disabled={idx === 0} onClick={() => moveStat(idx, -1)} className="rounded border border-slate-300 px-1.5 text-xs disabled:opacity-30" aria-label="Lên">↑</button>
                        <button type="button" disabled={idx === aboutStats.length - 1} onClick={() => moveStat(idx, 1)} className="rounded border border-slate-300 px-1.5 text-xs disabled:opacity-30" aria-label="Xuống">↓</button>
                        <button type="button" onClick={() => removeStat(idx)} className="rounded border border-red-200 px-1.5 text-xs font-bold text-red-500 hover:bg-red-50">Xóa</button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <AdminField label="Con số (VI) — vd 20+, 2.000m²" name={`st-${idx}-value-vi`} value={s.valueVi} onChange={(val) => updateStat(idx, "valueVi", val)} />
                      <AdminField label="Value (EN)" name={`st-${idx}-value-en`} value={s.valueEn} onChange={(val) => updateStat(idx, "valueEn", val)} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <AdminField label="Nhãn (VI) — vd năm kinh nghiệm" name={`st-${idx}-label-vi`} value={s.labelVi} onChange={(val) => updateStat(idx, "labelVi", val)} />
                      <AdminField label="Label (EN)" name={`st-${idx}-label-en`} value={s.labelEn} onChange={(val) => updateStat(idx, "labelEn", val)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderLegacySectionDetails && (
              <>
            {/* Homepage About/Story Section */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <p className="text-xs font-bold text-slate-700 border-b pb-2">📖 About / Brand Story Section</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Story Heading (VI) *"
                  name="about-heading-vi"
                  value={aboutHeadingVi}
                  onChange={(val) => { setAboutHeadingVi(val); markDirty(); }}
                />
                <AdminField
                  label="Story Heading (EN) *"
                  name="about-heading-en"
                  value={aboutHeadingEn}
                  onChange={(val) => { setAboutHeadingEn(val); markDirty(); }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Story Lead (VI)"
                  name="about-lead-vi"
                  value={aboutLeadVi}
                  onChange={(val) => { setAboutLeadVi(val); markDirty(); }}
                  multiline
                />
                <AdminField
                  label="Story Lead (EN)"
                  name="about-lead-en"
                  value={aboutLeadEn}
                  onChange={(val) => { setAboutLeadEn(val); markDirty(); }}
                  multiline
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Nhãn nhỏ khu About trang chủ (VI)"
                  name="about-eyebrow-vi"
                  value={aboutEyebrowVi}
                  onChange={(val) => { setAboutEyebrowVi(val); markDirty(); }}
                />
                <AdminField
                  label="About section eyebrow (EN)"
                  name="about-eyebrow-en"
                  value={aboutEyebrowEn}
                  onChange={(val) => { setAboutEyebrowEn(val); markDirty(); }}
                />
              </div>
              <ImageUploadDropzone
                label="Story side image upload"
                value={aboutImage}
                onChange={(url) => { setAboutImage(url); markDirty(); }}
              />
            </div>

            {/* About Page — Timeline / Journey Section */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <p className="text-xs font-bold text-slate-700 border-b pb-2">🗺️ Trang Giới thiệu — Hành trình phát triển</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Nhãn nhỏ hành trình (VI)"
                  name="about-journey-eyebrow-vi"
                  value={aboutJourneyEyebrowVi}
                  onChange={(val) => { setAboutJourneyEyebrowVi(val); markDirty(); }}
                />
                <AdminField
                  label="Journey eyebrow (EN)"
                  name="about-journey-eyebrow-en"
                  value={aboutJourneyEyebrowEn}
                  onChange={(val) => { setAboutJourneyEyebrowEn(val); markDirty(); }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Tiêu đề hành trình (VI)"
                  name="about-journey-heading-vi"
                  value={aboutJourneyHeadingVi}
                  onChange={(val) => { setAboutJourneyHeadingVi(val); markDirty(); }}
                />
                <AdminField
                  label="Journey heading (EN)"
                  name="about-journey-heading-en"
                  value={aboutJourneyHeadingEn}
                  onChange={(val) => { setAboutJourneyHeadingEn(val); markDirty(); }}
                />
              </div>
            </div>

            {/* Featured Products */}
            <div className="bg-white p-4 rounded-xl border space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-700">⭐ Featured Products Section</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={featuredVisible}
                    onChange={(e) => { setFeaturedVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {featuredVisible ? "Visible" : "Hidden"}
                </label>
              </div>
              {featuredVisible && (
                <>
                  <AdminField
                    label="Max featured items"
                    name="featured-max"
                    value={featuredMaxItems}
                    inputType="number"
                    min={0}
                    max={settingsPreviewProducts.length}
                    onChange={(val) => { setFeaturedMaxItems(val); markDirty(); }}
                  />
                  <p className="text-[10px] font-semibold text-slate-500">
                    Preview uses {settingsPreviewProducts.length} CMS/BE product records, with featured products shown first.
                  </p>
                </>
              )}
            </div>

            {/* Blog Section */}
            <div className="bg-white p-4 rounded-xl border space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-700">📝 Blog / News Section</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={blogSectionVisible}
                    onChange={(e) => { setBlogSectionVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {blogSectionVisible ? "Visible" : "Hidden"}
                </label>
              </div>
              {blogSectionVisible && (
                <>
                  <AdminField
                    label="Max blog posts"
                    name="blog-max"
                    value={blogMaxPosts}
                    inputType="number"
                    min={0}
                    max={blogPosts.length}
                    onChange={(val) => { setBlogMaxPosts(val); markDirty(); }}
                  />
                  <p className="text-[10px] font-semibold text-slate-500">
                    Preview uses {blogPosts.length} CMS/BE article records.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Heading (VI)"
                      name="blog-heading-vi"
                      value={blogHeadingVi}
                      onChange={(val) => { setBlogHeadingVi(val); markDirty(); }}
                    />
                    <AdminField
                      label="Section Heading (EN)"
                      name="blog-heading-en"
                      value={blogHeadingEn}
                      onChange={(val) => { setBlogHeadingEn(val); markDirty(); }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Showroom Section Configuration */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-xs font-bold text-slate-700">🏢 Showroom Section Configuration</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showroomVisible}
                    onChange={(e) => { setShowroomVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {showroomVisible ? "Visible" : "Hidden"}
                </label>
              </div>

              {showroomVisible && (
                <div className="space-y-4 pt-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Heading (VI) *"
                      name="showroom-heading-vi"
                      value={showroomHeadingVi}
                      onChange={(val) => { setShowroomHeadingVi(val); markDirty(); }}
                    />
                    <AdminField
                      label="Section Heading (EN) *"
                      name="showroom-heading-en"
                      value={showroomHeadingEn}
                      onChange={(val) => { setShowroomHeadingEn(val); markDirty(); }}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Lead (VI)"
                      name="showroom-lead-vi"
                      value={showroomLeadVi}
                      onChange={(val) => { setShowroomLeadVi(val); markDirty(); }}
                      multiline
                    />
                    <AdminField
                      label="Section Lead (EN)"
                      name="showroom-lead-en"
                      value={showroomLeadEn}
                      onChange={(val) => { setShowroomLeadEn(val); markDirty(); }}
                      multiline
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="CTA Button Label (VI)"
                      name="showroom-cta-vi"
                      value={showroomCtaVi}
                      onChange={(val) => { setShowroomCtaVi(val); markDirty(); }}
                    />
                    <AdminField
                      label="CTA Button Label (EN)"
                      name="showroom-cta-en"
                      value={showroomCtaEn}
                      onChange={(val) => { setShowroomCtaEn(val); markDirty(); }}
                    />
                  </div>
                  <ImageUploadDropzone
                    label="Showroom background image upload"
                    value={showroomBgImage}
                    onChange={(url) => { setShowroomBgImage(url); markDirty(); }}
                  />
                </div>
              )}
            </div>

            {/* Quote Section Configuration */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-xs font-bold text-slate-700">💬 Quote Request Section Configuration</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={quoteVisible}
                    onChange={(e) => { setQuoteVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {quoteVisible ? "Visible" : "Hidden"}
                </label>
              </div>

              {quoteVisible && (
                <div className="space-y-4 pt-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Heading (VI) *"
                      name="quote-heading-vi"
                      value={quoteHeadingVi}
                      onChange={(val) => { setQuoteHeadingVi(val); markDirty(); }}
                    />
                    <AdminField
                      label="Section Heading (EN) *"
                      name="quote-heading-en"
                      value={quoteHeadingEn}
                      onChange={(val) => { setQuoteHeadingEn(val); markDirty(); }}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Lead (VI)"
                      name="quote-lead-vi"
                      value={quoteLeadVi}
                      onChange={(val) => { setQuoteLeadVi(val); markDirty(); }}
                      multiline
                    />
                    <AdminField
                      label="Section Lead (EN)"
                      name="quote-lead-en"
                      value={quoteLeadEn}
                      onChange={(val) => { setQuoteLeadEn(val); markDirty(); }}
                      multiline
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-xs font-bold text-slate-700">🤝 Trust Badges / Partners Section</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={trustBadgesVisible}
                    onChange={(e) => { setTrustBadgesVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {trustBadgesVisible ? "Visible" : "Hidden"}
                </label>
              </div>

              {trustBadgesVisible && (
                <div className="grid gap-4 md:grid-cols-2 pt-2">
                  {/* Badge 1 */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border space-y-3">
                    <p className="text-xs font-bold text-slate-600">Huy hiệu 1 (Badge 1)</p>
                    <div className="grid gap-3">
                      <div className="grid gap-2 grid-cols-2">
                        <AdminField
                          label="Value (VI) *"
                          name="badge1-value-vi"
                          value={badge1ValueVi}
                          onChange={(val) => { setBadge1ValueVi(val); markDirty(); }}
                        />
                        <AdminField
                          label="Value (EN) *"
                          name="badge1-value-en"
                          value={badge1ValueEn}
                          onChange={(val) => { setBadge1ValueEn(val); markDirty(); }}
                        />
                      </div>
                      <div className="grid gap-2 grid-cols-2">
                        <AdminField
                          label="Desc (VI) *"
                          name="badge1-desc-vi"
                          value={badge1DescVi}
                          onChange={(val) => { setBadge1DescVi(val); markDirty(); }}
                        />
                        <AdminField
                          label="Desc (EN) *"
                          name="badge1-desc-en"
                          value={badge1DescEn}
                          onChange={(val) => { setBadge1DescEn(val); markDirty(); }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badge 2 */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border space-y-3">
                    <p className="text-xs font-bold text-slate-600">Huy hiệu 2 (Badge 2)</p>
                    <div className="grid gap-3">
                      <div className="grid gap-2 grid-cols-2">
                        <AdminField
                          label="Value (VI) *"
                          name="badge2-value-vi"
                          value={badge2ValueVi}
                          onChange={(val) => { setBadge2ValueVi(val); markDirty(); }}
                        />
                        <AdminField
                          label="Value (EN) *"
                          name="badge2-value-en"
                          value={badge2ValueEn}
                          onChange={(val) => { setBadge2ValueEn(val); markDirty(); }}
                        />
                      </div>
                      <div className="grid gap-2 grid-cols-2">
                        <AdminField
                          label="Desc (VI) *"
                          name="badge2-desc-vi"
                          value={badge2DescVi}
                          onChange={(val) => { setBadge2DescVi(val); markDirty(); }}
                        />
                        <AdminField
                          label="Desc (EN) *"
                          name="badge2-desc-en"
                          value={badge2DescEn}
                          onChange={(val) => { setBadge2DescEn(val); markDirty(); }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
              </>
            )}
          </section>
          {/* Right Column: Live Homepage Preview */}
          {renderHomepagePreview && (
          <aside className="space-y-3 self-start 2xl:sticky 2xl:top-4">
            <div className="homepage-preview-shell surface-soft p-3 rounded-xl">
              <input
                id={desktopPreviewId}
                className="homepage-preview-radio-desktop sr-only"
                type="radio"
                name="homepage-preview-device"
                aria-label="Xem trước trang chủ trên máy tính"
                defaultChecked
              />
              <input
                id={mobilePreviewId}
                className="homepage-preview-radio-mobile sr-only"
                type="radio"
                name="homepage-preview-device"
                aria-label="Xem trước trang chủ trên di động"
              />
              <div className="homepage-preview-header flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">Xem trước trực tiếp</span>
                </div>
                <div className="homepage-preview-controls flex rounded-lg overflow-hidden border border-slate-200">
                  <label
                    htmlFor={desktopPreviewId}
                    data-testid="preview-desktop-label"
                    className="homepage-preview-device-label homepage-preview-desktop-label"
                  >
                    <Monitor className="size-3" /> Máy tính
                  </label>
                  <label
                    htmlFor={mobilePreviewId}
                    data-testid="preview-mobile-label"
                    className="homepage-preview-device-label homepage-preview-mobile-label"
                  >
                    <Smartphone className="size-3" /> Di động
                  </label>
                </div>
              </div>
              <div className="homepage-preview-frames max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                <div className="homepage-preview-frame-desktop">
                  <HomepageLivePreview
                    {...homepagePreviewProps}
                    testId="settings-homepage-preview-desktop"
                    device="desktop"
                  />
                </div>
                <div className="homepage-preview-frame-mobile">
                  <HomepageLivePreview
                    {...homepagePreviewProps}
                    testId="settings-homepage-preview-mobile"
                    device="mobile"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-center mt-2 italic">
                Bản preview cập nhật theo thời gian thực khi bạn chỉnh sửa
              </p>
            </div>
          </aside>
          )}
          </div>
        )}
    </div>
  );
}
