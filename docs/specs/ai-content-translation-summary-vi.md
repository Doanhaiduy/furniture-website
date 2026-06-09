# TÃ³m Táº¯t: Module AI Content Generation & Translation Workflow

**NgÃ y táº¡o:** 2026-06-06
**Tráº¡ng thÃ¡i:** Sáºµn sÃ ng triá»ƒn khai
**TÃ i liá»‡u chi tiáº¿t:** `ai-content-translation-spec.md`

---

## 1. Má»¥c TiÃªu

XÃ¢y dá»±ng há»‡ thá»‘ng AI backend Ä‘á»ƒ:
- Tá»± Ä‘á»™ng táº¡o mÃ´ táº£ sáº£n pháº©m, metadata SEO, outline blog
- Dá»‹ch ná»™i dung Viá»‡t â†” Anh
- TÃ­ch há»£p vÃ o Payload CMS vá»›i workflow review cá»§a con ngÆ°á»i
- Báº£o máº­t: API key khÃ´ng bao giá» lá»™ ra browser, khÃ´ng gá»­i dá»¯ liá»‡u khÃ¡ch hÃ ng Ä‘áº¿n OpenAI

---

## 2. Kiáº¿n TrÃºc Tá»•ng Quan

```
CMS Admin UI (Payload)
  â†“ Click "Generate with AI" button
Server-Side AI Actions (Next.js API Routes)
  â†“ Build prompts + validate input
OpenAI API (GPT-4o-mini)
  â†“ Return AI-generated content
AIDrafts Collection (PostgreSQL)
  â†“ Save as draft, status = 'draft'
Human Review (Editor/Admin)
  â†“ Accept/Discard/Edit
Publication (Payload Hooks)
  â†“ Validate bilingual content complete
Public Website (Next.js Frontend)
```

**NguyÃªn táº¯c quan trá»ng:**
- âœ… AI chá»‰ táº¡o draft, khÃ´ng auto-publish
- âœ… Server-side only (API key báº£o máº­t)
- âœ… KhÃ´ng bao giá» gá»­i thÃ´ng tin khÃ¡ch hÃ ng (email, phone, quote requests) Ä‘áº¿n OpenAI
- âœ… Rate limiting: 20 requests/giá» má»—i user
- âœ… Budget: $100/thÃ¡ng máº·c Ä‘á»‹nh

---

## 3. CÃ¡c TÃ­nh NÄƒng ChÃ­nh

### 3.1 Táº¡o Ná»™i Dung AI

**Prompt types:**
1. **Product Description** - Táº¡o mÃ´ táº£ sáº£n pháº©m tá»« thÃ´ng tin cÆ¡ báº£n
2. **SEO Metadata** - Táº¡o title, description, OG tags
3. **Blog Outline** - Táº¡o outline bÃ i viáº¿t
4. **Translation** - Dá»‹ch vi â†” en
5. **Safety Review** - Kiá»ƒm tra ná»™i dung khÃ´ng an toÃ n

**Input:**
- Product: name, category, material, dimensions, brand
- SEO: page type, title, content summary, keyword
- Translation: source content (vi/en)

**Output:**
- JSON structured data
- Saved to `AIDrafts` collection
- Status: `draft` | `accepted` | `discarded`

### 3.2 Translation Workflow

**Quy trÃ¬nh dá»‹ch:**
1. Editor nháº­p ná»™i dung tiáº¿ng Viá»‡t Ä‘áº§y Ä‘á»§
2. Click "Generate EN Translation"
3. AI táº¡o báº£n dá»‹ch draft
4. UI hiá»ƒn thá»‹ side-by-side comparison (vi vs en)
5. Editor review vÃ  edit náº¿u cáº§n
6. Click "Accept Translation" â†’ copy sang field tiáº¿ng Anh
7. Khi publish, system validate cáº£ 2 ngÃ´n ngá»¯ Ä‘Ã£ Ä‘áº§y Ä‘á»§

**Publication Validation:**
- Required fields: `name_vi`, `name_en`, `description_vi`, `description_en`
- Náº¿u thiáº¿u â†’ block publish + hiá»ƒn thá»‹ error message gá»£i Ã½ dÃ¹ng AI

---

## 4. Database Schema

### Collection: AIDrafts

```typescript
{
  targetType: 'product' | 'blog_post' | 'content_page' | 'seo' | 'translation',
  targetId: string,  // ID cá»§a entity liÃªn quan (productId, blogPostId...)
  locale: 'vi' | 'en',
  promptType: 'product_description' | 'seo_metadata' | 'blog_outline' | 'translation',
  input: JSON,      // Input Ä‘Ã£ sanitized
  output: JSON,     // AI output
  status: 'draft' | 'accepted' | 'discarded',
  requestedBy: userId,
  reviewedBy: userId,
  model: 'gpt-4o-mini',
  tokensUsed: number,
  errorMessage: string
}
```

---

## 5. Cáº¥u TrÃºc Code

### Backend Files (Server-Side Only)

```
src/
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ ai/
â”‚   â”‚   â”œâ”€â”€ client.ts                    # OpenAI client wrapper
â”‚   â”‚   â”œâ”€â”€ rate-limiter.ts              # Rate limiting logic
â”‚   â”‚   â”œâ”€â”€ validate-input.ts            # Sanitize input, block PII
â”‚   â”‚   â”œâ”€â”€ prompts/
â”‚   â”‚   â”‚   â”œâ”€â”€ product-description.ts   # Product prompt builder
â”‚   â”‚   â”‚   â”œâ”€â”€ seo-metadata.ts          # SEO prompt builder
â”‚   â”‚   â”‚   â”œâ”€â”€ translation.ts           # Translation prompt builder
â”‚   â”‚   â”‚   â””â”€â”€ blog-outline.ts          # Blog prompt builder
â”‚   â”‚   â””â”€â”€ actions/
â”‚   â”‚       â”œâ”€â”€ product-description.ts   # Full generation flow
â”‚   â”‚       â”œâ”€â”€ seo-metadata.ts
â”‚   â”‚       â””â”€â”€ translate-content.ts
â”‚   â””â”€â”€ env/
â”‚       â””â”€â”€ server.ts                    # Environment validation
â”œâ”€â”€ payload/
â”‚   â”œâ”€â”€ collections/
â”‚   â”‚   â”œâ”€â”€ AIDrafts.ts                  # AI drafts collection
â”‚   â”‚   â”œâ”€â”€ Products.ts                  # + AI button integration
â”‚   â”‚   â””â”€â”€ BlogPosts.ts                 # + AI button integration
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â””â”€â”€ validate-bilingual-publication.ts  # Block publish if incomplete
â”‚   â””â”€â”€ components/
â”‚       â”œâ”€â”€ AIGenerateButton.tsx         # CMS UI: "Generate with AI" button
â”‚       â”œâ”€â”€ AIDraftPreview.tsx           # Draft preview modal
â”‚       â””â”€â”€ TranslationPanel.tsx         # Side-by-side translation review
â””â”€â”€ app/
    â””â”€â”€ api/
        â””â”€â”€ ai/
            â””â”€â”€ generate/
                â””â”€â”€ route.ts             # API endpoint /api/ai/generate
```

### Environment Variables

```bash
# .env.local (KHÃ”NG BAO GIá»œ commit vÃ o git)
OPENAI_API_KEY=sk-...
OPENAI_MODEL_DEFAULT=gpt-4o-mini
OPENAI_MAX_TOKENS_PER_REQUEST=4000
AI_RATE_LIMIT_PER_USER=20
AI_MONTHLY_BUDGET_USD=100
```

---

## 6. Security Checklist

| Rá»§i ro | Giáº£i phÃ¡p |
|---|---|
| **API key lá»™ ra browser** | âœ… Server-side only, khÃ´ng import trong client components |
| **Dá»¯ liá»‡u khÃ¡ch hÃ ng gá»­i Ä‘áº¿n OpenAI** | âœ… Input validation block cÃ¡c field: email, phone, quoteRequestId, customerId |
| **Prompt injection** | âœ… Sanitize input, structured JSON output |
| **Rate limit bypass** | âœ… Server-side rate limiter (Redis hoáº·c in-memory) |
| **Chi phÃ­ vÆ°á»£t má»©c** | âœ… Monthly budget alert, token cap per request |
| **AI táº¡o ná»™i dung sai** | âœ… Draft-only workflow, human review required |

---

## 7. Testing Strategy

### Unit Tests
- âœ… AI prompt builders (product, SEO, translation)
- âœ… Rate limiter logic
- âœ… Input sanitization (block PII fields)
- âœ… Environment validation

### Integration Tests
- âœ… Full AI generation flow (call OpenAI â†’ save draft â†’ verify database)
- âœ… Translation workflow (viâ†’en)
- âœ… Rate limiting enforcement (21st request fails)
- âœ… Publication validation (block publish if bilingual incomplete)

### Browser MCP Journey Checks (primary) + Playwright backup
- âœ… CMS: Click "Generate with AI" â†’ preview draft â†’ accept
- âœ… CMS: Translate viâ†’en â†’ review side-by-side â†’ accept
- âœ… CMS: Try publish without en content â†’ see error message
- âœ… CMS: Full workflow tá»« generate â†’ review â†’ publish

### Security Tests
- âœ… Search `.next/static` build output â†’ confirm NO API key
- âœ… Code review: No client-side import cá»§a `lib/ai/*`
- âœ… Input validation: Block request chá»©a "email", "phone", "customerId"

---

## 8. Implementation Tasks

**Tá»•ng thá»i gian Æ°á»›c tÃ­nh:** 51 giá» (~1.5 tuáº§n cho 1 dev)

### Backend (31 giá»)
1. Environment config + validation (2h)
2. OpenAI client + rate limiter (4h)
3. Prompt builders (4 types) (6h)
4. AIDrafts collection (3h)
5. AI generation actions (8h)
6. API route /api/ai/generate (4h)
7. Publication validation hook (2h)
8. Audit logging integration (2h)

### CMS UI (14 giá»)
9. AIGenerateButton component (6h)
10. TranslationPanel component (4h)
11. Integrate buttons in Products (2h)
12. Integrate buttons in BlogPosts (2h)

### Documentation (6 giá»)
13. Admin user guide (3h)
14. Security review doc (2h)
15. Update traceability matrix (1h)

---

## 9. Verification Commands

```bash
# 1. Unit tests
pnpm test tests/unit/ai-prompts.test.ts
pnpm test tests/unit/rate-limiter.test.ts

# 2. Integration tests
pnpm test tests/integration/ai-generation.test.ts
pnpm test tests/integration/translation-workflow.test.ts

# 3. Browser MCP journey checks
# Open CMS AI workflow with Browser MCP, run generate/translate/publish-block journeys, capture evidence. Use pnpm test:e2e tests/e2e/ai-workflow.spec.ts only as Playwright backup for CI/headless regression.

# 4. Security check: NO API key in client bundle
pnpm build
grep -r "OPENAI_API_KEY" .next/static && echo "FAIL" || echo "PASS"

# 5. Lint + Typecheck
pnpm lint
pnpm typecheck
```

---

## 10. Acceptance Criteria

### FR-11: AI Assistance

| ID | TiÃªu chÃ­ | CÃ¡ch kiá»ƒm tra |
|---|---|---|
| AC-11.1 | Editor click "Generate with AI" cho product descriptions | Browser MCP journey |
| AC-11.2 | AI output lÆ°u vÃ o AIDrafts vá»›i `status: 'draft'` | Integration test |
| AC-11.3 | Modal preview hiá»ƒn thá»‹ output vá»›i options Accept/Discard/Regenerate | Browser MCP journey |
| AC-11.4 | Accept draft â†’ copy ná»™i dung vÃ o field target â†’ mark `accepted` | Integration test |
| AC-11.5 | Discard draft â†’ mark `discarded` mÃ  khÃ´ng Ä‘á»•i field | Integration test |
| AC-11.6 | AI KHÃ”NG auto-publish (pháº£i human review) | Unit test |
| AC-11.7 | API key khÃ´ng lá»™ ra browser | Code review |
| AC-11.8 | Rate limiting: 20 requests/giá» per user | Integration test |
| AC-11.9 | Audit logs ghi láº¡i táº¥t cáº£ AI generations | Integration test |

### FR-12-ADM: Bilingual Content Management

| ID | TiÃªu chÃ­ | CÃ¡ch kiá»ƒm tra |
|---|---|---|
| AC-12.1 | Products cÃ³ fields riÃªng `name_vi`, `name_en`, `description_vi`, `description_en` | Schema inspection |
| AC-12.2 | Editor click "Generate Translation" button | Browser MCP journey |
| AC-12.3 | Translation preview hiá»ƒn thá»‹ source vÃ  target side-by-side | Browser MCP journey |
| AC-12.4 | Accept translation â†’ copy vÃ o target locale fields | Integration test |
| AC-12.5 | Publication validation block publish náº¿u thiáº¿u bilingual fields | Integration test |
| AC-12.6 | Error message hÆ°á»›ng dáº«n dÃ¹ng AI translation | Browser MCP journey |

---

## 11. Chi PhÃ­ Dá»± Kiáº¿n

### Token Usage Estimates

| Loáº¡i | Tokens | Cost (gpt-4o-mini @ $0.01/1K tokens) |
|---|---|---|
| Product description (vi) | ~800 | $0.008 |
| SEO metadata | ~400 | $0.004 |
| Translation (viâ†’en product) | ~600 | $0.006 |
| Blog outline | ~500 | $0.005 |

### Launch Content Estimate

Giáº£ sá»­ táº¡o ná»™i dung cho:
- 100 sáº£n pháº©m Ã— (description + translation) = 140,000 tokens
- 50 blog posts Ã— outline = 25,000 tokens
- 100 SEO metadata = 40,000 tokens
- **Total:** ~205,000 tokens = **$2.05**

**Monthly budget:** $100 â†’ Ä‘á»§ cho ~10,000 AI generations (ráº¥t dÆ° cho launch)

---

## 12. Rollout Plan

### Tuáº§n 1: Internal Testing
- Deploy lÃªn staging
- Chá»‰ Admin test
- Validate táº¥t cáº£ prompt types
- Check rate limiting + error handling
- Monitor token usage

### Tuáº§n 2: Editor Beta
- Enable cho Editor role
- Training 2-3 editors
- Thu tháº­p feedback UI/UX
- Äiá»u chá»‰nh rate limits náº¿u cáº§n

### Tuáº§n 3: Production Launch
- Deploy production
- Enable cho táº¥t cáº£ Editors + Admins
- Rate limit: 20/hour (conservative)
- Monitor daily trong tuáº§n Ä‘áº§u

### Tuáº§n 4+: Optimization
- PhÃ¢n tÃ­ch prompt types hay dÃ¹ng nháº¥t
- Optimize prompts Ä‘á»ƒ tiáº¿t kiá»‡m tokens
- Äiá»u chá»‰nh rate limits theo usage thá»±c táº¿
- Triá»ƒn khai Phase 2 features (batch, memory)

---

## 13. Rá»§i Ro vÃ  Giáº£i PhÃ¡p

| Rá»§i ro | Kháº£ nÄƒng | TÃ¡c Ä‘á»™ng | Giáº£i phÃ¡p |
|---|---|---|---|
| API Key bá»‹ leak | Tháº¥p | NghiÃªm trá»ng | Server-only, code review, rotate key náº¿u nghi ngá» |
| Chi phÃ­ vÆ°á»£t budget | Trung bÃ¬nh | Trung bÃ¬nh | Budget alerts, rate limiting, monitor daily |
| AI táº¡o ná»™i dung sai | Trung bÃ¬nh | Trung bÃ¬nh | Draft-only workflow, human review báº¯t buá»™c |
| Gá»­i dá»¯ liá»‡u khÃ¡ch hÃ ng Ä‘áº¿n OpenAI | Tháº¥p | NghiÃªm trá»ng | Input validation block PII, audit logs |
| OpenAI service outage | Trung bÃ¬nh | Tháº¥p | Graceful error handling, retry logic, manual fallback |
| Cháº¥t lÆ°á»£ng dá»‹ch kÃ©m | Trung bÃ¬nh | Trung bÃ¬nh | Side-by-side review, editor cÃ³ thá»ƒ edit, brand glossary |

---

## 14. Metrics Theo DÃµi

### Usage Metrics
- AI generations per day/week/month
- Breakdown by prompt type
- Accepted vs discarded ratio
- Average tokens per request

### Performance Metrics
- API response time (p50, p95, p99)
- Error rate (% failed requests)
- Timeout rate

### Cost Metrics
- Daily/monthly spending
- Cost per generation by type
- Spending by user/role

### Quality Metrics
- Draft acceptance rate
- Time tá»« generation Ä‘áº¿n acceptance
- Regeneration frequency (bao nhiÃªu % pháº£i generate láº¡i)

---

## 15. Äiá»u Kiá»‡n Báº¯t Äáº§u

TrÆ°á»›c khi implement, cáº§n hoÃ n thÃ nh:

- [ ] **S-00: Foundation Alignment** - Payload CMS Ä‘Ã£ setup, `src/` structure, env validation
- [ ] **S-01: CMS Access and Media** - Users collection, Admin/Editor roles, Media collection
- [ ] **S-05: Product Catalog CMS** - Products, ProductCategories collections vá»›i bilingual fields
- [ ] **OpenAI API key** Ä‘Ã£ cÃ³ vÃ  add vÃ o `.env.local`
- [ ] **Monthly budget** Ä‘Æ°á»£c approve ($100 default)
- [ ] **Security review** kiáº¿n trÃºc Ä‘Ã£ pass
- [ ] **Training plan** cho Admin/Editor Ä‘Ã£ chuáº©n bá»‹

---

## 16. Káº¿t Luáº­n

### Scope HoÃ n ThÃ nh

âœ… **Backend AI Integration:**
- OpenAI GPT-4o-mini cho content generation
- Server-side prompt builders (4 types)
- Draft-only workflow vá»›i human review
- Rate limiting + cost controls
- Security: API key protection, PII filtering, audit logs

âœ… **Translation Workflow:**
- Vi â†” En translation
- Side-by-side review UI
- Publication validation
- Brand glossary support

âœ… **Testing:**
- Unit, integration, Browser MCP journey checks; Playwright backup only for CI/headless deterministic regression
- Security tests

### Out of Scope (Phase 2)

âŒ Public AI chatbot
âŒ AI product recommendations
âŒ Batch translation
âŒ Translation memory
âŒ AI image alt text
âŒ Custom fine-tuned models

### Success Criteria

Implementation hoÃ n thÃ nh khi:
1. Táº¥t cáº£ acceptance criteria pass
2. Security check: NO API key in client bundle
3. Browser MCP journey checks cover full workflow; Playwright backup covers CI/headless deterministic gaps only
4. Editor training thÃ nh cÃ´ng
5. Production smoke test pass

---

**TÃ i liá»‡u Ä‘áº§y Ä‘á»§:** `docs/specs/ai-content-translation-spec.md`
**Tráº¡ng thÃ¡i:** âœ… Sáºµn sÃ ng triá»ƒn khai
**BÆ°á»›c tiáº¿p theo:** Báº¯t Ä‘áº§u implement sau khi S-05 hoÃ n thÃ nh
