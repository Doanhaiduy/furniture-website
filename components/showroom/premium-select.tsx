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
          "select-pd px-3 text-sm transition",
          tone === "admin"
            ? "h-10 w-full text-[13px] text-[var(--admin-text)] hover:border-[var(--admin-accent)] data-[state=open]:border-[var(--admin-accent)] data-[state=open]:bg-white"
            : "h-11 w-full text-on-surface hover:border-primary/35 focus:ring-primary-container/20 data-[state=open]:border-primary/45 data-[state=open]:bg-white data-[state=open]:ring-2 data-[state=open]:ring-primary-container/20",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className={cn(
          "surface-elevated rounded-[var(--radius-panel)] p-1",
          tone === "admin"
            ? "border-[var(--admin-border)] bg-white text-[var(--admin-text)]"
            : "border-outline-variant/35 bg-surface-container-lowest"
        )}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              "rounded-[var(--radius-control)] px-2 py-2 text-sm",
              tone === "admin"
                ? "text-[var(--admin-text)] focus:bg-[var(--admin-bg-soft)] focus:text-[var(--admin-accent)]"
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
