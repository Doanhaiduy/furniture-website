# Performance Budget

## Targets

| Area | Budget |
| --- | --- |
| Public page load | <= 3 seconds in accepted launch measurement environment |
| Product filter/search result | <= 3 seconds for representative launch catalog data |
| PageSpeed Mobile | >= 80 for launch-critical public pages |
| Responsive stability | No incoherent overlap or hidden primary controls |

## Launch-Critical Pages

- Homepage.
- About.
- Product listing.
- Product detail.
- Contact/quote.
- Showrooms.
- Blog listing/detail when blog is in launch scope.

## Design Constraints

- Prefer server components and server-side data loading.
- Use client components only for interactive controls.
- Paginate product, blog, media, and quote lists.
- Use Cloudinary transformations for responsive image sizes.
- Do not serve oversized originals to public pages.
- Cache published content reads and revalidate after CMS changes.
- Keep metadata/schema generation server-side and cheap.
- Avoid broad unbounded Payload queries.

## Product Filtering/Search

- Validate all filters before querying.
- Index category/status, price range, slug, featured flag, localized names/summaries, and filterable attributes.
- Cap page size.
- Preserve filter state in URL params.
- Provide an empty state without extra expensive queries.

## Evidence

Each performance-sensitive slice should record:

- Dataset size used.
- Measurement command/tool.
- Environment.
- Timing or PageSpeed result.
- Any deferred optimization.
