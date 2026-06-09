# AI Content Generation & Translation Workflow Specification

**Version:** 1.0
**Date:** 2026-06-06
**Status:** Ready for Implementation
**Prerequisites:** Slices S-00 to S-05 complete (Payload CMS foundation, Users, Media, Product catalog)

---

## 1. Executive Summary

### Scope

This spec defines the **backend-only** AI content generation API and translation workflow for the Showroom Ná»™i Tháº¥t PhÆ°Æ¡ng ÄÃ´ng CMS. It covers:

- OpenAI integration architecture
- Server-side prompt builders and API client
- Draft-only AI content generation (descriptions, SEO, translations)
- Payload CMS hooks and custom field components
- AI draft storage and review workflow
- Security, rate limiting, and compliance

### Out of Scope

- Frontend UI changes (existing admin UI already has AI assistant placeholder)
- Public-facing AI features (chatbots, product recommendations)
- Real-time translation during page visits
- Auto-publishing AI content (all AI output requires human review)

### Requirement Mapping

| Requirement ID | Description | Implementation Area |
|---|---|---|
| FR-11 | AI Assistance for CMS content/SEO drafting | Core feature |
| FR-12-ADM | Bilingual content management | Translation workflow |
| NFR-05 | Security (API key handling, input validation, private data protection) | Security layer |
| NFR-07 | Extensibility (new AI prompt types) | Prompt library architecture |

---

## 2. Architecture Overview

### System Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     Payload CMS Admin UI                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚ Product Editor  â”‚  â”‚  Blog Editor     â”‚  â”‚  SEO Panel â”‚ â”‚
â”‚  â”‚ [Generate AI]   â”‚  â”‚  [Translate]     â”‚  â”‚ [Generate] â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚           â”‚                    â”‚                    â”‚         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â”‚                    â”‚                    â”‚
            v                    v                    v
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Payload Server-Side Hooks & Actions              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  AI Generation Actions (server-only)                     â”‚ â”‚
â”‚  â”‚  - generateProductDescription()                          â”‚ â”‚
â”‚  â”‚  - generateSEOMetadata()                                 â”‚ â”‚
â”‚  â”‚  - generateBlogOutline()                                 â”‚ â”‚
â”‚  â”‚  - translateContent()                                       â”‚ â”‚
â”‚  â”‚  - reviewContentSafety()                                 â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                         â”‚                                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€vâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  AI Service Layer (lib/ai/)                              â”‚ â”‚
â”‚  â”‚  - OpenAI client wrapper                                 â”‚ â”‚
â”‚  â”‚  - Prompt builder library                                â”‚ â”‚
â”‚  â”‚  - Response validation                                   â”‚ â”‚
â”‚  â”‚  - Rate limiter                                          â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
                         v
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    OpenAI API (External)                        â”‚
â”‚  Models: gpt-4o-mini (default), gpt-4o (premium)              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
                         v
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              PostgreSQL Database (via Payload)                 â”‚
â”‚  Collections:                                                  â”‚
â”‚  - AIDrafts (id, targetType, targetId, locale, promptType,   â”‚
â”‚              input, output, status, requestedBy, reviewedBy)  â”‚
â”‚  - AuditLogs (actor, action, entity, metadata)               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Key Principles

1. **Server-Only Execution**: OpenAI API key never exposed to browser
2. **Draft-First**: All AI output saved as `status: 'draft'`, requires human review
3. **No Private Data**: Never send QuoteRequest customer data, secrets, or PII to OpenAI
4. **Locale Separation**: Vietnamese and English prompts/outputs handled separately
5. **Auditable**: All AI generations logged with actor, input hash, timestamp

---

## 3. Database Schema

### AIDrafts Collection (Payload CMS)


```typescript
// src/payload/collections/AIDrafts.ts
export const AIDrafts: CollectionConfig = {
  slug: 'ai-drafts',
  access: {
    read: ({ req }) => {
      // Editors can read own drafts, Admins read all
      if (req.user.role === 'admin') return true;
      return { requestedBy: { equals: req.user.id } };
    },
    create: ({ req }) => isEditor(req) || isAdmin(req),
    update: ({ req }) => isEditor(req) || isAdmin(req),
    delete: ({ req }) => isAdmin(req), // Only admins can delete
  },
  fields: [
    {
      name: 'targetType',
      type: 'select',
      required: true,
      options: ['product', 'blog_post', 'content_page', 'seo', 'translation'],
    },
    {
      name: 'targetId',
      type: 'text',
      required: true,
      admin: { description: 'ID of the target entity' },
    },
    {
      name: 'locale',
      type: 'select',
      options: ['vi', 'en'],
      admin: { description: 'Target locale for output' },
    },
    {
      name: 'promptType',
      type: 'select',
      required: true,
      options: [
        'product_description',
        'seo_metadata',
        'blog_outline',
        'translation',
        'safety_review',
      ],
    },
    {
      name: 'inputHash',
      type: 'text',
      admin: { description: 'SHA256 hash of input to detect duplicates' },
    },
    {
      name: 'input',
      type: 'json',
      required: true,
      admin: { description: 'Sanitized input data (never includes private customer data)' },
    },
    {
      name: 'output',
      type: 'json',
      required: true,
      admin: { description: 'AI-generated draft content' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Discarded', value: 'discarded' },
      ],
    },
    {
      name: 'requestedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'reviewedAt',
      type: 'date',
    },
    {
      name: 'model',
      type: 'text',
      admin: { description: 'OpenAI model used (gpt-4o-mini, gpt-4o)' },
    },
    {
      name: 'tokensUsed',
      type: 'number',
      admin: { description: 'Total tokens consumed' },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: { condition: (data) => !!data.errorMessage },
    },
  ],
  timestamps: true,
};
```

### Audit Integration

All AI generation calls logged to existing `AuditLogs`:

```typescript
{
  actor: req.user.id,
  action: 'ai_generate',
  entityType: 'ai_drafts',
  entityId: draft.id,
  metadata: {
    promptType: 'product_description',
    targetType: 'product',
    targetId: productId,
    tokensUsed: 850,
    model: 'gpt-4o-mini'
  }
}
```

---

## 4. AI Service Layer Implementation

### 4.1 Environment Configuration

```bash
# .env.local (server-side only, never exposed to browser)
OPENAI_API_KEY=sk-...
OPENAI_MODEL_DEFAULT=gpt-4o-mini
OPENAI_MODEL_PREMIUM=gpt-4o
OPENAI_MAX_TOKENS_PER_REQUEST=4000
OPENAI_TIMEOUT_MS=30000
AI_RATE_LIMIT_PER_USER=20  # requests per hour per user
AI_MONTHLY_BUDGET_USD=100  # spending alert threshold
```

### 4.2 OpenAI Client Wrapper

```typescript
// src/lib/ai/client.ts
import OpenAI from 'openai';
import { env } from '@/lib/env/server';
import { RateLimiter } from './rate-limiter';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: env.OPENAI_TIMEOUT_MS,
});

const rateLimiter = new RateLimiter({
  maxRequestsPerHour: env.AI_RATE_LIMIT_PER_USER,
});

export async function callOpenAI(params: {
  userId: string;
  messages: Array<{ role: 'system' | 'user'; content: string }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ content: string; tokensUsed: number; model: string }> {
  // Rate limit check
  await rateLimiter.checkLimit(params.userId);

  const response = await openai.chat.completions.create({
    model: params.model || env.OPENAI_MODEL_DEFAULT,
    messages: params.messages,
    max_tokens: params.maxTokens || env.OPENAI_MAX_TOKENS_PER_REQUEST,
    temperature: params.temperature ?? 0.7,
  });

  const content = response.choices[0]?.message?.content || '';
  const tokensUsed = response.usage?.total_tokens || 0;

  return {
    content,
    tokensUsed,
    model: response.model,
  };
}
```

### 4.3 Rate Limiter


```typescript
// src/lib/ai/rate-limiter.ts
import { Redis } from '@upstash/redis'; // Or in-memory store for MVP

export class RateLimiter {
  constructor(private config: { maxRequestsPerHour: number }) {}

  async checkLimit(userId: string): Promise<void> {
    const key = `ai:ratelimit:${userId}:${this.getCurrentHour()}`;
    const count = await this.increment(key);

    if (count > this.config.maxRequestsPerHour) {
      throw new Error(
        `Rate limit exceeded. Maximum ${this.config.maxRequestsPerHour} AI requests per hour.`
      );
    }
  }

  private getCurrentHour(): string {
    return new Date().toISOString().slice(0, 13); // "2026-06-06T14"
  }

  private async increment(key: string): Promise<number> {
    // Implementation: Redis INCR or in-memory Map for MVP
    // Set TTL to 1 hour
    return 1; // Placeholder
  }
}
```

### 4.4 Prompt Builder Library

```typescript
// src/lib/ai/prompts/product-description.ts
import type { Locale } from '@/i18n/routing';

export interface ProductDescriptionInput {
  name: string;
  category: string;
  material?: string;
  dimensions?: string;
  brandSeries?: string;
  colors?: string[];
  attributes?: Record<string, string>;
}

export function buildProductDescriptionPrompt(
  input: ProductDescriptionInput,
  locale: Locale
): { system: string; user: string } {
  const localeContext =
    locale === 'vi'
      ? 'Vietnamese showroom consultant tone, professional and warm'
      : 'English showroom consultant tone, professional and refined';

  return {
    system: `You are a ${localeContext} content writer for Showroom Ná»™i Tháº¥t PhÆ°Æ¡ng ÄÃ´ng, a premium furniture and sanitary equipment showroom.

Rules:
- Focus on consultation and quote-first approach (NOT ecommerce)
- Emphasize material quality, craftsmanship, and spatial harmony
- Never invent price, warranty, stock, or shipping details
- Do not make ecommerce promises (checkout, cart, immediate purchase)
- Use "consultation", "quote", "project" language, not "buy now"
- Output valid JSON only

Output format:
{
  "summary": "1-2 sentence product card summary",
  "description": "2-3 paragraph detailed description",
  "features": ["feature 1", "feature 2", "feature 3"]
}`,
    user: `Generate a product description in ${locale.toUpperCase()} for:

Product Name: ${input.name}
Category: ${input.category}
${input.material ? `Material: ${input.material}` : ''}
${input.dimensions ? `Dimensions: ${input.dimensions}` : ''}
${input.brandSeries ? `Brand/Series: ${input.brandSeries}` : ''}
${input.colors?.length ? `Colors: ${input.colors.join(', ')}` : ''}

Generate the description following the JSON format specified.`,
  };
}
```

### 4.5 SEO Metadata Prompt

```typescript
// src/lib/ai/prompts/seo-metadata.ts
export interface SEOMetadataInput {
  pageType: 'product' | 'blog_post' | 'category' | 'homepage' | 'about';
  title: string;
  contentSummary: string;
  primaryKeyword?: string;
  brandName: string;
}

export function buildSEOMetadataPrompt(
  input: SEOMetadataInput,
  locale: Locale
): { system: string; user: string } {
  return {
    system: `You are an SEO expert for Vietnamese/English bilingual websites.

Rules:
- Title: 50-60 characters, include primary keyword naturally
- Description: 140-160 characters, compelling and informative
- Include brand name only when natural (avoid keyword stuffing)
- No unsupported claims or exaggerated promises
- Output valid JSON only

Output format:
{
  "title": "SEO title",
  "description": "Meta description",
  "ogTitle": "Open Graph title (can be longer than SEO title)",
  "ogDescription": "OG description"
}`,
    user: `Generate SEO metadata in ${locale.toUpperCase()} for a ${input.pageType} page:

Page Title: ${input.title}
Content Summary: ${input.contentSummary}
${input.primaryKeyword ? `Primary Keyword: ${input.primaryKeyword}` : ''}
Brand: ${input.brandName}

Generate metadata following the JSON format.`,
  };
}
```

---

## 5. Translation Workflow

### 5.1 Translation Prompt Builder

```typescript
// src/lib/ai/prompts/translation.ts
export interface TranslationInput {
  sourceLocale: Locale;
  targetLocale: Locale;
  contentType: 'product' | 'blog' | 'page_section';
  sourceContent: {
    title?: string;
    summary?: string;
    body?: string;
    features?: string[];
  };
  glossary?: Record<string, string>; // Brand terms to preserve
}

export function buildTranslationPrompt(
  input: TranslationInput
): { system: string; user: string } {
  const glossaryText = input.glossary
    ? `\n\nGlossary (preserve these terms):\n${Object.entries(input.glossary)
        .map(([vi, en]) => `- ${vi} â†’ ${en}`)
        .join('\n')}`
    : '';

  return {
    system: `You are a professional translator specializing in furniture and interior design content for Vietnamese/English websites.

Rules:
- Preserve brand names, product references, dimensions, and technical terms
- Maintain the tone: professional showroom consultant style
- Do not add new claims or information not in source
- Keep URLs, numbers, and formatting unchanged
- Output valid JSON matching the input structure

Preserve these key terms:
- Heritage Modernism (keep in English)
- Showroom Ná»™i Tháº¥t PhÆ°Æ¡ng ÄÃ´ng (company name)
- Product reference codes (e.g., PD-S2401)${glossaryText}`,
    user: `Translate the following ${input.contentType} content from ${input.sourceLocale.toUpperCase()} to ${input.targetLocale.toUpperCase()}:

${JSON.stringify(input.sourceContent, null, 2)}

Return the translated content in the same JSON structure.`,
  };
}
```

### 5.2 Translation Workflow Steps

1. **Initiate Translation** (CMS UI)
   - Editor views product with only `vi` content filled
   - Clicks "Generate EN Translation" button
   - System validates source content exists and is complete

2. **Generate Draft** (Server Action)
   - Build translation prompt with source content
   - Call OpenAI API
   - Validate output structure matches input
   - Save to `AIDrafts` collection with `status: 'draft'`
   - Return draft ID to UI

3. **Review Draft** (CMS UI)
   - Show source (vi) and draft translation (en) side-by-side
   - Allow inline editing of translation
   - Options:
     - **Accept**: Copy draft to target locale fields, mark draft as `accepted`
     - **Regenerate**: Create new draft with different parameters
     - **Discard**: Mark draft as `discarded`, keep target fields unchanged

4. **Publication Validation** (Payload Hook)
   - Before setting `status: 'published'`, check both `vi` and `en` required fields are complete
   - Block publish if any required locale is missing

### 5.3 Translation Action Implementation

```typescript
// src/payload/actions/translate-content.ts
import { callOpenAI } from '@/lib/ai/client';
import { buildTranslationPrompt } from '@/lib/ai/prompts/translation';
import { createAIDraft } from './create-ai-draft';

export async function translateContent(params: {
  userId: string;
  targetType: 'product' | 'blog_post' | 'content_page';
  targetId: string;
  sourceLocale: Locale;
  targetLocale: Locale;
  sourceContent: Record<string, any>;
  glossary?: Record<string, string>;
}): Promise<{ draftId: string; output: Record<string, any> }> {
  // Build prompt
  const prompt = buildTranslationPrompt({
    sourceLocale: params.sourceLocale,
    targetLocale: params.targetLocale,
    contentType: params.targetType,
    sourceContent: params.sourceContent,
    glossary: params.glossary,
  });

  // Call OpenAI
  const response = await callOpenAI({
    userId: params.userId,
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ],
    temperature: 0.3, // Lower temperature for translation accuracy
  });

  // Parse and validate output
  const output = JSON.parse(response.content);
  validateTranslationOutput(output, params.sourceContent);

  // Save draft
  const draft = await createAIDraft({
    targetType: params.targetType,
    targetId: params.targetId,
    locale: params.targetLocale,
    promptType: 'translation',
    input: { sourceLocale: params.sourceLocale, sourceContent: params.sourceContent },
    output,
    requestedBy: params.userId,
    model: response.model,
    tokensUsed: response.tokensUsed,
  });

  return { draftId: draft.id, output };
}

function validateTranslationOutput(
  output: Record<string, any>,
  source: Record<string, any>
): void {
  // Ensure output has same keys as source
  const sourceKeys = Object.keys(source);
  const outputKeys = Object.keys(output);

  for (const key of sourceKeys) {
    if (!outputKeys.includes(key)) {
      throw new Error(`Translation output missing required field: ${key}`);
    }
  }
}
```

---

## 6. Payload CMS Integration

### 6.1 Custom Field Component: AI Generation Button

```typescript
// src/payload/components/AIGenerateButton.tsx
'use client';
import { useFormFields } from '@payloadcms/ui';
import { useState } from 'react';

export function AIGenerateButton({
  targetType,
  promptType,
  locale,
}: {
  targetType: 'product' | 'blog_post';
  promptType: 'description' | 'seo_metadata' | 'translation';
  locale: Locale;
}) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const formFields = useFormFields();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId: formFields.id.value,
          promptType,
          locale,
          input: extractInputFields(formFields, promptType),
        }),
      });

      const result = await response.json();
      if (result.ok) {
        setDraft(result.draft);
        // Show draft preview modal
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : `Generate ${promptType} with AI`}
    </button>
  );
}
```

### 6.2 Product Collection with AI Fields


```typescript
// src/payload/collections/Products.ts (excerpt)
export const Products: CollectionConfig = {
  slug: 'products',
  fields: [
    {
      name: 'name_vi',
      type: 'text',
      required: true,
      label: 'Product Name (Vietnamese)',
    },
    {
      name: 'name_en',
      type: 'text',
      required: true,
      label: 'Product Name (English)',
      admin: {
        components: {
          afterInput: [
            {
              path: '/src/payload/components/AIGenerateButton',
              clientProps: {
                targetType: 'product',
                promptType: 'translation',
                locale: 'en',
              },
            },
          ],
        },
      },
    },
    {
      name: 'description_vi',
      type: 'richText',
      required: true,
      admin: {
        components: {
          beforeInput: [
            {
              path: '/src/payload/components/AIGenerateButton',
              clientProps: {
                targetType: 'product',
                promptType: 'description',
                locale: 'vi',
              },
            },
          ],
        },
      },
    },
    // ... other fields
  ],
};
```

### 6.3 Publication Validation Hook

```typescript
// src/payload/hooks/validate-bilingual-publication.ts
import type { CollectionBeforeChangeHook } from 'payload';

export const validateBilingualPublication: CollectionBeforeChangeHook = async ({
  data,
  operation,
}) => {
  // Only validate on publish attempt
  if (data.status !== 'published') return data;

  const requiredBilingualFields = [
    'name_vi',
    'name_en',
    'summary_vi',
    'summary_en',
    'description_vi',
    'description_en',
  ];

  const missingFields = requiredBilingualFields.filter(
    (field) => !data[field] || data[field].trim() === ''
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Cannot publish: Missing required bilingual fields: ${missingFields.join(', ')}. ` +
      `Use AI translation assistant to generate missing content, then review before publishing.`
    );
  }

  return data;
};
```

---

## 7. API Routes (Next.js Server)

### 7.1 AI Generation Endpoint

```typescript
// src/app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadUser } from '@/lib/auth/payload';
import { generateProductDescription } from '@/lib/ai/actions/product-description';
import { generateSEOMetadata } from '@/lib/ai/actions/seo-metadata';
import { translateContent } from '@/lib/ai/actions/translate-content';

export async function POST(req: NextRequest) {
  try {
    const user = await getPayloadUser(req);
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { targetType, targetId, promptType, locale, input } = body;

    // Validate input
    validateAIGenerationInput({ targetType, targetId, promptType, locale, input });

    let result;
    switch (promptType) {
      case 'product_description':
        result = await generateProductDescription({
          userId: user.id,
          targetId,
          locale,
          input,
        });
        break;
      case 'seo_metadata':
        result = await generateSEOMetadata({
          userId: user.id,
          targetType,
          targetId,
          locale,
          input,
        });
        break;
      case 'translation':
        result = await translateContent({
          userId: user.id,
          targetType,
          targetId,
          sourceLocale: input.sourceLocale,
          targetLocale: locale,
          sourceContent: input.sourceContent,
        });
        break;
      default:
        return NextResponse.json({ ok: false, error: 'Invalid prompt type' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, draft: result });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'AI generation failed' },
      { status: 500 }
    );
  }
}

function validateAIGenerationInput(params: any): void {
  const { targetType, targetId, promptType, locale, input } = params;

  if (!['product', 'blog_post', 'content_page'].includes(targetType)) {
    throw new Error('Invalid targetType');
  }
  if (!targetId || typeof targetId !== 'string') {
    throw new Error('targetId is required');
  }
  if (!['vi', 'en'].includes(locale)) {
    throw new Error('Invalid locale');
  }
  if (!input || typeof input !== 'object') {
    throw new Error('input is required');
  }

  // Check for private data leakage
  const dangerousKeys = ['customerId', 'quoteRequestId', 'email', 'phone', 'apiKey', 'secret'];
  const inputString = JSON.stringify(input).toLowerCase();
  for (const key of dangerousKeys) {
    if (inputString.includes(key.toLowerCase())) {
      throw new Error(`Input contains prohibited field: ${key}`);
    }
  }
}
```

---

## 8. Security & Compliance

### 8.1 Security Checklist

| Risk | Mitigation |
|---|---|
| **API Key Exposure** | - Store in `.env.local` only<br>- Never import in client components<br>- Validate all AI calls run server-side |
| **Private Data Leakage** | - Block quote request customer data in input validation<br>- Never send PII (email, phone, address) to OpenAI<br>- Audit all prompts for sensitive data |
| **Prompt Injection** | - Sanitize user-provided content before building prompts<br>- Use structured JSON output format<br>- Validate output structure matches expectations |
| **Rate Limit Bypass** | - Enforce per-user rate limiting<br>- Track failed attempts<br>- Alert on suspicious patterns |
| **Unauthorized Access** | - Check user role before all AI calls<br>- Admin/Editor only<br>- Log all generations with actor ID |
| **Cost Overrun** | - Set monthly budget alert ($100 default)<br>- Monitor token usage<br>- Cap tokens per request (4000 default) |
| **Unsafe Output** | - Validate output against input structure<br>- Check for unsupported claims (price, stock, warranty invented by AI)<br>- Human review before publish |

### 8.2 Input Sanitization

```typescript
// src/lib/ai/validate-input.ts
export function sanitizeAIInput(input: Record<string, any>): Record<string, any> {
  const sanitized = { ...input };

  // Remove any fields that might contain PII
  const blockedFields = [
    'email',
    'phone',
    'customerId',
    'quoteRequestId',
    'password',
    'apiKey',
    'secret',
  ];

  for (const key of Object.keys(sanitized)) {
    if (blockedFields.includes(key)) {
      delete sanitized[key];
    }
  }

  // Truncate long strings to prevent excessive token usage
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string' && value.length > 5000) {
      sanitized[key] = value.slice(0, 5000) + '... [truncated]';
    }
  }

  return sanitized;
}
```

### 8.3 Compliance Rules

**OpenAI Terms of Service:**
- âœ… Use for content generation (allowed)
- âœ… User-initiated requests (not automated bulk processing)
- âŒ Never send private customer data without consent
- âœ… Human review before publication

**GDPR/Privacy:**
- AI input must NOT contain customer PII from quote requests
- AI drafts stored in database do NOT contain identifiable customer information
- Audit logs anonymize customer-facing data

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// tests/unit/ai-prompts.test.ts
import { describe, it, expect } from 'vitest';
import { buildProductDescriptionPrompt } from '@/lib/ai/prompts/product-description';
import { buildTranslationPrompt } from '@/lib/ai/prompts/translation';

describe('AI Prompt Builders', () => {
  it('builds product description prompt with required fields', () => {
    const prompt = buildProductDescriptionPrompt(
      {
        name: 'Sofa Curve Velour',
        category: 'Sofa',
        material: 'Velour fabric + oak frame',
        dimensions: '2400 x 950 x 850 mm',
      },
      'vi'
    );

    expect(prompt.system).toContain('Vietnamese showroom consultant');
    expect(prompt.system).toContain('quote-first approach');
    expect(prompt.user).toContain('Sofa Curve Velour');
    expect(prompt.user).toContain('2400 x 950 x 850 mm');
  });

  it('blocks private data fields in translation input', () => {
    expect(() => {
      buildTranslationPrompt({
        sourceLocale: 'vi',
        targetLocale: 'en',
        contentType: 'product',
        sourceContent: {
          title: 'Test Product',
          customerEmail: 'secret@example.com', // Should be blocked
        },
      });
    }).toThrow(/prohibited field/i);
  });
});
```

### 9.2 Integration Tests

```typescript
// tests/integration/ai-generation.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { generateProductDescription } from '@/lib/ai/actions/product-description';
import { createMockUser, createMockProduct } from './test-helpers';

describe('AI Generation Actions', () => {
  let mockUser;
  let mockProduct;

  beforeAll(async () => {
    mockUser = await createMockUser({ role: 'editor' });
    mockProduct = await createMockProduct({
      name_vi: 'BÃ n TrÃ  Marble',
      category: 'Coffee Table',
    });
  });

  it('generates product description and saves draft', async () => {
    const result = await generateProductDescription({
      userId: mockUser.id,
      targetId: mockProduct.id,
      locale: 'vi',
      input: {
        name: mockProduct.name_vi,
        category: mockProduct.category,
        material: 'Marble + walnut',
      },
    });

    expect(result.draftId).toBeTruthy();
    expect(result.output.summary).toBeTruthy();
    expect(result.output.description).toBeTruthy();
    expect(result.output.features).toHaveLength(3);

    // Verify draft saved to database
    const draft = await payload.findByID({
      collection: 'ai-drafts',
      id: result.draftId,
    });
    expect(draft.status).toBe('draft');
    expect(draft.promptType).toBe('product_description');
  });

  it('respects rate limiting', async () => {
    // Make 21 requests rapidly (exceeds 20/hour limit)
    const requests = Array.from({ length: 21 }, () =>
      generateProductDescription({
        userId: mockUser.id,
        targetId: mockProduct.id,
        locale: 'vi',
        input: { name: 'Test', category: 'Test' },
      })
    );

    await expect(Promise.all(requests)).rejects.toThrow(/rate limit exceeded/i);
  });
});
```

### 9.3 Browser MCP Journey Checks

Browser MCP is the primary tool for CMS AI workflow validation. Do not start by writing Playwright scripts or selector-first assertions. Use Playwright only as backup when Browser MCP cannot cover the interaction or a deterministic CI/headless regression script is required.

#### Test Case: Product Description Draft

- **Goal**: Verify an Editor can generate, review, and accept a product description draft without auto-publishing.
- **Preconditions**: Editor is authenticated; Gemini/OpenAI mock or configured provider is available; product creation page is reachable.
- **Browser MCP steps**:
  1. Open the product creation page.
  2. Inspect the current form state and AI action availability.
  3. Fill basic product context using visible labels, such as product name and category.
  4. Click the visible AI generate action for product description.
  5. Verify loading state appears.
  6. Verify a draft preview appears with accept/discard/regenerate controls.
  7. Accept the draft.
  8. Verify the draft content is copied into the editable description field and remains unpublished until the user manually saves/publishes.
- **Expected result**: AI output is draft-only, editable, and copied only after user acceptance.
- **Pass/fail**:
  - Pass: draft preview appears, acceptance copies content to the target field, and no auto-publish occurs.
  - Fail: output is published automatically, private data appears, or the user cannot review before accepting.
- **Playwright backup**: Use only for mocked CI regression of the same flow.

#### Test Case: Vietnamese To English Translation Draft

- **Goal**: Verify an Editor can generate an English translation draft from existing Vietnamese content.
- **Preconditions**: Product record has Vietnamese content; Editor is authenticated.
- **Browser MCP steps**:
  1. Open the product edit page.
  2. Inspect Vietnamese source fields.
  3. Use the visible action to generate English translation.
  4. Verify side-by-side or preview comparison appears.
  5. Accept the translation.
  6. Verify English fields are populated and remain editable.
- **Expected result**: Translation preserves product facts and requires human acceptance.
- **Pass/fail**:
  - Pass: translation appears in preview, can be accepted, and populates target locale fields.
  - Fail: translation overwrites source content, invents unsupported facts, or skips review.
- **Playwright backup**: Use only when a deterministic seeded translation script is required.

#### Test Case: Incomplete Bilingual Publication Block

- **Goal**: Verify publication is blocked when required bilingual fields are incomplete.
- **Preconditions**: Editor is authenticated; product creation/edit page is reachable.
- **Browser MCP steps**:
  1. Open product creation.
  2. Fill only the Vietnamese required fields.
  3. Attempt to publish.
  4. Verify localized validation errors identify missing English fields.
  5. Verify the record remains draft/unpublished.
- **Expected result**: Publication is blocked with clear guidance.
- **Pass/fail**:
  - Pass: user sees actionable validation and public publish state is not reached.
  - Fail: incomplete bilingual content is published or validation is unclear.
- **Playwright backup**: Use only for CI publication-validation regression.

---

## 10. Implementation Tasks (Slice S-11)

### Prerequisites
- [x] S-00: Foundation alignment complete (Payload CMS, env validation, `src/` structure)
- [x] S-01: CMS access and media (Users, Media collections, Admin/Editor access)
- [x] S-05: Product catalog CMS (Products, ProductCategories collections)

### Backend Tasks

| Task | Files | Estimated Hours | Tests |
|---|---|---|---|
| **T-11.1: Environment config** | `.env.example`, `src/lib/env/server.ts` | 2h | Unit: env validation |
| **T-11.2: OpenAI client wrapper** | `src/lib/ai/client.ts`, `src/lib/ai/rate-limiter.ts` | 4h | Unit: rate limiter<br>Mock: OpenAI calls |
| **T-11.3: Prompt builders** | `src/lib/ai/prompts/product-description.ts`<br>`src/lib/ai/prompts/seo-metadata.ts`<br>`src/lib/ai/prompts/translation.ts`<br>`src/lib/ai/prompts/blog-outline.ts` | 6h | Unit: prompt structure<br>Unit: input sanitization |
| **T-11.4: AIDrafts collection** | `src/payload/collections/AIDrafts.ts` | 3h | Integration: CRUD<br>Access control |
| **T-11.5: AI generation actions** | `src/lib/ai/actions/product-description.ts`<br>`src/lib/ai/actions/seo-metadata.ts`<br>`src/lib/ai/actions/translate-content.ts` | 8h | Integration: full flow<br>Mock OpenAI responses |
| **T-11.6: API route** | `src/app/api/ai/generate/route.ts` | 4h | Integration: auth<br>Integration: validation |
| **T-11.7: Publication validation hook** | `src/payload/hooks/validate-bilingual-publication.ts` | 2h | Unit: validation logic<br>Integration: block publish |
| **T-11.8: Audit logging** | Update `src/lib/audit/log.ts` | 2h | Integration: AI events logged |

### CMS UI Tasks

| Task | Files | Estimated Hours | Tests |
|---|---|---|---|
| **T-11.9: AI Generate button component** | `src/payload/components/AIGenerateButton.tsx`<br>`src/payload/components/AIDraftPreview.tsx` | 6h | Browser MCP: click generate and accept/discard draft; Playwright backup only for CI |
| **T-11.10: Translation workflow UI** | `src/payload/components/TranslationPanel.tsx` | 4h | Browser MCP: translate vi to en and review side-by-side; Playwright backup only for CI |
| **T-11.11: Integrate AI buttons in Products** | `src/payload/collections/Products.ts` | 2h | Browser MCP: full product workflow; Playwright backup only for CI |
| **T-11.12: Integrate AI buttons in Blog** | `src/payload/collections/BlogPosts.ts` | 2h | Browser MCP: blog translation workflow; Playwright backup only for CI |

### Documentation Tasks

| Task | Files | Estimated Hours |
|---|---|---|
| **T-11.13: Admin user guide** | `docs/user-guides/ai-assistant.md` | 3h |
| **T-11.14: Security review** | `docs/security/ai-integration-review.md` | 2h |
| **T-11.15: Update traceability** | `docs/specs/traceability-matrix.md` | 1h |

**Total Estimated Hours:** 51 hours (approximately 1.5 weeks for 1 developer)

---

## 11. Acceptance Criteria

### FR-11: AI Assistance

**Requirement:** AI assistance supports content and SEO drafting inside CMS.

**Acceptance Criteria:**

| ID | Criterion | Verification Method |
|---|---|---|
| AC-11.1 | Editor can click "Generate with AI" button for product descriptions | Browser MCP journey: Product edit page |
| AC-11.2 | AI output is saved as `status: 'draft'` in `AIDrafts` collection | Integration test: Check database |
| AC-11.3 | Draft preview modal shows AI output with Accept/Discard/Regenerate options | Browser MCP journey: Modal interaction |
| AC-11.4 | Accepted draft copies content to target field and marks draft as `accepted` | Integration test: Field update |
| AC-11.5 | Discarded draft marks as `discarded` without changing target field | Integration test: No field update |
| AC-11.6 | AI cannot auto-publish content (all generations remain draft until human review) | Unit test: Validate no auto-publish path |
| AC-11.7 | API key is never exposed to browser (server-side only) | Code review: No client imports |
| AC-11.8 | Rate limiting prevents abuse (20 requests/hour per user default) | Integration test: 21st request fails |
| AC-11.9 | Audit logs track all AI generations with actor, entity, tokens used | Integration test: Audit entry exists |

### FR-12-ADM: Bilingual Content Management

**Requirement:** Admin bilingual content management supports separate Vietnamese and English content.

**Acceptance Criteria:**

| ID | Criterion | Verification Method |
|---|---|---|
| AC-12.1 | Products have separate `name_vi`, `name_en`, `description_vi`, `description_en` fields | Schema inspection: Payload collection |
| AC-12.2 | Editor can initiate translation from `vi` to `en` via "Generate Translation" button | Browser MCP journey: Translation button |
| AC-12.3 | Translation draft shows source and target side-by-side for review | Browser MCP journey: Translation preview |
| AC-12.4 | Accepted translation copies to target locale fields | Integration test: Field update |
| AC-12.5 | Publication validation blocks publish if required bilingual fields are incomplete | Integration test: Validation error |
| AC-12.6 | Validation error message guides user to use AI translation for missing content | Browser MCP journey: Error message text |

---

## 12. Operational Considerations

### 12.1 Cost Management

**Monthly Budget:** $100 (configurable via `AI_MONTHLY_BUDGET_USD`)

**Token Usage Estimates:**
- Product description (vi): ~800 tokens
- SEO metadata: ~400 tokens
- Translation (viâ†’en product): ~600 tokens
- Blog outline: ~500 tokens

**Cost at $0.01 per 1K tokens (gpt-4o-mini):**
- 100 product descriptions: ~$0.80
- 100 translations: ~$0.60
- 50 blog outlines: ~$0.25
- **Total launch content:** ~$2 for 250 AI generations

**Monitoring:**
- Track monthly spending via OpenAI dashboard
- Alert when 80% of budget reached
- Log token usage per request in `AIDrafts.tokensUsed`

### 12.2 Model Selection

**Default Model:** `gpt-4o-mini` (faster, cheaper, sufficient for most content)
- Cost: $0.150 per 1M input tokens, $0.600 per 1M output tokens
- Speed: ~2-5 seconds per request
- Quality: Good for descriptions, SEO, translations

**Premium Model:** `gpt-4o` (optional, for complex blog content)
- Cost: $2.50 per 1M input tokens, $10.00 per 1M output tokens
- Speed: ~5-10 seconds per request
- Quality: Superior for long-form blog outlines, nuanced translations

**Configuration:**
```bash
OPENAI_MODEL_DEFAULT=gpt-4o-mini  # Default for all generations
OPENAI_MODEL_PREMIUM=gpt-4o       # Optional override for blog content
```

### 12.3 Error Handling

**OpenAI API Errors:**

| Error Type | HTTP Status | Retry Strategy | User Message |
|---|---|---|---|
| Rate limit (429) | 429 | Exponential backoff (1s, 2s, 4s) | "AI service is busy. Please try again in a moment." |
| Invalid API key (401) | 500 | No retry, alert admin | "AI service configuration error. Contact administrator." |
| Timeout (>30s) | 500 | Single retry after 5s | "AI request timed out. Trying again..." |
| Invalid response | 500 | No retry | "AI generated invalid response. Please try again or contact support." |
| Quota exceeded (429) | 500 | No retry, alert admin | "Monthly AI budget exceeded. Contact administrator." |

**Logging:**
- All errors logged to `AIDrafts.errorMessage`
- Failed attempts counted in rate limiter
- Admin alerts via email when quota/budget thresholds reached

---

## 13. Future Enhancements (Out of Scope for MVP)

### Phase 2 Features

1. **Batch Translation**
   - Select multiple products and translate all viâ†’en in one operation
   - Progress tracking UI
   - Parallel API calls with queue management

2. **Translation Memory**
   - Store approved translations for reuse
   - Suggest previously translated terms
   - Build brand glossary automatically

3. **AI Image Alt Text Generation**
   - Analyze uploaded images with OpenAI Vision API
   - Generate descriptive alt text for accessibility
   - Bilingual alt text suggestions

4. **Content Quality Scoring**
   - AI-powered readability analysis
   - SEO keyword density checks
   - Tone consistency validation

5. **Custom AI Models**
   - Fine-tune GPT on brand voice samples
   - Domain-specific vocabulary (furniture, materials)
   - Improved translation accuracy for technical terms

6. **Multi-language Support**
   - Expand beyond vi/en to zh, ja, ko
   - Language-specific prompt templates
   - Regional glossaries

---

## 14. Dependencies and Prerequisites

### External Services

| Service | Purpose | Account Requirement | Cost Estimate |
|---|---|---|---|
| OpenAI API | GPT-4o-mini for content generation | API key required | $2-5/month for launch |
| Upstash Redis (optional) | Rate limiting storage | Free tier sufficient | Free (10K requests/day) |

### Internal Dependencies

| Prerequisite | Status | Blocking Tasks |
|---|---|---|
| Payload CMS 3.x installed | âŒ TODO (S-00) | All AI tasks |
| Users collection with role field | âŒ TODO (S-01) | Authorization |
| Products collection with bilingual fields | âŒ TODO (S-05) | Product AI features |
| BlogPosts collection | âŒ TODO (S-08) | Blog AI features |
| AuditLogs collection | âŒ TODO (S-01) | Audit logging |

---

## 15. Verification Commands

Before marking Slice S-11 as complete, run:

```bash
# 1. Environment validation
pnpm test tests/unit/env-validation.test.ts

# 2. AI prompt builders
pnpm test tests/unit/ai-prompts.test.ts

# 3. Rate limiter
pnpm test tests/unit/rate-limiter.test.ts

# 4. Integration: AI generation flow
pnpm test tests/integration/ai-generation.test.ts

# 5. Integration: Translation workflow
pnpm test tests/integration/translation-workflow.test.ts

# 6. Browser MCP: CMS AI workflow
# Open the CMS AI route, perform product draft, translation, and incomplete-publication journeys, capture screenshot/snapshot evidence when useful, and record pass/fail. Use pnpm test:e2e tests/e2e/ai-workflow.spec.ts only as Playwright backup for CI/headless regression.

# 7. Security: No API key in client bundles
pnpm build
grep -r "OPENAI_API_KEY" .next/static && echo "FAIL: API key found in client bundle" || echo "PASS"

# 8. Lint and typecheck
pnpm lint
pnpm typecheck

# 9. Full build
pnpm build
```

**Expected Results:**
- All tests pass
- No API key in client bundles
- No TypeScript errors
- Build succeeds

---

## 16. Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Deploy to staging environment
- Admin account only
- Test all prompt types with real OpenAI API
- Verify rate limiting and error handling
- Validate bilingual publication workflow

### Phase 2: Editor Beta (Week 2)
- Enable for Editor role on staging
- Train 2-3 editors on AI workflow
- Collect feedback on UI/UX
- Monitor token usage and costs
- Adjust rate limits if needed

### Phase 3: Production Launch (Week 3)
- Deploy to production
- Enable for all Editors and Admins
- Set conservative rate limits (20/hour)
- Monitor daily for first week
- Prepare runbook for common issues

### Phase 4: Optimization (Week 4+)
- Analyze most common prompt types
- Optimize prompts for quality and token efficiency
- Adjust rate limits based on actual usage
- Implement Phase 2 enhancements (batch, memory)

---

## 17. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **API Key Leaked** | Low | Critical | - Server-only access<br>- Code review before deploy<br>- Rotate key if suspected |
| **Cost Overrun** | Medium | Medium | - Monthly budget alerts<br>- Rate limiting per user<br>- Monitor daily for first month |
| **AI Generates Inaccurate Content** | Medium | Medium | - Draft-only workflow<br>- Human review required<br>- Safety review prompt for flagging |
| **Private Data Sent to OpenAI** | Low | Critical | - Input validation blocks PII fields<br>- Code review of all prompt builders<br>- Audit logs for investigation |
| **Rate Limit Bypass** | Low | Low | - Server-side enforcement<br>- Redis-backed counter<br>- Alert on unusual patterns |
| **OpenAI Service Outage** | Medium | Low | - Graceful error handling<br>- Retry with exponential backoff<br>- Manual content creation fallback |
| **Translation Quality Issues** | Medium | Medium | - Side-by-side review UI<br>- Editor can edit before accepting<br>- Brand glossary for consistency |
| **Model Deprecation** | Low | Medium | - Follow OpenAI deprecation notices<br>- Config-driven model selection<br>- Test with new models before switching |

---

## 18. Monitoring and Metrics

### Key Metrics to Track

1. **Usage Metrics**
   - AI generations per day/week/month
   - Breakdown by prompt type (description, SEO, translation)
   - Accepted vs discarded drafts ratio
   - Average tokens per request

2. **Performance Metrics**
   - API response time (p50, p95, p99)
   - Error rate (% of failed requests)
   - Timeout rate

3. **Cost Metrics**
   - Daily/monthly spending
   - Cost per generation by type
   - Spending by user/role

4. **Quality Metrics**
   - Draft acceptance rate
   - Time from generation to acceptance
   - Regeneration frequency

### Monitoring Implementation

```typescript
// src/lib/monitoring/ai-metrics.ts
export async function logAIMetrics(params: {
  userId: string;
  promptType: string;
  tokensUsed: number;
  duration: number;
  status: 'success' | 'error';
  errorType?: string;
}) {
  // Log to monitoring service (e.g., Vercel Analytics, Datadog)
  // Or store in PostgreSQL for internal dashboard
}
```

### Alerts

- **Budget Alert:** Email admin when 80% of monthly budget reached
- **Error Rate Alert:** Slack notification when error rate >10% over 1 hour
- **Quota Alert:** Email admin when approaching OpenAI account quota

---

## 19. Summary and Sign-off

### What This Spec Delivers

âœ… **Backend AI Integration:**
- OpenAI GPT-4o-mini integration for content generation
- Server-side prompt builders for products, SEO, blog, translation
- Draft-only workflow with human review
- Rate limiting and cost controls
- Security: API key protection, PII filtering, audit logging

âœ… **Translation Workflow:**
- Vietnamese â†” English content translation
- Side-by-side review UI
- Publication validation (both locales required)
- Brand glossary support

âœ… **CMS Integration:**
- Payload CMS custom field components
- AI Generate buttons in Products and Blog collections
- Draft preview and acceptance workflow
- Bilingual publication validation hook

âœ… **Testing:**
- Unit tests for prompts, rate limiter, validation
- Integration tests for full AI generation flow
- Browser MCP journey checks for CMS UI workflow
- Playwright backup scripts only for CI/headless deterministic regression when needed
- Security tests for API key protection

### What This Spec Does NOT Include

âŒ **Frontend Public Features:**
- Public AI chatbot
- AI product recommendations on website
- Real-time translation for visitors

âŒ **Advanced Features (Phase 2):**
- Batch translation
- Translation memory
- AI image alt text
- Custom fine-tuned models

### Sign-off Checklist

Before implementation begins, confirm:

- [ ] Payload CMS foundation (S-00, S-01) is complete
- [ ] Product catalog CMS (S-05) is complete
- [ ] OpenAI API key obtained and added to `.env`
- [ ] Monthly budget approved ($100 default)
- [ ] Security review of architecture approved
- [ ] Admin/Editor training plan prepared

### Estimated Effort

- **Backend Implementation:** 31 hours
- **CMS UI Integration:** 14 hours
- **Documentation:** 6 hours
- **Total:** ~51 hours (1.5 weeks for 1 developer, or 1 week for 2 developers)

### Success Criteria

Implementation is complete when:

1. All AC-11.x and AC-12.x acceptance criteria pass
2. All verification commands pass
3. Browser MCP journey checks cover full CMS AI workflow; Playwright backup covers only CI/headless deterministic gaps when needed
4. Security review confirms no API key exposure
5. Editor training session conducted successfully
6. Production deployment smoke test passes

---

**Document Version:** 1.0
**Last Updated:** 2026-06-06
**Status:** âœ… Ready for Implementation
**Next Step:** Begin T-11.1 (Environment config) after S-05 completes

