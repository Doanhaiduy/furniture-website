# ADR-003: Media Storage With Cloudinary

## Status

Accepted

## Date

2026-06-01

## Context

The public site needs product, category, blog, showroom, homepage, about, logo, favicon, Open Graph, and optional video media. Media should support responsive delivery and validation without exposing upload secrets.

## Decision

Use Cloudinary for media storage and delivery. Payload `Media` is the CMS-facing media collection and stores Cloudinary asset metadata.

## Rationale

- Cloudinary provides CDN delivery, responsive transformations, image optimization, and video support.
- Server-signed uploads keep credentials out of the browser.
- A Payload `Media` collection gives editors reusable assets, alt text, ownership context, and publication validation.

## Rules

- Uploads require authenticated Admin or Editor access.
- Allowed launch image types: JPEG, PNG, WebP, AVIF.
- Allowed launch video types only for video fields: MP4, WebM.
- Baseline limits: images <= 10 MB; videos <= 100 MB unless account limits require lower.
- Meaningful public images require `alt_vi` and `alt_en`.
- Cloudinary public IDs and delivery URLs are stored; signing secrets are server-only.
- Deletion must check references before removing Cloudinary assets.

## Consequences

- Next.js image configuration must allow Cloudinary delivery domains.
- Tests must cover upload validation and secret exposure.
- Earlier Supabase Storage references are obsolete.
