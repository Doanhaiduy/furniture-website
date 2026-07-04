"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type PremiumSelectOption = {
  value: string;
  label: string;
};

export type PremiumSelectGroup = {
  label: string;
  options: PremiumSelectOption[];
};

export function PremiumSelect({
  name,
  value,
  defaultValue,
  onValueChange,
  options,
  groups,
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
  groups?: PremiumSelectGroup[];
  placeholder: string;
  ariaLabel: string;
  className?: string;
  tone?: "default" | "admin";
}) {
  const EMPTY_VALUE = "none";
  const mapValue = (v: string) => (v === "" ? EMPTY_VALUE : v);

  // Map empty string values to EMPTY_VALUE internally to comply with Radix UI requirements
  const mappedValue = value === "" ? EMPTY_VALUE : value;
  const mappedDefaultValue = defaultValue === "" ? EMPTY_VALUE : defaultValue;
  const mappedOptions = options.map((opt) => ({
    ...opt,
    value: mapValue(opt.value),
  }));
  const mappedGroups = (groups ?? []).map((group) => ({
    label: group.label,
    options: group.options.map((opt) => ({ ...opt, value: mapValue(opt.value) })),
  }));

  const handleValueChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val === EMPTY_VALUE ? "" : val);
    }
  };

  const stateProps =
    value !== undefined
      ? { value: mappedValue, onValueChange: handleValueChange }
      : { defaultValue: mappedDefaultValue || mappedOptions[0]?.value, onValueChange: handleValueChange };

  const renderItem = (option: PremiumSelectOption, indented = false) => (
    <SelectItem
      key={option.value}
      value={option.value}
      className={cn(
        "rounded-[var(--radius-control)] px-2 py-2 text-sm truncate",
        indented && "pl-4",
        tone === "admin"
          ? "text-[var(--admin-text)] focus:bg-[var(--admin-bg-soft)] focus:text-[var(--admin-accent)]"
          : "text-on-surface focus:bg-surface-container focus:text-primary"
      )}
    >
      <span className="truncate block" title={option.label}>
        {option.label}
      </span>
    </SelectItem>
  );

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
        <SelectValue placeholder={placeholder} className="truncate" />
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
        {mappedOptions.map((option) => renderItem(option))}
        {mappedGroups.map((group, index) => (
          <SelectGroup key={`${group.label}-${index}`}>
            {(index > 0 || mappedOptions.length > 0) && (
              <SelectSeparator
                className={tone === "admin" ? "bg-[var(--admin-border)]" : "bg-outline-variant/35"}
              />
            )}
            <SelectLabel
              className={cn(
                "px-2 pt-1 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
                tone === "admin" ? "text-[var(--admin-text-soft)]" : "text-outline"
              )}
            >
              {group.label}
            </SelectLabel>
            {group.options.map((option) => renderItem(option, true))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
