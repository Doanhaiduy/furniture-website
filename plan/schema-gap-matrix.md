# Database Schema Gap Matrix

This document provides a detailed mapping of features to identified database schema gaps, detailing the recommended fix, severity, and migration requirements.

| Feature/Flow | FE Expects | Current Schema Supports | Gap Type | Severity | Recommended Fix | Requires Migration? |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Gemini AI Settings** | Manage API key, model name, temperature, and max tokens from Settings. | Only public branding settings inside `site_settings`. No secret key columns. | Database Schema | **High** | Create a dedicated `integration_secrets` table to store encrypted configuration details. | **Yes** |
| **Secret Encryption at Rest** | Secrets are saved securely and never exposed in cleartext. | No encryption helpers or Vault configurations inside the migrations. | Security/Privacy | **High** | Implement an AES-GCM-256 server helper encrypting keys using a server-side `AI_SECRET_ENCRYPTION_KEY`. | No |
| **Key rotation audit trails** | Changing the Gemini API key writes an event log. | An `audit_logs` table exists, but no triggers bind it to setting changes. | Security/Audit | **Medium** | Implement server-side audit logs inside Settings APIs when saving credentials. | No |
| **Bilingual Page Content** | Retrieve dynamic localized blocks for static pages. | Supporting translations via `content_page_translations`. | Translation | **None** | Use Next.js Server Components to query translation tables by locale. | No |
| **Showroom Images Array** | Multi-image carousels for showroom galleries. | The `showrooms` table contains no image arrays. Maps to `showroom_media` relational junction table. | Relational mapping | **None** | The `public_showrooms` RPC aggregates images into a JSONB array, aligning with frontend layouts without schema modifications. | No |
| **Product Media lists** | Products map to primary and gallery images. | Relational mappings via `product_media` and `media_assets`. | Relational mapping | **None** | The `public_products` RPC aggregates media assets into `primary_media` and `media` JSONB fields automatically. | No |
| **CamelCase Quote Payload** | Form validation uses camelCase keys (e.g., `fullName`). | Table columns use snake_case (e.g., `full_name`). | Naming convention | **None** | The `submit_quote_request` RPC coalesces parameters (supporting both camelCase and snake_case), resolving naming drift. | No |
