"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import {
  quoteRequestSchema,
  type QuoteRequestInput,
} from "@/lib/validations/quote";
import { PremiumSelect } from "./premium-select";
import { products } from "@/lib/showroom-mock-fallback";

type QuoteLabels = {
  formTitle: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  service: string;
  message: string;
  submit: string;
  sending: string;
  responseTime: string;
  honeypot: string;
  submitError: string;
};

export function QuoteForm({
  locale,
  labels,
  productId,
  categoryId,
  sourcePath,
}: {
  locale: Locale;
  labels: QuoteLabels;
  productId?: string;
  categoryId?: string;
  sourcePath: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  
  const isVi = locale === "vi";

  // Build product options from mock fallback database
  const productOptions = [
    { value: "", label: isVi ? "Khác / Không có trong danh sách" : "Other / Not in list" },
    ...products.map((p) => ({
      value: p.slug,
      label: isVi ? p.name.vi : p.name.en,
    })),
  ];

  // Calculate initial service and categoryId from productId if provided
  const initialProduct = productId ? products.find((p) => p.slug === productId) : null;
  const initialService = initialProduct
    ? initialProduct.categoryKey === "sanitary"
      ? "sanitary"
      : initialProduct.categoryKey === "tiles"
      ? "tiles"
      : "wood-furniture"
    : "interior-consulting";
  
  const initialCategoryId = categoryId || (initialProduct?.categoryKey || "");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      locale,
      fullName: "",
      phone: "",
      email: "",
      company: "",
      service: initialService,
      message: "",
      productId: productId || "",
      categoryId: initialCategoryId,
      sourcePath,
      sourceUrl: typeof window === "undefined" ? "" : window.location.href,
      honeypot: "",
    },
  });

  // Watch productId changes to auto-update categoryId and service
  const selectedProductId = watch("productId");
  
  // Effect to update category when product changes
  React.useEffect(() => {
    if (selectedProductId) {
      const matchedProduct = products.find((p) => p.slug === selectedProductId);
      if (matchedProduct) {
        // Auto-update service type based on category
        if (matchedProduct.categoryKey === "sanitary") {
          setValue("service", "sanitary");
        } else if (matchedProduct.categoryKey === "tiles") {
          setValue("service", "tiles");
        } else {
          setValue("service", "wood-furniture");
        }
        // Update categoryId (using categoryKey for mock data)
        setValue("categoryId", matchedProduct.categoryKey || "");
      }
    }
  }, [selectedProductId, setValue]);

  async function submit(values: QuoteRequestInput) {
    setServerError("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setServerError(result.message || labels.submitError);
      return;
    }

    router.push(`/${locale}/contact/success`);
  }

  return (
    <form
      className="card-pd reveal-soft grid gap-5 p-6 md:p-8 lg:p-10 bg-white"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <h2 className="type-section-title text-primary">
        {labels.formTitle}
      </h2>
      
      {/* Show selected product info if coming from product page */}
      {productId && initialProduct && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
          <div className="bg-primary/10 rounded-md p-2 shrink-0">
            <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isVi ? "Sản phẩm đã chọn" : "Selected Product"}
            </p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {isVi ? initialProduct.name.vi : initialProduct.name.en}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isVi ? "Danh mục" : "Category"}: {isVi ? initialProduct.category.vi : initialProduct.category.en}
            </p>
          </div>
        </div>
      )}
      
      <input type="hidden" {...register("locale")} />
      <input type="hidden" {...register("sourcePath")} />
      <label className="sr-only" aria-hidden="true">
        {labels.honeypot}
        <input type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </label>

      {/* Name and Phone */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.name} error={errors.fullName?.message}>
          <input className="input-pd" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
        </Field>
        <Field label={labels.phone} error={errors.phone?.message}>
          <input className="input-pd" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
        </Field>
      </div>

      {/* Email and Company (labeled as optional) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={`${labels.email} ${isVi ? "(tùy chọn)" : "(optional)"}`}
          error={errors.email?.message}
        >
          <input className="input-pd" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        </Field>
        <Field
          label={`${labels.company} ${isVi ? "(tùy chọn)" : "(optional)"}`}
          error={errors.company?.message}
        >
          <input className="input-pd" aria-invalid={Boolean(errors.company)} {...register("company")} />
        </Field>
      </div>

      {/* Service Type and Product selection */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.service} error={errors.service?.message}>
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <PremiumSelect
                value={field.value ?? ""}
                onValueChange={field.onChange}
                options={[
                  {
                    value: "interior-consulting",
                    label: isVi ? "Thiết kế nội thất trọn gói" : "Full interior consulting",
                  },
                  { value: "wood-furniture", label: isVi ? "Đồ gỗ nội thất" : "Wood furniture" },
                  { value: "sanitary", label: isVi ? "Thiết bị vệ sinh" : "Sanitary ware" },
                  { value: "tiles", label: isVi ? "Gạch ốp lát" : "Tiles" },
                ]}
                placeholder={labels.service}
                ariaLabel={labels.service}
              />
            )}
          />
        </Field>

        <Field
          label={isVi ? "Sản phẩm quan tâm" : "Product of interest"}
          error={errors.productId?.message}
        >
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <PremiumSelect
                value={field.value ?? ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  // Auto-update logic is handled by useEffect above
                }}
                options={productOptions}
                placeholder={isVi ? "Chọn sản phẩm..." : "Select product..."}
                ariaLabel={isVi ? "Sản phẩm quan tâm" : "Product of interest"}
              />
            )}
          />
        </Field>
      </div>

      <Field label={labels.message} error={errors.message?.message}>
        <textarea
          className="input-pd min-h-36 resize-y"
          placeholder={isVi ? "Nhập yêu cầu cụ thể của bạn về kích thước, màu sắc hoặc thi công..." : "Enter details about sizing, colors, or customization request..."}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
      </Field>

      {serverError ? (
        <p role="alert" className="field-feedback rounded-md border border-error/30 bg-error-container px-3 py-2 text-sm text-on-error-container">
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button className="button-pd min-w-44 cursor-pointer" disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          {isSubmitting ? labels.sending : labels.submit}
        </button>
        <span className="text-sm text-outline">{labels.responseTime}</span>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="group grid gap-2">
      <span className="field-label-pd text-slate-800">{label}</span>
      {children}
      {error ? <span role="alert" className="field-feedback text-xs text-error font-semibold mt-0.5">{error}</span> : null}
    </label>
  );
}
