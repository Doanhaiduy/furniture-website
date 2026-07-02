"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Search } from "lucide-react";

// Vietnam province data - using provinces.open-api.vn API
type Province = {
  code: number;
  name: string;
  division_type: string;
};

type District = {
  code: number;
  name: string;
  division_type: string;
  province_code: number;
};

type Ward = {
  code: number;
  name: string;
  division_type: string;
  district_code: number;
};

type VietnamAddressPickerProps = {
  streetValue: string;
  onStreetChange: (val: string) => void;
  onAddressChange: (fullAddress: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

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
  onSelect: (item: any) => void;
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
  streetValue,
  onStreetChange,
  onAddressChange,
  label = "Địa chỉ chi tiết (nhập số nhà, tên đường)",
  placeholder = "Số 123, đường Nguyễn Văn Cừ",
  disabled = false,
}: VietnamAddressPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const [provinceSearch, setProvinceSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");

  const [provinceOpen, setProvinceOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    async function fetchProvinces() {
      setLoadingProvinces(true);
      try {
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await res.json();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    }
    fetchProvinces();
  }, []);

  // Load districts when selectedProvince changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }

    const provinceCode = selectedProvince.code;

    async function fetchDistricts() {
      setLoadingDistricts(true);
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      } finally {
        setLoadingDistricts(false);
      }
    }
    fetchDistricts();
    setSelectedDistrict(null);
  }, [selectedProvince]);

  // Load wards when selectedDistrict changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard(null);
      return;
    }

    const districtCode = selectedDistrict.code;

    async function fetchWards() {
      setLoadingWards(true);
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await res.json();
        setWards(data.wards || []);
      } catch (error) {
        console.error("Failed to fetch wards:", error);
      } finally {
        setLoadingWards(false);
      }
    }
    fetchWards();
    setSelectedWard(null);
  }, [selectedDistrict]);

  // Emit full address change
  useEffect(() => {
    const parts = [
      streetValue.trim(),
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ].filter(Boolean);
    onAddressChange(parts.join(", "));
  }, [streetValue, selectedProvince, selectedDistrict, selectedWard, onAddressChange]);

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(provinceSearch.toLowerCase())
  );
  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
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
        placeholder={placeholder}
        value={streetValue}
        disabled={disabled}
        onChange={(e) => onStreetChange(e.target.value)}
      />

      {/* Province / District / Ward row */}
      <div className="grid gap-2 sm:grid-cols-3">
        <Dropdown
          value={selectedProvince?.name || null}
          placeholder="Tỉnh / Thành phố"
          search={provinceSearch}
          onSearchChange={setProvinceSearch}
          open={provinceOpen}
          onOpen={() => { setProvinceOpen(true); setDistrictOpen(false); setWardOpen(false); }}
          onClose={() => setProvinceOpen(false)}
          items={filteredProvinces}
          onSelect={(p: Province) => setSelectedProvince(p)}
          loading={loadingProvinces}
          disabled={disabled}
        />
        <Dropdown
          value={selectedDistrict?.name || null}
          placeholder="Quận / Huyện"
          search={districtSearch}
          onSearchChange={setDistrictSearch}
          open={districtOpen}
          onOpen={() => { setDistrictOpen(true); setProvinceOpen(false); setWardOpen(false); }}
          onClose={() => setDistrictOpen(false)}
          items={filteredDistricts}
          onSelect={(d: District) => setSelectedDistrict(d)}
          loading={loadingDistricts}
          disabled={disabled || !selectedProvince}
        />
        <Dropdown
          value={selectedWard?.name || null}
          placeholder="Phường / Xã"
          search={wardSearch}
          onSearchChange={setWardSearch}
          open={wardOpen}
          onOpen={() => { setWardOpen(true); setProvinceOpen(false); setDistrictOpen(false); }}
          onClose={() => setWardOpen(false)}
          items={filteredWards}
          onSelect={(w: Ward) => setSelectedWard(w)}
          loading={loadingWards}
          disabled={disabled || !selectedDistrict}
        />
      </div>

      {/* Full address preview */}
      {(streetValue || selectedProvince) && (
        <div className="flex items-start gap-2 bg-indigo-50/60 border border-indigo-100 rounded-lg px-3 py-2 mt-0.5">
          <MapPin className="size-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span className="text-[11px] text-indigo-700 leading-relaxed">
            {[streetValue, selectedWard?.name, selectedDistrict?.name, selectedProvince?.name]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}
