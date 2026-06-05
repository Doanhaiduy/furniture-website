# Pre-Coding Checklist

## Requirement Readiness

- [x] SRS workbook requirements extracted and compared to the official baseline.
- [x] Duplicate SRS IDs resolved as `FR-07-PUB`, `FR-07-ADM`, `FR-08-PUB`, `FR-08-ADM`, `FR-12-PUB`, and `FR-12-ADM`.
- [x] Every FR/NFR has acceptance criteria.
- [x] Every FR/NFR maps to design, implementation area, and planned tests.
- [x] Out-of-scope ecommerce/mobile behavior is explicit.

## Architecture Readiness

- [x] Next.js 15 App Router frontend is the public rendering target.
- [x] Payload CMS is the admin/backend target.
- [x] Managed PostgreSQL is the database target.
- [x] Cloudinary is the media storage/delivery target.
- [x] Resend, Google Maps Embed, and OpenAI integration boundaries are documented.
- [x] Thin BFF/API boundaries are documented.

## Content Model Readiness

- [x] Product model is structured and quote-first.
- [x] Blog model is full editorial with localized slugs and SEO fields.
- [x] Homepage model is expanded beyond banner editing.
- [x] About, showroom, site settings, quote request, user, media, and AI draft models are documented.
- [x] Vietnamese/English content workflow is defined.

## Security And Operations Readiness

- [x] Role Model Option A is documented.
- [x] Admin/Editor access matrix is documented.
- [x] Cloudinary upload validation requirements are documented.
- [x] Secret-handling rules are documented.
- [x] Monitoring and deployment expectations are documented.
- [ ] First Admin bootstrap process is finalized.
- [ ] Monitoring tool and alert owner are finalized.

## Coding Phase Gate

Go for foundation and homepage coding after dependency alignment. No-go for full launch until remaining slice-specific content and operations questions are closed in `docs/specs/open-questions.md`.
