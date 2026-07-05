# Payload Collection Contracts

## API Surface

Payload CMS exposes:

- Built-in Admin UI on the Payload service.
- REST API for server-side frontend reads and selected admin workflows.
- GraphQL API for structured CMS reads where useful.

The public frontend must call Payload APIs from server-side code or controlled backend
routes. Browser clients must not receive service secrets or privileged CMS tokens.

## Access Control Contract

| Area | Admin | Editor | Public |
| --- | --- | --- | --- |
| Users and roles | Full access | No access | No access |
| Site settings | Full access | Read limited public settings only when needed | Public safe fields only |
| Products/categories | Full access | Create/edit/publish/archive per editorial permissions | Published localized reads only |
| Blog/categories | Full access | Create/edit/publish/archive per editorial permissions | Published localized reads only |
| Showrooms | Full access | Create/edit/publish/archive per editorial permissions | Active localized reads only |
| Quote requests | Full access | View/filter/update status/notes | Create only through quote submission |
| AI drafts | Full access | Generate/edit/discard/accept drafts | No access |

## Collection Publication Contract

Publishable collections:

- Products
- ProductCategories when publicly visible
- BlogPosts
- BlogCategories when publicly visible
- Showrooms
- Homepage global

Publication requirements:

- Required Vietnamese and English public fields are complete.
- Localized slugs are unique where detail routes exist.
- Required SEO fields exist or can be derived from validated localized content.
- Required image URL fields are present and validated as safe Cloudinary URLs.
- Status is `published`.

Archived records:

- Must be removed from public listings and sitemap.
- Detail routes must return safe not-found or redirect behavior.

## Collection Hook Contract

Required hooks:

| Hook | Applies To | Contract |
| --- | --- | --- |
| publishValidation | Products, BlogPosts, Showrooms, Homepage | Blocks publication when required localized content, slug, image, or SEO minimums are missing. |
| mediaValidation | Image URL fields and upload workflows | Allows approved Cloudinary URLs and approved image types/size limits when uploads are implemented. |
| quoteNotifications | QuoteRequests | Sends Resend notification after valid request persistence and records notification status. |
| aiDrafts | Products, BlogPosts, Homepage/SEO content | Calls OpenAI only from CMS server context and stores editable drafts. |
| revalidation | Published content changes | Requests public frontend revalidation for affected routes when configured. |

## GraphQL/REST Read Contracts

Public server-side reads must filter by:

- `status = published` for publishable content.
- Requested locale completeness.
- Route slug matching requested locale.

Admin reads may include drafts after Admin/Editor role verification. Private lead data
is readable only by Admin users under Role Model Option A.

## Error Contract

Payload API errors exposed to public frontend must be normalized into:

- Not found.
- Validation error.
- Temporary content unavailable.
- Unauthorized or forbidden for admin-only routes.

Raw stack traces, secrets, SQL details, and private lead data must never be returned to
public users.

