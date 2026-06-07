# Gemini Secret Storage Specification

This specification details the implementation of our secure custom settings secrets table, encryption rules, admin masking controls, access controls, key rotation workflows, and error fallback modes.

---

## 1. Custom Secrets Table Design

We will create a custom database table `public.integration_secrets` to store sensitive API credentials (such as the Gemini API key).

### 1.1. SQL Schema Definition
```sql
CREATE TABLE public.integration_secrets (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  key_name TEXT UNIQUE NOT NULL, -- e.g. 'gemini_api_key'
  encrypted_value TEXT NOT NULL,  -- AES-GCM-256 encrypted string
  masked_hint TEXT NOT NULL,      -- Suffix hint (e.g. '****abcd')
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;
```

---

## 2. Encryption Approach
- **Algorithm**: Advanced Encryption Standard in Galois/Counter Mode (AES-GCM-256) is our chosen encryption standard, providing both confidentiality and integrity authentication.
- **Encryption Key**: We will load a 32-byte hexadecimal key `AI_SECRET_ENCRYPTION_KEY` strictly inside the server environment. This key must never be committed to repository code or exposed via browser bundles.
- **Payload format**: Ciphertexts saved to the database will store the initialization vector (IV) and authentication tag alongside the encrypted data using the following string structure:
  `iv_hex:auth_tag_hex:ciphertext_hex`

---

## 3. UI Masking Rules
- **No Raw Retrieval**: The server-side API `/api/admin/settings` must never return cleartext secrets to the browser.
- **Masking Format**: Masked strings must display only a prefix mask and the actual last 4 characters of the key (retrieved from `masked_hint`):
  `************5678`
- **Mask Input Placeholder**: The settings form displays the masked string as a placeholder. If the Admin saves the form without modifying the field, the server bypasses updating the secret to prevent double encryption of already masked placeholders.

---

## 4. Access Control Boundaries

### 4.1. Database-Level RLS Policies
The RLS policies on `integration_secrets` restrict all direct transactions to the `service_role` and `admin` roles:
```sql
-- Deny select/write access to everyone by default
REVOKE ALL ON TABLE public.integration_secrets FROM anon, authenticated;

-- Allow service-role complete access
GRANT ALL ON TABLE public.integration_secrets TO service_role;

-- Allow select and write only for Admins
CREATE POLICY "Admin select secrets" ON public.integration_secrets
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin write secrets" ON public.integration_secrets
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### 4.2. Application-Level Gates
- **Middleware blocks**: Middleware intercepts `/admin/settings` API requests from non-admin accounts.
- **Server actions verification**: Any Server Action trying to decrypt keys will check `profiles.role` first. If the role is `editor`, the execution is halted immediately, throwing a `403 Forbidden` response.

---

## 5. Key Rotation & Validation Flow

```mermaid
sequenceflow
    Admin -> Settings Form: Inputs new Gemini key & saves
    Settings Form -> API: PUT /api/admin/settings (payload)
    API -> Validator: minimal Gemini SDK check
    alt Key is valid
        Validator -> Crypto: encrypts key with AI_SECRET_ENCRYPTION_KEY
        Crypto -> Database: saves encrypted value & masked hint
        Database -> Audit: writes INSERT/UPDATE event to audit_logs
        API -> Admin: success (masked string + config state)
    else Key is invalid
        Validator -> API: returns validation error
        API -> Admin: error toast (retains old settings)
    end
```

### 5.1. Audit Logging Details
Every settings update must insert a log entry into `audit_logs` storing:
- `actor_id`: ID of the logged-in administrator.
- `action`: `'UPDATE'` or `'ROTATE_KEY'`.
- `entity_type`: `'integration_secrets'`.
- `entity_id`: ID of the secret row.
- `metadata`: JSON payload containing the masked hint (e.g. `{"masked_hint": "****5678"}`) and a success flag. Never log the raw key or ciphertext parameter.

---

## 6. System Fallback When Gemini is Misconfigured
- **Disabled State**: If settings indicate Gemini is disabled or the validation check fails, the API returns:
  ```json
  {
    "ok": false,
    "code": "AI_UNAVAILABLE",
    "message": "AI assistant is currently offline."
  }
  ```
- **Form Controls**: The AI generate buttons inside the Product and Blog post creation forms are disabled, displaying an "AI offline" alert message.
- **Manual Editing Fallback**: Editors can bypass AI outlines generation completely and compose Vietnamese and English descriptions manually in the default text editors without any blocks.
