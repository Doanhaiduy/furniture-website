# Product Brief

## Product

- Project: Website doanh nghiệp Đồ gỗ nội thất & Thiết bị vệ sinh.
- Brand: Showroom Nội Thất Phương Đông.
- Primary language: Vietnamese.
- Secondary language: English.
- Business goal: introduce the company, showcase products, capture consultation/quote leads, and support marketing/SEO.

## Source Baseline

- `docs/srs/Tai_lieu_SRS_Web_do_go_noi_that.xlsx`, version 1.0.
- Official requirement baseline supplied in the documentation audit request.
- Architecture decisions in `docs/decisions/`.

The SRS workbook contains these sheets: overview, functional requirements, non-functional requirements, and stakeholders. The official baseline matches the workbook requirement set and adds binding architecture/content decisions for the coding phase.

## In Scope

- Public website: homepage, about, product catalog, product filtering/search, blog, showroom list/maps, contact/quote form, social links/share, SEO, and one-click Vietnamese/English switching.
- Admin CMS: Payload CMS for homepage, about, products, categories, blog posts, blog categories, showrooms, quote requests, media, users, settings, and bilingual content.
- Lead workflow: public lead capture, persistence, admin review, and Resend email notification.
- Media: Cloudinary-backed uploads and delivery for public images/video.
- AI assistance: OpenAI-powered content and SEO drafts in CMS, with human review before publishing.

## Out Of Scope

- Shopping cart.
- Online payment.
- Order management or order tracking.
- Native mobile app.
- Ecommerce SKU, inventory, fulfillment, invoice, or checkout workflows.

## Primary Users

- Visitors researching the showroom, products, showroom locations, and contact channels.
- Potential customers submitting consultation or quote requests.
- Editors managing publishable content only.
- Admins managing all content, quote requests, users, settings, integrations, and publication governance.

## Standard Architecture

- Frontend: Next.js 15 App Router, TypeScript, Tailwind CSS v4, shadcn/ui.
- CMS/Admin backend: Payload CMS 3.x.
- Database: managed PostgreSQL through Payload's PostgreSQL adapter.
- Media storage/delivery: Cloudinary.
- i18n: next-intl with `vi` and `en`.
- Email: Resend.
- Maps: Google Maps Embed.
- AI: OpenAI for draft-only content and SEO assistance inside CMS.
- Testing: Vitest for unit/integration checks, Browser MCP-first for browser-visible QA/user journeys, and Playwright only as backup for CI/headless deterministic automation.
- Deployment: Vercel for public frontend, separate Payload app/runtime, managed PostgreSQL database.

## Success Criteria

- Homepage first viewport shows company signal and both product groups: wooden furniture and sanitary equipment.
- Public pages are bilingual, SEO-ready, responsive, and do not include ecommerce behavior.
- Product filters/search return relevant results within the 3-second target for launch data.
- Valid quote requests are saved, visible to Admin users, and trigger a notification attempt.
- Payload CMS allows business users to manage launch content without developer intervention.
- Admin/Editor permissions match Role Model Option A.
- Every FR/NFR maps to design, implementation area, and at least one planned validation path, with Browser MCP as the default for UI/user journey evidence.
