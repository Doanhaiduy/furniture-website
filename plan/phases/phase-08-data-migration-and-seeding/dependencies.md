# Phase 08 Dependencies – Data Migration & Seeding

## Upstream Prerequisites
- **Phase 07 Complete**: The Cloudinary upload presets and service helper configurations must be active.
- **Database Schema stability**: All core tables (`products`, `categories`, `blog_posts`, `showrooms`, `settings`) must match target migration structures.

## Required Services / Configuration / Auth State
- **Supabase CLI Integration**: Local development must support Supabase migrations execution scripts.
- **Cloudinary Assets**: The static images must be uploaded to Cloudinary, and the resulting public URLs and IDs mapped for references.
- **Local Gated Settings**: The configuration parameters must permit seeding inside local environments (`app.seed_local` set to `true`).

## Blockers
- **Mojibake / Encodings artifacts**: Incorrect character sets in text files will corrupt Vietnamese content during migrations.
- **Circular references**: Parent-child category relations in category tables will block insertions if insert operations do not respect order constraints.

## Parallelization and Constraints
- **Parallel Work**:
  - Compiling blog posts and showroom addresses text is independent of product categories catalog mapping.
  - Uploading prototype media assets to Cloudinary can be executed independently of SQL script construction.
- **Sequential Constraints**:
  - Category listings must be inserted before products to resolve foreign key constraints (`category_id` references `categories.id`).
  - Media records must be uploaded and mapped before running product seeds to ensure product image URLs reference valid Cloudinary sources.
