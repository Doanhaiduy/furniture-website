# Database Coverage Summary

## Migration Inventory

| Migration | Coverage |
| --- | --- |
| `0001_extensions_and_enums.sql` | Extensions and enums for locale, role, publish status, media, product groups, quote status, AI target/status. |
| `0002_helpers_and_triggers.sql` | Timestamp, publish, archive, search, compact text, and prevent-update/delete helpers. |
| `0003_core_tables.sql` | Core application tables. |
| `0004_foreign_keys_indexes_triggers.sql` | FKs, indexes, triggers, audit immutability. |
| `0005_constraints_and_partial_uniques.sql` | Check constraints, partial unique indexes, publication translation validation. |
| `0006_rls_helper_functions.sql` | `is_admin`, `is_editor`, service-role and permission helpers. |
| `0007_rls_policies.sql` | Public/editor/admin/service-role policies for all tables. |
| `0008_public_admin_rpcs.sql` | Public read RPCs, public quote submit RPC, admin quote search RPC. |
| `0009_optional_local_seed.sql` | Optional local seed gated by `app.seed_local`. |

## Important Tables

| Module | Tables |
| --- | --- |
| Auth/RBAC | `profiles` |
| Media | `media_assets`, `media_asset_translations` |
| Settings/social/quote recipients | `site_settings`, `site_setting_translations`, `social_links`, `quote_recipients` |
| Pages/home/about content | `content_pages`, `content_page_translations`, `page_sections`, `page_section_translations`, `page_media` |
| Product catalog | `product_categories`, `product_category_translations`, `products`, `product_translations`, `product_media`, `product_attribute_definitions`, `product_attribute_definition_translations`, `product_attribute_options`, `product_attribute_option_translations`, `product_attribute_values` |
| Blog | `blog_categories`, `blog_category_translations`, `blog_posts`, `blog_post_translations` |
| Showrooms | `showrooms`, `showroom_translations`, `showroom_media` |
| Quote leads | `quote_requests`, `quote_request_events`, `quote_notifications` |
| AI/audit | `ai_drafts`, `audit_logs` |

## RPCs In `0008`

| RPC | Intended use | Requirement IDs |
| --- | --- | --- |
| `public_products(locale, ...)` | Public product list/search/filter/detail data source. | FR-03, FR-04, FR-05, FR-12-PUB, NFR-01, NFR-06 |
| `public_blog_posts(locale, ...)` | Public blog list/detail data source. | FR-06, FR-12-PUB, NFR-06 |
| `public_showrooms(locale)` | Public showroom list data source. | FR-08-PUB, FR-12-PUB |
| `submit_quote_request(payload jsonb)` | Public quote submission write path. | FR-07-PUB, FR-07-ADM, NFR-05 |
| `admin_quote_search(...)` | Admin-only quote search path. | FR-07-ADM, FR-10, NFR-05 |

## Frontend Mapping

| Frontend area | Current data | Supabase coverage |
| --- | --- | --- |
| Homepage | `productGroups`, `products`, `blogPosts`, `showrooms`, `trustBadges` | `content_pages`, `page_sections`, public RPCs, settings/social tables. |
| About | mock/static content and images | `content_pages`, `page_sections`, media tables. |
| Products | `products`, `productTaxonomy` | `public_products`, product/category/attribute tables. |
| Product detail | `getProductBySlug` | published product slug query/RPC mapping. |
| Blog | `blogPosts`, `blogArticleContent` | `public_blog_posts`, blog tables with `body_json`. |
| Showrooms | `showrooms` | `public_showrooms`, showroom tables. |
| Contact | Zod schema only | `submit_quote_request`, quote tables, `quote_notifications`. |
| Admin quotes | `quoteRequests` | `admin_quote_search`, quote detail tables/events/notifications. |
| Admin settings | prototype UI | settings/social/quote recipient tables plus new Gemini secret storage needed. |
| AI assistant | prototype UI | `ai_drafts`; Gemini settings storage still missing. |

## Known Database Gap For Gemini

The schema has `ai_drafts` and `audit_logs`, but it does not contain a dedicated encrypted Gemini API key/config table. Phase 01 must add a secure storage mechanism or choose Supabase Vault. Do not store Gemini raw keys in public-safe settings rows or return them to the browser.
