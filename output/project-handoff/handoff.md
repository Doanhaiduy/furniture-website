# Full Project Figma Handoff

Generated: 2026-06-02T16:09:45.965Z

## Overview

This package expands the previous admin-only handoff into a full-project handoff covering public/client screens, admin/CMS screens, key modals and interaction states, color tokens, component inventory, responsive frame specs, and a static review board.

The screenshots were captured from the running Next.js app at `http://127.0.0.1:3000` using real browser interactions. No fake `.fig` file was generated.

## What Was Fixed Before Export

- Admin date/calendar triggers now open real calendar popovers and expose open/selected state.
- Admin shared date selection updates dashboard chart, utility rail, and selected work link.
- Admin active/open/selected/focus states were polished for buttons, tabs, selects, popovers, and editor controls.
- Admin fixed background behavior was replaced with a robust fixed pseudo-layer behind the shell.
- Admin dynamic section routes render correctly for supported sections instead of falling through.
- Admin popover/modal layering uses visible z-index/portal behavior and stable overflow handling.

## Export Scope

- Public route screens: 18 routes.
- Admin route screens: 14 routes.
- Responsive breakpoints: Desktop 1440x1000, Tablet 834x1112, Mobile 390x844.
- Interaction state screenshots: 23 states.
- Design system exports: tokens, components, screen maps, responsive frame map, interaction state map.
- Figma-ready exports: PNG screens, SVG assets, frames JSON, reconstruction README.

## Updated Interaction Notes

- Public catalog menu opens from the real catalog trigger and also opens type mega-menu content on hover/focus.
- Mobile public navigation expands below the sticky header and includes navigation, catalog links, locale switch, and quote CTA.
- Product detail gallery supports selected thumbnail state and a real image dialog.
- Product detail tabs expose selected tab state and update content.
- Product filters expose expanded state and select-open portal state.
- Quote form exposes validation errors without submitting invalid lead data.
- Admin calendar, notifications, selects, publish confirmation, editor active controls, AI accepted state, and media selected state are captured as real interactions.

## Admin-Specific Behavior Notes

- Admin pages keep the current visual language: light operational canvas, dark sidebar, violet accent, compact panels, utility rail.
- Role Model Option A remains reflected in users/settings/quotes/access-denied states.
- AI workflow remains draft-only with explicit human review/acceptance state.
- Upload/media UI remains governance-oriented and does not bypass validation requirements.
- Fixed background is applied behind the admin shell and does not cover foreground content.

## Route Screen Map

| Screen | Route | Area | Template | Captures |
| --- | --- | --- | --- | --- |
| Public Home VI | `/vi` | public | home | desktop/tablet/mobile |
| Public Home EN | `/en` | public | home | desktop/tablet/mobile |
| About VI | `/vi/about` | public | content | desktop/tablet/mobile |
| Products VI | `/vi/products` | public | listing | desktop/tablet/mobile |
| Products Filtered VI | `/vi/products?category=wood&material=walnut&room=living` | public | listing-filtered | desktop/tablet/mobile |
| Products EN | `/en/products` | public | listing | desktop/tablet/mobile |
| Product Detail VI | `/vi/products/sofa-curve-velour` | public | product-detail | desktop/tablet/mobile |
| Product Detail EN | `/en/products/sofa-curve-velour` | public | product-detail | desktop/tablet/mobile |
| Blog Listing VI | `/vi/blog` | public | listing-editorial | desktop/tablet/mobile |
| Blog Listing EN | `/en/blog` | public | listing-editorial | desktop/tablet/mobile |
| Blog Detail VI | `/vi/blog/bi-quyet-chon-go-oc-cho` | public | article | desktop/tablet/mobile |
| Blog Detail EN | `/en/blog/bi-quyet-chon-go-oc-cho` | public | article | desktop/tablet/mobile |
| Showrooms VI | `/vi/showrooms` | public | showrooms | desktop/tablet/mobile |
| Contact VI | `/vi/contact` | public | contact | desktop/tablet/mobile |
| Contact EN | `/en/contact` | public | contact | desktop/tablet/mobile |
| Contact Success VI | `/vi/contact/success` | public | feedback | desktop/tablet/mobile |
| Contact Error VI | `/vi/contact/error` | public | feedback | desktop/tablet/mobile |
| Not Found VI | `/vi/not-found-demo` | public | feedback | desktop/tablet/mobile |
| Admin Dashboard | `/admin` | admin | admin-dashboard | desktop/tablet/mobile |
| Admin Products | `/admin/products` | admin | admin-table | desktop/tablet/mobile |
| Admin Product Create | `/admin/products?new=1` | admin | admin-editor | desktop/tablet/mobile |
| Admin Categories | `/admin/categories` | admin | admin-cards | desktop/tablet/mobile |
| Admin Category Create | `/admin/categories?new=1` | admin | admin-editor | desktop/tablet/mobile |
| Admin Blog Editor | `/admin/blog` | admin | admin-editor | desktop/tablet/mobile |
| Admin Showrooms | `/admin/showrooms` | admin | admin-cards | desktop/tablet/mobile |
| Admin Media | `/admin/media` | admin | admin-media | desktop/tablet/mobile |
| Admin Quotes | `/admin/quotes` | admin | admin-table | desktop/tablet/mobile |
| Admin Users | `/admin/users` | admin | admin-table | desktop/tablet/mobile |
| Admin Settings | `/admin/settings` | admin | admin-settings | desktop/tablet/mobile |
| Admin AI Assistant | `/admin/ai-assistant` | admin | admin-ai | desktop/tablet/mobile |
| Admin Login | `/admin/login` | admin | auth | desktop/tablet/mobile |
| Admin Access Denied | `/admin/access-denied` | admin | feedback | desktop/tablet/mobile |

## Interaction State Map

| State | Route | Area | State | Screenshot |
| --- | --- | --- | --- | --- |
| Public Catalog Brands Open | `/vi` | public | open | `screenshots/states/public-catalog-brands-open.png` |
| Public Catalog Type Hover | `/vi` | public | hover-open | `screenshots/states/public-catalog-type-hover.png` |
| Public Mobile Menu Open | `/vi` | public | open | `screenshots/states/public-mobile-menu-open.png` |
| Product Image Modal Open | `/vi/products/sofa-curve-velour` | public | modal-open | `screenshots/states/public-product-image-modal-open.png` |
| Product Selected Thumbnail | `/vi/products/sofa-curve-velour` | public | selected | `screenshots/states/public-product-selected-thumbnail.png` |
| Product Specifications Tab | `/vi/products/sofa-curve-velour` | public | selected-tab | `screenshots/states/public-product-tabs-specifications.png` |
| Products Filters Expanded | `/vi/products` | public | expanded | `screenshots/states/public-products-filters-expanded.png` |
| Products Filter Select Open | `/vi/products` | public | select-open | `screenshots/states/public-products-filter-select-open.png` |
| Contact Service Select Open | `/vi/contact` | public | select-open | `screenshots/states/public-contact-service-select-open.png` |
| Contact Validation Errors | `/vi/contact` | public | error | `screenshots/states/public-contact-validation-errors.png` |
| Product Card Hover | `/vi/products` | public | hover | `screenshots/states/public-product-card-hover.png` |
| Public Fixed Background Visible | `/vi/about` | public | scrolled | `screenshots/states/public-fixed-background-visible.png` |
| Admin Calendar Open | `/admin` | admin | calendar-open | `screenshots/states/admin-calendar-open.png` |
| Admin Calendar Selected Date | `/admin` | admin | selected-date | `screenshots/states/admin-calendar-selected-date.png` |
| Admin Products Select Open | `/admin/products` | admin | select-open | `screenshots/states/admin-products-select-open.png` |
| Admin Notifications Open | `/admin` | admin | popover-open | `screenshots/states/admin-notifications-open.png` |
| Admin Publish Confirmation Modal | `/admin/blog` | admin | modal-open | `screenshots/states/admin-publish-confirmation-modal.png` |
| Admin Rich Text Active Controls | `/admin/blog` | admin | active | `screenshots/states/admin-rich-text-active-controls.png` |
| Admin Locale Tab Selected | `/admin/blog` | admin | selected-tab | `screenshots/states/admin-locale-tab-selected.png` |
| Admin AI Draft Accepted | `/admin/ai-assistant` | admin | result-accepted | `screenshots/states/admin-ai-draft-accepted.png` |
| Admin Media Selected File | `/admin/media` | admin | selected | `screenshots/states/admin-media-selected-file.png` |
| Admin Fixed Background Visible | `/admin/settings` | admin | scrolled | `screenshots/states/admin-fixed-background-visible.png` |
| Admin Sidebar Collapsed | `/admin` | admin | collapsed | `screenshots/states/admin-sidebar-collapsed.png` |

## File / Component Map

- `components/showroom/public-shell.tsx` - PublicShell: Localized site shell with sticky header, desktop catalog mega menu, mobile navigation, footer, newsletter.
- `components/showroom/hero-showcase.tsx` - HeroShowcase: Homepage carousel with active, adjacent, paused, and reduced-motion behavior.
- `components/showroom/product-filter-panel.tsx` - ProductFilterPanel: Query-driven product filtering with expandable advanced fields.
- `components/showroom/premium-select.tsx` - PremiumSelect: Radix select wrapper with public/admin tones and portal content.
- `components/showroom/product-card.tsx` - ProductCard: Product list card with image, category, tags, price/quote copy, hover lift.
- `components/showroom/product-detail-experience.tsx` - ProductGallery: Product detail media gallery with selected thumbnails and image modal.
- `components/showroom/product-detail-experience.tsx` - ProductInformationTabs: Tabbed product content for overview, specs, materials, care, delivery.
- `components/showroom/quote-form.tsx` - QuoteForm: Lead capture form with Zod/RHF validation and service select.
- `components/showroom/article-toc.tsx` - ArticleToc: Article navigation and scan support for blog detail.
- `components/showroom/social-share.tsx` - SocialShare: Share actions for article pages.
- `components/showroom/admin-shell.tsx` - AdminShell: Admin layout with sidebar, sticky header, mobile admin nav, utility rail, locale toggle.
- `components/showroom/admin-dashboard-widgets.tsx` - AdminDatePicker: Shared admin date picker using real popover/calendar state.
- `components/showroom/admin-dashboard-widgets.tsx` - DashboardInsightChart: Admin performance chart linked to shared date selection.
- `components/showroom/admin-dashboard-widgets.tsx` - NotificationButton: Header notification popover and unread indicator.
- `components/showroom/admin-interactions.tsx` - PublishWorkflow: Draft/publish/archive status controls with confirmation modal.
- `components/showroom/admin-interactions.tsx` - AiDraftWorkflow: Draft-only AI assistance with loading, result, accept, and error states.
- `components/showroom/admin-interactions.tsx` - RichTextEditorMock: Editor toolbar demo with active formatting and image placeholder feedback.
- `components/showroom/admin-interactions.tsx` - MediaUploadPanel: Cloudinary-ready upload state mock with selected-file feedback.
- `app/admin/[section]/page.tsx` - AdminSectionPage: Validated admin dynamic section router for all supported admin sections.

## Deliverable Map

- `review-board.html` - static stakeholder review board with all route and state screenshots.
- `project-handoff-summary.pdf` - concise PDF summary for client review.
- `design-tokens.json` - color, typography, spacing, radius, shadow, motion, breakpoints.
- `component-inventory.json` - component purpose, file, states, and responsive notes.
- `screen-map.json` - complete route screen map with screenshot references.
- `public-screen-map.json` - public/client subset.
- `admin-screen-map.json` - admin subset.
- `responsive-frame-map.json` - desktop/tablet/mobile frame references per screen.
- `interaction-state-map.json` - modal/open/selected/hover/error/active state references.
- `figma-ready/frames.json` - Figma-import-friendly frame/spec JSON.
- `figma-ready/assets/` - reusable SVG visual assets.
- `figma-ready/screens/` - PNG copies organized by breakpoint/state.
- `screenshots/` - source PNG screenshots organized by breakpoint/state.

## Figma File Status

A true `.fig` file was not created because Figma's proprietary file format is not realistically exportable in this local environment without a Figma plugin/API workflow and authenticated import. Instead, this package provides a Figma-ready structured handoff: PNG frames, SVG assets, tokens, component inventory, screen maps, and reconstruction instructions.
