# CMS AI Prompt Library

## Rules For All Prompts

- Use only server-side OpenAI calls from the Payload runtime.
- Do not include quote request data, private customer data, secrets, or credentials.
- Return draft content only.
- Require human review before publication.
- Keep Vietnamese and English outputs separate.
- Output must pass normal CMS validation and SEO review.

## Product Description Draft

Inputs:

- Product name.
- Category.
- Material, dimensions, colors, brand/series.
- Target locale.
- Tone: professional showroom consultant.

Prompt outline:

```text
Draft a {locale} product description for Showroom Nội Thất Phương Đông.
Use the facts below. Do not invent price, warranty, stock, or ecommerce claims.
Emphasize consultation/quote-first behavior.
Facts: {facts}
Return: short summary, detailed description, and 3 feature bullets.
```

## SEO Metadata Draft

Inputs:

- Page type.
- Locale.
- Title/source content.
- Primary keyword.
- Brand name.

Prompt outline:

```text
Create draft SEO metadata in {locale} for a {pageType} page.
Keep title concise and include the brand only when natural.
Keep description useful for search snippets.
Do not make unsupported claims.
Return JSON: title, description, ogTitle, ogDescription.
```

## Blog Outline Draft

Inputs:

- Topic.
- Locale.
- Target audience.
- Product/category context.

Prompt outline:

```text
Create a draft blog outline in {locale} for showroom customers.
Focus on practical buying guidance and showroom consultation.
Avoid ecommerce checkout or payment language.
Return: title options, excerpt, outline headings, SEO keyword ideas.
```

## Translation Draft

Inputs:

- Source locale.
- Target locale.
- Source content.
- Brand terms glossary.

Prompt outline:

```text
Translate the content from {sourceLocale} to {targetLocale}.
Preserve brand names, product facts, dimensions, and URLs.
Do not add new claims.
Return editable translated draft only.
Glossary: {glossary}
Content: {content}
```

## Safety Review Prompt

```text
Review this CMS draft for unsupported claims, unsafe HTML/script content,
private data leakage, ecommerce/order/payment language, and SEO overclaiming.
Return a concise list of issues and suggested edits.
```
