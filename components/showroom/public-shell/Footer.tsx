"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe2, Share2, MessageCircle } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { PublicSiteSettings } from "@/lib/supabase/queries";

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
  socialLinks?: any[];
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

  return (
    <footer className="public-footer py-16">
      <div className="container-pd grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={
                siteSettings?.logoUrl
                  ? siteSettings.logoUrl.startsWith("http://local-assets")
                    ? siteSettings.logoUrl.replace("http://local-assets", "")
                    : siteSettings.logoUrl
                  : "/logo-final.svg"
              }
              alt={siteSettings?.brandName || labels.common.brand}
              className="h-10 w-10 rounded-md object-contain bg-[#fdebbf] p-0.5"
            />
            <h2 className="font-heading text-xl font-bold">
              {siteSettings?.brandName || labels.common.brand}
            </h2>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
            {locale === "vi"
              ? "Nội thất, thiết bị vệ sinh và gạch ốp lát cao cấp. Không gian chuẩn mực cho mọi ngôi nhà Việt."
              : "Premium furniture, sanitary ware and tiles for refined living spaces."}
          </p>
          <div className="mt-5 flex gap-3">
            {socialLinks && socialLinks.length > 0 ? (
              socialLinks.map((link, idx) => {
                const platformLower = (link.platform || "").toLowerCase();
                let Icon = Share2;
                if (platformLower === "facebook") Icon = Globe2;
                else if (platformLower === "zalo") Icon = MessageCircle;
                return (
                  <a
                    key={idx}
                    className="public-social-link"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label || link.platform}
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })
            ) : (
              <>
                <a
                  className="public-social-link"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Globe2 className="size-4" />
                </a>
                <a
                  className="public-social-link"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Share2 className="size-4" />
                </a>
                <a
                  className="public-social-link"
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Zalo"
                >
                  <Share2 className="size-4" />
                </a>
              </>
            )}
          </div>
        </div>

        <FooterColumn
          title={locale === "vi" ? "Liên kết nhanh" : "Quick links"}
          links={navItems.slice(0, 4).map((item) => ({
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
          ]}
        />

        <div>
          <h3 className="label-pd text-white">
            {locale === "vi" ? "Đăng ký bản tin" : "Newsletter"}
          </h3>
          <p className="mt-4 text-sm leading-6 text-white/70">
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
            />
            <button className="public-footer-button" type="submit">
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
      <div className="container-pd mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
        © 2026 Showroom Nội Thất Phương Đông.
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
          <li key={link.label}>
            <Link className="transition hover:text-white" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
