"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Loader2, Save, X, AlertTriangle } from "lucide-react";
import {
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand,
  getAdminBrandById,
  type BrandInput,
} from "@/lib/supabase/brands-mutations";

export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
}

interface BrandsAdminProps {
  initialBrands?: Brand[];
}

export function BrandsAdmin({ initialBrands = [] }: BrandsAdminProps) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa thương hiệu này?")) return;

    setIsLoading(true);
    setError(null);

    const result = await deleteAdminBrand(id);
    if (result.success) {
      setBrands(brands.filter((b) => b.id !== id));
    } else {
      setError(result.error || "Không thể xóa thương hiệu");
    }

    setIsLoading(false);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleFormSuccess = (savedBrand: Brand) => {
    if (editingId) {
      setBrands(brands.map((b) => (b.id === editingId ? savedBrand : b)));
    } else {
      setBrands([savedBrand, ...brands]);
    }
    handleFormClose();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Thương hiệu</h2>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý các thương hiệu đối tác (Kohler, Grohe, TOTO...)
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm thương hiệu
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {brand.logo_url && (
                  <div className="mb-3 h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={brand.logo_url}
                      alt={brand.name.vi}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900">{brand.name.vi}</h3>
                {brand.name.en && brand.name.en !== brand.name.vi && (
                  <p className="text-sm text-gray-600">{brand.name.en}</p>
                )}
                {brand.origin && (
                  <p className="mt-1 text-xs text-gray-500">Xuất xứ: {brand.origin}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      brand.status === "published"
                        ? "bg-green-100 text-green-700"
                        : brand.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {brand.status === "published"
                      ? "Đã xuất bản"
                      : brand.status === "draft"
                      ? "Nháp"
                      : "Lưu trữ"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Thứ tự: {brand.sort_order}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-3">
                <button
                  onClick={() => handleEdit(brand.id)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
                  title="Xóa"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {brands.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Chưa có thương hiệu nào. Thêm thương hiệu đầu tiên!</p>
          </div>
        )}
      </div>

      {/* Brand Form Modal */}
      {isFormOpen && (
        <BrandFormModal
          brandId={editingId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

interface BrandFormModalProps {
  brandId: string | null;
  onClose: () => void;
  onSuccess: (brand: Brand) => void;
}

function BrandFormModal({ brandId, onClose, onSuccess }: BrandFormModalProps) {
  const [formData, setFormData] = useState<BrandInput>({
    name_vi: "",
    name_en: "",
    description_vi: "",
    description_en: "",
    origin: "",
    logo_url: "",
    status: "draft",
    sort_order: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(!!brandId);

  const loadBrandData = useCallback(async (id: string) => {
    setIsLoadingData(true);
    const result = await getAdminBrandById(id);
    if (result.success && result.data) {
      setFormData({
        name_vi: result.data.name_vi,
        name_en: result.data.name_en,
        description_vi: result.data.description_vi,
        description_en: result.data.description_en,
        origin: result.data.origin,
        logo_url: result.data.logo_url,
        status: result.data.status,
        sort_order: result.data.sort_order,
        seo_title_vi: result.data.seo_title_vi,
        seo_title_en: result.data.seo_title_en,
        seo_description_vi: result.data.seo_description_vi,
        seo_description_en: result.data.seo_description_en,
      });
    }
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    if (brandId) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      loadBrandData(brandId);
    }
  }, [brandId, loadBrandData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = brandId
      ? await updateAdminBrand(brandId, formData)
      : await createAdminBrand(formData);

    if (result.success) {
      const newId = brandId || (result as { success: true; id: string }).id;
      onSuccess({
        id: newId,
        name: {
          vi: formData.name_vi,
          en: formData.name_en || formData.name_vi,
        },
        origin: formData.origin,
        logo_url: formData.logo_url,
        status: formData.status,
        sort_order: formData.sort_order,
      });
    } else {
      setError(result.error || "Không thể lưu thương hiệu");
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {brandId ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Brand Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên thương hiệu (VI) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_vi"
                  value={formData.name_vi}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Kohler"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name (EN)
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Kohler"
                />
              </div>
            </div>

            {/* Origin & Sort Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xuất xứ
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="USA, Germany, Japan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Logo
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="https://res.cloudinary.com/..."
              />
              {formData.logo_url && (
                <div className="mt-3">
                  <img
                    src={formData.logo_url}
                    alt="Preview"
                    className="h-20 w-20 rounded-lg border border-gray-200 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả (VI)
                </label>
                <textarea
                  name="description_vi"
                  value={formData.description_vi}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Mô tả ngắn về thương hiệu..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (EN)
                </label>
                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Short brand description..."
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="draft">Nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu thương hiệu
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
