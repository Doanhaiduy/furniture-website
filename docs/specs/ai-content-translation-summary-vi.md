# Tóm Tắt: Module AI Content Generation & Translation Workflow

**Ngày tạo:** 2026-06-06  
**Trạng thái:** Sẵn sàng triển khai  
**Tài liệu chi tiết:** `ai-content-translation-spec.md`

---

## 1. Mục Tiêu

Xây dựng hệ thống AI backend để:
- Tự động tạo mô tả sản phẩm, metadata SEO, outline blog
- Dịch nội dung Việt ↔ Anh
- Tích hợp vào Payload CMS với workflow review của con người
- Bảo mật: API key không bao giờ lộ ra browser, không gửi dữ liệu khách hàng đến OpenAI

---

## 2. Kiến Trúc Tổng Quan

```
CMS Admin UI (Payload)
  ↓ Click "Generate with AI" button
Server-Side AI Actions (Next.js API Routes)
  ↓ Build prompts + validate input
OpenAI API (GPT-4o-mini)
  ↓ Return AI-generated content
AIDrafts Collection (PostgreSQL)
  ↓ Save as draft, status = 'draft'
Human Review (Editor/Admin)
  ↓ Accept/Discard/Edit
Publication (Payload Hooks)
  ↓ Validate bilingual content complete
Public Website (Next.js Frontend)
```

**Nguyên tắc quan trọng:**
- ✅ AI chỉ tạo draft, không auto-publish
- ✅ Server-side only (API key bảo mật)
- ✅ Không bao giờ gửi thông tin khách hàng (email, phone, quote requests) đến OpenAI
- ✅ Rate limiting: 20 requests/giờ mỗi user
- ✅ Budget: $100/tháng mặc định

---

## 3. Các Tính Năng Chính

### 3.1 Tạo Nội Dung AI

**Prompt types:**
1. **Product Description** - Tạo mô tả sản phẩm từ thông tin cơ bản
2. **SEO Metadata** - Tạo title, description, OG tags
3. **Blog Outline** - Tạo outline bài viết
4. **Translation** - Dịch vi ↔ en
5. **Safety Review** - Kiểm tra nội dung không an toàn

**Input:**
- Product: name, category, material, dimensions, brand
- SEO: page type, title, content summary, keyword
- Translation: source content (vi/en)

**Output:**
- JSON structured data
- Saved to `AIDrafts` collection
- Status: `draft` | `accepted` | `discarded`

### 3.2 Translation Workflow

**Quy trình dịch:**
1. Editor nhập nội dung tiếng Việt đầy đủ
2. Click "Generate EN Translation"
3. AI tạo bản dịch draft
4. UI hiển thị side-by-side comparison (vi vs en)
5. Editor review và edit nếu cần
6. Click "Accept Translation" → copy sang field tiếng Anh
7. Khi publish, system validate cả 2 ngôn ngữ đã đầy đủ

**Publication Validation:**
- Required fields: `name_vi`, `name_en`, `description_vi`, `description_en`
- Nếu thiếu → block publish + hiển thị error message gợi ý dùng AI

---

## 4. Database Schema

### Collection: AIDrafts

```typescript
{
  targetType: 'product' | 'blog_post' | 'content_page' | 'seo' | 'translation',
  targetId: string,  // ID của entity liên quan (productId, blogPostId...)
  locale: 'vi' | 'en',
  promptType: 'product_description' | 'seo_metadata' | 'blog_outline' | 'translation',
  input: JSON,      // Input đã sanitized
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

## 5. Cấu Trúc Code

### Backend Files (Server-Side Only)

```
src/
├── lib/
│   ├── ai/
│   │   ├── client.ts                    # OpenAI client wrapper
│   │   ├── rate-limiter.ts              # Rate limiting logic
│   │   ├── validate-input.ts            # Sanitize input, block PII
│   │   ├── prompts/
│   │   │   ├── product-description.ts   # Product prompt builder
│   │   │   ├── seo-metadata.ts          # SEO prompt builder
│   │   │   ├── translation.ts           # Translation prompt builder
│   │   │   └── blog-outline.ts          # Blog prompt builder
│   │   └── actions/
│   │       ├── product-description.ts   # Full generation flow
│   │       ├── seo-metadata.ts
│   │       └── translate-content.ts
│   └── env/
│       └── server.ts                    # Environment validation
├── payload/
│   ├── collections/
│   │   ├── AIDrafts.ts                  # AI drafts collection
│   │   ├── Products.ts                  # + AI button integration
│   │   └── BlogPosts.ts                 # + AI button integration
│   ├── hooks/
│   │   └── validate-bilingual-publication.ts  # Block publish if incomplete
│   └── components/
│       ├── AIGenerateButton.tsx         # CMS UI: "Generate with AI" button
│       ├── AIDraftPreview.tsx           # Draft preview modal
│       └── TranslationPanel.tsx         # Side-by-side translation review
└── app/
    └── api/
        └── ai/
            └── generate/
                └── route.ts             # API endpoint /api/ai/generate
```

### Environment Variables

```bash
# .env.local (KHÔNG BAO GIỜ commit vào git)
OPENAI_API_KEY=sk-...
OPENAI_MODEL_DEFAULT=gpt-4o-mini
OPENAI_MAX_TOKENS_PER_REQUEST=4000
AI_RATE_LIMIT_PER_USER=20
AI_MONTHLY_BUDGET_USD=100
```

---

## 6. Security Checklist

| Rủi ro | Giải pháp |
|---|---|
| **API key lộ ra browser** | ✅ Server-side only, không import trong client components |
| **Dữ liệu khách hàng gửi đến OpenAI** | ✅ Input validation block các field: email, phone, quoteRequestId, customerId |
| **Prompt injection** | ✅ Sanitize input, structured JSON output |
| **Rate limit bypass** | ✅ Server-side rate limiter (Redis hoặc in-memory) |
| **Chi phí vượt mức** | ✅ Monthly budget alert, token cap per request |
| **AI tạo nội dung sai** | ✅ Draft-only workflow, human review required |

---

## 7. Testing Strategy

### Unit Tests
- ✅ AI prompt builders (product, SEO, translation)
- ✅ Rate limiter logic
- ✅ Input sanitization (block PII fields)
- ✅ Environment validation

### Integration Tests
- ✅ Full AI generation flow (call OpenAI → save draft → verify database)
- ✅ Translation workflow (vi→en)
- ✅ Rate limiting enforcement (21st request fails)
- ✅ Publication validation (block publish if bilingual incomplete)

### E2E Tests (Playwright)
- ✅ CMS: Click "Generate with AI" → preview draft → accept
- ✅ CMS: Translate vi→en → review side-by-side → accept
- ✅ CMS: Try publish without en content → see error message
- ✅ CMS: Full workflow từ generate → review → publish

### Security Tests
- ✅ Search `.next/static` build output → confirm NO API key
- ✅ Code review: No client-side import của `lib/ai/*`
- ✅ Input validation: Block request chứa "email", "phone", "customerId"

---

## 8. Implementation Tasks

**Tổng thời gian ước tính:** 51 giờ (~1.5 tuần cho 1 dev)

### Backend (31 giờ)
1. Environment config + validation (2h)
2. OpenAI client + rate limiter (4h)
3. Prompt builders (4 types) (6h)
4. AIDrafts collection (3h)
5. AI generation actions (8h)
6. API route /api/ai/generate (4h)
7. Publication validation hook (2h)
8. Audit logging integration (2h)

### CMS UI (14 giờ)
9. AIGenerateButton component (6h)
10. TranslationPanel component (4h)
11. Integrate buttons in Products (2h)
12. Integrate buttons in BlogPosts (2h)

### Documentation (6 giờ)
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

# 3. E2E tests
pnpm test:e2e tests/e2e/ai-workflow.spec.ts

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

| ID | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC-11.1 | Editor click "Generate with AI" cho product descriptions | E2E test |
| AC-11.2 | AI output lưu vào AIDrafts với `status: 'draft'` | Integration test |
| AC-11.3 | Modal preview hiển thị output với options Accept/Discard/Regenerate | E2E test |
| AC-11.4 | Accept draft → copy nội dung vào field target → mark `accepted` | Integration test |
| AC-11.5 | Discard draft → mark `discarded` mà không đổi field | Integration test |
| AC-11.6 | AI KHÔNG auto-publish (phải human review) | Unit test |
| AC-11.7 | API key không lộ ra browser | Code review |
| AC-11.8 | Rate limiting: 20 requests/giờ per user | Integration test |
| AC-11.9 | Audit logs ghi lại tất cả AI generations | Integration test |

### FR-12-ADM: Bilingual Content Management

| ID | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC-12.1 | Products có fields riêng `name_vi`, `name_en`, `description_vi`, `description_en` | Schema inspection |
| AC-12.2 | Editor click "Generate Translation" button | E2E test |
| AC-12.3 | Translation preview hiển thị source và target side-by-side | E2E test |
| AC-12.4 | Accept translation → copy vào target locale fields | Integration test |
| AC-12.5 | Publication validation block publish nếu thiếu bilingual fields | Integration test |
| AC-12.6 | Error message hướng dẫn dùng AI translation | E2E test |

---

## 11. Chi Phí Dự Kiến

### Token Usage Estimates

| Loại | Tokens | Cost (gpt-4o-mini @ $0.01/1K tokens) |
|---|---|---|
| Product description (vi) | ~800 | $0.008 |
| SEO metadata | ~400 | $0.004 |
| Translation (vi→en product) | ~600 | $0.006 |
| Blog outline | ~500 | $0.005 |

### Launch Content Estimate

Giả sử tạo nội dung cho:
- 100 sản phẩm × (description + translation) = 140,000 tokens
- 50 blog posts × outline = 25,000 tokens
- 100 SEO metadata = 40,000 tokens
- **Total:** ~205,000 tokens = **$2.05**

**Monthly budget:** $100 → đủ cho ~10,000 AI generations (rất dư cho launch)

---

## 12. Rollout Plan

### Tuần 1: Internal Testing
- Deploy lên staging
- Chỉ Admin test
- Validate tất cả prompt types
- Check rate limiting + error handling
- Monitor token usage

### Tuần 2: Editor Beta
- Enable cho Editor role
- Training 2-3 editors
- Thu thập feedback UI/UX
- Điều chỉnh rate limits nếu cần

### Tuần 3: Production Launch
- Deploy production
- Enable cho tất cả Editors + Admins
- Rate limit: 20/hour (conservative)
- Monitor daily trong tuần đầu

### Tuần 4+: Optimization
- Phân tích prompt types hay dùng nhất
- Optimize prompts để tiết kiệm tokens
- Điều chỉnh rate limits theo usage thực tế
- Triển khai Phase 2 features (batch, memory)

---

## 13. Rủi Ro và Giải Pháp

| Rủi ro | Khả năng | Tác động | Giải pháp |
|---|---|---|---|
| API Key bị leak | Thấp | Nghiêm trọng | Server-only, code review, rotate key nếu nghi ngờ |
| Chi phí vượt budget | Trung bình | Trung bình | Budget alerts, rate limiting, monitor daily |
| AI tạo nội dung sai | Trung bình | Trung bình | Draft-only workflow, human review bắt buộc |
| Gửi dữ liệu khách hàng đến OpenAI | Thấp | Nghiêm trọng | Input validation block PII, audit logs |
| OpenAI service outage | Trung bình | Thấp | Graceful error handling, retry logic, manual fallback |
| Chất lượng dịch kém | Trung bình | Trung bình | Side-by-side review, editor có thể edit, brand glossary |

---

## 14. Metrics Theo Dõi

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
- Time từ generation đến acceptance
- Regeneration frequency (bao nhiêu % phải generate lại)

---

## 15. Điều Kiện Bắt Đầu

Trước khi implement, cần hoàn thành:

- [ ] **S-00: Foundation Alignment** - Payload CMS đã setup, `src/` structure, env validation
- [ ] **S-01: CMS Access and Media** - Users collection, Admin/Editor roles, Media collection
- [ ] **S-05: Product Catalog CMS** - Products, ProductCategories collections với bilingual fields
- [ ] **OpenAI API key** đã có và add vào `.env.local`
- [ ] **Monthly budget** được approve ($100 default)
- [ ] **Security review** kiến trúc đã pass
- [ ] **Training plan** cho Admin/Editor đã chuẩn bị

---

## 16. Kết Luận

### Scope Hoàn Thành

✅ **Backend AI Integration:**
- OpenAI GPT-4o-mini cho content generation
- Server-side prompt builders (4 types)
- Draft-only workflow với human review
- Rate limiting + cost controls
- Security: API key protection, PII filtering, audit logs

✅ **Translation Workflow:**
- Vi ↔ En translation
- Side-by-side review UI
- Publication validation
- Brand glossary support

✅ **Testing:**
- Unit, integration, E2E tests
- Security tests

### Out of Scope (Phase 2)

❌ Public AI chatbot  
❌ AI product recommendations  
❌ Batch translation  
❌ Translation memory  
❌ AI image alt text  
❌ Custom fine-tuned models  

### Success Criteria

Implementation hoàn thành khi:
1. Tất cả acceptance criteria pass
2. Security check: NO API key in client bundle
3. E2E tests cover full workflow
4. Editor training thành công
5. Production smoke test pass

---

**Tài liệu đầy đủ:** `docs/specs/ai-content-translation-spec.md`  
**Trạng thái:** ✅ Sẵn sàng triển khai  
**Bước tiếp theo:** Bắt đầu implement sau khi S-05 hoàn thành
