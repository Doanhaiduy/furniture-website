"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import {
  quoteRequestSchema,
  type QuoteRequestInput,
} from "@/lib/validations/quote";
import { PremiumSelect } from "./premium-select";

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
};

export function QuoteForm({
  locale,
  labels,
  productId,
  sourcePath,
}: {
  locale: Locale;
  labels: QuoteLabels;
  productId?: string;
  sourcePath: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      locale,
      fullName: "",
      phone: "",
      email: "",
      company: "",
      service: productId || "interior-consulting",
      message: "",
      productId: productId || "",
      categoryId: "",
      sourcePath,
      honeypot: "",
    },
  });

  async function submit(values: QuoteRequestInput) {
    setServerError("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setServerError(result.message || "Unable to submit request.");
      return;
    }

    router.push(`/${locale}/contact/success`);
  }

  return (
    <form
      className="card-pd reveal-soft grid gap-5 p-6 md:p-8 lg:p-10"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <h2 className="type-section-title text-primary">
        {labels.formTitle}
      </h2>
      <input type="hidden" {...register("locale")} />
      <input type="hidden" {...register("productId")} />
      <input type="hidden" {...register("sourcePath")} />
      <label className="sr-only">
        {labels.honeypot}
        <input tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.name} error={errors.fullName?.message}>
          <input className="input-pd" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
        </Field>
        <Field label={labels.phone} error={errors.phone?.message}>
          <input className="input-pd" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.email} error={errors.email?.message}>
          <input className="input-pd" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        </Field>
        <Field label={labels.company} error={errors.company?.message}>
          <input className="input-pd" aria-invalid={Boolean(errors.company)} {...register("company")} />
        </Field>
      </div>
      <Field label={labels.service} error={errors.service?.message}>
        <Controller
          name="service"
          control={control}
          render={({ field }) => (
            <PremiumSelect
              value={field.value}
              onValueChange={field.onChange}
              options={[
                {
                  value: "interior-consulting",
                  label: locale === "vi" ? "Thiết kế nội thất trọn gói" : "Full interior consulting",
                },
                { value: "wood-furniture", label: locale === "vi" ? "Đồ gỗ nội thất" : "Wood furniture" },
                { value: "sanitary", label: locale === "vi" ? "Thiết bị vệ sinh" : "Sanitary ware" },
                { value: "tiles", label: locale === "vi" ? "Gạch ốp lát" : "Tiles" },
              ]}
              placeholder={labels.service}
              ariaLabel={labels.service}
            />
          )}
        />
      </Field>
      <Field label={labels.message} error={errors.message?.message}>
        <textarea className="input-pd min-h-36 resize-y" aria-invalid={Boolean(errors.message)} {...register("message")} />
      </Field>

      {serverError ? (
        <p role="alert" className="field-feedback rounded-md border border-error/30 bg-error-container px-3 py-2 text-sm text-on-error-container">
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button className="button-pd min-w-44" disabled={isSubmitting} type="submit">
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
        <span className="field-label-pd">{label}</span>
      {children}
      {error ? <span role="alert" className="field-feedback text-xs text-error">{error}</span> : null}
    </label>
  );
}
