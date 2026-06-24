"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PremiumSelect, type PremiumSelectOption } from "./premium-select";

export function ProductSortSelect({
  value,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  options: PremiumSelectOption[];
  placeholder: string;
  ariaLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <PremiumSelect
      value={value}
      onValueChange={(nextValue) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");

        if (nextValue === "newest") {
          params.delete("sort");
        } else {
          params.set("sort", nextValue);
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      }}
      options={options}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
    />
  );
}
