"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, Search, X } from "lucide-react";

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
  disabled?: boolean;
  label?: string;
  placeholder?: string;
};

export function VietnamAddressPicker({
  streetValue,
  onStreetChange,
  onAddressChange,
  disabled,
  label = "Địa chỉ",
  placeholder = "Số nhà, tên đường...",
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

  // Fetch provinces on mount
  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((r) => r.json())
      .then((data: Province[]) => {
        setProvinces(data || []);
      })
      .catch(() => {
        // Fallback to common provinces
        setProvinces([
          { code: 1, name: "Thành phố Hà Nội", division_type: "thành phố trung ương" },
          { code: 79, name: "Thành phố Hồ Chí Minh", division_type: "thành phố trung ương" },
          { code: 48, name: "Thành phố Đà Nẵng", division_type: "thành phố trung ương" },
          { code: 92, name: "Thành phố Cần Thơ", division_type: "thành phố trung ương" },
          { code: 31, name: "Thành phố Hải Phòng", division_type: "thành phố trung ương" },
          { code: 77, name: "Tỉnh Bà Rịa - Vũng Tàu", division_type: "tỉnh" },
          { code: 74, name: "Tỉnh Bình Dương", division_type: "tỉnh" },
          { code: 75, name: "Tỉnh Đồng Nai", division_type: "tỉnh" },
          { code: 68, name: "Tỉnh Lâm Đồng", division_type: "tỉnh" },
          { code: 56, name: "Tỉnh Khánh Hòa", division_type: "tỉnh" },
        ]);
      })
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Fetch districts when province selected
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      return;
    }
    setLoadingDistricts(true);
    fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
      .then((r) => r.json())
      .then((data: any) => {
        setDistricts(data.districts || []);
        setSelectedDistrict(null);
        setWards([]);
        setSelectedWard(null);
      })
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
  }, [selectedProvince]);

  // Fetch wards when district selected
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard(null);
      return;
    }
    setLoadingWards(true);
    fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
      .then((r) => r.json())
      .then((data: any) => {
        setWards(data.wards || []);
        setSelectedWard(null);
      })
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
  }, [selectedDistrict]);

  // Compose full address whenever parts change
  useEffect(() => {
    const parts = [
      streetValue,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ].filter(Boolean);
    onAddressChange(parts.join(", "));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streetValue, selectedProvince, selectedDistrict, selectedWard]);

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(provinceSearch.toLowerCase())
  );
  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );
  const filteredWards = wards.filter((w) =>
    w.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

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
