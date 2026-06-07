# Gemini API Integration Plan

## Overview
The Google Gemini API is integrated inside the admin CMS to provide AI-powered content drafting and translation support (Vietnamese/English). This is a draft-only system: AI generates outline recommendations or translations that require human verification before being committed to publishable tables.

---

## 1. Feature Specifications

### 1.1. Content Draft Generation
- **Product Details**: Generate Vietnamese and English descriptions from name and category keywords.
- **Blog Outline drafts**: Generate draft outlines based on subject inputs.
- **SEO Title/Description suggestions**: Recommend SEO tags from content text.
- **Fields Translations**: Translate content inputs between Vietnamese and English inline on the edit forms.

### 1.2. Constraints & Safeguards
- AI generation operates strictly as drafts. It cannot publish content, modify status states, delete products, or send emails.
- AI prompt parameters must only contain public product attributes or blog outlines. Private lead details (customer quotes) and user account metadata are strictly excluded.

---

## 2. Gemini Settings Configuration
Admin settings must allow managing the following Gemini parameters:
- **Enabled status** (boolean toggle)
- **API Key** (encrypted text)
- **Model** (text field, defaults to `gemini-1.5-flash`)
- **Temperature** (numeric slider, bounds `0.0` to `1.0`)
- **Max tokens** (integer)

---

## 3. Secret Storage Design (Custom Secrets Table)
As confirmed, we will use a custom settings secrets table rather than Supabase Vault or environment variables.

### 3.1. Settings Table Entity
We will create the `integration_secrets` table:
```sql
CREATE TABLE public.integration_secrets (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  key_name TEXT UNIQUE NOT NULL, -- e.g., 'gemini_api_key'
  encrypted_value TEXT NOT NULL,  -- encrypted key string
  masked_hint TEXT NOT NULL,      -- suffix (e.g. '****5678')
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2. Encryption Mechanism
- Secret values are encrypted using AES-GCM-256 with a 32-byte `AI_SECRET_ENCRYPTION_KEY` configured in the server environment.
- The decryption helper function lives inside server-only modules and is never imported in client components.

---

## 4. Security & Role Model Option A Boundaries

### 4.1. Admin-Only Capabilities
- Only authenticated users with the `admin` role can read or write setting configurations from `integration_secrets`.
- GET endpoints mask API keys, returning only the last 4 characters (`****5678`). Raw keys are never exposed in JSON responses.
- Writing or rotating the key will trigger formats validation check and write an insert log to the `audit_logs` table.

### 4.2. Editor Constraints
- Users with the `editor` role are blocked from viewing settings panels or executing settings APIs.
- Editors can trigger AI draft generation inside the blog/product forms, but the server handles key retrieval and decryption, preventing credentials exposure to Editor browsers.

---

## 5. API Endpoints
- `GET /api/admin/settings/ai` -> Retrieves masked Gemini configurations (Admin only).
- `PUT /api/admin/settings/ai` -> Updates Gemini API key, model settings, and toggle states (Admin only).
- `POST /api/admin/ai/generate-draft` -> Generates drafts using decrypted keys (Admin & Editor).

---

## 6. Error & Fallback Modes
- If the Gemini API key is missing, disabled, or fails validation, the endpoint returns an `AI_UNAVAILABLE` error code.
- UI widgets render "AI Offline" indicators and disable generate buttons, allowing Editors to compose all details manually.
