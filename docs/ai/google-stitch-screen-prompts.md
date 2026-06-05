# Google Stitch Screen Prompt Library

Use this file as the source prompt list for Google Stitch. The existing Homepage and existing CMS Dashboard are the visual source of truth.

## How To Use

For every public website screen, paste `PUBLIC BASE PROMPT` first, then paste the target screen prompt.

For every CMS screen, paste `CMS BASE PROMPT` first, then paste the target screen prompt.

If Stitch supports references, attach the existing Homepage screenshot for public prompts and the existing Dashboard screenshot for CMS prompts.

Do not ask Stitch to redesign the brand, header, dashboard shell, sidebar, typography, color system, or button system. The task is to extend the existing design system to missing screens.

## PUBLIC BASE PROMPT

```text
Design a high-fidelity public website screen for "Showroom Noi That Phuong Dong", a Vietnamese business website for wooden furniture and sanitary equipment. Use the existing Homepage design as the strict visual reference. Match the same header layout, logo placement, navigation style, language switcher, quote CTA, footer, typography scale, spacing rhythm, color palette, image treatment, border radius, shadow style, and button hierarchy. Do not redesign the brand system.

Public UI copy should primarily be Vietnamese. English appears only where a locale switch or English page state is being designed. The website is bilingual Vietnamese and English, SEO-focused, consultation-focused, and lead-generation-focused.

Always include the existing public header exactly as the Homepage uses it. Keep the header consistent across desktop and mobile. If a mobile screen is requested, adapt the existing header into the same mobile menu system, not a new header.

The business model is quote-first showroom consultation. Do not add cart, checkout, payment, order tracking, order management, inventory, buy-now buttons, ecommerce SKU complexity, mobile app prompts, or account login features for public visitors.

Use semantic, accessible, responsive layout thinking: clear hierarchy, visible focus/hover/active states where relevant, readable text, no text overlap, no tiny inaccessible controls, no broken mobile layout. Product and blog routes are localized slug-based pages. Public pages should visually support localized SEO metadata, breadcrumbs, canonical/alternate route behavior, and share previews where relevant.
```

## CMS BASE PROMPT

```text
Design a high-fidelity Payload CMS/admin screen for "Showroom Noi That Phuong Dong". Use the existing CMS Dashboard design as the strict visual reference. Match the same admin sidebar layout, sidebar width, navigation groups, active item styling, top bar, role badge, page heading style, table density, form fields, tabs, status chips, modals, buttons, empty states, spacing rhythm, typography, color palette, border radius, and dashboard shell.

Do not redesign the CMS shell. Keep the sidebar and top bar consistent with the existing Dashboard on every CMS screen. The CMS should feel like a practical content operations tool for Admin and Editor roles, not a marketing website.

Role model is binding: Admin can manage users, settings, quote requests, integrations, media governance, and all content. Editor can manage publishable content only: products, categories, blog, showrooms, homepage/about content, and media used for content. Editor must not access quote requests, users, privileged settings, integration secrets, or admin-only controls.

Content lifecycle must support draft, published, and archived states. Bilingual Vietnamese and English content must be managed separately. Publication readiness should consider missing Vietnamese content, missing English content, missing SEO fields, missing image alt text, invalid slug, duplicate slug, unsafe URL, upload type/size errors, unsaved changes, and publish/archive/delete confirmations.

AI assistant behavior is draft-only. AI may generate content or SEO suggestions, but never publishes, changes status, sends notifications, uses private quote request data, or exposes secrets. Human review is required before publication.
```

## Public Website Screens

### 01. Homepage Mobile / Existing Home Extension

```text
Create a mobile-first variant of the existing Homepage, without changing the established Homepage art direction. This is not a new homepage redesign; it is the mobile adaptation and state coverage for the existing home screen.

Canvas: mobile 390px wide. Keep the same brand header, logo, menu trigger, language switcher, and quote CTA behavior from the existing Homepage. The first viewport must clearly show the brand, hero message, primary quote CTA, and the two product groups: "Do go noi that" and "Thiet bi ve sinh". The two product groups must be visible before the user scrolls deeply; use compact cards or stacked tiles if needed.

Below the first viewport, include featured categories, featured products, showroom teaser, trust highlights, and quote CTA strip. Use real showroom-oriented Vietnamese sample copy. Product cards should include image, product/category name, short descriptor, and quote/contact action, not buy buttons.

Show responsive behavior details: sticky or compact header state, open-menu entry point, touch-friendly buttons, no text overlap, no tiny chips. Keep visual style identical to the existing Homepage.
```

### 02. About Page

```text
Create the public About page. Use the existing Homepage as the visual reference for header, footer, typography, image style, colors, spacing, buttons, and section rhythm.

The page should include: breadcrumb, page title, short company introduction, vision section, mission section, capabilities/services section, showroom credibility section, material and installation/service strengths, and an optional timeline or gallery block. The tone should be trustworthy, established, and consultation-oriented for a furniture and sanitary equipment showroom.

Use Vietnamese primary UI copy, for example: "Gioi thieu", "Tam nhin", "Su menh", "Nang luc thi cong va tu van", "Den showroom de trai nghiem vat lieu". Include realistic placeholder content but avoid unsupported claims such as "so 1", "gia re nhat", or guaranteed warranties unless visually marked as placeholder.

Layout should work as a polished desktop page and have an obvious mobile stacking behavior. Keep CTA options aligned with the site: view products, visit showroom, request quote. Do not add cart, checkout, login, or ecommerce elements.
```

### 03. Product Listing Desktop

```text
Create the desktop Product Listing page using the existing Homepage style. Canvas: desktop 1440px.

Include the unchanged public header and footer. Main content must include breadcrumb, localized page title, short SEO intro, search input, category filter, price range filter, attribute filters, sort control, grid/list toggle, applied filter chips, product result count, product grid, pagination, and empty state design.

Product cards must support: product image, category label, localized product name, short summary, price range, key attributes such as material/dimensions/color/brand where available, featured badge if applicable, and quote CTA. The CTA language must be quote/consultation-oriented: "Yeu cau bao gia", "Lien he tu van", not "Buy now" or "Add to cart".

Left filter panel or top filter bar may be used, but it must match the existing Homepage spacing and component style. Show realistic Vietnamese sample filters: "Phong khach", "Phong ngu", "Tu bep", "Thiet bi ve sinh", "Gia tham khao", "Chat lieu", "Mau sac". Include disabled/loading-friendly states for filter controls and ensure the layout does not shift when chips wrap.
```

### 04. Product Listing Mobile

```text
Create the mobile Product Listing page and filter drawer. Canvas: mobile 390px wide. Use the existing Homepage mobile header style exactly.

The screen must include mobile breadcrumb or compact page context, page title, search field, sort control, filter drawer trigger, applied filter chips, product result count, product cards, pagination or load-more, and empty state. Product cards should be compact but still include image, product name, category, price range, one or two attributes, and quote CTA.

Design the filter drawer open state: category filter, price range filter, attribute filters, clear-all action, apply button, close button, and current filter count. Applied chips should be removable and touch-friendly. Include a no-results empty state with "Xoa bo loc" and "Gui yeu cau tu van" CTAs.

Keep the same visual language as the Homepage. Avoid dense desktop controls squeezed into mobile. Do not add cart, payment, inventory, or account features.
```

### 05. Product Detail

```text
Create the public Product Detail page using the Homepage visual system. Include the unchanged public header and footer.

The page must include breadcrumb, localized product title, category label, gallery with main image and thumbnails, product summary, price range, attributes/specification table, material notes, dimensions, color/finish if available, brand/series if available, availability wording limited to consultation/showroom context, primary quote CTA, secondary hotline/contact CTA, and related or featured products.

Add SEO-friendly content blocks: short overview, usage suggestions, showroom consultation note, and related category links. Include social sharing buttons if they fit naturally. Use Vietnamese sample copy and make it clear that price is a reference/range and quote request is needed.

Do not include add-to-cart, quantity selector, checkout, stock counter, delivery calculator, order tracking, or user reviews unless explicitly marked as editorial content. Product action should be "Yeu cau bao gia" or "Lien he tu van".
```

### 06. Blog Listing

```text
Create the public Blog/News listing page using the Homepage style. Include unchanged header and footer.

The page must include breadcrumb, page title "Tin tuc", short intro, category filter, optional featured article area, post card grid, pagination, and empty state. Post cards must include cover image, category chip, localized title, excerpt, publish date, and read-more action.

Use Vietnamese sample categories such as "Tu van noi that", "Thiet bi ve sinh", "Kinh nghiem showroom", "Xu huong vat lieu". The layout should support SEO and editorial browsing, with strong image hierarchy and readable excerpts.

Include category filter selected state, hover state on post cards, and an empty state with a reset filter action. Do not include unrelated ecommerce widgets or newsletter popups unless they match the existing Homepage CTA style.
```

### 07. Blog Article Detail

```text
Create the public Blog Article Detail page using the existing Homepage design language. Include unchanged public header and footer.

The screen must include breadcrumb, category, article title, publish date, cover image, article body layout, rich text styling, headings, image/caption example, quote/contact CTA if relevant, related posts, and social share buttons. The article body should be readable and editorial, with comfortable line length and strong spacing.

Include Vietnamese example article content about choosing wooden furniture or sanitary equipment. Add share interactions for Facebook, Zalo, and copy link. Include copied-link success state if possible.

Keep the page SEO-ready visually: breadcrumb, article metadata, strong H1, related internal links. Do not add comments, cart, checkout, payment, login, or account behavior.
```

### 08. Showrooms

```text
Create the public Showrooms page using the Homepage visual system. Include unchanged header and footer.

The page must include breadcrumb, page title "He thong showroom", short intro, list of showroom cards, showroom name, localized address, hotline, opening hours if shown, Google Maps embed area, fallback "Mo Google Maps" link, call hotline CTA, and contact/quote CTA.

Design both desktop and mobile behavior. Desktop may use a list/map split layout. Mobile should stack showroom cards and map previews cleanly. Show a fallback state when map cannot load, with a safe external map link.

Use realistic Vietnamese sample addresses but avoid claiming exact locations as final unless marked placeholder. Make visit/call actions prominent. Do not add delivery tracking or ecommerce order features.
```

### 09. Contact / Quote Form

```text
Create the public Contact / Quote Request page using the existing Homepage style. Include unchanged header and footer.

The screen must include breadcrumb, title "Lien he bao gia", short consultation intro, form fields for full name, phone, email, product/category interest, optional product prefill, message, consent/help text, submit button, validation error states, submit loading state, hotline CTA, showroom address block, and map teaser.

Show an example prefilled state from a product detail page: selected product/category appears as a removable chip or readonly summary. Field-level validation must be visible for required name/phone/message and invalid email/phone. Server error and rate-limit states can be represented in alert areas.

The CTA must be consultation-oriented: "Gui yeu cau bao gia". Do not use checkout, order, payment, delivery, or cart language. Keep the form accessible, responsive, and easy to complete on mobile.
```

### 10. Quote Form Success

```text
Create the successful quote request confirmation screen using the Homepage visual system. Include unchanged public header and footer.

Show a clear success state after form submission: success icon/visual, title such as "Da gui yeu cau bao gia", short confirmation message, submitted request summary, expected response time, next CTA to view products, CTA to call hotline, and option to view showroom locations.

The design should feel calm and trustworthy, not like an ecommerce receipt. Do not show order number, payment status, shipping status, cart summary, or tracking link. A lightweight request reference may be shown if needed, but call it "ma yeu cau" rather than order.

Ensure mobile layout is clean and CTAs are stacked clearly. Keep colors, buttons, spacing, and typography aligned with the existing Homepage.
```

### 11. Quote Form Error

```text
Create quote request error states using the Homepage visual system. This can be a page section or a set of state variants for the contact form.

Include three states: server error, rate-limit error, and validation error. Server error should offer retry and hotline fallback. Rate-limit error should explain the visitor should wait before retrying. Validation error should show field-level messages and a summary alert.

Include actions: retry submit, edit form, call hotline, and return to products. Keep the language clear and Vietnamese-first. Do not show technical stack traces, secret details, API names, or database errors.

Maintain the same form layout and component styling from the Contact / Quote page. Error treatment should be visible but not visually aggressive.
```

### 12. Localized 404

```text
Create a localized 404 page using the existing Homepage header and footer. The page should work for Vietnamese and English route contexts.

Include a clear title, friendly explanation, "Ve trang chu" CTA, "Xem san pham" CTA, and "Lien he showroom" CTA. Show language-aware copy: Vietnamese primary, and an English equivalent state or small bilingual hint if the screen is specifically for locale behavior.

The visual should match the public site: brand imagery or subtle showroom/product visual, same button hierarchy, same spacing, no generic default framework page.

Do not include search engine debug details, route stack traces, account login, cart, checkout, or unrelated promotional content.
```

### 13. Generic Public Error Page

```text
Create a generic public route error page using the Homepage design language. Include unchanged header and footer.

The screen should show that something went wrong while loading the page, with a retry button, back-to-home CTA, contact fallback, and hotline/showroom option. Keep technical wording minimal and visitor-friendly.

Include visual states for "Thu lai", "Ve trang chu", and "Lien he tu van". If showing an error code, keep it small and non-technical.

Do not show stack traces, server internals, API paths, secrets, or raw exception messages. Keep the design consistent with the existing public website.
```

### 14. Public Loading / Skeleton States

```text
Create a public loading state screen library using the existing Homepage visual style. Show skeletons for product list, blog list, showrooms list, and quote form submit.

Each skeleton must preserve final layout dimensions to avoid layout shift: product card placeholders, filter placeholder, article card placeholders, showroom card/map placeholders, and disabled submit button with loading indicator. Use the same spacing, border radius, and card density as the public website.

Include desktop and mobile examples if space allows. Loading states should look intentional and premium, not like default gray blocks.

Do not add explanatory tutorial text. Do not use random spinners where skeletons are more appropriate. Keep controls visibly disabled during submit/loading.
```

### 15. Mobile Menu Open / Closed

```text
Create mobile menu open and closed states based strictly on the existing Homepage header. Canvas: mobile 390px wide.

Closed state: logo, compact header, menu trigger, language switcher or locale entry, and quote CTA behavior exactly as the Homepage mobile header. Open state: navigation links, active route state, language switcher, quote CTA, hotline/contact shortcut, and close control.

Use the same colors, typography, shadows, and spacing as the existing Homepage. The drawer or overlay must not feel like a new product. Include touch-friendly link heights and clear focus/active styling.

Do not add login, account, cart, checkout, payment, or order links. Navigation should cover home, about, products, blog/news, showrooms, contact/quote.
```

### 16. Locale Switch Behavior

```text
Create a locale switch interaction screen using the existing Homepage visual system. The goal is to show that the visitor can switch Vietnamese to English and remain on the equivalent page where available.

Show the current page context, active locale state, hover/focus state on the locale switcher, and equivalent English route state. Example: Vietnamese product detail page switches to the matching English product detail slug. If equivalent content is missing, show a graceful fallback state to the English listing or homepage.

Keep the existing header exactly. Use visual labels like "VI" and "EN" only if that matches the Homepage. Preserve filters/page context where relevant.

Do not create a separate language selection landing page. Do not reset the visitor to an unrelated page unless showing a fallback state.
```

### 17. Social Sharing

```text
Create social sharing interaction states for public article and product pages using the Homepage style.

Include share buttons for Facebook, Zalo if suitable, and copy link. Show default, hover/focus, pressed, and copied-success states. The copied state should be compact and clear, such as "Da sao chep lien ket".

Place the share controls where they naturally fit on article detail and optionally product detail pages, without overpowering the main content or CTA.

Do not include unrelated social feeds, comments, login prompts, or tracking-heavy UI. Keep the controls accessible, compact, and visually consistent with existing public buttons/icons.
```

## CMS / Payload Screens

### 18. CMS Login

```text
Create the CMS login screen using the existing Dashboard visual language, but without showing the full authenticated sidebar.

Include brand/logo, title "Dang nhap CMS", email field, password field, show/hide password control, remember session if appropriate, login button, forgot password link, validation error examples, disabled/loading login state, and a small note that the CMS is for authorized Admin/Editor users.

The screen should feel like the entry point to Payload CMS customized for this showroom. Use the same colors, input styling, button styling, border radius, and typography as the Dashboard.

Do not expose any environment information, secrets, API URLs, database names, or role bypass options. Do not show public visitor account signup.
```

### 19. Forgot / Reset Password

```text
Create forgot password and reset password CMS screens using the Dashboard visual language.

Forgot password state: email field, submit button, back-to-login link, success message after request, and validation for invalid/missing email. Reset password state: new password, confirm password, password rule hints, submit button, success state, expired/invalid token error, and return-to-login action.

Keep the screen compact and operational. Use the same form controls, alert style, buttons, and typography from the CMS Dashboard.

Do not expose whether a specific email exists beyond safe generic messaging. Do not show debug tokens, backend error stacks, or secrets.
```

### 20. CMS Dashboard

```text
Create the CMS dashboard screen using the existing Dashboard as strict reference. This prompt is for a refined/dashboard state, not a new shell redesign.

Include sidebar, top bar, role badge, dashboard title, content stats, publishing checklist, recent content edits, quick actions for products, blog posts, showrooms, media, homepage/about content, and Admin-only recent quote request summary. Show Editor dashboard variant where quote/users/settings cards are absent or inaccessible.

Use practical content operations UI: status chips, warning counts for missing SEO/translation/alt text, recent activity table, and shortcuts. Keep density moderate and scannable.

Do not add ecommerce metrics such as revenue, orders, carts, inventory, abandoned checkout, or payment analytics. This CMS manages content and quote leads only.
```

### 21. Access Denied / 403

```text
Create a CMS Access Denied / 403 screen for an Editor trying to access restricted areas. Use the existing Dashboard shell exactly: same sidebar, top bar, active navigation area, role badge, and content card style.

The main content should show a locked state, title "Khong co quyen truy cap", explanation that the current role cannot access quote requests, users, privileged settings, or integrations, and CTA to return to dashboard. If the attempted module is known, show a small module label such as "Quote Requests" or "Users".

Ensure no restricted data is visible in the screen, table previews, breadcrumbs, or side panels. Sidebar may show restricted items as hidden or disabled depending on the existing dashboard pattern.

Do not provide request IDs, secret names, database details, permission override buttons, or "switch role" controls.
```

### 22. Product Categories List

```text
Create the CMS Product Categories list screen using the existing Dashboard sidebar and table style.

Include page title, create category button, search input, locale completeness filter, status filter, parent category filter if applicable, and a table/list with columns: category name, localized slug, parent category, product count, status, missing content warnings, updated date, and row actions.

Show status chips for draft, published, and archived. Include empty state and no-results-after-filter state. Row actions should include edit, preview if applicable, archive, and delete confirmation entry point according to role permission.

Use Admin/Editor content-management behavior. Do not add ecommerce merchandising features like stock, cart collections, discount campaigns, or order categories.
```

### 23. Product Category Create / Edit

```text
Create the CMS Product Category create/edit form using the Dashboard form style.

Include bilingual tabs or sections for Vietnamese and English: name, slug, description, SEO title, SEO description. Include parent category selector, category image/media picker, visibility/order fields if useful, status selector draft/published/archived, save draft button, preview button, publish button, and archive action.

Show validation states for missing Vietnamese content, missing English content, invalid slug, duplicate slug, missing SEO fields, and missing image alt text. Slug fields should show generated suggestions and route preview for both locales.

Keep form layout practical and Payload-like: grouped panels, right-side publish/status panel if consistent with Dashboard, and clear button hierarchy. Do not include cart, checkout, inventory, SKU, or discount fields.
```

### 24. Products List

```text
Create the CMS Products list screen using the existing Dashboard shell and table/list style.

Include search, category filter, status filter, locale completeness filter, featured filter, missing SEO filter, create product button, bulk action entry point if consistent, and a table with columns: thumbnail, product name, category, price range, status, locale completeness, SEO/alt warnings, updated date, and row actions.

Show realistic rows for furniture and sanitary equipment. Row actions should include edit, preview public page, archive, and delete confirmation. Include empty state and filtered no-results state.

Use quote-first catalog language. Do not introduce stock count, cart status, order count, payment status, warehouse inventory, or ecommerce product variants unless they are simple display attributes.
```

### 25. Product Create / Edit

```text
Create the CMS Product create/edit form in the existing Dashboard style.

Include content areas for Vietnamese and English: product name, localized slug, short description, detailed description, SEO title, SEO description. Include product category, gallery media picker, primary image, price range fields, attributes/specifications, dimensions, material, color/finish, brand/series, featured toggle, related products selector, and status draft/published/archived.

Include right-side or sticky publish panel with save draft, preview, publish confirmation, archive, and updated metadata. Include AI draft assistant panel for description/SEO generation, but make AI output draft-only and human-reviewed.

Show validation and readiness warnings: missing Vietnamese content, missing English content, missing SEO, missing image alt text, invalid slug, duplicate slug, unsafe URL if any, unsaved changes. Do not include SKU inventory, cart behavior, payment fields, stock reservation, shipping setup, or order links.
```

### 26. Product Archive / Delete Confirmation

```text
Create a CMS Product archive/delete confirmation modal using the Dashboard modal style.

Show product thumbnail, product name, category, current status, and public visibility impact. Present archive as the safer recommended action and permanent delete as destructive. Include cancel, archive, and delete controls with clear hierarchy.

If using confirmation input, require typing the product name or "DELETE" for permanent delete. Show warning that archived products disappear from public lists and sitemap, while delete removes the record according to permissions.

Do not imply customer orders or carts will be affected, because this project has no ecommerce order system.
```

### 27. Blog Categories List / Create / Edit

```text
Create the CMS Blog Categories management screen using the existing Dashboard style.

Show a split or tabbed layout: left/table list of categories and right/create-edit panel, or separate list and form states if more consistent with Dashboard. Include search, status filter, category name, localized slug, description, SEO title, SEO description, post count, updated date, and row actions.

Include validation states for duplicate slug, invalid slug, missing Vietnamese/English content, and missing SEO fields. Status options: draft, published, archived.

Keep it editorial and content-focused. Do not include ecommerce blog monetization widgets, product cart modules, or public user comments management unless explicitly requested elsewhere.
```

### 28. Blog Posts List

```text
Create the CMS Blog Posts list screen using the existing Dashboard shell and table style.

Include search, category filter, status filter, author/editor filter if useful, locale completeness filter, missing SEO filter, create post button, and table columns: cover thumbnail, title, category, locale completeness, SEO warning, status, updated date, and row actions.

Show realistic blog post examples about furniture selection, sanitary equipment, showroom visits, and design advice. Include empty state and no-results state.

Row actions should include edit, preview, archive, and delete confirmation. Do not add comment moderation, paid subscriptions, checkout, or ecommerce analytics.
```

### 29. Blog Post Create / Edit Rich Text

```text
Create the CMS Blog Post create/edit rich text editor screen using the Dashboard style.

Include bilingual content tabs/sections for title, slug, excerpt, rich text body, cover image, category, SEO title, SEO description, Open Graph image, and status. The rich text editor must show a toolbar, headings, paragraph, list, image embed/caption, link control, and preview action.

Include AI draft assistant panel for outline, article body, translation, or SEO metadata. AI result must be draft-only with accept/discard/regenerate controls and human review reminder.

Show validation warnings for missing locale content, missing SEO fields, missing cover alt text, invalid/duplicate slug, unsafe URL in links, unsaved changes, and publish confirmation. Do not include public comments, payments, subscriptions, or storefront checkout content.
```

### 30. Showrooms List

```text
Create the CMS Showrooms list screen using the existing Dashboard style.

Include search, status filter, locale completeness filter, map-status filter, create showroom button, and table columns: showroom name, address, hotline, map embed status, fallback map link status, locale completeness, published status, updated date, and row actions.

Show empty state and no-results state. Row actions should include edit, preview public page, archive, and delete confirmation.

Keep the screen focused on public showroom content management. Do not include delivery zones, order pickup tracking, warehouse inventory, or ecommerce fulfillment features.
```

### 31. Showroom Create / Edit

```text
Create the CMS Showroom create/edit form using the Dashboard form style.

Include bilingual fields for showroom name, address, description, SEO title, SEO description if needed. Include hotline, opening hours, Google Maps embed URL, fallback map link, image/media picker, status draft/published/archived, save draft, preview, and publish controls.

Show validation states for missing Vietnamese/English content, unsafe URL, invalid phone/hotline format, missing map fallback, missing image alt text, and unsaved changes. The URL validation error must clearly reject unsafe protocols and suspicious links.

Do not expose Google Maps API keys or integration secrets. Do not include order pickup, delivery route, or inventory features.
```

### 32. Homepage Global Edit

```text
Create the CMS Homepage global edit screen using the existing Dashboard style.

Include editable sections for hero title/subtitle per locale, hero image/video, primary CTA, secondary CTA, two fixed product group cards above the fold, trust badges/highlights, intro/company summary, featured categories, featured products, showroom teaser, quote CTA strip, testimonial/partner strip if used, visibility/order toggles, and homepage SEO metadata.

Use bilingual tabs or locale sections. Show preview action, save draft, publish confirmation, status/readiness panel, and warnings for missing locale content, missing SEO fields, missing image alt text, and unsaved changes.

The form must preserve the existing Homepage design, not invent a new homepage. Do not add ecommerce blocks, cart promos, payment banners, order tracking, or mobile app download sections.
```

### 33. About Page Global Edit

```text
Create the CMS About page global edit screen using the existing Dashboard style.

Include bilingual editable fields for page title, intro, vision, mission, capabilities, timeline/gallery entries if used, showroom credibility blocks, media picker, SEO title, SEO description, and Open Graph image.

Include section-level completeness indicators, save draft, preview, publish confirmation, archive if applicable, and validation for missing Vietnamese content, missing English content, missing SEO, missing media alt text, invalid slug if any, and unsaved changes.

Keep it content-focused and editorial. Do not add ecommerce configuration, quote request data, user management, or integration settings to this screen.
```

### 34. Media Library Grid / List

```text
Create the CMS Media Library screen using the existing Dashboard style.

Include grid/list toggle, upload button, search, filters by media type, file size, usage/context, alt text status, owner/context, and updated date. Grid cards should show thumbnail, filename, type, dimensions, alt text warning badge, and quick actions. List view should show columns for thumbnail, filename, type, size, dimensions, alt text status, usage references, owner/context, and updated date.

Include empty state, upload entry point, missing alt text warning, and selection state for using media inside content forms. Use Cloudinary-backed media language without exposing secrets.

Do not include direct credential fields, raw storage secrets, private customer files, or unrestricted public upload behavior.
```

### 35. Media Upload Modal

```text
Create the CMS Media Upload modal using the existing Dashboard modal and form style.

Include drag-and-drop area, file picker button, accepted file type/size notes, upload progress, queue list, rejected file state, owner/context selector, alt text field, caption field, and confirm/cancel actions. Show validation errors for unsupported file type, oversized file, missing context, and missing alt text where required.

The modal should communicate Cloudinary-backed media upload without showing credentials or signing details. Use practical content-management labels and compact layout.

Do not allow arbitrary executable uploads, secret exposure, or public visitor upload patterns. Do not add ecommerce product inventory import features.
```

### 36. Media Detail / Edit

```text
Create the CMS Media detail/edit screen using the existing Dashboard style.

Include large preview, filename, file type, size, dimensions, Cloudinary delivery status if useful, alt text field, caption field, usage references, owner/context, replace file action, save button, and delete/archive action depending on permissions.

Show warnings for missing alt text, file used by published content, unsafe metadata, or invalid replacement file type/size. Include a clear "used in" list such as product, blog post, homepage section, or showroom.

Do not expose Cloudinary API secrets, signed upload internals, database IDs unless the Dashboard already shows technical IDs, or customer private data.
```

### 37. Quote Requests List - Admin Only

```text
Create the Admin-only Quote Requests list screen using the existing Dashboard shell.

Include Admin role badge, page title, search, status filter, date range filter, product/category filter, source/page filter if useful, and table columns: customer name, phone, email, product/category interest, message preview, status, created date, internal note indicator, and detail action.

Show statuses such as new, contacted, in progress, closed, or spam if suitable. Include empty state, no-results state, and privacy-conscious data display. This screen must be absent or blocked for Editors.

Do not show this data in any Editor variant. Do not add order/payment/shipping fields. This is lead/quote management only.
```

### 38. Quote Request Detail / Status / Notes - Admin Only

```text
Create the Admin-only Quote Request detail screen using the existing Dashboard style.

Include customer information, submitted phone/email, product or category interest, message, source page, created date, status selector, internal notes, contact history or note timeline if useful, save status action, and back-to-list navigation.

Use privacy-conscious layout: customer data should be readable for Admin but not overexposed in large decorative cards. Include validation for required status/note fields if applicable.

Do not include Editor access, payment, invoice, order fulfillment, delivery tracking, or cart details. Do not expose raw IP/security logs unless specifically required elsewhere.
```

### 39. Users List - Admin Only

```text
Create the Admin-only Users list screen using the existing Dashboard shell and table style.

Include search, role filter, active/disabled status filter, create user button, and table columns: name, email, role, active/disabled status, last login, updated date, and row actions for edit/disable.

Show role chips for Admin and Editor. Make it clear this screen is Admin-only. Include empty state and no-results state.

Do not let Editors access or preview user data. Do not show passwords, secrets, reset tokens, or authentication internals.
```

### 40. User Create / Edit / Disable - Admin Only

```text
Create the Admin-only User create/edit screen using the existing Dashboard form style.

Include name, email, role selector Admin/Editor, active/disabled toggle, invite or password reset action, permission summary, save button, cancel button, and disable confirmation modal. Show validation for invalid email, duplicate email, missing role, and unsafe role change if applicable.

Permission summary should clearly explain that Editor manages publishable content only and cannot access quote requests, users, settings, or integrations.

Do not show password values, reset tokens, secret keys, or direct database user IDs unless already part of the Dashboard pattern.
```

### 41. Site Settings - Admin Only

```text
Create the Admin-only Site Settings screen using the existing Dashboard style.

Include business name, default locale, supported locales, contact phone/hotline, primary address, email, operating metadata, global organization information, default public CTA labels if managed, and save action. Include warnings that these settings affect public pages.

Use grouped settings panels and a sticky save bar if consistent with Dashboard. Include validation states for missing required fields, invalid phone/email, and unsaved changes.

Do not include integration secrets in general site settings. Do not expose database, Payload, Cloudinary, Resend, Google Maps, OpenAI, or revalidation secrets.
```

### 42. Social Links / Settings - Admin Only

```text
Create the Admin-only Social Links settings screen using the existing Dashboard style.

Include editable fields for Facebook, Zalo, YouTube, TikTok or relevant official channels, plus display label and enabled toggle. Show URL validation, unsafe URL error, preview icons, save button, cancel/reset action, and unsaved changes warning.

Include a small preview of how social links appear in the public footer or share areas, matching the Homepage style.

Do not allow javascript URLs, unsafe protocols, secret tokens, tracking scripts, or arbitrary HTML embeds.
```

### 43. SEO Defaults / Settings - Admin Only

```text
Create the Admin-only SEO Defaults settings screen using the existing Dashboard style.

Include default title template, localized default meta description, Open Graph image picker, default social image preview, robots defaults, canonical base URL if safe, localized alternates preview, and save action. Include SEO snippet preview for Vietnamese and English.

Show missing-field warnings, invalid URL warning, missing OG image warning, and unsaved changes state. Use grouped panels: General SEO, Open Graph, Locale Alternates, Robots.

Do not expose sitemap implementation details, private admin URLs, secret revalidation tokens, or raw environment variables.
```

### 44. Quote Recipients / Settings - Admin Only

```text
Create the Admin-only Quote Recipients settings screen using the existing Dashboard style.

Include recipient email list, add/remove recipient action, recipient role/label, enabled toggle, notification rule summary, test notification button, save action, and validation errors for invalid email, duplicate email, and empty recipient list.

Show a confirmation state after test notification is sent, but do not expose email provider credentials. Include unsaved changes warning.

Do not include customer quote request data beyond a safe notification preview. Do not show Resend API keys or SMTP secrets.
```

### 45. Integration Settings Placeholder - Admin Only

```text
Create the Admin-only Integration Settings placeholder screen using the existing Dashboard style.

Include sections for Resend, Cloudinary, Google Maps, OpenAI, Payload, revalidation, and deployment/runtime health. Show masked fields, connection status indicators, "configured / not configured" badges, last checked time if useful, and restricted access warning.

This is a placeholder/overview screen, not a secret editor. It should never show actual secret values. Use actions like "View documentation", "Check status", or "Request developer update" if needed.

Do not expose API keys, database URLs, Payload secrets, Cloudinary secrets, Resend keys, Google Maps keys, OpenAI keys, or revalidation secrets. Editors must not access this screen.
```

### 46. AI Draft Assistant Panel

```text
Create an AI Draft Assistant panel embedded inside a CMS content edit screen, using the existing Dashboard style.

Include prompt input, content type context selector or locked context, locale selector, generation type options such as product description, SEO metadata, blog outline, translation, or safety review, generate button, loading state, result preview area, and human review warning.

Actions must include insert into draft, copy, discard, regenerate, and close. The panel should clearly state that AI output is draft-only and cannot publish content. It must not use quote request data or private customer data.

Keep the panel compact enough to fit beside or below the editor without disrupting the CMS layout. Do not create a standalone AI chatbot unrelated to content editing.
```

### 47. AI Draft Review State

```text
Create the AI Draft Review state inside a CMS editor using the existing Dashboard style.

Show generated result, comparison with current draft if useful, accept, discard, regenerate, and error state. Include locale label, content field target, and a clear reminder that the editor/admin must review and publish manually.

Include examples for a product description or blog SEO metadata result. Show accepted state inserting content into the draft field, not directly into published content.

Do not include auto-publish, auto-send, customer-data context, quote request access, or secret/provider settings.
```

## CMS Form States

### 48. Draft / Published / Archived

```text
Create CMS content status states using the existing Dashboard form style.

Show draft, published, and archived chips; status selector; save draft button; publish button; archive button; and status history/update metadata. Include visual differences: draft is editable and not public, published is public and included in public pages/sitemap, archived is hidden from public pages.

Include publish confirmation and archive warning entry points. Make button hierarchy clear and consistent with the Dashboard.

Do not imply ecommerce order states such as pending payment, shipped, fulfilled, or cancelled.
```

### 49. Missing Vietnamese Content

```text
Create CMS validation state for missing Vietnamese content using the Dashboard style.

Highlight the Vietnamese locale tab/section, mark required fields, show section-level warning, show a locale completeness indicator, and disable or warn before publish until required Vietnamese fields are completed.

Use realistic missing fields: Vietnamese title/name, slug, description/body, SEO title, SEO description. Allow save draft if that matches the CMS workflow.

Do not hide the missing field problem in a generic toast only. The warning must be visible near the affected fields and in the publish readiness panel.
```

### 50. Missing English Content

```text
Create CMS validation state for missing English content using the Dashboard style.

Highlight the English locale tab/section, show missing translation warnings, show locale completeness indicator, allow draft save, and show publish readiness warning if English content is required for the target publish state.

Use examples: missing English name/title, slug, excerpt/description, SEO metadata. Include a translation draft action if consistent with AI assistant, but generated content must remain draft-only.

Do not silently copy Vietnamese content into English fields as final. Do not publish incomplete localized content without a visible warning.
```

### 51. Missing SEO Fields

```text
Create CMS missing SEO fields state using the Dashboard style.

Highlight SEO title, SEO description, localized slug, Open Graph image, and canonical/preview area if shown. Include SEO completeness warning, snippet preview, and action to generate draft SEO with AI if the AI assistant is available.

Show the difference between blocking required SEO fields and advisory optional fields. Keep the warning visible in the publish readiness panel.

Do not create keyword-stuffing UI, unsupported ranking promises, or hidden metadata that contradicts public content.
```

### 52. Missing Image Alt Text

```text
Create CMS media validation state for missing image alt text using the Dashboard style.

Show media thumbnails with warning badges, alt text input fields, caption fields if applicable, bulk warning summary, and publish readiness warning. Include example images used in product gallery, blog cover, homepage hero, or showroom gallery.

Make it clear which images block publication and which are advisory. Provide save/update actions near the media fields.

Do not ignore decorative/accessibility differences if the Dashboard pattern supports them. Do not expose raw Cloudinary secrets or upload internals.
```

### 53. Invalid Slug / Duplicate Slug

```text
Create CMS slug validation states using the Dashboard style.

Show invalid slug format error, duplicate slug error, generated slug suggestion, route preview for Vietnamese and English, and disabled publish state until fixed. Include helper text for allowed characters and localized slug behavior.

Show both field-level errors and publish readiness warning. Include examples such as duplicate product slug or invalid blog slug.

Do not allow unsafe characters, script content, or silent overwriting of another record's slug.
```

### 54. Unsafe URL Validation

```text
Create CMS unsafe URL validation error state using the Dashboard style.

Apply the state to social link fields, Google Maps embed URL, fallback map link, or rich text link editor. Show rejected URL styling, clear error copy, safe URL helper text, and disabled save/publish until resolved if required.

Examples of unsafe inputs should be visually represented but not executed: javascript protocol, suspicious redirect, unsupported protocol. Include safe examples like https URLs.

Do not render unsafe links as clickable. Do not show raw security internals or bypass controls.
```

### 55. Upload Type / Size Validation

```text
Create CMS upload validation error state using the Dashboard media modal style.

Show rejected file card, file name, file type/size, reason for rejection, accepted file types/sizes, retry upload action, remove file action, and cancel button. Include a valid upload row nearby if useful.

The screen should cover unsupported type, oversized file, and missing required metadata such as alt text or context. Use Cloudinary-backed language without exposing credentials.

Do not imply arbitrary executable upload is allowed. Do not show secrets, signed URLs, or storage credentials.
```

### 56. Unsaved Changes Warning

```text
Create CMS unsaved changes warning modal using the Dashboard modal style.

Include current page/content title, explanation that changes are not saved, actions for stay and continue editing, save draft, and leave without saving. Make destructive/leave action visually secondary or clearly warned.

Show this as an overlay on a content edit page, preserving the Dashboard shell in the background. Include keyboard/focus-safe modal behavior visually.

Do not auto-save without indication. Do not discard changes without a clear explicit action.
```

### 57. Publish Confirmation

```text
Create CMS publish confirmation modal using the Dashboard style.

Include content summary, current status, target status, locale completeness, SEO readiness, media alt text readiness, public route preview, sitemap/public visibility note, confirm publish button, and cancel button.

Show warnings if some readiness checks are incomplete. If publishing is blocked, confirm button should be disabled and the modal should point to required fixes.

Do not include ecommerce publication steps like price activation, stock release, payment setup, or order availability.
```

### 58. Archive / Delete Confirmation

```text
Create CMS archive/delete confirmation state using the Dashboard style.

Include item summary, current status, where the item appears publicly, archive recommendation, permanent delete warning, cancel action, archive action, and destructive delete action. Use status chips and clear destructive styling.

Show impact: archived content is removed from public pages and sitemap; deleted content is permanently removed according to permissions. If needed, require confirmation input for permanent delete.

Do not mention orders, carts, payments, shipping, or customer purchase history.
```

### 59. AI Generation Loading / Error / Result

```text
Create AI generation states inside the CMS assistant panel using the Dashboard style.

Include loading state, disabled generate button, skeleton or progress indicator, error state with retry, generated result preview, accept, discard, regenerate, and manual edit reminder. Show locale and target field context.

Make the result clearly draft-only. Accepted content should insert into editable draft fields and still require normal validation before publishing.

Do not include auto-publish, customer quote data, private data, secret settings, provider logs, or billing details.
```

## Prototype Flows

### 60. Visitor Product To Quote Flow

```text
Create a clickable prototype flow using the existing Homepage visual system. The flow: visitor opens product listing, searches or filters products, opens product detail, clicks quote CTA, lands on quote form with product/category prefilled, submits valid form, and sees success confirmation.

Include key screens/states: product listing with filters and applied chips, product detail with gallery and quote CTA, contact/quote form with prefilled product summary, submit loading state, validation-ready form, and success screen with next CTAs.

The flow must remain quote-first and consultation-focused. Do not include cart, checkout, payment, quantity, inventory, shipping, order confirmation, or order tracking.

Use Vietnamese UI copy and the existing public header/footer across all public steps.
```

### 61. Visitor Vietnamese / English Locale Flow

```text
Create a clickable locale switch prototype using the existing public website style. The flow: visitor starts on a Vietnamese page, opens or clicks the locale switcher, switches to English, lands on the equivalent English route, then can switch back to Vietnamese while preserving page context.

Show active locale state, route-equivalent behavior, and graceful fallback if translated content is missing. Use examples from product detail, blog article, or showroom page.

Keep the existing Homepage header exactly and do not create a separate language-selection landing page. The switch should feel like part of the existing navigation.

Do not reset filters or page context unless demonstrating a fallback state.
```

### 62. Visitor Showroom To Map / Call Flow

```text
Create a clickable showroom flow using the existing public website style. The flow: visitor opens Showrooms page, views showroom card, opens map embed or fallback Google Maps link, taps hotline on mobile, and optionally opens quote/contact CTA.

Include showroom list, address, hotline, map embed, fallback map link, mobile call CTA, and map load fallback state. Show both desktop split layout and mobile stacked behavior if possible.

Keep Vietnamese UI copy and make physical showroom visit/contact actions prominent.

Do not include delivery tracking, pickup orders, warehouse stock, or ecommerce fulfillment.
```

### 63. Admin Product Publish Flow

```text
Create a clickable CMS-to-public prototype flow using the existing Dashboard style and existing Homepage public style. The flow: Admin creates a bilingual product, uploads/selects images, fills category, price range, attributes, SEO, alt text, validates readiness, publishes, then sees the product appear on public listing/detail.

Include screens/states: Products list, product create/edit form, media picker/upload modal, validation warnings, publish confirmation, success state, public product listing card, and public product detail page.

Use Admin role. Show that publishing requires Vietnamese and English content, SEO fields, valid slug, and image alt text. AI assistance may suggest draft copy but cannot publish.

Do not add cart, checkout, inventory, payment, or order-management steps.
```

### 64. Admin Quote Request Status Flow

```text
Create a clickable Admin-only CMS prototype flow using the existing Dashboard style. The flow: Admin opens quote requests list, filters or searches, opens quote request detail, changes status to contacted, adds internal note, saves, and returns to list with updated status.

Include quote requests list, detail panel/page, status selector, internal notes area, save confirmation, updated status chip, and privacy-conscious display of customer contact information.

Make clear this is Admin-only. Editor must not have access. Keep quote data as lead/contact data, not order data.

Do not include payment, invoice, cart, shipping, fulfillment, or order history.
```

### 65. Editor Restricted Access Flow

```text
Create a clickable CMS prototype flow using the existing Dashboard style. The flow: Editor logs in or is already in CMS, tries to access quote requests, users, and settings, then sees Access Denied / 403 screens with no restricted data exposed.

Include Editor sidebar/dashboard, attempted restricted navigation, disabled or hidden restricted module state if appropriate, and 403 page with return-to-dashboard CTA.

Show that Editor can still access publishable content modules such as products, blog, showrooms, media, homepage, and about page.

Do not show preview rows, customer data, user emails, settings values, integration secrets, or permission override controls to Editor.
```

### 66. Editor AI Draft To Manual Publish Flow

```text
Create a clickable CMS prototype flow using the existing Dashboard style. The flow: Editor opens a product or blog editor, uses AI draft assistant, reviews generated content, edits manually, accepts draft content into the form, resolves validation warnings, and publishes manually.

Include content editor, AI assistant prompt panel, loading state, generated result, accept/discard/regenerate controls, edited draft field, validation readiness panel, publish confirmation, and published status state.

Make clear that AI output is draft-only, human review is required, and the publish action is a manual Editor/Admin action depending on content permissions. AI must not use quote request data or private customer data.

Do not include AI auto-publish, AI sending notifications, AI changing status automatically, access to restricted quote/user/settings data, or secret/provider configuration.
```
