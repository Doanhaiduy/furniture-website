"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { PublicSiteSettings } from "@/lib/supabase/queries";
import { SocialIcon } from "@/components/showroom/social-icons";

type SocialLink = {
  platform?: string;
  label?: string;
  url: string;
  isEnabled?: boolean;
};

type FooterProps = {
  locale: Locale;
  siteSettings?: PublicSiteSettings;
  labels: {
    common: {
      brand: string;
      tagline: string;
      newsletterSent: string;
    };
    nav: Record<string, string>;
  };
  socialLinks?: SocialLink[];
  navItems: readonly { key: string; href: string }[];
  linkHref: (href: string) => string;
};

export function Footer({
  locale,
  siteSettings,
  labels,
  socialLinks = [],
  navItems,
  linkHref,
}: FooterProps) {
  const [newsletterSent, setNewsletterSent] = useState(false);

  const logoSrc = siteSettings?.logoUrl
    ? siteSettings.logoUrl.startsWith("http://local-assets")
      ? siteSettings.logoUrl.replace("http://local-assets", "")
      : siteSettings.logoUrl
    : "/logo-final.svg";
  const brandName = siteSettings?.brandName || labels.common.brand;
  const phone = siteSettings?.contactPhone;
  const email = siteSettings?.contactEmail;
  const address = siteSettings?.contactAddress;

  const visibleSocials = (socialLinks || []).filter((s) => s && s.url && s.isEnabled !== false);

  return (
    <footer className="public-footer pt-16 pb-8">
      <div className="container-pd grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        {/* Brand + contact */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt={brandName}
              className="h-11 w-11 rounded-lg object-contain bg-[#fdebbf] p-1"
            />
            <h2 className="font-heading text-xl font-bold leading-tight">{brandName}</h2>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
            {locale === "vi"
              ? "Nội thất, thiết bị vệ sinh và gạch ốp lát cao cấp. Không gian chuẩn mực cho mọi ngôi nhà Việt."
              : "Premium furniture, sanitary ware and tiles for refined living spaces."}
          </p>

          <ul className="mt-6 space-y-3 text-sm text-white/75">
            {address ? (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--primary-container)]" />
                <span className="leading-6">{address}</span>
              </li>
            ) : null}
            {phone ? (
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-[var(--primary-container)]" />
                <a className="transition hover:text-white" href={`tel:${phone.replace(/\s+/g, "")}`}>
                  {phone}
                </a>
              </li>
            ) : null}
            {email ? (
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-[var(--primary-container)]" />
                <a className="transition hover:text-white" href={`mailto:${email}`}>
                  {email}
                </a>
              </li>
            ) : null}
          </ul>

          {visibleSocials.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {visibleSocials.map((link, idx) => (
                <a
                  key={`${link.platform}-${idx}`}
                  className="public-social-link"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label || link.platform || "social"}
                  title={link.label || link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <FooterColumn
          title={locale === "vi" ? "Liên kết nhanh" : "Quick links"}
          links={navItems.slice(0, 5).map((item) => ({
            href: linkHref(item.href),
            label: labels.nav[item.key],
          }))}
        />

        <FooterColumn
          title={locale === "vi" ? "Chính sách" : "Policies"}
          links={[
            { href: `/${locale}/contact`, label: locale === "vi" ? "Chính sách bảo mật" : "Privacy policy" },
            { href: `/${locale}/contact`, label: locale === "vi" ? "Điều khoản sử dụng" : "Terms of service" },
            { href: `/${locale}/showrooms`, label: locale === "vi" ? "Hỗ trợ khách hàng" : "Customer support" },
            { href: `/${locale}/contact`, label: locale === "vi" ? "Liên hệ" : "Contact" },
          ]}
        />

        <div>
          <h3 className="label-pd text-white">
            {locale === "vi" ? "Đăng ký bản tin" : "Newsletter"}
          </h3>
          <p className="mt-4 text-sm leading-6 text-white/65">
            {locale === "vi"
              ? "Nhận cập nhật mới nhất về bộ sưu tập và ưu đãi."
              : "Receive the latest collection updates and offers."}
          </p>
          <form
            className="mt-4 flex"
            onSubmit={(event) => {
              event.preventDefault();
              setNewsletterSent(true);
            }}
          >
            <input
              aria-label="Email"
              className="public-footer-field"
              placeholder="Email"
              type="email"
            />
            <button className="public-footer-button inline-flex items-center gap-1.5" type="submit">
              <Send className="size-3.5" />
              {locale === "vi" ? "Gửi" : "Send"}
            </button>
          </form>
          {newsletterSent ? (
            <p className="mt-3 text-xs font-semibold text-white/70">
              {labels.common.newsletterSent}
            </p>
          ) : null}
        </div>
      </div>

      <div className="container-pd mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
        <span>© {new Date().getFullYear()} {brandName}.</span>
        <span>
          {locale === "vi" ? "Thiết kế & phát triển bởi Phương Đông." : "Designed & developed by Phuong Dong."}
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="label-pd text-white">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-white/70">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link className="transition hover:text-white" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
