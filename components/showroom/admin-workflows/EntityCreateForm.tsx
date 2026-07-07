"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { friendlySaveError } from "@/lib/admin-error-messages";
import { useEffect, useState } from "react";
import {
  Award,
  BadgePercent,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Eye,
  Languages,
  Loader2,
  Lock,
  Package,
  Plus,
  Search,
  Store,
  Tag,
} from "lucide-react";
import { PremiumSelect } from "../premium-select";
import { VietnamAddressPicker } from "../vietnam-address-picker";
import {
  MediaUploadPanel,
  PublishWorkflow,
} from "../admin-interactions";




import { DateTimePickerField } from "@/components/ui/datetime-picker";
import { assetUrl } from "@/lib/asset-url";


import {
  type EntityKind,
  slugify,
  WorkflowIntro,
  ReadinessPanel,
  AdminField,
  ImageUploadDropzone,
  SeoFieldset,
  DetailPreviewModal,
} from "../admin-workflows";

export function EntityCreateForm({ kind, idOrSlug }: { kind: EntityKind; idOrSlug?: string }) {
  if (kind === "media") return <MediaUploadPanel />;
  if (kind === "user") return <UserCreateEntityForm />;
  if (kind === "showroom") return <ShowroomEntityForm idOrSlug={idOrSlug} />;
  if (kind === "promotion") return <PromotionEntityForm idOrSlug={idOrSlug} />;
  if (kind === "brand") return <BrandEntityForm idOrSlug={idOrSlug} />;
  return <CategoryEntityForm idOrSlug={idOrSlug} />;
}

function UserCreateEntityForm() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("editor");
  const [isActive, setIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setFormError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role, isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Tạo tài khoản quản trị thành công!");
        window.location.href = "/admin/users";
      } else {
        setFormError(data.error || "Có lỗi xảy ra khi tạo tài khoản.");
      }
    } catch (err) {
      setFormError("Lỗi kết nối tới máy chủ.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateUser} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Lock}
          title="Tạo người dùng dành cho quản trị viên"
          description="Tạo tài khoản CMS, gán quyền theo mô hình vai trò A và đồng bộ trực tiếp vào database."
        />
        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {formError}
          </div>
        )}
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="label-pd">Tên hiển thị</span>
            <input
              className="input-pd bg-white"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Email đăng nhập</span>
            <input
              className="input-pd bg-white"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Mật khẩu ban đầu</span>
            <input
              className="input-pd bg-white"
              type="password"
              value={password}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Vai trò</span>
            <PremiumSelect
              value={role}
              onValueChange={setRole}
              ariaLabel="Vai trò"
              placeholder="Vai trò"
              tone="admin"
              options={[
                { value: "editor", label: "Biên tập viên - chỉ quản lý nội dung có thể xuất bản" },
                { value: "admin", label: "Quản trị viên - người dùng, cài đặt, báo giá và toàn bộ nội dung" },
              ]}
            />
          </label>
          <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3 text-sm">
            <input 
              className="mt-1" 
              type="checkbox" 
              checked={isActive} 
              onChange={(e) => setIsActive(e.target.checked)} 
            />
            <span>
              <strong className="block text-[var(--admin-text)]">Tài khoản đang hoạt động</strong>
              <span className="text-[var(--admin-text-muted)]">Người dùng bị tắt không thể truy cập CMS.</span>
            </span>
          </label>
        </div>
      </section>
      <aside className="space-y-5">
        <ReadinessPanel
          items={[
            { label: "Vai trò khớp ma trận quyền của phương án A", state: "ready" },
            { label: "Tài khoản quản trị đầu tiên vẫn do vận hành backend thiết lập", state: "warning" },
            { label: "Mật khẩu sẽ có hiệu lực ngay lập tức", state: "ready" },
          ]}
        />
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Thao tác</h3>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold hover:from-sky-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Tạo tài khoản
              </>
            )}
          </button>
        </section>
      </aside>
    </form>
  );
}

function ShowroomEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { showLoading, hideLoading, showAlert } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = idOrSlug || searchParams.get("edit");
  const isEdit = Boolean(editSlug);

  const [englishEnabled, setEnglishEnabled] = useState(isEdit);
  const [aiFilling, setAiFilling] = useState(false);
  const [aiFillSuccess, setAiFillSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  // (SEO state removed — showrooms have no SEO columns / no public SEO consumer.)

  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [showroomId, setShowroomId] = useState<string | null>(null);
  // Preserved so editing a showroom doesn't reset its manual ordering to 0.
  const [sortOrder, setSortOrder] = useState(0);

  // Bind input states
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [hotline, setHotline] = useState("");
  const [code, setCode] = useState("");
  const [addressVi, setAddressVi] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [hoursVi, setHoursVi] = useState("");
  const [hoursEn, setHoursEn] = useState("");
  // Empty by default so the required + https validation forces a real URL rather than
  // letting a broken "…pb=..." placeholder save through.
  const [mapsEmbed, setMapsEmbed] = useState("");
  const [mapsFallback, setMapsFallback] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Sync state with edit entity
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editSlug) {
      setIsLoadingEdit(true);
      setLoadError("");
      import("@/lib/supabase/mutations")
        .then(async ({ getAdminShowroomByIdOrCode }) => {
          const res = await getAdminShowroomByIdOrCode(editSlug);
          if (res.success && res.data) {
            const match = res.data;
            setShowroomId(match.id || null);
            setNameVi(match.name_vi || "");
            setNameEn(match.name_en || "");
            setAddressVi(match.address_vi || "");
            setAddressEn(match.address_en || "");
            setProvinceCode(match.province_code || "");
            setProvinceName(match.province_name || "");
            setWardCode(match.ward_code || "");
            setWardName(match.ward_name || "");
            // Fallback: legacy rows have no structured street yet — seed it with the old composed
            // address so it stays visible/editable until re-structured via the picker.
            setStreetAddress(match.street_address || (!match.province_code ? (match.address_vi || "") : ""));
            setHotline(match.hotline || "");
            setCode(match.code || "");
            setHoursVi(match.opening_hours_vi || "");
            setHoursEn(match.opening_hours_en || "");
            setMapsEmbed(match.google_maps_embed_url || "");
            setMapsFallback(match.google_maps_fallback_url || "https://maps.google.com/?q=Phuong+Dong");
            setCoverImage(match.cover_image || "");
            setEnglishEnabled(Boolean(match.name_en));
            setStatus(match.status || "draft");
            setSortOrder(match.sort_order ?? 0);
          } else {
            setLoadError(res.error || `Không tìm thấy showroom: ${editSlug}`);
          }
        })
        .catch((err) => {
          console.error("Failed to load showroom for edit:", err);
          setLoadError("Không thể tải dữ liệu showroom từ máy chủ.");
        })
        .finally(() => setIsLoadingEdit(false));
    } else {
      // Clear for create mode
      setShowroomId(null);
      setNameVi("");
      setNameEn("");
      setAddressVi("");
      setAddressEn("");
      setProvinceCode("");
      setProvinceName("");
      setWardCode("");
      setWardName("");
      setStreetAddress("");
      setHotline("");
      setCode("");
      setHoursVi("");
      setHoursEn("");
      setMapsEmbed("");
      setMapsFallback("https://maps.google.com/?q=Phuong+Dong");
      setCoverImage("");
      setEnglishEnabled(false);
      setStatus("draft");
    }
  }, [editSlug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-generate showroom code from nameVi
  useEffect(() => {
    if (!isEdit && nameVi) {
      setCode(slugify(nameVi));
    }
  }, [nameVi, isEdit]);

  const handleAiFill = async () => {
    if (!nameVi.trim() && !addressVi.trim()) return;
    setAiFilling(true);
    setAiFillSuccess(false);
    try {
      const res = await fetch("/api/admin/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "generate-content",
          targetType: "showroom",
          inputText: `Tên showroom: ${nameVi}. Địa chỉ: ${addressVi}.`,
          targetLocale: englishEnabled ? "en" : "vi",
        }),
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data || {};
        if (data.enTitle) {
          setNameEn(data.enTitle.replace(/\s*(?:-|–)\s*Premium Showroom/i, ""));
        } else {
          setNameEn(`${nameVi} Premium Showroom`);
        }
        if (addressVi) setAddressEn(`${addressVi} (English translation)`);
        if (hoursVi) setHoursEn("8:00 AM - 8:00 PM daily");
      } else {
        // Fallback
        setNameEn(`${nameVi} Premium Showroom`);
        if (addressVi) setAddressEn(`${addressVi} (English translation)`);
        if (hoursVi) setHoursEn("8:00 AM - 8:00 PM daily");
      }
      setAiFillSuccess(true);
    } catch {
      // Fallback
      setNameEn(`${nameVi} Premium Showroom`);
      if (addressVi) setAddressEn(`${addressVi} (English translation)`);
      if (hoursVi) setHoursEn("8:00 AM - 8:00 PM daily");
      setAiFillSuccess(true);
    } finally {
      setAiFilling(false);
    }
  };

  const handleSave = async (targetStatus?: "draft" | "published" | "archived") => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const statusToSave = targetStatus || status;

    const payload = {
      code: code.trim().toLowerCase(),
      name_vi: nameVi.trim(),
      name_en: englishEnabled ? nameEn.trim() : "",
      address_vi: addressVi.trim(),
      address_en: englishEnabled ? addressEn.trim() : "",
      province_code: provinceCode || undefined,
      province_name: provinceName || undefined,
      ward_code: wardCode || undefined,
      ward_name: wardName || undefined,
      street_address: streetAddress || undefined,
      opening_hours_vi: hoursVi.trim() || null,
      opening_hours_en: englishEnabled && hoursEn.trim() ? hoursEn.trim() : null,
      hotline: hotline.trim(),
      google_maps_embed_url: mapsEmbed.trim(),
      google_maps_fallback_url: mapsFallback.trim(),
      latitude: null,
      longitude: null,
      status: statusToSave,
      sort_order: Number(sortOrder) || 0,
      cover_image: coverImage || null,
    };

    try {
      const { showroomSchema } = await import("@/lib/validations/admin");
      const validation = showroomSchema.safeParse(payload);
      if (!validation.success) {
        const msgs = validation.error.issues.map((e: any) => e.message).join(". ");
        setSaveError(msgs);
        setIsSaving(false);
        return;
      }

      showLoading(isEdit ? "Đang cập nhật showroom..." : "Đang tạo showroom mới...");
      const { createAdminShowroom, updateAdminShowroom } = await import("@/lib/supabase/mutations");
      let res;
      if (isEdit && showroomId) {
        res = await updateAdminShowroom(showroomId, payload);
      } else {
        res = await createAdminShowroom(payload);
      }

      hideLoading();

      if (res.success) {
        setSaveSuccess(true);
        showAlert(
          "Thành công",
          statusToSave === "published"
            ? (isEdit ? "Cập nhật showroom thành công!" : "Tạo showroom mới thành công!")
            : statusToSave === "archived"
              ? "Đã lưu trữ showroom thành công!"
              : "Đã lưu bản nháp showroom thành công!",
          "success",
          () => {
            router.push("/admin/showrooms");
            router.refresh();
          }
        );
      } else {
        const friendly = friendlySaveError(res.error) || "Không thể lưu showroom.";
        setSaveError(friendly);
        showAlert("Thất bại", friendly, "error");
      }
    } catch (err) {
      hideLoading();
      const friendly = friendlySaveError(err instanceof Error ? err.message : String(err));
      setSaveError(friendly);
      showAlert("Lỗi hệ thống", friendly, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const validationErrors: string[] = [];
  if (!nameVi.trim()) validationErrors.push("Cần nhập tên showroom tiếng Việt.");
  if (!code.trim()) validationErrors.push("Cần nhập mã showroom (code).");
  if (!addressVi.trim()) validationErrors.push("Cần nhập địa chỉ tiếng Việt.");
  if (!hotline.trim()) validationErrors.push("Cần nhập số hotline.");
  if (!mapsEmbed.trim()) validationErrors.push("Cần nhập URL nhúng Google Maps.");
  if (!mapsFallback.trim()) validationErrors.push("Cần nhập URL bản đồ dự phòng.");
  if (englishEnabled && !nameEn.trim()) validationErrors.push("Cần nhập tên showroom tiếng Anh khi đã bật tiếng Anh.");
  if (englishEnabled && !addressEn.trim()) validationErrors.push("Cần nhập địa chỉ tiếng Anh khi đã bật tiếng Anh.");

  if (isLoadingEdit) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Đang tải dữ liệu showroom...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
        <p className="font-semibold">{loadError}</p>
        <button
          type="button"
          className="button-pd mt-4"
          onClick={() => router.push("/admin/showrooms")}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* --- Bật tiếng Anh và điền bằng AI --- */}
        <section className="surface-soft p-4">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-[var(--admin-accent)]" />
              <h3 className="admin-section-title-pd">Bản dịch tiếng Anh</h3>
            </div>
            {englishEnabled && (
              <button
                type="button"
                className="button-pd-outline py-1 px-3 text-xs flex items-center gap-1.5"
                onClick={handleAiFill}
                disabled={aiFilling}
                aria-label="Dịch từ tiếng Việt bằng AI"
              >
                {aiFilling ? (
                  <><Loader2 className="size-3.5 animate-spin" />Đang dịch...</>
                ) : (
                  <><Languages className="size-3.5" />Dịch bằng AI</>
                )}
              </button>
            )}
          </div>
          <div className="mt-4">
            <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 w-full ${
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
                    Kích hoạt dịch tiếng Anh cho tên showroom, địa chỉ, giờ mở cửa và các thẻ SEO.
                  </span>
                </div>
              </div>
              
              <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={englishEnabled}
                  aria-label="Bật trường tiếng Anh"
                  onChange={(e) => setEnglishEnabled(e.target.checked)}
                />
                <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-slate-300 bg-slate-200 transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.1)] after:transition-transform peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
          {aiFillSuccess && (
            <p className="mt-3 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              AI đã điền các trường tiếng Anh. Vui lòng rà soát và chỉnh sửa khi cần.
            </p>
          )}
        </section>

        <section className="surface-soft p-4">
          <WorkflowIntro
            icon={Store}
            title="Hồ sơ showroom"
            description="Lưu tên và địa chỉ song ngữ, hotline công khai, mã nhúng Google Maps, đường dẫn dự phòng và trạng thái xuất bản."
          />
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Tên showroom - Tiếng Việt" 
                name="showroom-name-vi" 
                value={nameVi} 
                onChange={setNameVi} 
              />
              <AdminField 
                label="Tên showroom - Tiếng Anh" 
                name="showroom-name-en" 
                value={nameEn} 
                onChange={setNameEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Đường dây nóng" name="showroom-hotline" value={hotline} onChange={setHotline} />
              <AdminField label="Mã nội bộ (Đường dẫn)" name="showroom-code" value={code} onChange={setCode} disabled={true} />
            </div>

            <div className="grid gap-4">
              <VietnamAddressPicker
                label="Địa chỉ showroom (Tỉnh/Thành phố → Phường/Xã)"
                value={{ provinceCode, provinceName, wardCode, wardName, street: streetAddress }}
                onChange={(v) => {
                  setProvinceCode(v.provinceCode);
                  setProvinceName(v.provinceName);
                  setWardCode(v.wardCode);
                  setWardName(v.wardName);
                  setStreetAddress(v.street);
                  setAddressVi(v.fullAddress);
                  // Vietnamese place names are not translated; keep EN address in sync.
                  setAddressEn(v.fullAddress);
                }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Giờ mở cửa - Tiếng Việt" 
                name="showroom-hours-vi" 
                value={hoursVi} 
                onChange={setHoursVi} 
              />
              <AdminField 
                label="Giờ mở cửa - Tiếng Anh" 
                name="showroom-hours-en" 
                value={hoursEn} 
                onChange={setHoursEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField
                label="URL nhúng Google Maps"
                name="maps-embed"
                value={mapsEmbed}
                placeholder="Dán liên kết https://… (hoặc mã <iframe> — hệ thống tự lấy src)"
                onChange={(v) => {
                  // Google's "Embed a map" gives an <iframe … src="https://…">. Extract
                  // the src so the stored value is the bare https URL the DB CHECK expects.
                  const m = v.match(/src=["']([^"']+)["']/i);
                  setMapsEmbed(m ? m[1] : v);
                }}
              />
              <AdminField label="URL bản đồ dự phòng" name="maps-fallback" value={mapsFallback} placeholder="https://maps.google.com/?q=…" onChange={setMapsFallback} />
            </div>
          </div>
        </section>
        {/* SEO fields removed: showrooms have no SEO columns and no public detail page
            consumes them. (Re-add here + columns on showroom_translations if needed.) */}
      </div>
      <aside className="space-y-5">
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Thứ tự hiển thị</h3>
          <AdminField
            label="Thứ tự hiển thị (Số nhỏ xếp trước)"
            name="showroom-sort-order"
            inputType="number"
            value={String(sortOrder)}
            onChange={(v) => setSortOrder(Number(v) || 0)}
          />
        </section>
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Ảnh bìa showroom</h3>
          <ImageUploadDropzone value={coverImage} onChange={setCoverImage} label="Tải ảnh showroom lên" />
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

        {saveError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <strong className="block font-semibold">Lỗi lưu trữ:</strong>
            <p className="mt-1">{saveError}</p>
          </div>
        )}
        {saveSuccess && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
            <strong className="block font-semibold">Thành công!</strong>
            <p className="mt-1">Dữ liệu showroom đã được lưu trữ vào cơ sở dữ liệu.</p>
          </div>
        )}

        <PublishWorkflow
          status={status}
          onStatusChange={setStatus}
          errors={validationErrors}
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
          canArchive={isEdit}
        />
      </aside>
      {previewOpen && (
        <DetailPreviewModal
          kind="showroom"
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={{
            nameVi, nameEn, coverImage,
            addressVi, addressEn,
            hotline, hoursVi, hoursEn,
            mapsEmbed,
          }}
        />
      )}
    </div>
  );
}

function CategoryEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { showLoading, hideLoading, showAlert } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = idOrSlug || searchParams.get("edit");
  const isEdit = Boolean(editSlug);

  const [englishEnabled, setEnglishEnabled] = useState(isEdit);
  const [aiFilling, setAiFilling] = useState(false);
  const [aiFillSuccess, setAiFillSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [seoTitleVi, setSeoTitleVi] = useState("");
  const [seoDescVi, setSeoDescVi] = useState("");
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoDescEn, setSeoDescEn] = useState("");
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [parentGroup, setParentGroup] = useState("wood");
  const [parentId, setParentId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  // Preserved so editing a category doesn't reset its manual ordering to 0.
  const [sortOrder, setSortOrder] = useState(0);
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  // Auto-set parent category ID for new categories
  useEffect(() => {
    if (!isEdit && categoriesList.length > 0 && !parentId) {
      const firstGroup = categoriesList.find(c => c.parent_id === null);
      if (firstGroup) {
        setParentId(firstGroup.id);
        setParentGroup(firstGroup.group_key || "wooden_furniture");
      }
    }
  }, [categoriesList, isEdit, parentId]);

  // Load all categories for parent selector
  useEffect(() => {
    import("@/lib/supabase/admin-queries").then(async ({ getAdminCategories }) => {
      try {
        const res = await getAdminCategories();
        const cats = Array.isArray(res) ? res : res?.data || [];
        setCategoriesList(cats);
      } catch (err) {
        console.error("Failed to load categories list:", err);
      }
    });
  }, []);

  // Sync state with edit entity from DB
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editSlug) {
      setIsLoadingEdit(true);
      setLoadError("");
      // Use the single-entity loader (NOT the list query): it returns cover_image,
      // name_en, description_en and seo_* — the list query does not, so reading from
      // the list defaulted them to blank and SAVING then wiped the cover, English
      // translation and SEO. This loader round-trips every field correctly.
      import("@/lib/supabase/mutations")
        .then(async ({ getAdminCategoryByIdOrSlug }) => {
          const res = await getAdminCategoryByIdOrSlug(editSlug);
          if (res.success && res.data) {
            const d = res.data;
            setCategoryId(d.id);
            setNameVi(d.name_vi || "");
            setNameEn(d.name_en || "");
            setDescriptionVi(d.description_vi || "");
            setDescriptionEn(d.description_en || "");
            setParentGroup(d.group_key || "wood");
            setParentId(d.parent_id || null);
            setSortOrder(d.sort_order ?? 0);
            setSlug(d.slug || "");
            setCoverImage(d.cover_image || "");
            setSeoTitleVi(d.seo_title_vi || `${d.name_vi || ""} | Đồ Gỗ Phương Đông`);
            setSeoTitleEn(d.seo_title_en || `${d.name_en || d.name_vi || ""} | Phuong Dong`);
            setSeoDescVi(d.seo_description_vi || d.description_vi || "");
            setSeoDescEn(d.seo_description_en || d.description_en || "");
            // Only treat English as "enabled" when it's a real, distinct translation
            // (the mutation always stores an en row that falls back to vi).
            setEnglishEnabled(Boolean(d.name_en && d.name_en !== d.name_vi));
            setStatus(d.status || "draft");
          } else {
            setLoadError(res.error || `Không tìm thấy danh mục: ${editSlug}`);
          }
        })
        .catch((err) => {
          console.error("Failed to load category for edit:", err);
          setLoadError("Không thể tải dữ liệu danh mục từ máy chủ.");
        })
        .finally(() => setIsLoadingEdit(false));
    } else {
      // Clear for create mode
      setCategoryId(null);
      setNameVi("");
      setNameEn("");
      setDescriptionVi("");
      setDescriptionEn("");
      setParentGroup("wood");
      setParentId(null);
      setSlug("");
      setCoverImage("");
      setSeoTitleVi("");
      setSeoDescVi("");
      setSeoTitleEn("");
      setSeoDescEn("");
      setEnglishEnabled(false);
      setStatus("draft");
    }
  }, [editSlug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-slugify category nameVi
  useEffect(() => {
    if (!isEdit && nameVi) {
      setSlug(slugify(nameVi));
    }
  }, [nameVi, isEdit]);

  const handleAiFill = async () => {
    if (!nameVi.trim()) return;
    setAiFilling(true);
    setAiFillSuccess(false);
    try {
      const res = await fetch("/api/admin/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "generate-content",
          targetType: "category",
          inputText: nameVi,
          targetLocale: englishEnabled ? "en" : "vi",
        }),
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data || {};
        if (data.enTitle) setNameEn(data.enTitle);
        if (data.enSummary || data.enBody) setDescriptionEn(data.enSummary || data.enBody);
        if (data.seoTitleVi) setSeoTitleVi(data.seoTitleVi);
        if (data.seoTitleEn) setSeoTitleEn(data.seoTitleEn);
        if (data.seoDescVi) setSeoDescVi(data.seoDescVi);
        if (data.seoDescEn) setSeoDescEn(data.seoDescEn);
      } else {
        // Graceful fallback for AI errors — use basic pattern
        setNameEn(`${nameVi} Collection`);
        if (descriptionVi) setDescriptionEn(`English: ${descriptionVi}`);
        setSeoTitleVi(`${nameVi} | Đồ Gỗ Phương Đông`);
        setSeoTitleEn(`${nameVi} | Phuong Dong Premium Furniture`);
        setSeoDescVi(`Mua ngay ${nameVi} chính hãng tại Phương Đông.`);
        setSeoDescEn(`Shop premium ${nameVi} at Phuong Dong.`);
      }
      setAiFillSuccess(true);
    } catch {
      // Graceful fallback
      setNameEn(`${nameVi} Collection`);
      setSeoTitleVi(`${nameVi} | Đồ Gỗ Phương Đông`);
      setSeoTitleEn(`${nameVi} | Phuong Dong`);
      setAiFillSuccess(true);
    } finally {
      setAiFilling(false);
    }
  };

  const handleSave = async (targetStatus?: "draft" | "published" | "archived") => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const statusToSave = targetStatus || status;

    const payload = {
      slug: slug.trim(),
      name_vi: nameVi.trim(),
      name_en: englishEnabled ? nameEn.trim() : "",
      description_vi: descriptionVi.trim() || null,
      description_en: englishEnabled && descriptionEn.trim() ? descriptionEn.trim() : null,
      parent_id: parentId || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      group_key: parentGroup as any,
      status: statusToSave,
      sort_order: Number(sortOrder) || 0,
      cover_image: coverImage || null,
      seo_title_vi: seoTitleVi.trim() || null,
      seo_title_en: englishEnabled && seoTitleEn.trim() ? seoTitleEn.trim() : null,
      seo_description_vi: seoDescVi.trim() || null,
      seo_description_en: englishEnabled && seoDescEn.trim() ? seoDescEn.trim() : null,
    };

    try {
      const { categorySchema } = await import("@/lib/validations/admin");
      const validation = categorySchema.safeParse(payload);
      if (!validation.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msgs = validation.error.issues.map((e: any) => e.message).join(". ");
        setSaveError(msgs);
        setIsSaving(false);
        return;
      }

      showLoading(isEdit ? "Đang cập nhật danh mục..." : "Đang tạo danh mục mới...");
      const { createAdminCategory, updateAdminCategory } = await import("@/lib/supabase/mutations");
      let res;
      if (isEdit && categoryId) {
        res = await updateAdminCategory(categoryId, payload);
      } else {
        res = await createAdminCategory(payload);
      }

      hideLoading();

      if (res.success) {
        setSaveSuccess(true);
        showAlert(
          "Thành công",
          statusToSave === "published"
            ? (isEdit ? "Cập nhật danh mục thành công!" : "Tạo danh mục mới thành công!")
            : statusToSave === "archived"
              ? "Đã lưu trữ danh mục thành công!"
              : "Đã lưu bản nháp danh mục thành công!",
          "success",
          () => {
            router.push("/admin/categories");
            router.refresh();
          }
        );
      } else {
        const friendly = friendlySaveError(res.error) || "Không thể lưu danh mục.";
        setSaveError(friendly);
        showAlert("Thất bại", friendly, "error");
      }
    } catch (err) {
      hideLoading();
      const friendly = friendlySaveError(err instanceof Error ? err.message : String(err));
      setSaveError(friendly);
      showAlert("Lỗi hệ thống", friendly, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const validationErrors: string[] = [];
  if (!nameVi.trim()) validationErrors.push("Cần nhập tên danh mục tiếng Việt.");
  if (!slug.trim()) validationErrors.push("Cần nhập đường dẫn (slug).");
  if (englishEnabled && !nameEn.trim()) validationErrors.push("Cần nhập tên danh mục tiếng Anh khi đã bật tiếng Anh.");
  // On create this form always makes a LEAF category, so a parent group is
  // required. Without it the category would be saved as a top-level group by
  // mistake (e.g. if submitted before the group list finished loading).
  if (!isEdit && !parentId) validationErrors.push("Cần chọn nhóm danh mục cha.");

  if (isLoadingEdit) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Đang tải dữ liệu danh mục...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
        <p className="font-semibold">{loadError}</p>
        <button
          type="button"
          className="button-pd mt-4"
          onClick={() => router.push("/admin/categories")}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* --- Bật tiếng Anh và điền bằng AI --- */}
        <section className="surface-soft p-4">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-[var(--admin-accent)]" />
              <h3 className="admin-section-title-pd">Bản dịch tiếng Anh</h3>
            </div>
            {englishEnabled && (
              <button
                type="button"
                className="button-pd-outline py-1 px-3 text-xs flex items-center gap-1.5"
                onClick={handleAiFill}
                disabled={aiFilling}
                aria-label="Dịch từ tiếng Việt bằng AI"
              >
                {aiFilling ? (
                  <><Loader2 className="size-3.5 animate-spin" />Đang dịch...</>
                ) : (
                  <><Languages className="size-3.5" />Dịch bằng AI</>
                )}
              </button>
            )}
          </div>
          <div className="mt-4">
            <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 w-full ${
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
                    Kích hoạt dịch tiếng Anh cho tên danh mục, mô tả và các thẻ SEO.
                  </span>
                </div>
              </div>
              
              <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={englishEnabled}
                  aria-label="Bật trường tiếng Anh"
                  onChange={(e) => setEnglishEnabled(e.target.checked)}
                />
                <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-slate-300 bg-slate-200 transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.1)] after:transition-transform peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
          {aiFillSuccess && (
            <p className="mt-3 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              AI đã điền các trường tiếng Anh. Vui lòng rà soát và chỉnh sửa khi cần.
            </p>
          )}
        </section>

        <section className="surface-soft p-4">
          <WorkflowIntro
            icon={Tag}
            title="Hồ sơ danh mục"
            description="Nhóm sản phẩm cấp cao được giữ cố định; biên tập viên tạo danh mục với trường song ngữ và SEO sẵn sàng."
          />
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Tên danh mục - Tiếng Việt" 
                name="category-name-vi" 
                value={nameVi} 
                onChange={setNameVi} 
              />
              <AdminField 
                label="Tên danh mục - Tiếng Anh" 
                name="category-name-en" 
                value={nameEn} 
                onChange={setNameEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
              />
            </div>
            
            {(!isEdit || parentId !== null) ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="label-pd">Thuộc Nhóm danh mục *</span>
                  <PremiumSelect
                    value={parentId || ""}
                    onValueChange={(val) => {
                      setParentId(val);
                      const selectedGroup = categoriesList.find(c => c.id === val);
                      if (selectedGroup) {
                        setParentGroup(selectedGroup.group_key || "project_solutions");
                      }
                    }}
                    ariaLabel="Thuộc Nhóm danh mục"
                    placeholder="Chọn Nhóm danh mục..."
                    tone="admin"
                    options={categoriesList
                      .filter(c => c.parent_id === null)
                      .map(c => ({
                        value: c.id,
                        label: c.name
                      }))
                    }
                  />
                </label>
                <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} disabled={true} />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1 justify-center bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Loại danh mục:</span>
                  <span className="text-xs font-bold text-slate-700">Nhóm danh mục (Cấp cao nhất)</span>
                </div>
                <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} disabled={true} />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Mô tả danh mục - Tiếng Việt" 
                name="category-description-vi" 
                value={descriptionVi} 
                onChange={setDescriptionVi} 
                multiline
              />
              <AdminField 
                label="Mô tả danh mục - Tiếng Anh" 
                name="category-description-en" 
                value={descriptionEn} 
                onChange={setDescriptionEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
                multiline
              />
            </div>
          </div>
        </section>

        {/* --- SEO Fields --- */}
        <SeoFieldset
          kind="category"
          seoTitleVi={seoTitleVi}
          setSeoTitleVi={setSeoTitleVi}
          seoTitleEn={seoTitleEn}
          setSeoTitleEn={setSeoTitleEn}
          seoDescVi={seoDescVi}
          setSeoDescVi={setSeoDescVi}
          seoDescEn={seoDescEn}
          setSeoDescEn={setSeoDescEn}
          englishEnabled={englishEnabled}
          viTitle={nameVi}
          enTitle={nameEn}
        />
      </div>
      <aside className="space-y-5">
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Ảnh bìa danh mục</h3>
          <ImageUploadDropzone value={coverImage} onChange={setCoverImage} label="Tải ảnh danh mục lên" />
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
        
        {saveError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <strong className="block font-semibold">Lỗi lưu trữ:</strong>
            <p className="mt-1">{saveError}</p>
          </div>
        )}
        {saveSuccess && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
            <strong className="block font-semibold">Thành công!</strong>
            <p className="mt-1">Dữ liệu danh mục đã được lưu trữ vào cơ sở dữ liệu.</p>
          </div>
        )}

        <PublishWorkflow
          status={status}
          onStatusChange={setStatus}
          errors={validationErrors}
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
          canArchive={isEdit}
        />
      </aside>
      {previewOpen && (
        <DetailPreviewModal
          kind="category"
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={{
            nameVi, nameEn, coverImage,
            descriptionVi, descriptionEn,
            slug,
          }}
        />
      )}
    </div>
  );
}


// Common countries of origin for partner brands (Vietnamese labels, ISO-style controlled list).
const BRAND_COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "Việt Nam", label: "Việt Nam" },
  { value: "Đức", label: "Đức (Germany)" },
  { value: "Ý", label: "Ý (Italy)" },
  { value: "Pháp", label: "Pháp (France)" },
  { value: "Tây Ban Nha", label: "Tây Ban Nha (Spain)" },
  { value: "Anh", label: "Anh (UK)" },
  { value: "Bỉ", label: "Bỉ (Belgium)" },
  { value: "Ba Lan", label: "Ba Lan (Poland)" },
  { value: "Thụy Điển", label: "Thụy Điển (Sweden)" },
  { value: "Đan Mạch", label: "Đan Mạch (Denmark)" },
  { value: "Thổ Nhĩ Kỳ", label: "Thổ Nhĩ Kỳ (Turkey)" },
  { value: "Mỹ", label: "Mỹ (USA)" },
  { value: "Nhật Bản", label: "Nhật Bản (Japan)" },
  { value: "Hàn Quốc", label: "Hàn Quốc (Korea)" },
  { value: "Trung Quốc", label: "Trung Quốc (China)" },
  { value: "Đài Loan", label: "Đài Loan (Taiwan)" },
  { value: "Thái Lan", label: "Thái Lan (Thailand)" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Ấn Độ", label: "Ấn Độ (India)" },
];

function BrandEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { toast, showLoading, hideLoading, showAlert } = useToast();
  const searchParams = useSearchParams();
  const editId = idOrSlug || searchParams.get("edit") || "";
  const isEdit = Boolean(editId);

  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [origin, setOrigin] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [seoTitleVi, setSeoTitleVi] = useState("");
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoDescVi, setSeoDescVi] = useState("");
  const [seoDescEn, setSeoDescEn] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-slugify brand nameVi
  useEffect(() => {
    if (!isEdit && nameVi) {
      setSlug(slugify(nameVi));
    }
  }, [nameVi, isEdit]);

  useEffect(() => {
    if (isEdit) {
      const loadBrand = async () => {
        try {
          const { getAdminBrandById } = await import("@/lib/supabase/brands-mutations");
          const res = await getAdminBrandById(editId);
          if (res.success && res.data) {
            const b = res.data;
            setNameVi(b.name_vi || "");
            setNameEn(b.name_en || "");
            setSlug(b.slug || "");
            setDescriptionVi(b.description_vi || "");
            setDescriptionEn(b.description_en || "");
            setOrigin(b.origin || "");
            setLogoUrl(b.logo_url || "");
            setSortOrder(b.sort_order || 0);
            setStatus(b.status || "draft");
            setSeoTitleVi(b.seo_title_vi || "");
            setSeoTitleEn(b.seo_title_en || "");
            setSeoDescVi(b.seo_description_vi || "");
            setSeoDescEn(b.seo_description_en || "");
          }
        } catch (e) {
          console.error("Failed to load brand:", e);
        }
      };
      loadBrand();
    }
  }, [editId, isEdit]);

  const handleSave = async (targetStatus: "draft" | "published" | "archived") => {
    setFormLoading(true);
    setFormError("");
    setFieldErrors({});

    try {
      const brandData = {
        name_vi: nameVi,
        name_en: nameEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        origin,
        logo_url: logoUrl,
        sort_order: Number(sortOrder),
        status: targetStatus,
        slug,
        seo_title_vi: seoTitleVi.trim() || undefined,
        seo_title_en: seoTitleEn.trim() || undefined,
        seo_description_vi: seoDescVi.trim() || undefined,
        seo_description_en: seoDescEn.trim() || undefined,
      };

      const { brandSchema } = await import("@/lib/validations/admin");
      const validation = brandSchema.safeParse(brandData);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            errors[path] = issue.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Vui lòng sửa các lỗi nhập liệu bên dưới.");
        setFormLoading(false);
        return;
      }

      showLoading(isEdit ? "Đang cập nhật thương hiệu..." : "Đang tạo thương hiệu mới...");
      const { createAdminBrand, updateAdminBrand } = await import("@/lib/supabase/brands-mutations");

      let res;
      if (isEdit) {
        res = await updateAdminBrand(editId, brandData);
      } else {
        res = await createAdminBrand(brandData);
      }

      hideLoading();

      if (res.success) {
        showAlert(
          "Thành công",
          targetStatus === "published"
            ? (isEdit ? "Cập nhật thương hiệu thành công!" : "Tạo thương hiệu thành công!")
            : targetStatus === "archived"
              ? "Đã lưu trữ thương hiệu thành công!"
              : "Đã lưu bản nháp thương hiệu thành công!",
          "success",
          () => {
            window.location.href = "/admin/brands";
          }
        );
      } else {
        const friendly = friendlySaveError(res.error) || "Có lỗi xảy ra.";
        setFormError(friendly);
        showAlert("Thất bại", friendly, "error");
      }
    } catch (err) {
      hideLoading();
      const friendly = friendlySaveError(err instanceof Error ? err.message : String(err));
      setFormError(friendly);
      showAlert("Lỗi hệ thống", friendly, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Keep any pre-existing free-text origin selectable so editing an old brand doesn't lose it.
  const originOptions =
    !origin || BRAND_COUNTRY_OPTIONS.some((o) => o.value === origin)
      ? BRAND_COUNTRY_OPTIONS
      : [{ value: origin, label: origin }, ...BRAND_COUNTRY_OPTIONS];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Award}
          title={isEdit ? "Hiệu chỉnh thương hiệu" : "Thêm thương hiệu mới"}
          description="Thiết lập logo, xuất xứ và mô tả song ngữ cho thương hiệu đối tác."
        />
        {formError && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Tên thương hiệu (VI) *"
              name="name_vi"
              value={nameVi}
              onChange={setNameVi}
              error={fieldErrors.name_vi}
            />
            <AdminField
              label="Tên thương hiệu (EN)"
              name="name_en"
              value={nameEn}
              onChange={setNameEn}
              error={fieldErrors.name_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Đường dẫn"
              name="brand-slug"
              value={slug}
              onChange={setSlug}
              disabled={true}
            />
            <div className="grid gap-2">
              <span className="label-pd">Xuất xứ</span>
              <PremiumSelect
                tone="admin"
                name="origin"
                value={origin}
                options={originOptions}
                placeholder="Chọn quốc gia xuất xứ"
                ariaLabel="Xuất xứ"
                onValueChange={setOrigin}
              />
              {fieldErrors.origin && <span className="text-red-600 text-xs font-medium">{fieldErrors.origin}</span>}
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Mô tả tiếng Việt"
              name="description_vi"
              value={descriptionVi}
              onChange={setDescriptionVi}
              multiline
              error={fieldErrors.description_vi}
            />
            <AdminField
              label="Mô tả tiếng Anh"
              name="description_en"
              value={descriptionEn}
              onChange={setDescriptionEn}
              multiline
              error={fieldErrors.description_en}
            />
          </div>
          
          {/* SEO Block — lưu trong brand_translations */}
          <div className="mt-6 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-550">Cấu hình SEO Search Engine</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Tiêu đề SEO (VI)" name="seo_title_vi" value={seoTitleVi} onChange={setSeoTitleVi} />
              <AdminField label="Tiêu đề SEO (EN)" name="seo_title_en" value={seoTitleEn} onChange={setSeoTitleEn} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Mô tả SEO (VI)" name="seo_desc_vi" value={seoDescVi} onChange={setSeoDescVi} multiline />
              <AdminField label="Mô tả SEO (EN)" name="seo_desc_en" value={seoDescEn} onChange={setSeoDescEn} multiline />
            </div>
          </div>
        </div>
      </section>
      <aside className="space-y-5">
        <section className="surface-soft p-4">
          <span className="label-pd">Logo thương hiệu</span>
          <div className="mt-2">
            <ImageUploadDropzone
              value={logoUrl}
              onChange={(url) => setLogoUrl(url)}
              label="Tải logo thương hiệu lên"
            />
          </div>
          {fieldErrors.logo_url && <span className="mt-1 block text-red-600 text-xs font-medium">{fieldErrors.logo_url}</span>}
        </section>
        <PublishWorkflow
          status={status}
          onStatusChange={setStatus}
          errors={[]}
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
          canArchive={isEdit}
        />
      </aside>
    </div>
  );
}

function PromotionEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { toast, showLoading, hideLoading, showAlert } = useToast();
  const searchParams = useSearchParams();
  const editId = idOrSlug || searchParams.get("edit") || "";
  const isEdit = Boolean(editId);

  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  // Preserved-only (no dedicated UI yet): keep any existing combo pricing / bullet
  // items so editing a promotion doesn't wipe them (they can be set via seed/import).
  const [comboPrice, setComboPrice] = useState<number | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [promoItems, setPromoItems] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [englishEnabled, setEnglishEnabled] = useState(isEdit);
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");

  // N-N products states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  
  // Custom searchable select states
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Auto-generate promotion code from titleVi
  useEffect(() => {
    if (!isEdit && titleVi) {
      setCode(slugify(titleVi).toUpperCase().replaceAll("-", "_"));
    }
  }, [titleVi, isEdit]);

  // Load all products for select list
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const { getAdminProducts } = await import("@/lib/supabase/admin-queries");
        const res = await getAdminProducts({ limit: 1000 });
        const prods = Array.isArray(res) ? res : res?.data || [];
        setAllProducts(prods);
      } catch (e) {
        console.error(e);
      }
    };
    loadAllProducts();
  }, []);

  const [aiTranslating, setAiTranslating] = useState(false);
  const [aiTranslateSuccess, setAiTranslateSuccess] = useState(false);

  const handleAiTranslate = async () => {
    setAiTranslating(true);
    setAiTranslateSuccess(false);
    try {
      // Returns "" for empty input, null on failure, translated text on success.
      const translateField = async (text: string): Promise<string | null> => {
        if (!text.trim()) return "";
        try {
          const res = await fetch("/api/admin/ai/generate-draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task: "translate",
              inputText: text,
              targetLocale: "en"
            })
          });
          if (!res.ok) return null;
          const json = await res.json();
          if (!json.success || typeof json.text !== "string") return null;
          return json.text;
        } catch {
          return null;
        }
      };

      const translatedTitle = await translateField(titleVi);
      const translatedDesc = await translateField(descriptionVi);

      // Do NOT clear the English fields or claim success when translation failed.
      if (translatedTitle === null || translatedDesc === null) {
        showAlert(
          "Dịch tự động thất bại",
          "Không thể dịch bằng AI. Vui lòng kiểm tra cấu hình Gemini API trong Cài đặt rồi thử lại.",
          "error",
        );
        return;
      }

      if (translatedTitle) setTitleEn(translatedTitle);
      if (translatedDesc) setDescriptionEn(translatedDesc);
      setAiTranslateSuccess(true);
    } finally {
      setAiTranslating(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      const loadPromotion = async () => {
        try {
          const { getAdminPromotionById, getProductsByIds } = await import("@/lib/supabase/admin-queries");
          const res = await getAdminPromotionById(editId);
          if (res.success && res.data) {
            const p = res.data;
            setCode(p.code || "");
            setDiscountPercentage(p.discount_percentage || 0);
            setTitleVi(p.title?.vi || p.title_vi || "");
            setTitleEn(p.title?.en || p.title_en || "");
            setDescriptionVi(p.description?.vi || p.description_vi || "");
            setDescriptionEn(p.description?.en || p.description_en || "");
            setCoverImage(p.cover_image_url || p.cover_image || "");
            setStartAt(p.start_at ? p.start_at.substring(0, 16) : "");
            setEndAt(p.end_at ? p.end_at.substring(0, 16) : "");
            setStatus(p.status || "draft");
            setEnglishEnabled(Boolean(p.title_en));
            // Preserve combo pricing + bullet items across edits (no UI yet).
            setComboPrice(p.combo_price ?? null);
            setOriginalPrice(p.original_price ?? null);
            setPromoItems(
              Array.isArray(p.items)
                ? p.items
                : Array.isArray(p.metadata_jsonb?.items_vi)
                  ? p.metadata_jsonb.items_vi
                  : [],
            );

            if (p.productIds && p.productIds.length > 0) {
              setSelectedProductIds(p.productIds);
              const prods = await getProductsByIds(p.productIds);
              setSelectedProducts(prods);
            }
          }
        } catch (e) {
          console.error("Failed to load promotion:", e);
        }
      };
      loadPromotion();
    }
  }, [editId, isEdit]);

  const handleSave = async (targetStatus: "draft" | "published" | "archived") => {
    setFormLoading(true);
    setFormError("");
    setFieldErrors({});
    try {
      setStatus(targetStatus);
      const promotionData = {
        code,
        discount_percentage: Number(discountPercentage),
        title_vi: titleVi,
        title_en: titleEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        cover_image: coverImage,
        combo_price: comboPrice,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        original_price: originalPrice,
        items: promoItems,
        status: targetStatus,
        productIds: selectedProductIds,
      };

      const { promotionSchema } = await import("@/lib/validations/admin");
      const validation = promotionSchema.safeParse(promotionData);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            errors[path] = issue.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Vui lòng sửa các lỗi nhập liệu bên dưới.");
        setFormLoading(false);
        return;
      }

      showLoading(isEdit ? "Đang cập nhật khuyến mãi..." : "Đang tạo khuyến mãi mới...");
      const { createAdminPromotion, updateAdminPromotion } = await import("@/lib/supabase/admin-queries");

      let res;
      if (isEdit) {
        res = await updateAdminPromotion(editId, promotionData);
      } else {
        res = await createAdminPromotion(promotionData);
      }

      hideLoading();

      if (res.success) {
        showAlert(
          "Thành công",
          targetStatus === "published"
            ? (isEdit ? "Cập nhật khuyến mãi thành công!" : "Tạo khuyến mãi thành công!")
            : targetStatus === "archived"
              ? "Đã lưu trữ khuyến mãi thành công!"
              : "Đã lưu bản nháp khuyến mãi thành công!",
          "success",
          () => {
            window.location.href = "/admin/promotions";
          }
        );
      } else {
        const friendly = friendlySaveError(res.error) || "Có lỗi xảy ra.";
        setFormError(friendly);
        showAlert("Thất bại", friendly, "error");
      }
    } catch (err) {
      hideLoading();
      const friendly = friendlySaveError(err instanceof Error ? err.message : String(err));
      setFormError(friendly);
      showAlert("Lỗi hệ thống", friendly, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleProduct = (prod: any) => {
    if (selectedProductIds.includes(prod.id)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== prod.id));
      setSelectedProducts(selectedProducts.filter(p => p.id !== prod.id));
    } else {
      setSelectedProductIds([...selectedProductIds, prod.id]);
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  const filteredProducts = allProducts.filter(p => 
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.reference_code?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* --- English Translation Switcher (Product Style) --- */}
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
            
            <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 w-full md:max-w-md ${
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
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                    Kích hoạt dịch tiếng Anh cho tiêu đề và mô tả khuyến mãi.
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
            </button>
          </div>
        </section>

        {/* --- TAB CONTENT: VIETNAMESE --- */}
        {activeTab === "vi" && (
          <section className="surface-soft p-4">
            <WorkflowIntro
              icon={BadgePercent}
              title={isEdit ? "Hiệu chỉnh khuyến mãi" : "Thêm khuyến mãi mới"}
              description="Biên tập tiêu đề và mô tả tiếng Việt cho khuyến mãi."
            />
            {formError && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}
            <div className="mt-5 grid gap-4">
              <AdminField
                label="Tiêu đề khuyến mãi (VI) *"
                name="title_vi"
                value={titleVi}
                onChange={setTitleVi}
                error={fieldErrors.title_vi}
              />
              <AdminField
                label="Mô tả khuyến mãi (VI)"
                name="description_vi"
                value={descriptionVi}
                onChange={setDescriptionVi}
                multiline
                error={fieldErrors.description_vi}
              />
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: ENGLISH --- */}
        {activeTab === "en" && englishEnabled && (
          <section className="surface-soft p-4">
            <div className="flex justify-between items-center border-b pb-2 border-indigo-100">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Tab 2: Bản dịch tiếng Anh</span>
              
              <button
                type="button"
                className="button-pd-outline py-1 px-3 text-xs bg-white text-indigo-700 hover:text-indigo-900 border-indigo-200 flex items-center gap-1.5"
                onClick={handleAiTranslate}
                disabled={aiTranslating || !titleVi.trim()}
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
              <p className="mt-3 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                AI đã điền các trường tiếng Anh. Hãy xem và hiệu chỉnh thủ công nếu cần.
              </p>
            )}

            <div className="mt-5 grid gap-4">
              <AdminField
                label="Tiêu đề khuyến mãi (EN)"
                name="title_en"
                value={titleEn}
                onChange={setTitleEn}
                error={fieldErrors.title_en}
              />
              <AdminField
                label="Mô tả khuyến mãi (EN)"
                name="description_en"
                value={descriptionEn}
                onChange={setDescriptionEn}
                multiline
                error={fieldErrors.description_en}
              />
            </div>
          </section>
        )}

        {/* --- PREMIUM SEARCHABLE PRODUCT MULTISELECT --- */}
        <section className="surface-soft p-4 space-y-4">
          <WorkflowIntro
            icon={Package}
            title="Sản phẩm áp dụng"
            description="Tìm kiếm và chọn các sản phẩm trong phạm vi giảm giá của chương trình khuyến mãi này."
          />
          <div className="grid gap-2 relative">
            <span className="label-pd">Chọn sản phẩm giảm giá *</span>
            <div className="relative">
              <input
                className="input-pd bg-white w-full pr-10"
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="size-4" />
              </div>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-20 divide-y divide-slate-50 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((prod) => {
                        const isSelected = selectedProductIds.includes(prod.id);
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              handleToggleProduct(prod);
                              setProductSearch("");
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-indigo-50/60 flex items-center gap-3 text-xs transition-colors ${isSelected ? "bg-indigo-50/40" : ""}`}
                          >
                            {/* Product thumbnail */}
                            <div className="size-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/60">
                              {prod.primary_media?.url ? (
                                <img
                                  src={assetUrl(prod.primary_media.url)}
                                  alt={prod.name}
                                  className="size-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="size-full flex items-center justify-center">
                                  <Package className="size-4 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-800 truncate">{prod.name}</span>
                              {prod.reference_code && (
                                <span className="text-[10px] text-slate-400 font-mono">Mã: {prod.reference_code}</span>
                              )}
                            </div>
                            {isSelected && (
                              <BadgeCheck className="size-4 text-emerald-600 shrink-0 ml-auto" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-center text-xs text-slate-400">
                        Không tìm thấy sản phẩm nào
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Selected Products List */}
            {selectedProducts.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sản phẩm đã chọn ({selectedProducts.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProducts.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs pl-1.5 pr-2 py-1 rounded-xl shadow-sm animate-in zoom-in-95 duration-100"
                    >
                      <div className="size-7 rounded-lg overflow-hidden bg-indigo-100 shrink-0">
                        {prod.primary_media?.url ? (
                          <img src={assetUrl(prod.primary_media.url)} alt={prod.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <Package className="size-3.5 text-indigo-400" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{prod.name}</span>
                      {prod.reference_code && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                          {prod.reference_code}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(prod)}
                        className="text-indigo-400 hover:text-indigo-600 font-bold hover:bg-indigo-100/50 size-5 rounded-full flex items-center justify-center transition-colors text-sm font-heading"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- COMMON FIELDS (LOCKED OUTSIDE TABS) --- */}
        <section className="surface-soft p-5 space-y-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-extrabold text-slate-800 uppercase tracking-wider">Thời gian & Chiết khấu</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cấu hình mức giảm giá, thời gian hiệu lực và mã áp dụng tự động.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <AdminField
                label="Mã khuyến mãi (Tự động tạo) *"
                name="code"
                value={code}
                onChange={setCode}
                error={fieldErrors.code}
                disabled={true}
              />
              <div className="absolute right-3.5 bottom-2.5 text-slate-400">
                <Lock className="size-4" />
              </div>
            </div>
            
            <AdminField
              label="Mức chiết khấu (%) *"
              name="discount_percentage"
              inputType="number"
              value={String(discountPercentage)}
              onChange={(val) => setDiscountPercentage(Number(val))}
              error={fieldErrors.discount_percentage}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-slate-50">
            <label className="grid gap-2">
              <span className="label-pd">Thời gian bắt đầu *</span>
              <DateTimePickerField
                value={startAt}
                onChange={setStartAt}
                placeholder="Chọn ngày & giờ bắt đầu"
                ariaLabel="Thời gian bắt đầu"
                error={Boolean(fieldErrors.start_at)}
              />
              {fieldErrors.start_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.start_at}</span>}
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Thời gian kết thúc</span>
              <DateTimePickerField
                value={endAt}
                onChange={setEndAt}
                placeholder="Chọn ngày & giờ kết thúc"
                ariaLabel="Thời gian kết thúc"
                error={Boolean(fieldErrors.end_at)}
              />
              {fieldErrors.end_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.end_at}</span>}
            </label>
          </div>
        </section>


      </div>

      <aside className="space-y-5">
        {/* --- COMBO COVER IMAGE (Moved above PublishWorkflow) --- */}
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Ảnh bìa khuyến mãi</h3>
          <ImageUploadDropzone
            value={coverImage}
            onChange={(url) => setCoverImage(url)}
            label="Tải ảnh combo khuyến mãi lên"
          />
          {fieldErrors.cover_image && <span className="text-red-600 text-xs font-medium">{fieldErrors.cover_image}</span>}
        </section>

        <PublishWorkflow 
          status={status}
          onStatusChange={setStatus}
          errors={[]} 
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
        />
      </aside>
    </div>
  );
}
