"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BadgePercent,
  BadgeCheck,
  BookOpen,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  Heart,
  ImageUp,
  Info,
  Languages,
  LayoutDashboard,
  Link2,
  Loader2,
  Lock,
  MapPin,
  Menu,
  Monitor,
  Package,
  Phone,
  Plus,
  Ruler,
  Save,
  Search,
  Settings2,
  Share2,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { PremiumSelect } from "../premium-select";
import {
  MediaUploadPanel,
  PublishWorkflow,
  RichTextEditorMock,
  MediaPicker,
} from "../admin-interactions";
import {
  localized,
  productGroups,
  trustBadges,
} from "@/lib/showroom-data";
import {
  blogPosts,
  imageAssets,
  products,
  showrooms,
} from "@/tests/fixtures/showroom-data-fixture";
import enMessages from "@/messages/en.json";
import viMessages from "@/messages/vi.json";


import {
  type ContentKind,
  type EntityKind,
  type SettingsTab,
  slugify,
  formatVnNumber,
  readVnNumber,
  productReadiness,
  blogReadiness,
  settingsHomepageDefaults,
  settingsPreviewProducts,
  getPreviewLimit,
  formatBytes,
  getAssetName,
  getFocusableElements,
  ImageUploadDropzone,
  MultiImageGalleryUpload,
  DetailPreviewModal,
} from "../admin-workflows";

const isBodyEmpty = (val: any) => {
  if (!val) return true;
  if (typeof val === "string") return !val.trim();
  if (typeof val === "object") {
    if (val.type === "doc" && Array.isArray(val.content)) {
      return val.content.length === 0;
    }
    return Object.keys(val).length === 0;
  }
  return false;
};

export function ContentEditorForm({
  kind,
  mode = "edit",
  idOrSlug,
}: {
  kind: ContentKind;
  mode?: "create" | "edit";
  idOrSlug?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProduct = kind === "product";

  // --- Form State ---
  const [viTitle, setViTitle] = useState(mode === "edit" ? (isProduct ? "Sofa Curve Velour" : "Bí quyết chọn gỗ óc chó cho nội thất bền vững") : "");
  const [enTitle, setEnTitle] = useState(mode === "edit" ? (isProduct ? "Sofa Curve Velour" : "How to choose walnut wood for lasting interiors") : "");
  
  const [viSlug, setViSlug] = useState(mode === "edit" ? (isProduct ? "sofa-curve-velour" : "bi-quyet-chon-go-oc-cho") : "");
  const [enSlug, setEnSlug] = useState(mode === "edit" ? (isProduct ? "sofa-curve-velour" : "how-to-choose-walnut-wood") : "");

  const [viSummary, setViSummary] = useState(mode === "edit" ? (isProduct ? "Sofa cao cấp bọc vải Velour với đường cong tinh tế, khung gỗ sồi tự nhiên." : "Nhận biết vân gỗ, độ ẩm và quy trình xử lý bề mặt trước khi đầu tư cho nội thất cao cấp.") : "");
  const [enSummary, setEnSummary] = useState(mode === "edit" ? (isProduct ? "Premium velour sofa with a soft curved silhouette and natural oak frame." : "Understand grain, moisture and finishing process before investing in premium interiors.") : "");

  const [viBody, setViBody] = useState(mode === "edit" ? "Nội dung chi tiết tiếng Việt. Đây là trường nguồn để biên tập viên kiểm duyệt trước khi dịch sang tiếng Anh." : "");
  const [enBody, setEnBody] = useState(mode === "edit" ? "English body draft appears here only when English authoring is enabled." : "");

  const [englishEnabled, setEnglishEnabled] = useState(mode === "edit");

  const [seoTitleVi, setSeoTitleVi] = useState(mode === "edit" ? (isProduct ? "Sofa gỗ óc chó cho phòng khách cao cấp" : "Bí quyết chọn gỗ óc chó cho nội thất cao cấp") : "");
  const [seoTitleEn, setSeoTitleEn] = useState(mode === "edit" ? (isProduct ? "Walnut sofa for refined living rooms" : "How to choose walnut wood for premium interiors") : "");
  const [seoDescVi, setSeoDescVi] = useState(mode === "edit" ? "Mô tả ngắn gọn, rõ giá trị tư vấn và lời mời nhận báo giá." : "");
  const [seoDescEn, setSeoDescEn] = useState(mode === "edit" ? "Short, specific search description with a quote request path." : "");

  // --- Product-specific fields ---
  const [price, setPrice] = useState(""); // stored as raw digits string
  const [quoteOnly, setQuoteOnly] = useState(true);
  const [category, setCategory] = useState(isProduct ? "wood" : "wood-knowledge");
  const [brand, setBrand] = useState("Atelier Select");
  const [refCode, setRefCode] = useState("PD-SF-184");
  const [showroom, setShowroom] = useState("district-7");
  const [featured, setFeatured] = useState(true);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  // Spec & Dimension states (Bilingual)
  const [materialsVi, setMaterialsVi] = useState(mode === "edit" ? "Gỗ óc chó tự nhiên, khung xương chắc chắn, lớp hoàn thiện tinh tế." : "");
  const [materialsEn, setMaterialsEn] = useState(mode === "edit" ? "Solid natural walnut wood, robust structural frame, refined natural finish." : "");
  const [dimensionsVi, setDimensionsVi] = useState(mode === "edit" ? "2200 x 920 x 780 mm" : "");
  const [dimensionsEn, setDimensionsEn] = useState(mode === "edit" ? "2200 x 920 x 780 mm" : "");
  const [specMaterialVi, setSpecMaterialVi] = useState(mode === "edit" ? "Gỗ óc chó tự nhiên nguyên khối" : "");
  const [specMaterialEn, setSpecMaterialEn] = useState(mode === "edit" ? "Premium solid natural walnut" : "");
  const [specFinishVi, setSpecFinishVi] = useState(mode === "edit" ? "Sơn lau dầu thực vật cao cấp" : "");
  const [specFinishEn, setSpecFinishEn] = useState(mode === "edit" ? "Premium organic plant-oil finish" : "");
  const [specCareVi, setSpecCareVi] = useState(mode === "edit" ? "Lau bằng vải khô mềm hằng tuần, tránh nước đọng" : "");
  const [specCareEn, setSpecCareEn] = useState(mode === "edit" ? "Wipe weekly with a dry soft cloth, avoid standing water" : "");

  const [coverImage, setCoverImage] = useState(mode === "edit" ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDeNaFa3JY47GArzSxORvjQWIf13YpBq5rZYV_Vlg0WKN8i1K-riacPvEpxjgArG70R9OkqHw41H7xEEnVaMamTzu2j8lUK-wN10A784d1QoZHM4fi9vE9NsHXu1EneflVADtw0KiL5VYdZ-5MVbfL4kn3BaILk6D4iORdO7N2m089CpKpF2esGBi_yIxBC9B7XXStL7PKNX97Nil49w0dOvCjJzkSw6MopELonyTGhnooSPrfWnl3mqEpWOdLeuH6JKV3e8hIF1D4" : "");
  const [galleryImages, setGalleryImages] = useState<string[]>(mode === "edit" ? [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCS7rYc18dpXUFnhvwBuKvVucavZ1sAsE7DxMtRl_98ETvYOUVz44VpAURmwOHZ7J9HuYsw8sBH_O4uP1U_8G2qw0JOtoCI_dTrmqpw2kEsALwRtiBzM2XQx8aKxpcPVlMn34cMjlBmADgZhbyHjyZjYC20RChapDYZk1VETdbY4ce1PYH6BxZ9ILJakNNyTsFOL82tJQs_U_JfvrNJvYA0cgVpj1VZZOzglO4g_SsMvrcrb7dLAz4YUJlC3-e3y-ZwFnQg8bCrdFs",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB9AqZgkazhLr1T0iK0v_7bDSJHoCTj3l7Bj1kVA10E3JGafT3Ac50zasCKjmT768HKPkLHAuydGJZJhcPgRtnx7_lmH_wPPkCksh-mWEU67Ei-yO7Ft71A-StpTV931Nc2YeU5FBCPPxTlj4Pl8A_0LKVIcc7hTjZMR4zKfqic1n1uqjBz3PkdQMMaP8FSpmyCTaPMjANwfzExqwt7upT3zcL8vw6xmL52Dy822UQXYQregnQUtL615QO5pxLjUKsEDFJonheQBL8"
  ] : []);

  interface CustomAttribute {
    id: string;
    nameVi: string;
    nameEn: string;
    valueVi: string;
    valueEn: string;
  }

  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>(mode === "edit" ? [
    { id: "1", nameVi: "Bảo hành", nameEn: "Warranty", valueVi: "24 tháng", valueEn: "24 months" },
    { id: "2", nameVi: "Xuất xứ", nameEn: "Origin", valueVi: "Việt Nam", valueEn: "Vietnam" }
  ] : []);

  interface AIResultData {
    viTitle: string;
    enTitle: string;
    viSlug: string;
    enSlug: string;
    viSummary: string;
    enSummary: string;
    viBody: string;
    enBody: string;
    seoTitleVi: string;
    seoTitleEn: string;
    seoDescVi: string;
    seoDescEn: string;
    materialsVi?: string;
    materialsEn?: string;
    dimensionsVi?: string;
    dimensionsEn?: string;
    specMaterialVi?: string;
    specMaterialEn?: string;
    specFinishVi?: string;
    specFinishEn?: string;
    specCareVi?: string;
    specCareEn?: string;
  }

  // --- AI Assistant Generator States ---
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResultData | null>(null);
  const [showAiReviewDialog, setShowAiReviewDialog] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // --- AI Translate States ---
  const [aiTranslating, setAiTranslating] = useState(false);
  const [aiTranslateSuccess, setAiTranslateSuccess] = useState(false);

  // --- Local Draft Auto-save & Restore ---
  const [hasLocalDraft, setHasLocalDraft] = useState(() => {
    if (typeof window !== "undefined" && mode === "create") {
      const saved = localStorage.getItem(`${kind}_post_draft`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return !!(parsed.viTitle || parsed.viSummary);
        } catch (e) {}
      }
    }
    return false;
  });
  const [draftTimestamp, setDraftTimestamp] = useState(() => {
    if (typeof window !== "undefined" && mode === "create") {
      const saved = localStorage.getItem(`${kind}_post_draft`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.timestamp || "";
        } catch (e) {}
      }
    }
    return "";
  });

  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [entityId, setEntityId] = useState<string | null>(null);
  const editSlug = idOrSlug || searchParams.get("edit");

  // Sync state with edit entity from DB
  useEffect(() => {
    if (mode === "edit" && editSlug) {
      setIsLoadingEdit(true);
      setLoadError("");
      
      if (isProduct) {
        import("@/lib/supabase/mutations")
          .then(async ({ getAdminProductByIdOrSlug }) => {
            const { getAdminCategories } = await import("@/lib/supabase/admin-queries");
            const cats = await getAdminCategories();
            const catList = Array.isArray(cats) ? cats : cats?.data || [];
            const res = await getAdminProductByIdOrSlug(editSlug);
            if (res.success && res.data) {
              const p = res.data;
              setEntityId(p.id);
              setViTitle(p.name_vi || "");
              setEnTitle(p.name_en || "");
              setViSlug(p.slug || "");
              setEnSlug(p.slug || "");
              setViSummary(p.summary_vi || "");
              setEnSummary(p.summary_en || "");
              setViBody(p.description_json_vi || "");
              setEnBody(p.description_json_en || "");
              setEnglishEnabled(!!p.name_en);
              
              setPrice(p.price_min ? String(p.price_min) : "");
              setQuoteOnly(p.price_display_text_vi === "Liên hệ" || !p.price_min);
              
              const catSlug = catList.find(c => c.id === p.category_id)?.slug || "wood";
              setCategory(catSlug);
              setBrand(p.brand_id || "Atelier Select");
              setRefCode(p.reference_code || "");
              setFeatured(p.featured || false);
              setStatus(p.status || "draft");
              
              setMaterialsVi(p.material_vi || "");
              setMaterialsEn(p.material_en || "");
              setDimensionsVi(p.dimension_display_text_vi || "");
              setDimensionsEn(p.dimension_display_text_en || "");
              
              if (p.specifications) {
                setSpecMaterialVi(p.specifications.material_vi || "");
                setSpecMaterialEn(p.specifications.material_en || "");
                setSpecFinishVi(p.specifications.finish_vi || "");
                setSpecFinishEn(p.specifications.finish_en || "");
                setSpecCareVi(p.specifications.care_vi || "");
                setSpecCareEn(p.specifications.care_en || "");
              }
              
              setCoverImage(p.cover_image || "");
              setGalleryImages(p.gallery_images || []);
              
              setSeoTitleVi(p.seo_title_vi || "");
              setSeoTitleEn(p.seo_title_en || "");
              setSeoDescVi(p.seo_description_vi || "");
              setSeoDescEn(p.seo_description_en || "");
              
              if (p.custom_attributes) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setCustomAttributes(p.custom_attributes.map((a: any, idx: number) => ({
                  id: String(idx + 1),
                  nameVi: a.name_vi,
                  nameEn: a.name_en,
                  valueVi: a.value_vi,
                  valueEn: a.value_en
                })));
              }
            } else {
              setLoadError(res.error || "Không thể tải thông tin sản phẩm.");
            }
          })
          .catch((err) => {
            console.error(err);
            setLoadError("Lỗi hệ thống khi tải sản phẩm.");
          })
          .finally(() => {
            setIsLoadingEdit(false);
          });
      } else {
        import("@/lib/supabase/mutations")
          .then(async ({ getAdminBlogPostByIdOrSlug }) => {
            const res = await getAdminBlogPostByIdOrSlug(editSlug);
            if (res.success && res.data) {
              const b = res.data;
              setEntityId(b.id);
              setViTitle(b.title_vi || "");
              setEnTitle(b.title_en || "");
              setViSlug(b.slug || "");
              setEnSlug(b.slug || "");
              setViSummary(b.excerpt_vi || "");
              setEnSummary(b.excerpt_en || "");
              setViBody(b.body_json_vi || "");
              setEnBody(b.body_json_en || "");
              setEnglishEnabled(!!b.title_en);
              
              setCategory(b.category_id || "insights");
              setFeatured(b.featured || false);
              setStatus(b.status || "draft");
              setCoverImage(b.cover_image || "");
              
              setSeoTitleVi(b.seo_title_vi || "");
              setSeoTitleEn(b.seo_title_en || "");
              setSeoDescVi(b.seo_description_vi || "");
              setSeoDescEn(b.seo_description_en || "");
            } else {
              setLoadError(res.error || "Không thể tải thông tin bài viết.");
            }
          })
          .catch((err) => {
            console.error(err);
            setLoadError("Lỗi hệ thống khi tải bài viết.");
          })
          .finally(() => {
            setIsLoadingEdit(false);
          });
      }
    }
  }, [mode, editSlug, isProduct, kind]);

  useEffect(() => {
    if (mode === "create" && (viTitle || viSummary || viBody)) {
      const draftData = {
        viTitle,
        enTitle,
        viSlug,
        enSlug,
        viSummary,
        enSummary,
        viBody,
        enBody,
        englishEnabled,
        seoTitleVi,
        seoTitleEn,
        seoDescVi,
        seoDescEn,
        timestamp: new Date().toLocaleTimeString(),
      };
      localStorage.setItem(`${kind}_post_draft`, JSON.stringify(draftData));
    }
  }, [viTitle, enTitle, viSlug, enSlug, viSummary, enSummary, viBody, enBody, englishEnabled, seoTitleVi, seoTitleEn, seoDescVi, seoDescEn, mode, kind]);

  // Auto-generate slug from Vietnamese title
  useEffect(() => {
    if (mode === "create" && viTitle) {
      setViSlug(slugify(viTitle));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viTitle, mode]);

  // Auto-generate slug from English title
  useEffect(() => {
    if (mode === "create" && enTitle) {
      setEnSlug(slugify(enTitle));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enTitle, mode]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(`${kind}_post_draft`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setViTitle(parsed.viTitle || "");
        setEnTitle(parsed.enTitle || "");
        setViSlug(parsed.viSlug || "");
        setEnSlug(parsed.enSlug || "");
        setViSummary(parsed.viSummary || "");
        setEnSummary(parsed.enSummary || "");
        setViBody(parsed.viBody || "");
        setEnBody(parsed.enBody || "");
        setEnglishEnabled(parsed.englishEnabled || false);
        setSeoTitleVi(parsed.seoTitleVi || "");
        setSeoTitleEn(parsed.seoTitleEn || "");
        setSeoDescVi(parsed.seoDescVi || "");
        setSeoDescEn(parsed.seoDescEn || "");
      } catch (e) {}
    }
    setHasLocalDraft(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(`${kind}_post_draft`);
    setHasLocalDraft(false);
  };

  // --- Validation Logic ---
  const validationErrors: string[] = [];
  if (!viTitle.trim()) validationErrors.push("Cần nhập tiêu đề tiếng Việt.");
  if (!viSummary.trim()) validationErrors.push("Cần nhập mô tả ngắn hoặc trích đoạn tiếng Việt.");
  if (isBodyEmpty(viBody)) validationErrors.push("Cần nhập nội dung tiếng Việt.");
  if (!seoTitleVi.trim()) validationErrors.push("Cần nhập tiêu đề SEO tiếng Việt.");
  if (!seoDescVi.trim()) validationErrors.push("Cần nhập mô tả meta tiếng Việt.");

  if (englishEnabled) {
    if (!enTitle.trim()) validationErrors.push("Cần nhập tiêu đề tiếng Anh khi đã bật tiếng Anh.");
    if (!enSummary.trim()) validationErrors.push("Cần nhập mô tả ngắn hoặc trích đoạn tiếng Anh khi đã bật tiếng Anh.");
    if (isBodyEmpty(enBody)) validationErrors.push("Cần nhập nội dung tiếng Anh khi đã bật tiếng Anh.");
    if (!seoTitleEn.trim()) validationErrors.push("Cần nhập tiêu đề SEO tiếng Anh khi đã bật tiếng Anh.");
    if (!seoDescEn.trim()) validationErrors.push("Cần nhập mô tả meta tiếng Anh khi đã bật tiếng Anh.");
  }

  // Define dynamic readiness items based on current validation errors
  const dynamicReadiness = [
    { 
      label: "Đã hoàn tất trường nội dung gốc tiếng Việt", 
      state: (!viTitle.trim() || !viSummary.trim() || isBodyEmpty(viBody)) ? "warning" : "ready" 
    },
    { 
      label: englishEnabled ? "Bản dịch tiếng Anh đã hoàn tất" : "Không bật tiếng Anh (tùy chọn)", 
      state: (englishEnabled && (!enTitle.trim() || !enSummary.trim() || isBodyEmpty(enBody))) ? "warning" : "ready" 
    },
    { 
      label: isProduct ? (quoteOnly ? "Đang bật trạng thái chỉ nhận báo giá" : "Đã cấu hình khoảng giá") : "Đã gán ảnh bìa và thẻ", 
      state: "ready" as const
    },
    { 
      label: "SEO mặc định và đường dẫn song ngữ đã sẵn sàng", 
      state: (!seoTitleVi.trim() || !seoDescVi.trim() || (englishEnabled && (!seoTitleEn.trim() || !seoDescEn.trim()))) ? "warning" : "ready" 
    },
  ] as const;

  // --- AI Generate Content Mock Logic ---
  const handleAiGenerate = () => {
    if (!aiTopic.trim()) return;
    
    // Check if form contains entered content to warning user about overwrite
    const isFormDirty = viTitle !== "" || viSummary !== "" || viBody !== "";
    if (isFormDirty) {
      setShowOverwriteWarning(true);
    } else {
      triggerAiGeneration();
    }
  };

    const triggerAiGeneration = async () => {
    setShowOverwriteWarning(false);
    setAiLoading(true);

    try {
      const res = await fetch("/api/admin/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "generate-content",
          inputText: aiTopic,
          targetType: kind,
        }),
      });
      const data = await res.json();
      setAiLoading(false);
      if (data.success && data.data && !data.data.error) {
        setAiResult(data.data);
        setShowAiReviewDialog(true);
      } else {
        toast.error(data.error || (data.data && data.data.error) || "Không thể tạo nội dung từ AI.");
      }
    } catch (err) {
      setAiLoading(false);
      toast.error("Lỗi kết nối khi gọi API AI.");
    }
  };

  const applyGeneratedContent = () => {
    if (!aiResult) return;
    setViTitle(aiResult.viTitle);
    setEnTitle(aiResult.enTitle);
    setViSlug(aiResult.viSlug);
    setEnSlug(aiResult.enSlug);
    setViSummary(aiResult.viSummary);
    setEnSummary(aiResult.enSummary);
    setViBody(aiResult.viBody);
    setEnBody(aiResult.enBody);
    setSeoTitleVi(aiResult.seoTitleVi);
    setSeoTitleEn(aiResult.seoTitleEn);
    setSeoDescVi(aiResult.seoDescVi);
    setSeoDescEn(aiResult.seoDescEn);
    
    if (aiResult.materialsVi) setMaterialsVi(aiResult.materialsVi);
    if (aiResult.materialsEn) setMaterialsEn(aiResult.materialsEn);
    if (aiResult.dimensionsVi) setDimensionsVi(aiResult.dimensionsVi);
    if (aiResult.dimensionsEn) setDimensionsEn(aiResult.dimensionsEn);
    if (aiResult.specMaterialVi) setSpecMaterialVi(aiResult.specMaterialVi);
    if (aiResult.specMaterialEn) setSpecMaterialEn(aiResult.specMaterialEn);
    if (aiResult.specFinishVi) setSpecFinishVi(aiResult.specFinishVi);
    if (aiResult.specFinishEn) setSpecFinishEn(aiResult.specFinishEn);
    if (aiResult.specCareVi) setSpecCareVi(aiResult.specCareVi);
    if (aiResult.specCareEn) setSpecCareEn(aiResult.specCareEn);
    
    setEnglishEnabled(true);
    setShowAiReviewDialog(false);
  };

  // --- AI Translate Action Logic ---
  const handleAiTranslate = () => {
    if (!viTitle.trim()) return;
    setAiTranslating(true);
    setAiTranslateSuccess(false);

    setTimeout(() => {
      setAiTranslating(false);
      setAiTranslateSuccess(true);
      
      setEnTitle(`${viTitle} - English draft`);
      setEnSlug(`${viSlug}-en`);
      setEnSummary(`English translated preview of the Vietnamese text: ${viSummary}`);
      setEnBody(`<p>English translated body context:</p>${viBody}`);
      
      // SEO & Localized slug readiness
      setSeoTitleEn(seoTitleVi ? `Premium ${seoTitleVi}` : `${viTitle} - Premium Furniture | Phuong Dong`);
      setSeoDescEn(seoDescVi ? `English metadata: ${seoDescVi}` : `Discover ${viTitle} at Phuong Dong Showroom. Premium quality, modern design.`);
      
      // Price, dimensions and specifications
      if (materialsVi) setMaterialsEn(`${materialsVi} (English translation)`);
      else setMaterialsEn("Premium materials (English draft)");
      
      if (dimensionsVi) setDimensionsEn(dimensionsVi);
      else setDimensionsEn("Standard size");
      
      if (specMaterialVi) setSpecMaterialEn(`${specMaterialVi} (English translation)`);
      else setSpecMaterialEn("Premium solid wood");
      
      if (specFinishVi) setSpecFinishEn(`${specFinishVi} (English translation)`);
      else setSpecFinishEn("Refined matte coat");
      
      if (specCareVi) setSpecCareEn(`${specCareVi} (English translation)`);
      else setSpecCareEn("Wipe with dry soft cloth");
    }, 1200);
  };

  const handleSave = async (targetStatus?: "draft" | "published" | "archived") => {
    const statusToSave = targetStatus || status;
    try {
      if (isProduct) {
        const { createAdminProduct, updateAdminProduct } = await import("@/lib/supabase/mutations");
        const { getAdminCategories } = await import("@/lib/supabase/admin-queries");
        const { getAdminBrands } = await import("@/lib/supabase/brands-mutations");

        const cats = await getAdminCategories();
        const catList = Array.isArray(cats) ? cats : cats?.data || [];
        const catObj = catList.find(c => c.slug === category) || catList[0];
        const categoryId = catObj ? catObj.id : null;

        const brands = await getAdminBrands();
        const brandsList = Array.isArray(brands) ? brands : (brands as any)?.data || [];
        const brandObj = brandsList.find((b: any) => b.id === brand || b.name?.vi === brand || b.name === brand) || brandsList[0];
        const brandId = brandObj ? brandObj.id : null;

        if (!categoryId) {
          toast.error("Không tìm thấy danh mục hợp lệ.");
          return;
        }

        const productData = {
          reference_code: refCode,
          slug: viSlug,
          name_vi: viTitle,
          name_en: enTitle || null,
          summary_vi: viSummary,
          summary_en: enSummary || null,
          description_json_vi: viBody,
          description_json_en: enBody || null,
          material_vi: materialsVi || null,
          material_en: materialsEn || null,
          price_display_text_vi: quoteOnly ? "Liên hệ" : `${parseInt(price.replace(/[^0-9]/g, "") || "0").toLocaleString("vi-VN")} VND`,
          price_display_text_en: quoteOnly ? "Contact" : `${parseInt(price.replace(/[^0-9]/g, "") || "0").toLocaleString("en-US")} VND`,
          dimension_display_text_vi: dimensionsVi || null,
          dimension_display_text_en: dimensionsEn || null,
          category_id: categoryId,
          price_min: price ? parseFloat(price.replace(/[^0-9]/g, "")) : null,
          price_max: null,
          currency: "VND",
          brand_id: brandId,
          brand_series: null,
          featured: featured,
          status: statusToSave,
          cover_image: coverImage || null,
          gallery_images: galleryImages || [],
          specifications: {
            material_vi: specMaterialVi || null,
            material_en: specMaterialEn || null,
            finish_vi: specFinishVi || null,
            finish_en: specFinishEn || null,
            care_vi: specCareVi || null,
            care_en: specCareEn || null,
          },
          custom_attributes: customAttributes.map(attr => ({
            name_vi: attr.nameVi,
            name_en: attr.nameEn,
            value_vi: attr.valueVi,
            value_en: attr.valueEn,
          })),
          seo_title_vi: seoTitleVi || null,
          seo_title_en: seoTitleEn || null,
          seo_description_vi: seoDescVi || null,
          seo_description_en: seoDescEn || null,
          dimension_unit: "mm",
        };

        const res = mode === "create"
          ? await createAdminProduct(productData)
          : await updateAdminProduct(entityId || idOrSlug!, productData);

        if (res.success) {
          toast.success(statusToSave === "published" ? "Đã xuất bản thành công!." : "Đã lưu bản nháp thành công!.");
          router.push("/admin/products");
          router.refresh();
        } else {
          toast.error("Lỗi khi lưu sản phẩm: " + res.error);
        }
      } else {
        const { createAdminBlogPost, updateAdminBlogPost } = await import("@/lib/supabase/mutations");
        const blogData = {
          slug: viSlug,
          title_vi: viTitle,
          title_en: enTitle || null,
          excerpt_vi: viSummary,
          excerpt_en: enSummary || null,
          body_json_vi: viBody,
          body_json_en: enBody || null,
          category_id: category || "insights",
          status: statusToSave,
          featured: featured,
          cover_image: coverImage || null,
          seo_title_vi: seoTitleVi || null,
          seo_title_en: seoTitleEn || null,
          seo_description_vi: seoDescVi || null,
          seo_description_en: seoDescEn || null,
        };

        const res = mode === "create"
          ? await createAdminBlogPost(blogData)
          : await updateAdminBlogPost(entityId || idOrSlug!, blogData);

        if (res.success) {
          toast.success(statusToSave === "published" ? "Đã xuất bản thành công!." : "Đã lưu bản nháp thành công!.");
          router.push("/admin/blog");
          router.refresh();
        } else {
          toast.error("Lỗi khi lưu bài viết: " + res.error);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống: " + String(err));
    }
  };

  if (isLoadingEdit) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold">Đang tải thông tin chỉnh sửa...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-slate-400 p-8 text-center">
        <AlertTriangle className="size-8 text-rose-500" />
        <p className="text-sm font-semibold text-rose-500">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        {isProduct && (
          <p className="text-xs text-[var(--admin-text-muted)] font-medium">
            Trình soạn thảo sản phẩm ưu tiên tiếng Việt
          </p>
        )}
        
        {/* --- DRAFT RECOVERY CALLOUT --- */}
        {hasLocalDraft && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-900 shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="size-4 text-indigo-600 animate-bounce" />
              <span>Phát hiện bản nháp chưa lưu gần nhất ({draftTimestamp}). Bạn có muốn khôi phục lại không?</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="button-pd-outline py-1 px-3 text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold"
                onClick={discardDraft}
              >
                Xóa bản nháp
              </button>
              <button
                type="button"
                className="button-pd py-1 px-4 text-xs bg-indigo-600 text-white font-semibold"
                onClick={restoreDraft}
              >
                Khôi phục bản nháp
              </button>
            </div>
          </div>
        )}
        
        {/* --- AI GENERATOR WORKSPACE (Elevated Business Assistant) --- */}
        <section className="rounded-2xl border-2 border-dashed border-[var(--admin-accent)] bg-gradient-to-r from-purple-50/50 to-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Bot className="size-6 text-[var(--admin-accent)] animate-pulse" />
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">Trợ lý biên tập AI</h3>
              <p className="text-xs text-secondary">Nhập chủ đề thô để tự động sinh toàn bộ nội dung song ngữ, slug và cấu trúc chuẩn SEO.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <textarea
              className="input-pd min-h-16 bg-white border-[var(--admin-border-strong)]"
              placeholder={isProduct ? "Ví dụ: Bàn ăn gỗ óc chó 6 ghế, phong cách Heritage tối giản..." : "Ví dụ: Hướng dẫn chăm sóc và làm bóng bề mặt đồ gỗ tự nhiên..."}
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Lưu ý: Luôn có bước phê duyệt thủ công trước khi ghi đè dữ liệu.
              </span>
              <button
                type="button"
                className="button-pd px-5 flex items-center gap-2"
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiTopic.trim()}
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang tạo nháp...
                  </>
                ) : (
                  <>
                    <WandSparkles className="size-4" />
                    Tạo bản nháp song ngữ
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* --- BILINGUAL AUTHORING TABS --- */}
        <BilingualAuthoringFields
          kind={kind}
          viTitle={viTitle}
          setViTitle={setViTitle}
          enTitle={enTitle}
          setEnTitle={setEnTitle}
          viSlug={viSlug}
          setViSlug={setViSlug}
          enSlug={enSlug}
          setEnSlug={setEnSlug}
          viSummary={viSummary}
          setViSummary={setViSummary}
          enSummary={enSummary}
          setEnSummary={setEnSummary}
          viBody={viBody}
          setViBody={setViBody}
          enBody={enBody}
          setEnBody={setEnBody}
          englishEnabled={englishEnabled}
          setEnglishEnabled={setEnglishEnabled}
          aiTranslating={aiTranslating}
          aiTranslateSuccess={aiTranslateSuccess}
          handleAiTranslate={handleAiTranslate}
        />

        {/* --- SHARED STRUCTURED DATA FIELDS (Excluded from tabs to avoid duplicates) --- */}
        {isProduct ? (
          <ProductBusinessFields
            price={price}
            setPrice={setPrice}
            quoteOnly={quoteOnly}
            setQuoteOnly={setQuoteOnly}
            category={category}
            setCategory={setCategory}
            brand={brand}
            setBrand={setBrand}
            refCode={refCode}
            setRefCode={setRefCode}
            showroom={showroom}
            setShowroom={setShowroom}
            featured={featured}
            setFeatured={setFeatured}
            materialsVi={materialsVi}
            setMaterialsVi={setMaterialsVi}
            materialsEn={materialsEn}
            setMaterialsEn={setMaterialsEn}
            dimensionsVi={dimensionsVi}
            setDimensionsVi={setDimensionsVi}
            dimensionsEn={dimensionsEn}
            setDimensionsEn={setDimensionsEn}
            specMaterialVi={specMaterialVi}
            setSpecMaterialVi={setSpecMaterialVi}
            specMaterialEn={specMaterialEn}
            setSpecMaterialEn={setSpecMaterialEn}
            specFinishVi={specFinishVi}
            setSpecFinishVi={setSpecFinishVi}
            specFinishEn={specFinishEn}
            setSpecFinishEn={setSpecFinishEn}
            specCareVi={specCareVi}
            setSpecCareVi={setSpecCareVi}
            specCareEn={specCareEn}
            setSpecCareEn={setSpecCareEn}
            englishEnabled={englishEnabled}
            galleryImages={galleryImages}
            setGalleryImages={setGalleryImages}
            customAttributes={customAttributes}
            setCustomAttributes={setCustomAttributes}
          />
        ) : (
          <BlogBusinessFields
            category={category}
            setCategory={setCategory}
            status={status}
            setStatus={setStatus}
            featured={featured}
            setFeatured={setFeatured}
          />
        )}

        {/* --- SEO FIELDSET --- */}
        <SeoFieldset
          kind={kind}
          seoTitleVi={seoTitleVi}
          setSeoTitleVi={setSeoTitleVi}
          seoTitleEn={seoTitleEn}
          setSeoTitleEn={setSeoTitleEn}
          seoDescVi={seoDescVi}
          setSeoDescVi={setSeoDescVi}
          seoDescEn={seoDescEn}
          setSeoDescEn={setSeoDescEn}
          englishEnabled={englishEnabled}
          viTitle={viTitle}
          enTitle={enTitle}
        />
      </div>

      <aside className="space-y-5">
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Ảnh bìa {isProduct ? "sản phẩm" : "bài viết"}</h3>
          <ImageUploadDropzone 
            value={coverImage} 
            onChange={setCoverImage} 
            label={isProduct ? "Tải ảnh sản phẩm lên" : "Tải ảnh bài viết lên"} 
          />
        </section>
        <section className="surface-soft p-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold hover:from-sky-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-4" />
            Xem trước
          </button>
        </section>
        <ReadinessPanel items={dynamicReadiness} />
        <PublishWorkflow 
          status={status}
          onStatusChange={setStatus}
          errors={validationErrors} 
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
        />
      </aside>

      {/* --- OVERWRITE CONFIRMATION DIALOG --- */}
      {showOverwriteWarning && (
        <div className="fixed inset-0 z-[calc(var(--z-modal)+1)] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-orange-200 shadow-xl">
            <h4 className="font-heading text-lg font-bold text-orange-700 flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Ghi đè nội dung?
            </h4>
            <p className="mt-2 text-sm text-secondary">
              Bạn đang có các nội dung trong form chỉnh sửa. Việc tạo nội dung AI mới sẽ ghi đè toàn bộ dữ liệu hiện tại. Bạn có muốn tiếp tục?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="button-pd-outline py-1.5 text-xs"
                onClick={() => setShowOverwriteWarning(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="button-pd bg-orange-600 hover:bg-orange-700 py-1.5 text-xs text-white"
                onClick={triggerAiGeneration}
              >
                Tiếp tục & Ghi đè
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AI REVIEW & APPROVAL DIALOG --- */}
      {showAiReviewDialog && aiResult && (
        <div className="fixed inset-0 z-[calc(var(--z-modal)+1)] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border overflow-hidden">
            <div className="bg-indigo-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-yellow-300" />
                <h4 className="font-heading text-lg font-bold">Kiểm duyệt nội dung AI tạo</h4>
              </div>
              <button 
                type="button" 
                className="text-white/70 hover:text-white"
                onClick={() => setShowAiReviewDialog(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <h5 className="font-semibold text-primary text-xs uppercase tracking-wider mb-3">Tiếng Việt</h5>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tiêu đề</span>
                      <p className="text-sm font-semibold">{aiResult.viTitle}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Đường dẫn</span>
                      <p className="text-xs font-mono">{aiResult.viSlug}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Mô tả ngắn</span>
                      <p className="text-xs text-secondary leading-relaxed">{aiResult.viSummary}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tiêu đề SEO</span>
                      <p className="text-xs text-secondary">{aiResult.seoTitleVi}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <h5 className="font-semibold text-indigo-950 text-xs uppercase tracking-wider mb-3">Tiếng Anh</h5>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tiêu đề</span>
                      <p className="text-sm font-semibold text-indigo-900">{aiResult.enTitle}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Đường dẫn</span>
                      <p className="text-xs font-mono text-indigo-800">{aiResult.enSlug}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Mô tả ngắn</span>
                      <p className="text-xs text-secondary leading-relaxed">{aiResult.enSummary}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tiêu đề SEO</span>
                      <p className="text-xs text-secondary">{aiResult.seoTitleEn}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t bg-slate-50 px-6 py-4 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-semibold">
                Dữ liệu sẽ được tự động điền vào các trường tương ứng trên biểu mẫu chính.
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="button-pd-outline"
                  onClick={() => setShowAiReviewDialog(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="button-pd px-6"
                  onClick={applyGeneratedContent}
                >
                  <BadgeCheck className="size-4" />
                  Đồng ý và điền vào biểu mẫu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAIL PREVIEW MODAL --- */}
      {previewOpen && (
        <DetailPreviewModal
          kind={kind}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={{
            viTitle, enTitle, viSummary, enSummary, viBody, enBody,
            coverImage, galleryImages,
            price, quoteOnly, refCode, brand,
            materialsVi, materialsEn, dimensionsVi, dimensionsEn,
            specMaterialVi, specMaterialEn, specFinishVi, specFinishEn,
            specCareVi, specCareEn, customAttributes,
            category,
          }}
        />
      )}
    </div>
  );
}

function BilingualAuthoringFields({
  kind,
  viTitle,
  setViTitle,
  enTitle,
  setEnTitle,
  viSlug,
  setViSlug,
  enSlug,
  setEnSlug,
  viSummary,
  setViSummary,
  enSummary,
  setEnSummary,
  viBody,
  setViBody,
  enBody,
  setEnBody,
  englishEnabled,
  setEnglishEnabled,
  aiTranslating,
  aiTranslateSuccess,
  handleAiTranslate,
}: {
  kind: ContentKind;
  viTitle: string;
  setViTitle: (val: string) => void;
  enTitle: string;
  setEnTitle: (val: string) => void;
  viSlug: string;
  setViSlug: (val: string) => void;
  enSlug: string;
  setEnSlug: (val: string) => void;
  viSummary: string;
  setViSummary: (val: string) => void;
  enSummary: string;
  setEnSummary: (val: string) => void;
  viBody: string;
  setViBody: (val: string) => void;
  enBody: string;
  setEnBody: (val: string) => void;
  englishEnabled: boolean;
  setEnglishEnabled: (val: boolean) => void;
  aiTranslating: boolean;
  aiTranslateSuccess: boolean;
  handleAiTranslate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");
  const titleLabel = kind === "product" ? "Tiêu đề sản phẩm" : "Tiêu đề bài viết";
  const summaryLabel = kind === "product" ? "Mô tả ngắn / tóm tắt" : "Trích đoạn";

  // Calculate inline error counts
  const viErrorsCount = [viTitle, viSummary].filter(val => !val.trim()).length + (isBodyEmpty(viBody) ? 1 : 0);
  const enErrorsCount = englishEnabled ? ([enTitle, enSummary].filter(val => !val.trim()).length + (isBodyEmpty(enBody) ? 1 : 0)) : 0;

  return (
    <section className="surface-soft p-4">
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Languages className="size-5 text-[var(--admin-accent)]" />
            <h3 className="admin-section-title-pd">Biên tập nội dung song ngữ</h3>
          </div>
          <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
            Tiếng Việt là nguồn biên tập chính. Bật tiếng Anh khi cần lưu bản dịch song ngữ.
          </p>
        </div>
        
        <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 w-full md:max-w-2xl ${
          englishEnabled 
            ? "border-indigo-200 bg-gradient-to-r from-indigo-50/30 to-violet-50/30 shadow-[0_4px_20px_rgba(99,102,241,0.06)]" 
            : "border-slate-200 bg-slate-50/40"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-lg p-2 ${englishEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
              <Languages className="size-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Dịch nội dung sang tiếng Anh
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                Kích hoạt dịch tiếng Anh cho tên, mô tả, thông số kỹ thuật, slug và các thẻ SEO.
              </span>
            </div>
          </div>
          
          <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={englishEnabled}
              aria-label="Bật trường tiếng Anh"
              onChange={(e) => {
                setEnglishEnabled(e.target.checked);
                if (e.target.checked) setActiveTab("en");
                else setActiveTab("vi");
              }}
            />
            <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-slate-300 bg-slate-200 transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.1)] after:transition-transform peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>

      {/* --- TAB HEADERS --- */}
      <div className="mt-4 flex gap-2" role="tablist" aria-label="Tab nội dung song ngữ">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "vi"}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition flex items-center gap-2 ${
            activeTab === "vi" 
              ? "bg-slate-900 text-white border-slate-900" 
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
          onClick={() => setActiveTab("vi")}
        >
          Tiếng Việt
          {viErrorsCount > 0 && (
            <span className="size-2 rounded-full bg-red-500" title={`Thiếu ${viErrorsCount} trường`} />
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "en"}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition flex items-center gap-2 ${
            activeTab === "en" 
              ? "bg-slate-900 text-white border-slate-900" 
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          } ${!englishEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => englishEnabled && setActiveTab("en")}
        >
          Tiếng Anh
          {englishEnabled && enErrorsCount > 0 && (
            <span className="size-2 rounded-full bg-red-500 animate-pulse" title={`Thiếu ${enErrorsCount} trường`} />
          )}
        </button>
      </div>

      {/* --- TAB CONTENT: VIETNAMESE --- */}
      {activeTab === "vi" && (
        <div className="mt-4 rounded-xl border border-[var(--admin-border)] bg-white p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tab 1: Tiếng Việt (nguồn biên tập chính)</span>
            {viErrorsCount > 0 && (
              <span className="text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                Thiếu {viErrorsCount} trường bắt buộc
              </span>
            )}
          </div>
          
          <AdminField
            label={`${titleLabel} - Tiếng Việt *`}
            name={`${kind}-title-vi`}
            value={viTitle}
            onChange={setViTitle}
            placeholder="Nhập tiêu đề tiếng Việt..."
          />
          {!viTitle.trim() && <p className="text-red-500 text-xs mt-1">Vui lòng điền tiêu đề tiếng Việt.</p>}

          <div className="grid gap-1.5">
            <AdminField 
              label="Đường dẫn - Tiếng Việt *" 
              name={`${kind}-slug-vi`} 
              value={viSlug}
              onChange={setViSlug}
              placeholder="sofa-curve-velour"
            />
            {viSlug && (
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ⚡ Tự động từ tiêu đề. Có thể sửa thủ công.
              </p>
            )}
          </div>

          <AdminField
            label={`${summaryLabel} - Tiếng Việt *`}
            name={`${kind}-summary-vi`}
            value={viSummary}
            onChange={setViSummary}
            multiline
            placeholder="Nhập mô tả ngắn..."
          />
          {!viSummary.trim() && <p className="text-red-500 text-xs mt-1">Vui lòng điền mô tả ngắn.</p>}

          <div className="grid gap-2">
            <span className="label-pd">Nội dung chi tiết - Tiếng Việt *</span>
            <RichTextEditorMock 
              value={viBody}
              onChange={setViBody}
              placeholder="Nhập chi tiết nội dung tiếng Việt ở đây..."
            />
            {isBodyEmpty(viBody) && <p className="text-red-500 text-xs mt-1">Vui lòng điền nội dung chi tiết.</p>}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: ENGLISH --- */}
      {activeTab === "en" && englishEnabled && (
        <div className="mt-4 rounded-xl border border-[var(--admin-border)] bg-indigo-50/20 p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2 border-indigo-100">
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Tab 2: Bản dịch tiếng Anh</span>
            
            <button
              type="button"
              className="button-pd-outline py-1 px-3 text-xs bg-white text-indigo-700 hover:text-indigo-900 border-indigo-200"
              onClick={handleAiTranslate}
              disabled={aiTranslating || !viTitle.trim()}
              aria-label="Dịch từ tiếng Việt bằng AI"
            >
              {aiTranslating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Đang dịch bằng AI...
                </>
              ) : (
                <>
                  <Languages className="size-3.5" />
                  Dịch bằng AI
                </>
              )}
            </button>
          </div>

          {aiTranslateSuccess && (
            <p className="text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2 rounded">
              AI đã điền các trường tiếng Anh. Hãy xem và hiệu chỉnh thủ công nếu cần.
            </p>
          )}

          <AdminField
            label={`${titleLabel} - Tiếng Anh`}
            name={`${kind}-title-en`}
            value={enTitle}
            onChange={setEnTitle}
            placeholder="Nhập tiêu đề tiếng Anh..."
          />
          {!enTitle.trim() && <p className="text-red-500 text-xs mt-1">Cần nhập tiêu đề tiếng Anh.</p>}

          <div className="grid gap-1.5">
            <AdminField 
              label="Đường dẫn - Tiếng Anh *" 
              name={`${kind}-slug-en`} 
              value={enSlug}
              onChange={setEnSlug}
              placeholder="sofa-curve-velour-en"
            />
            {enSlug && (
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ⚡ Tự động từ tiêu đề tiếng Anh. Có thể sửa thủ công.
              </p>
            )}
          </div>

          <AdminField
            label={`${summaryLabel} - Tiếng Anh *`}
            name={`${kind}-summary-en`}
            value={enSummary}
            onChange={setEnSummary}
            multiline
            placeholder="Nhập mô tả ngắn tiếng Anh..."
          />
          {!enSummary.trim() && <p className="text-red-500 text-xs mt-1">Cần nhập mô tả ngắn tiếng Anh.</p>}

          <div className="grid gap-2">
            <span className="label-pd">Nội dung chi tiết - Tiếng Anh *</span>
            <RichTextEditorMock 
              value={enBody}
              onChange={setEnBody}
              placeholder="Nhập nội dung tiếng Anh..."
            />
            {isBodyEmpty(enBody) && <p className="text-red-500 text-xs mt-1">Cần nhập nội dung tiếng Anh.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function ProductBusinessFields({
  price,
  setPrice,
  quoteOnly,
  setQuoteOnly,
  category,
  setCategory,
  brand,
  setBrand,
  refCode,
  setRefCode,
  showroom,
  setShowroom,
  featured,
  setFeatured,
  materialsVi,
  setMaterialsVi,
  materialsEn,
  setMaterialsEn,
  dimensionsVi,
  setDimensionsVi,
  dimensionsEn,
  setDimensionsEn,
  specMaterialVi,
  setSpecMaterialVi,
  specMaterialEn,
  setSpecMaterialEn,
  specFinishVi,
  setSpecFinishVi,
  specFinishEn,
  setSpecFinishEn,
  specCareVi,
  setSpecCareVi,
  specCareEn,
  setSpecCareEn,
  englishEnabled,
  galleryImages,
  setGalleryImages,
  customAttributes,
  setCustomAttributes,
}: {
  price: string;
  setPrice: (val: string) => void;
  quoteOnly: boolean;
  setQuoteOnly: (val: boolean) => void;
  category: string;
  setCategory: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  refCode: string;
  setRefCode: (val: string) => void;
  showroom: string;
  setShowroom: (val: string) => void;
  featured: boolean;
  setFeatured: (val: boolean) => void;
  materialsVi: string;
  setMaterialsVi: (val: string) => void;
  materialsEn: string;
  setMaterialsEn: (val: string) => void;
  dimensionsVi: string;
  setDimensionsVi: (val: string) => void;
  dimensionsEn: string;
  setDimensionsEn: (val: string) => void;
  specMaterialVi: string;
  setSpecMaterialVi: (val: string) => void;
  specMaterialEn: string;
  setSpecMaterialEn: (val: string) => void;
  specFinishVi: string;
  setSpecFinishVi: (val: string) => void;
  specFinishEn: string;
  setSpecFinishEn: (val: string) => void;
  specCareVi: string;
  setSpecCareVi: (val: string) => void;
  specCareEn: string;
  setSpecCareEn: (val: string) => void;
  englishEnabled: boolean;
  galleryImages: string[];
  setGalleryImages: (urls: string[]) => void;
  customAttributes: { id: string; nameVi: string; nameEn: string; valueVi: string; valueEn: string; }[];
  setCustomAttributes: (attrs: { id: string; nameVi: string; nameEn: string; valueVi: string; valueEn: string; }[]) => void;
}) {
  const [categoriesList, setCategoriesList] = useState<{ value: string; label: string }[]>([]);
  const [brandsList, setBrandsList] = useState<{ value: string; label: string }[]>([]);
  const [showroomsList, setShowroomsList] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let active = true;
    const loadOptions = async () => {
      try {
        const { getAdminCategories, getAdminShowrooms } = await import("@/lib/supabase/admin-queries");
        const { getAdminBrands } = await import("@/lib/supabase/brands-mutations");
        
        const cats = await getAdminCategories();
        const brands = await getAdminBrands();
        const rooms = await getAdminShowrooms();
        
        if (!active) return;
        
        const catsList = Array.isArray(cats) ? cats : (cats as any)?.data || [];
        const formattedCats = catsList.map((c: any) => {
          const parent = c.parent_id ? catsList.find((p: any) => p.id === c.parent_id) : null;
          const parentName = parent ? parent.name : "";
          return {
            value: c.slug,
            label: parentName ? `${parentName} → ${c.name}` : c.name
          };
        });
        setCategoriesList(formattedCats);
        const brandsArr = Array.isArray(brands) ? brands : (brands as any)?.data || [];
        setBrandsList(brandsArr.map((b: any) => ({ value: b.id, label: b.name?.vi || b.name || "" })));
        const roomsArr = Array.isArray(rooms) ? rooms : (rooms as any)?.data || [];
        setShowroomsList(roomsArr.map((r: any) => ({ value: r.code || r.id, label: r.name?.vi || r.name || "" })));
      } catch (err) {
        console.error("Lỗi khi tải danh mục/thương hiệu/showroom động:", err);
      }
    };
    loadOptions();
    return () => {
      active = false;
    };
  }, []);

  const categoryOptions = categoriesList.some(c => c.value === category)
    ? categoriesList
    : [{ value: category, label: category === "wood" ? "Đồ gỗ / Sofa" : category === "sanitary" ? "Thiết bị vệ sinh / Sen tắm" : category === "tiles" ? "Gạch ốp lát / Bề mặt hoàn thiện" : category }, ...categoriesList];

  const brandOptions = brandsList.some(b => b.value === brand)
    ? brandsList
    : (brand ? [{ value: brand, label: brand }, ...brandsList] : brandsList);

  const showroomOptions = showroomsList.some(s => s.value === showroom)
    ? showroomsList
    : [
        { value: showroom, label: showroom === "district-7" ? "Showroom Quận 7" : showroom === "hanoi" ? "Showroom đối tác Hà Nội" : showroom === "project-only" ? "Chỉ tư vấn dự án" : showroom },
        ...showroomsList
      ];

  return (
    <>
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Package}
          title="Ánh xạ danh mục, showroom và báo giá"
          description="Đây là hồ sơ sản phẩm ưu tiên báo giá, không phải SKU thương mại điện tử hoặc mặt hàng tồn kho."
          compact
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="label-pd">Danh mục sản phẩm</span>
            <PremiumSelect
              value={category}
              onValueChange={setCategory}
              ariaLabel="Danh mục sản phẩm"
              placeholder="Danh mục sản phẩm"
              tone="admin"
              options={categoryOptions}
            />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Thương hiệu / Dòng sản phẩm</span>
            <PremiumSelect
              value={brand}
              onValueChange={setBrand}
              ariaLabel="Thương hiệu"
              placeholder="Chọn thương hiệu"
              tone="admin"
              options={brandOptions}
            />
          </label>
          <AdminField label="Mã sản phẩm" name="reference-code" value={refCode} onChange={setRefCode} />
          <label className="grid gap-2">
            <span className="label-pd">Showroom</span>
            <PremiumSelect
              value={showroom}
              onValueChange={setShowroom}
              ariaLabel="Showroom"
              placeholder="Chọn showroom"
              tone="admin"
              options={showroomOptions}
            />
          </label>
          <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3 text-sm">
            <input 
              className="mt-1" 
              type="checkbox" 
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)} 
            />
            <span>
              <strong className="block text-[var(--admin-text)]">Sản phẩm nổi bật</strong>
              <span className="text-[var(--admin-text-muted)]">Có thể hiển thị ở trang chủ và khu vực nổi bật trong danh mục.</span>
            </span>
          </label>
        </div>
      </section>

      <section className="surface-soft p-4 space-y-4">
        <WorkflowIntro
          icon={ImageUp}
          title="Thư viện ảnh sản phẩm"
          description="Tải nhiều ảnh để giới thiệu chi tiết sản phẩm và bối cảnh không gian cho khách truy cập."
          compact
        />
        <div className="mt-4">
          <MultiImageGalleryUpload value={galleryImages} onChange={setGalleryImages} />
        </div>
      </section>

      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Tag}
          title="Giá, kích thước và thông số"
          description="Hỗ trợ khoảng giá hoặc thông điệp chỉ nhận báo giá, không thêm giỏ hàng, thanh toán, tồn kho hoặc theo dõi đơn hàng."
          compact
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* Price field with formatting */}
          <div className="grid gap-1.5">
            <label htmlFor="product-price" className="label-pd">Giá sản phẩm (VNĐ)</label>
            <input
              id="product-price"
              type="text"
              inputMode="numeric"
              className="input-pd bg-white"
              placeholder="Nhập giá (ví dụ: 18000000)"
              value={price ? formatVnNumber(price) : ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setPrice(raw);
              }}
            />
            {price && (
              <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                💬 {readVnNumber(price)}
              </p>
            )}
            {!price && (
              <p className="text-xs text-slate-400 mt-0.5">
                Nhập số không có dấu phẩy — sẽ tự định dạng.
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3 text-sm">
            <input 
              className="mt-1" 
              type="checkbox" 
              checked={quoteOnly}
              onChange={(e) => setQuoteOnly(e.target.checked)} 
            />
            <span>
              <strong className="block text-[var(--admin-text)]">Chỉ hiển thị báo giá</strong>
              <span className="text-[var(--admin-text-muted)]">Ẩn giá chính xác cho đến khi tư vấn.</span>
            </span>
          </label>
        </div>


        {/* Bilingual Materials and Dimensions */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="bg-slate-50/50 p-4 rounded-xl border space-y-4">
            <p className="text-xs font-bold text-slate-700">Tiếng Việt: Chất liệu và kích thước</p>
            <AdminField label="Chất liệu / hoàn thiện (Tiếng Việt) *" name="materials-vi" value={materialsVi} onChange={setMaterialsVi} />
            <AdminField label="Kích thước (Tiếng Việt) *" name="dimensions-vi" value={dimensionsVi} onChange={setDimensionsVi} />
          </div>
          <div className={`p-4 rounded-xl border space-y-4 ${
            englishEnabled ? "bg-indigo-50/10 border-indigo-100" : "bg-slate-100/50 border-slate-200 opacity-60"
          }`}>
            <p className="text-xs font-bold text-indigo-900">Tiếng Anh: Chất liệu và kích thước</p>
            <AdminField 
              label="Chất liệu / hoàn thiện (Tiếng Anh) *" 
              name="materials-en" 
              value={materialsEn} 
              onChange={setMaterialsEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
            <AdminField 
              label="Kích thước (Tiếng Anh) *" 
              name="dimensions-en" 
              value={dimensionsEn} 
              onChange={setDimensionsEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
          </div>
        </div>

        {/* Bilingual Detailed Specifications */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="bg-slate-50/50 p-4 rounded-xl border space-y-4">
            <p className="text-xs font-bold text-slate-700">Tiếng Việt: Thông số kỹ thuật chi tiết</p>
            <AdminField label="Thông số - Vật liệu (Tiếng Việt) *" name="spec-material-vi" value={specMaterialVi} onChange={setSpecMaterialVi} />
            <AdminField label="Thông số - Hoàn thiện (Tiếng Việt) *" name="spec-finish-vi" value={specFinishVi} onChange={setSpecFinishVi} />
            <AdminField label="Thông số - Bảo dưỡng (Tiếng Việt) *" name="spec-care-vi" value={specCareVi} onChange={setSpecCareVi} />
          </div>

          <div className={`p-4 rounded-xl border space-y-4 ${
            englishEnabled ? "bg-indigo-50/10 border-indigo-100" : "bg-slate-100/50 border-slate-200 opacity-60"
          }`}>
            <p className="text-xs font-bold text-indigo-900">Tiếng Anh: Thông số kỹ thuật chi tiết</p>
            <AdminField 
              label="Thông số - Vật liệu (Tiếng Anh) *" 
              name="spec-material-en" 
              value={specMaterialEn} 
              onChange={setSpecMaterialEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
            <AdminField 
              label="Thông số - Hoàn thiện (Tiếng Anh) *" 
              name="spec-finish-en" 
              value={specFinishEn} 
              onChange={setSpecFinishEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
            <AdminField 
              label="Thông số - Bảo dưỡng (Tiếng Anh) *" 
              name="spec-care-en" 
              value={specCareEn} 
              onChange={setSpecCareEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
          </div>
        </div>
      </section>

      {/* Custom Attributes Section */}
      <section className="surface-soft p-4 space-y-4">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Plus className="size-5 text-[var(--admin-accent)]" />
            <h3 className="admin-section-title-pd">Thuộc tính tùy chỉnh</h3>
          </div>
          <button
            type="button"
            className="button-pd px-3 py-1.5 text-xs flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => {
              setCustomAttributes([
                ...customAttributes,
                {
                  id: Math.random().toString(),
                  nameVi: "",
                  nameEn: "",
                  valueVi: "",
                  valueEn: ""
                }
              ]);
            }}
          >
            <Plus className="size-3.5" />
            Thêm thuộc tính
          </button>
        </div>

        {customAttributes.length === 0 ? (
          <p className="text-xs text-[var(--admin-text-muted)] py-2 text-center font-medium">
            Chưa có thuộc tính tùy chỉnh nào. Nhấn &quot;+ Thêm thuộc tính&quot; để cấu hình thêm.
          </p>
        ) : (
          <div className="space-y-4">
            {customAttributes.map((attr, index) => (
              <div
                key={attr.id}
                className="grid gap-4 items-end bg-white p-4 rounded-xl border md:grid-cols-[1fr_1fr_40px] relative group"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <AdminField
                    label={`Tên thuộc tính (Tiếng Việt) #${index + 1}`}
                    name={`attr-${attr.id}-name-vi`}
                    value={attr.nameVi}
                    onChange={(val) => {
                      const updated = [...customAttributes];
                      updated[index].nameVi = val;
                      setCustomAttributes(updated);
                    }}
                    placeholder="Ví dụ: Xuất xứ"
                  />
                  <AdminField
                    label={`Tên thuộc tính (Tiếng Anh) #${index + 1}`}
                    name={`attr-${attr.id}-name-en`}
                    value={attr.nameEn}
                    onChange={(val) => {
                      const updated = [...customAttributes];
                      updated[index].nameEn = val;
                      setCustomAttributes(updated);
                    }}
                    placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : "Ví dụ: Origin"}
                    disabled={!englishEnabled}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <AdminField
                    label={`Giá trị (Tiếng Việt) #${index + 1}`}
                    name={`attr-${attr.id}-value-vi`}
                    value={attr.valueVi}
                    onChange={(val) => {
                      const updated = [...customAttributes];
                      updated[index].valueVi = val;
                      setCustomAttributes(updated);
                    }}
                    placeholder="Ví dụ: Việt Nam"
                  />
                  <AdminField
                    label={`Giá trị (Tiếng Anh) #${index + 1}`}
                    name={`attr-${attr.id}-value-en`}
                    value={attr.valueEn}
                    onChange={(val) => {
                      const updated = [...customAttributes];
                      updated[index].valueEn = val;
                      setCustomAttributes(updated);
                    }}
                    placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : "Ví dụ: Vietnam"}
                    disabled={!englishEnabled}
                  />
                </div>
                <div className="flex justify-center md:pb-1 pb-2">
                  <button
                    type="button"
                    className="p-2.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition border"
                    onClick={() => {
                      setCustomAttributes(customAttributes.filter((_, i) => i !== index));
                    }}
                    title="Xóa thuộc tính"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function BlogBusinessFields({
  category,
  setCategory,
  status,
  setStatus,
  featured,
  setFeatured,
}: {
  category: string;
  setCategory: (val: string) => void;
  status: string;
  setStatus: (val: any) => void;
  featured: boolean;
  setFeatured: (val: boolean) => void;
}) {
  return (
    <>
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={CalendarClock}
          title="Phân luồng biên tập và xuất bản"
          description="Làm rõ chủ đề, tác giả, lịch xuất bản và trạng thái kiểm duyệt trước khi xuất bản."
          compact
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="label-pd">Danh mục bài viết</span>
            <PremiumSelect
              value={category}
              onValueChange={setCategory}
              ariaLabel="Danh mục bài viết"
              placeholder="Danh mục bài viết"
              tone="admin"
              options={[
                { value: "wood-knowledge", label: "Kiến thức đồ gỗ" },
                { value: "sanitary-guides", label: "Hướng dẫn mua thiết bị vệ sinh" },
                { value: "showroom-news", label: "Tin tức showroom" },
              ]}
            />
          </label>
          <AdminField label="Tác giả" name="author" defaultValue="Đội ngũ biên tập Phương Đông" />
          <AdminField label="Thẻ" name="tags" defaultValue="gỗ óc chó, phòng khách, hướng dẫn vật liệu" />
          <AdminField label="Ngày xuất bản" name="published-at" defaultValue="2026-06-10 09:00" />
          <label className="grid gap-2">
            <span className="label-pd">Trạng thái xuất bản</span>
            <PremiumSelect
              value={status}
              onValueChange={setStatus}
              ariaLabel="Trạng thái xuất bản"
              placeholder="Trạng thái xuất bản"
              tone="admin"
              options={[
                { value: "draft", label: "Bản nháp" },
                { value: "published", label: "Đã xuất bản" },
                { value: "archived", label: "Đã lưu trữ" },
              ]}
            />
          </label>
          <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3 text-sm">
            <input 
              className="mt-1 cursor-pointer" 
              type="checkbox" 
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span>
              <strong className="block text-[var(--admin-text)]">Bài viết nổi bật</strong>
              <span className="text-[var(--admin-text-muted)]">Hiển thị trong khu vực biên tập trên trang chủ.</span>
            </span>
          </label>
        </div>
      </section>

      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={ImageUp}
          title="Ảnh bìa và tệp hỗ trợ"
          description="Cần có ảnh bìa để xuất bản. Thư viện tệp phụ là tùy chọn nhưng nên có văn bản thay thế song ngữ."
          compact
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["Ảnh bìa", "Ảnh chèn trong bài", "Tệp thư viện"].map((label) => (
            <div key={label} className="rounded-[var(--radius-card)] border border-dashed border-[var(--admin-border-strong)] bg-white p-4 text-sm">
              <ImageUp className="size-5 text-[var(--admin-accent)]" />
              <p className="mt-3 font-semibold text-[var(--admin-text)]">{label}</p>
              <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Chọn từ bộ sưu tập media có alt_vi và alt_en.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function SeoFieldset({
  kind,
  seoTitleVi,
  setSeoTitleVi,
  seoTitleEn,
  setSeoTitleEn,
  seoDescVi,
  setSeoDescVi,
  seoDescEn,
  setSeoDescEn,
  englishEnabled,
  viTitle,
  enTitle,
}: {
  kind: ContentKind;
  seoTitleVi: string;
  setSeoTitleVi: (val: string) => void;
  seoTitleEn: string;
  setSeoTitleEn: (val: string) => void;
  seoDescVi: string;
  setSeoDescVi: (val: string) => void;
  seoDescEn: string;
  setSeoDescEn: (val: string) => void;
  englishEnabled: boolean;
  viTitle?: string;
  enTitle?: string;
}) {
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [seoGenSuccess, setSeoGenSuccess] = useState(false);
  const [showSeoWarning, setShowSeoWarning] = useState(false);

  const hasExistingSeo = seoTitleVi.trim() || seoDescVi.trim() || seoTitleEn.trim() || seoDescEn.trim();

  const handleGenerateSeo = () => {
    if (!viTitle?.trim()) {
      setShowSeoWarning(true);
      setTimeout(() => setShowSeoWarning(false), 4000);
      return;
    }
    setShowSeoWarning(false);
    setSeoGenerating(true);
    setSeoGenSuccess(false);

    setTimeout(() => {
      setSeoGenerating(false);
      setSeoGenSuccess(true);

      const titleBase = viTitle;
      setSeoTitleVi(`${titleBase} - Showroom Phương Đông | Đồ gỗ nội thất cao cấp`);
      setSeoDescVi(`Khám phá ${titleBase.toLowerCase()} cao cấp tại Phương Đông. Chất liệu gỗ tự nhiên, thiết kế hiện đại. Nhận tư vấn và báo giá ngay.`);

      if (englishEnabled) {
        const enBase = enTitle || titleBase;
        setSeoTitleEn(`${enBase} - Phuong Dong Showroom | Premium Furniture`);
        setSeoDescEn(`Discover premium ${enBase.toLowerCase()} at Phuong Dong. Natural wood craftsmanship, modern design. Request a consultation today.`);
      }
    }, 800);
  };

  return (
    <section className="surface-soft p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <WorkflowIntro
          icon={Globe2}
          title="SEO và đường dẫn song ngữ"
          description={`Giữ siêu dữ liệu ${kind === "product" ? "sản phẩm" : kind === "blog" ? "bài viết" : kind} rõ ràng cho từng ngôn ngữ được bật trước khi xuất bản.`}
          compact
        />
        <button
          type="button"
          className="button-pd bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none py-1.5 px-3.5 text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
          onClick={handleGenerateSeo}
          disabled={seoGenerating}
        >
          {seoGenerating ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Đang tạo SEO bằng AI...
            </>
          ) : (
            <>
              <WandSparkles className="size-3.5" />
              Tạo SEO bằng AI
            </>
          )}
        </button>
      </div>

      {showSeoWarning && (
        <p className="mt-2 text-red-700 text-xs bg-red-50 border border-red-100 p-2.5 rounded-lg flex items-center gap-2 font-medium">
          <AlertTriangle className="size-4 text-red-600 shrink-0" />
          Vui lòng điền tên sản phẩm / bài viết (Tiếng Việt) trước khi dùng tính năng Tạo SEO bằng AI!
        </p>
      )}

      {hasExistingSeo && !seoGenSuccess && !seoGenerating && (
        <p className="mt-2 text-[11px] text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded border border-orange-100">
          Các trường SEO đã có nội dung. Tạo mới sẽ ghi đè giá trị hiện tại.
        </p>
      )}

      {seoGenSuccess && (
        <p className="mt-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2 rounded flex items-center gap-2">
          <CheckCircle2 className="size-3.5 text-emerald-600" />
          Đã tạo siêu dữ liệu SEO. Vui lòng rà soát và chỉnh sửa khi cần.
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4 bg-white space-y-3">
          <p className="text-xs font-bold text-slate-700">SEO: Tiếng Việt</p>
          <AdminField 
            label="Tiêu đề SEO - Tiếng Việt *" 
            name="seo-title-vi" 
            value={seoTitleVi} 
            onChange={setSeoTitleVi} 
          />
          {!seoTitleVi.trim() && <p className="text-red-500 text-xs">Cần nhập tiêu đề SEO tiếng Việt.</p>}
          
          <AdminField 
            label="Mô tả meta - Tiếng Việt *" 
            name="seo-description-vi" 
            value={seoDescVi} 
            onChange={setSeoDescVi} 
            multiline 
          />
          {!seoDescVi.trim() && <p className="text-red-500 text-xs">Cần nhập mô tả meta tiếng Việt.</p>}
        </div>

        {englishEnabled ? (
          <div className="rounded-xl border border-indigo-100 p-4 bg-indigo-50/10 space-y-3">
            <p className="text-xs font-bold text-indigo-900">SEO: Tiếng Anh</p>
            <AdminField 
              label="Tiêu đề SEO - Tiếng Anh *" 
              name="seo-title-en" 
              value={seoTitleEn} 
              onChange={setSeoTitleEn} 
            />
            {!seoTitleEn.trim() && <p className="text-red-500 text-xs">Cần nhập tiêu đề SEO tiếng Anh.</p>}
            
            <AdminField 
              label="Mô tả meta - Tiếng Anh *" 
              name="seo-description-en" 
              value={seoDescEn} 
              onChange={setSeoDescEn} 
              multiline 
            />
            {!seoDescEn.trim() && <p className="text-red-500 text-xs">Cần nhập mô tả meta tiếng Anh.</p>}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-4 flex items-center justify-center text-xs text-slate-400 text-center">
            Siêu dữ liệu SEO tiếng Anh đang tắt.<br />Bật trường tiếng Anh phía trên để cấu hình.
          </div>
        )}
      </div>
    </section>
  );
}

export function SettingsSection({
  icon: Icon,
  title,
  description,
  fields,
  warning,
  locked,
}: {
  icon: typeof Settings2;
  title: string;
  description: string;
  fields: string[];
  warning?: string;
  locked?: boolean;
}) {
  return (
    <section className="surface-soft p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="admin-section-title-pd">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--admin-text-muted)]">{description}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-[var(--admin-text-muted)]">
        {fields.map((field) => (
          <li key={field} className="flex gap-2 rounded-[var(--radius-card)] bg-white px-3 py-2">
            {locked ? <Lock className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--state-success)]" />}
            {field}
          </li>
        ))}
      </ul>
      {warning ? (
        <p className="mt-4 rounded-[var(--radius-card)] border border-[var(--state-warning)]/25 bg-[var(--state-warning-soft)] px-3 py-2 text-sm font-semibold text-[var(--state-warning)]">
          <AlertTriangle className="mr-1 inline size-4" />
          {warning}
        </p>
      ) : null}
    </section>
  );
}

function WorkflowIntro({
  icon: Icon,
  title,
  description,
  compact,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex items-start gap-3" : "rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-4"}>
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
          <Icon className="size-5" />
        </div>
        <div>
          <h3 className="admin-section-title-pd">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--admin-text-muted)]">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ReadinessPanel({
  items,
}: {
  items: readonly { label: string; state: "ready" | "warning" }[];
}) {
  return (
    <section className="surface-soft p-4">
      <div className="flex items-center gap-2">
        <Info className="size-5 text-[var(--admin-accent)]" />
        <h3 className="admin-section-title-pd">Mức độ sẵn sàng xuất bản</h3>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2 rounded-[var(--radius-card)] bg-white px-3 py-2 text-sm">
            {item.state === "ready" ? (
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[var(--state-success)]" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--state-warning)]" />
            )}
            <span className={item.state === "ready" ? "text-[var(--admin-text)]" : "text-[var(--admin-text-muted)]"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BilingualPair({
  viLabel,
  enLabel,
  viDefault,
  enDefault,
  multiline,
}: {
  viLabel: string;
  enLabel: string;
  viDefault: string;
  enDefault: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AdminField label={viLabel} name={viLabel.toLowerCase().replaceAll(" ", "-")} defaultValue={viDefault} multiline={multiline} />
      <AdminField label={enLabel} name={enLabel.toLowerCase().replaceAll(" ", "-")} defaultValue={enDefault} multiline={multiline} />
    </div>
  );
}

function AdminField({
  label,
  name,
  defaultValue,
  value,
  onChange,
  placeholder,
  inputType = "text",
  min,
  max,
  multiline,
  disabled,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  inputType?: "email" | "number" | "password" | "text" | "url";
  min?: number;
  max?: number;
  multiline?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = inputType === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : inputType;

  return (
    <label className={`grid gap-1.5 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
      <span className="flex items-center gap-1.5 label-pd">
        {label}
        {disabled && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
            <Lock className="size-2.5" />
            Khóa
          </span>
        )}
      </span>
      {multiline ? (
        <textarea
          className={`input-pd min-h-24 ${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed select-none pointer-events-none" : "bg-white"} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
          name={name}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          placeholder={disabled ? "— Không khả dụng —" : placeholder}
          disabled={disabled}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
        />
      ) : (
        <div className="relative flex items-center">
          <input
            className={`input-pd w-full pr-10 ${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white"} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            type={currentType}
            name={name}
            defaultValue={value === undefined ? defaultValue : undefined}
            value={value}
            placeholder={disabled ? "— Không khả dụng —" : placeholder}
            min={min}
            max={max}
            disabled={disabled}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
          />
          {isPassword && !disabled && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-500 hover:text-slate-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
          {disabled && (
            <span className="absolute right-3 text-slate-300 pointer-events-none">
              <Lock className="size-3.5" />
            </span>
          )}
        </div>
      )}
      {error && <span className="text-red-600 text-xs font-medium -mt-1">{error}</span>}
    </label>
  );
}

export function SectionVisibilityCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">{description}</p>
        </div>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
          <input
            type="checkbox"
            className="sr-only peer"
            aria-label={`${title} hiển thị`}
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
          <span>{checked ? "Hiển thị" : "Ẩn"}</span>
        </label>
      </div>
    </div>
  );
}

// --- DETAIL PREVIEW MODAL ---
export interface PreviewData {
  nameVi?: string;
  nameEn?: string;
  coverImage?: string;
  galleryImages?: string[];
  descriptionVi?: string;
  descriptionEn?: string;
  viTitle?: string;
  enTitle?: string;
  viSummary?: string;
  enSummary?: string;
  viBody?: string;
  enBody?: string;
  price?: string;
  quoteOnly?: boolean;
  refCode?: string;
  brand?: string;
  materialsVi?: string;
  materialsEn?: string;
  dimensionsVi?: string;
  dimensionsEn?: string;
  specMaterialVi?: string;
  specMaterialEn?: string;
  specFinishVi?: string;
  specFinishEn?: string;
  specCareVi?: string;
  specCareEn?: string;
  customAttributes?: { id: string; nameVi: string; nameEn: string; valueVi: string; valueEn: string; }[];
  addressVi?: string;
  addressEn?: string;
  hotline?: string;
  hoursVi?: string;
  hoursEn?: string;
  mapsEmbed?: string;
  slug?: string;
  category?: string;
  [key: string]: unknown;
}

