# Requirements

## ID Policy

The SRS workbook repeats `FR-07`, `FR-08`, and `FR-12` for public and admin scopes. This project keeps the official IDs and adds a suffix only where needed:

- `FR-07-PUB` and `FR-07-ADM`
- `FR-08-PUB` and `FR-08-ADM`
- `FR-12-PUB` and `FR-12-ADM`

All other FR/NFR IDs match the official baseline.

## Functional Requirements

| ID | Source | Actor | Priority | Requirement | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| FR-01 | SRS FR-01 | Visitor | High | Homepage displays company information and the two main product groups. | The two product groups are visible in the first viewport on desktop and mobile. |
| FR-02 | SRS FR-02 | Visitor, Editor, Admin | High | About page displays vision, mission, and capabilities from CMS-managed bilingual content. | Vietnamese and English content can be edited in Payload and rendered publicly. |
| FR-03 | SRS FR-03 | Admin, Editor | High | Admin Product Management supports create, update, delete/archive for products and categories. | Authorized users can manage product/category records; public pages show only publishable content. |
| FR-04 | SRS FR-04 | Visitor | High | Product Filter supports category, price range, and attributes. | Filtered results return within 3 seconds for representative launch data. |
| FR-05 | SRS FR-05 | Visitor | Medium | Product Search supports keyword search and relevant results. | Matching products are ranked ahead of weak matches; empty results provide a reset/quote path. |
| FR-06 | SRS FR-06 | Admin, Editor | Medium | Blog Management supports posts and categories. | CMS users can manage localized slug, title, excerpt, body, cover image, SEO fields, and publish state. |
| FR-07-PUB | SRS FR-07 public | Visitor | High | Public Contact/Quote Form captures consultation or quote requests. | Valid submissions succeed; invalid or unsafe input is rejected with clear errors. |
| FR-07-ADM | SRS FR-07 admin | Admin | High | Admin Quote Request Management supports receiving, storing, searching, and updating requests. | Admin can find quote requests by keyword/status/date/source; Editors cannot access quote requests under Role Model Option A. |
| FR-08-PUB | SRS FR-08 public | Visitor | Medium | Public Showroom List displays showroom name, address, hotline, and map. | Active showrooms render localized address, hotline, Google Maps embed, and fallback map link. |
| FR-08-ADM | SRS FR-08 admin | Admin, Editor | Medium | Admin Showroom Management supports create, update, delete/archive. | Authorized content users can manage showroom entries and localized fields. |
| FR-09 | SRS FR-09 | Visitor, Admin | Medium | Social Media Integration supports official links and sharing. | Configured social links/share URLs open correct destinations for the current locale/page. |
| FR-10 | SRS FR-10 | Admin | High | CMS System Management supports website content, users, settings, and role permissions. | Admin can manage users/settings/all content; Editor cannot manage users/settings/quote requests. |
| FR-11 | SRS FR-11 | Admin, Editor | Medium | AI Assistance supports content and SEO drafting inside CMS. | AI output is saved as editable draft content and requires human review before publication. |
| FR-12-PUB | SRS FR-12 public | Visitor | High | Public Bilingual switching supports Vietnamese/English by one click. | Visitors can switch locale and remain on the equivalent page when available. |
| FR-12-ADM | SRS FR-12 admin | Admin, Editor | High | Admin Bilingual Content Management supports separate Vietnamese and English content. | CMS models store and validate locale-specific public fields independently. |

## Non-Functional Requirements

| ID | Source | Priority | Requirement | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| NFR-01 | SRS NFR-01 | High | Performance: public pages load within 3 seconds and product filter results complete within 3 seconds. | PageSpeed Mobile score is at least 80 for launch-critical public pages. |
| NFR-02 | SRS NFR-02 | High | Availability target is uptime >= 99.5%. | Monitoring and alert ownership are configured before production launch. |
| NFR-03 | SRS NFR-03 | High | Responsive layouts support desktop, tablet, and mobile. | Primary flows have no broken layout, hidden controls, or incoherent overlap. |
| NFR-04 | SRS NFR-04 | Medium | Browser compatibility covers Chrome, Edge, Firefox, Safari, and Coc Coc. | No critical browser-specific defect remains in smoke coverage. |
| NFR-05 | SRS NFR-05 | High | Security covers HTTPS, XSS prevention, SQL injection prevention, authorization, upload safety, and secret handling. | No critical security finding remains open for implemented scope. |
| NFR-06 | SRS NFR-06 | High | SEO covers meta, sitemap, robots, schema, canonical, Open Graph, and localized alternates. | Implemented public routes pass the project SEO checklist. |
| NFR-07 | SRS NFR-07 | Medium | Extensibility allows new modules without major architecture changes. | New slices fit the approved Next.js/Payload/PostgreSQL/Cloudinary boundaries. |

## Binding Decisions

- Role model: Option A. Editor manages publishable content only. Admin manages users, settings, quote requests, and all content.
- Product model: structured quote-first catalog with category, optional price range, dimensions, material, colors, brand/series, attributes, images, and SEO fields. No ecommerce SKU complexity is required.
- Blog model: full editorial section with categories, localized slugs, excerpt, body, cover image, SEO fields, and publish state.
- Homepage model: CMS-managed full homepage, not banner-only. Required sections are defined in `docs/specs/data-model.md`.
- Media model: Cloudinary stores and delivers media.
- Frontend/backend model: Next.js frontend plus Payload CMS backend/admin plus thin BFF/API where needed.

## Global Constraints

- Do not implement cart, payment, order management, order tracking, or mobile app behavior.
- No hardcoded public UI text outside next-intl messages.
- Validate public forms, query params, admin mutations, media metadata, and AI requests server-side.
- Admin/CMS operations must enforce server-side authorization through Payload access control and server-only helpers.
- Do not expose database credentials, Payload secrets, Cloudinary secrets, Resend keys, Google Maps keys, or OpenAI keys to the browser.
- Product and blog detail pages must use localized slug routes.
- Public pages must include localized SEO metadata.
- Media upload must validate file type, size, dimensions where practical, and ownership/context.
- Do not leave mock data in production routes unless clearly marked as seed/demo.
