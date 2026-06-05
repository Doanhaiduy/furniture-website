"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type PremiumSelectOption = {
  value: string;
  label: string;
};

export function PremiumSelect({
  name,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className,
  tone = "default",
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: PremiumSelectOption[];
  placeholder: string;
  ariaLabel: string;
  className?: string;
  tone?: "default" | "admin";
}) {
  const stateProps =
    value !== undefined
      ? { value, onValueChange }
      : { defaultValue: defaultValue || options[0]?.value, onValueChange };

  return (
    <Select
      name={name}
      {...stateProps}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          tone === "admin"
            ? "h-10 w-full rounded-xl border-[#d9e0eb] bg-white px-3 text-[13px] text-[#15172b] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition hover:border-[#8b5cf6]/35 focus:ring-[#8b5cf6]/20 data-[state=open]:border-[#8b5cf6]/45 data-[state=open]:bg-white data-[state=open]:ring-2 data-[state=open]:ring-[#8b5cf6]/20"
            : "h-11 w-full rounded-md border-outline-variant/45 bg-white/85 px-3 text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:border-primary/35 focus:ring-primary-container/20 data-[state=open]:border-primary/45 data-[state=open]:bg-white data-[state=open]:ring-2 data-[state=open]:ring-primary-container/20",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className={cn(
          "rounded-xl p-1",
          tone === "admin"
            ? "border border-[#dfe6f1] bg-white shadow-[0_18px_48px_rgba(21,23,43,0.13)]"
            : "border border-outline-variant/35 bg-surface-container-lowest shadow-[0_18px_48px_rgba(68,42,34,0.14)]"
        )}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              "rounded-lg px-2 py-2 text-sm",
              tone === "admin"
                ? "text-[#15172b] focus:bg-[#f4f6fb] focus:text-[#8b5cf6]"
                : "text-on-surface focus:bg-surface-container focus:text-primary"
            )}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
