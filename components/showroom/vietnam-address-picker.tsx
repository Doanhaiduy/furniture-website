"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, Search } from "lucide-react";

// Vietnam 2-tier administrative model (Tỉnh/Thành phố -> Phường/Xã) per the
// 1/7/2025 reform that abolished districts. Data from provinces.open-api.vn v2.
const API_BASE = "https://provinces.open-api.vn/api/v2";

type Province = { code: number; name: string; division_type?: string };
type Ward = { code: number; name: string; division_type?: string; province_code?: number };

export type VietnamAddressValue = {
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  street: string;
  /** Composed, human-readable "street, ward, province" string for display/storage. */
  fullAddress: string;
};

type VietnamAddressPickerProps = {
  value?: Partial<VietnamAddressValue>;
  onChange: (value: VietnamAddressValue) => void;
  label?: string;
  streetPlaceholder?: string;
  disabled?: boolean;
};

function composeAddress(street: string, wardName: string, provinceName: string): string {
  return [street.trim(), wardName, provinceName].filter(Boolean).join(", ");
}

const Dropdown = ({
  value,
  placeholder: ph,
  search,
  onSearchChange,
  open,
  onOpen,
  onClose,
  items,
  onSelect,
  loading,
  disabled: ddDisabled,
}: {
  value: string | null;
  placeholder: string;
  search: string;
  onSearchChange: (v: string) => void;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  items: { code: number; name: string }[];
  onSelect: (item: { code: number; name: string }) => void;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <div className="relative">
    <button
      type="button"
      disabled={ddDisabled}
      onClick={() => (open ? onClose() : onOpen())}
      className={`input-pd w-full flex items-center justify-between text-left text-sm ${
        ddDisabled
          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
          : "bg-white cursor-pointer"
      } ${value ? "text-slate-800" : "text-slate-400"}`}
    >
      <span className="truncate">{value || ph}</span>
      <ChevronDown
        className={`size-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
    {open && !ddDisabled && (
      <>
        <div className="fixed inset-0 z-10" onClick={onClose} />
        <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                autoFocus
                className="input-pd pl-8 py-1.5 text-xs w-full bg-slate-50"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">Không tìm thấy</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                    onSearchChange("");
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 text-slate-700 transition-colors"
                >
                  {item.name}
                </button>
              ))
            )}
          </div>
        </div>
      </>
    )}
  </div>
);

export function VietnamAddressPicker({
  value,
  onChange,
  label = "Địa chỉ chi tiết (số nhà, tên đường)",
  streetPlaceholder = "Số 123, đường Nguyễn Văn Cừ",
  disabled = false,
}: VietnamAddressPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<{ code: string; name: string } | null>(
    value?.provinceCode ? { code: value.provinceCode, name: value.provinceName || "" } : null
  );
  const [selectedWard, setSelectedWard] = useState<{ code: string; name: string } | null>(
    value?.wardCode ? { code: value.wardCode, name: value.wardName || "" } : null
  );
  const [street, setStreet] = useState(value?.street ?? "");

  const [provinceSearch, setProvinceSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Prefill once when an async-loaded value arrives (edit mode). Does NOT emit onChange,
  // so it never fights the parent's already-loaded composed address.
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current) return;
    if (value?.provinceCode || value?.street) {
      if (value.provinceCode) {
        setSelectedProvince({ code: value.provinceCode, name: value.provinceName || "" });
      }
      if (value.wardCode) {
        setSelectedWard({ code: value.wardCode, name: value.wardName || "" });
      }
      if (value.street !== undefined) setStreet(value.street);
      prefilledRef.current = true;
    }
  }, [value?.provinceCode, value?.wardCode, value?.provinceName, value?.wardName, value?.street]);

  // Load provinces on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchProvinces() {
      setLoadingProvinces(true);
      try {
        const res = await fetch(`${API_BASE}/p/`);
        const data = await res.json();
        if (!cancelled) setProvinces(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      } finally {
        if (!cancelled) setLoadingProvinces(false);
      }
    }
    fetchProvinces();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load wards (direct children of province — no district level) when province changes
  const provinceCode = selectedProvince?.code;
  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    let cancelled = false;
    async function fetchWards() {
      setLoadingWards(true);
      try {
        const res = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
        const data = await res.json();
        if (!cancelled) setWards(Array.isArray(data?.wards) ? data.wards : []);
      } catch (error) {
        console.error("Failed to fetch wards:", error);
      } finally {
        if (!cancelled) setLoadingWards(false);
      }
    }
    fetchWards();
    return () => {
      cancelled = true;
    };
  }, [provinceCode]);

  function emit(next: {
    province: { code: string; name: string } | null;
    ward: { code: string; name: string } | null;
    street: string;
  }) {
    const provinceName = next.province?.name ?? "";
    const wardName = next.ward?.name ?? "";
    onChange({
      provinceCode: next.province?.code ?? "",
      provinceName,
      wardCode: next.ward?.code ?? "",
      wardName,
      street: next.street,
      fullAddress: composeAddress(next.street, wardName, provinceName),
    });
  }

  function handleSelectProvince(p: { code: number; name: string }) {
    const province = { code: String(p.code), name: p.name };
    setSelectedProvince(province);
    setSelectedWard(null);
    setWards([]);
    emit({ province, ward: null, street });
  }

  function handleSelectWard(w: { code: number; name: string }) {
    const ward = { code: String(w.code), name: w.name };
    setSelectedWard(ward);
    emit({ province: selectedProvince, ward, street });
  }

  function handleStreetChange(next: string) {
    setStreet(next);
    emit({ province: selectedProvince, ward: selectedWard, street: next });
  }

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(provinceSearch.toLowerCase())
  );
  const filteredWards = wards.filter((w) =>
    w.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  return (
    <div className={`grid gap-2 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
      <span className="flex items-center gap-1.5 label-pd">
        <MapPin className="size-3.5 text-indigo-500" />
        {label}
      </span>

      {/* Street / house number */}
      <input
        className={`input-pd w-full ${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white"}`}
        type="text"
        placeholder={streetPlaceholder}
        value={street}
        disabled={disabled}
        onChange={(e) => handleStreetChange(e.target.value)}
      />

      {/* Province / Ward row (2-tier) */}
      <div className="grid gap-2 sm:grid-cols-2">
        <Dropdown
          value={selectedProvince?.name || null}
          placeholder="Tỉnh / Thành phố"
          search={provinceSearch}
          onSearchChange={setProvinceSearch}
          open={provinceOpen}
          onOpen={() => { setProvinceOpen(true); setWardOpen(false); }}
          onClose={() => setProvinceOpen(false)}
          items={filteredProvinces}
          onSelect={handleSelectProvince}
          loading={loadingProvinces}
          disabled={disabled}
        />
        <Dropdown
          value={selectedWard?.name || null}
          placeholder="Phường / Xã"
          search={wardSearch}
          onSearchChange={setWardSearch}
          open={wardOpen}
          onOpen={() => { setWardOpen(true); setProvinceOpen(false); }}
          onClose={() => setWardOpen(false)}
          items={filteredWards}
          onSelect={handleSelectWard}
          loading={loadingWards}
          disabled={disabled || !selectedProvince}
        />
      </div>

      {/* Full address preview */}
      {(street || selectedProvince) && (
        <div className="flex items-start gap-2 bg-indigo-50/60 border border-indigo-100 rounded-lg px-3 py-2 mt-0.5">
          <MapPin className="size-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span className="text-[11px] text-indigo-700 leading-relaxed">
            {composeAddress(street, selectedWard?.name || "", selectedProvince?.name || "")}
          </span>
        </div>
      )}
    </div>
  );
}
