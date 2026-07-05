# ADR-007: Cloudinary For Media

## Status

Accepted

## Date

2026-05-31

## Context

Products, blog posts, showrooms, homepage hero, and CMS pages need image uploads. The
constitution approves Cloudinary and requires upload validation.

## Decision

Use Cloudinary for product and content images. In the launch data model, Payload
documents store validated Cloudinary media references directly in image fields and arrays.
Validate file type, file size, URL origin, and image presence before publication.

## Rationale

- Cloudinary is already part of the approved stack.
- Direct Cloudinary media reference fields match the requested launch collection model and keep the
  first implementation smaller.
- Server-side validation reduces upload abuse and accessibility gaps.

## Alternatives Considered

- **Third-party CDN/storage for launch**: rejected to reduce stack complexity.
- **Payload local filesystem uploads**: rejected because deployment needs durable
  managed storage.
- **Dedicated Payload Media collection for launch**: deferred because the requested
  model stores Cloudinary media references directly on content documents.
- **Inline arbitrary external image URLs**: rejected because URLs must come from the
  approved Cloudinary origin.

## Consequences

- Cloudinary upload and delivery policy must allow public delivery only for approved public media.
- Admin upload/update/delete operations must be role-gated and signed server-side.
- Public pages must use optimized image sizes and meaningful alt text from the owning
  content fields where needed.

