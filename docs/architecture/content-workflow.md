# Content Workflow

## Roles

- Editor: manages publishable content only.
- Admin: manages users, settings, quote requests, integrations, media governance, and all content.

## Content Lifecycle

1. Draft content is created in Payload.
2. Required Vietnamese and English fields are completed.
3. Media is selected from Cloudinary-backed Payload Media with alt text where needed.
4. SEO fields are entered or generated as draft suggestions.
5. Publication validation runs.
6. Published content appears on public routes and sitemap.
7. Updates trigger route/tag revalidation.
8. Archived content disappears from public lists and sitemap.

## Homepage Sections

HomePage must allow editing:

- Hero title/subtitle per locale.
- Hero image/video.
- Primary and secondary CTA.
- Two fixed product-group cards above the fold.
- Trust badges/quick highlights.
- Intro/company summary block.
- Featured categories.
- Featured products.
- Showroom teaser.
- Quote CTA strip.
- Testimonial or partner/logo strip.
- SEO fields.
- Visibility and order toggles for optional sections.

## SEO Checklist

For public routes:

- Localized title and description.
- Canonical URL.
- Alternate locale links.
- Open Graph title/description/image.
- Schema.org object for page type.
- Included in sitemap only when published.
- Admin/private/draft/preview routes excluded from indexing.

## AI Draft Workflow

- AI output is draft-only.
- User can edit, accept, discard, or regenerate.
- AI never publishes, changes status, sends notifications, or uses private quote request data.
- Accepted AI content still goes through publication validation.
