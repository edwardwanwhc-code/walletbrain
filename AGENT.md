# WalletBrain — Agent Handoff Document

> **Give this file to any developer/agent to continue building WalletBrain.**
> Last updated: 2026-06-28

---

## 1. What Is WalletBrain?

A **Hong Kong credit card recommendation assistant** for personal/family use.  
Enter a purchase (amount, merchant, category) → get the top 3 cards ranked by expected reward.

Key URL: **https://edwardwanwhc-code.github.io/walletbrain/**

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Hosting | GitHub Pages (static export) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |
| Automation | WorkBuddy daily check (not part of this repo) |

**Runtime**: Node.js 22 (managed)  
**Package manager**: npm

---

## 3. Project Structure

```
walletbrain/
├── AGENT.md                          ← THIS FILE — handoff guide
├── next.config.ts                    # output: "export", basePath: "/walletbrain"
├── package.json                      # Next 16.2.9, React 19, Supabase JS
├── .env.example                      # Template for env vars
├── .github/workflows/deploy.yml      # Auto-build + deploy to GitHub Pages on push to main
├── supabase/migrations/
│   └── 001_initial_schema.sql        # All 6 tables schema + indexes
├── scripts/
│   └── seed-promotions.js            # Seeds 19 real HK promotions (uses service_role key)
└── src/
    ├── app/
    │   ├── layout.tsx                # Root layout, nav, dark mode
    │   ├── page.tsx                  # Dashboard (home)
    │   ├── cards/
    │   │   ├── page.tsx              # Card list (CRUD)
    │   │   ├── new/page.tsx          # Add card form (bank→card auto-fill from cardData.ts)
    │   │   └── detail/page.tsx       # Card detail (query-param ?id=, NOT dynamic route)
    │   ├── transactions/
    │   │   ├── page.tsx              # Transaction list
    │   │   └── new/page.tsx          # Add transaction
    │   ├── recommend/
    │   │   └── page.tsx              # Recommendation UI (calls recommend() directly, no API route)
    │   ├── promotions/
    │   │   └── page.tsx              # Promotions list + filter
    │   └── settings/
    │       └── page.tsx              # Settings page
    ├── components/
    │   ├── layout/BottomNav.tsx      # Bottom tab bar (6 tabs, mobile-first)
    │   └── ui/
    │       ├── CategoryBadge.tsx     # Category tag with emoji
    │       ├── EmptyState.tsx        # Empty state placeholder
    │       └── LoadingSpinner.tsx    # Loading indicator
    ├── services/
    │   ├── cards.ts                  # Card CRUD + getActiveCards()
    │   ├── transactions.ts           # Transaction CRUD + getMonthlySpending()
    │   └── promotions.ts             # Promotion queries + registrations
    ├── lib/
    │   ├── cardData.ts               # 22 REAL HK credit cards (template database, pre-fill form)
    │   ├── constants.ts              # Category labels, icons, bank list, reward type labels
    │   ├── recommendation.ts         # DETERMINISTIC scoring engine (no LLM!)
    │   └── supabase.ts               # Supabase client (anon key, client-side)
    └── types/
        └── database.ts              # All TypeScript types matching Supabase schema
```

---

## 4. Supabase

**Project URL**: `https://foknmqtemkfperlccpdz.supabase.co`  
**Anon key** (in `.env`): used for all client-side operations  
**Service role key** (in `.env` + seed script): used only for seeding/admin operations

### 4.1 Tables (6 tables)

```sql
cards (
  id uuid PK, owner_name, bank, card_name, network,
  reward_type (cashback/miles/points), reward_currency,
  base_reward_rate numeric,          -- percentage! 4 = 4%
  monthly_cap_amount numeric,        -- HKD, null = no cap
  cap_reset_day int, official_url, notes,
  is_active boolean, created_at, updated_at
)

card_category_rewards (
  id uuid PK, card_id FK→cards(cascade),
  category, reward_rate numeric,     -- percentage! 4 = 4%
  cap_amount numeric, notes
)

transactions (
  id uuid PK, card_id FK→cards(set null),
  transaction_date, amount_hkd, merchant, location,
  category, notes, created_at, updated_at
)
-- NEVER DELETE transactions (project rule)

promotions (
  id uuid PK, title, bank, applicable_cards text[],
  merchant, mall, category, reward_description,
  reward_rate numeric,                -- percentage! 4 = 4%
  minimum_spend, maximum_reward,
  registration_required boolean, registration_url,
  terms_summary, start_date, end_date,
  source_url, confidence_score numeric,
  status (active/expired/upcoming),
  needs_review boolean, last_checked_at,
  created_at, updated_at
)

promotion_registrations (
  id uuid PK, promotion_id FK→promotions(cascade),
  registered boolean, registered_at, notes
)

agent_logs (
  id uuid PK, task_type, status, summary,
  checked_count, added_count, updated_count,
  expired_count, needs_review_count, created_at
)
```

### 4.2 RLS Policies

**CRITICAL**: WalletBrain uses the anon key directly (no user auth). All 6 tables need permissive RLS policies:

```sql
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on cards" ON cards;
CREATE POLICY "Allow all on cards" ON cards FOR ALL USING (true) WITH CHECK (true);
-- Repeat for all 6 tables: card_category_rewards, transactions, promotions, promotion_registrations, agent_logs
```

If `INSERT` fails with "violates row-level security", run these policies in Supabase SQL Editor.

---

## 5. CRITICAL: Reward Rate Convention

**⚠️ THIS IS THE #1 SOURCE OF BUGS. READ CAREFULLY.**

All reward rates are stored as **percentages** (not decimals):
- `cardData.ts`: `baseRewardRate: 4` → means **4%**
- `card_category_rewards.reward_rate: 5` → means **5%**
- `promotions.reward_rate: 15` → means **15%**

**In `recommendation.ts`, EVERY calculation MUST divide by 100:**

```typescript
// ✅ CORRECT
const baseReward = amount_hkd * Number(card.base_reward_rate) / 100;
const categoryReward = amount_hkd * effectiveRate / 100;
const promoReward = amount * Number(promo.reward_rate) / 100;

// ❌ WRONG — this creates the 250% bug
const baseReward = amount_hkd * Number(card.base_reward_rate);
```

**In display code, do NOT multiply by 100** — rates are already in percentage form:
```typescript
// ✅ CORRECT — rate is already 4% form
<div>{Number(card.base_reward_rate).toFixed(1)}%</div>

// ❌ WRONG — would show 400%
<div>{(Number(card.base_reward_rate) * 100).toFixed(1)}%</div>
```

---

## 6. Static Export Rules

The project uses `output: "export"` for GitHub Pages. Key implications:

1. **No API routes** (`/api/*`) — they don't work with static export
2. **No dynamic routes** (`[id]`) — use query parameters instead:
   - ❌ `/cards/[id]` → ✅ `/cards/detail?id=xxx`
3. **`basePath: "/walletbrain"`** — all asset paths must use Next.js `<Link>` / `<Image>` (they auto-prefix)
4. **Image optimization disabled** (`images.unoptimized: true`)
5. **No server-side data fetching** — all Supabase calls are client-side via `useEffect` + `useState`

---

## 7. Recommendation Engine (`src/lib/recommendation.ts`)

**Deterministic** — zero LLM calls, pure logic.

### Scoring formula:
```
expected_reward = base_reward + promotion_reward
  (uses higher of base_reward_rate vs category_reward_rate)

penalties = cap_penalty + registration_penalty + confidence_penalty
  cap_penalty: subtract reward exceeding monthly cap
  registration_penalty: -50% of promo reward if registration needed but not done
  confidence_penalty: -20% if confidence_score < 0.7

final_score = expected_reward - penalties
```

### Key files to update:
| When... | Update... |
|---|---|
| Adding new card templates | `src/lib/cardData.ts` |
| Changing category labels | `src/lib/constants.ts` |
| Changing scoring logic | `src/lib/recommendation.ts` |
| Seeding promotions | `scripts/seed-promotions.js` |
| Adding new DB columns | `types/database.ts` + migration |

---

## 8. Deployment

### Trigger: push to `main` branch
GitHub Actions auto-deploys to GitHub Pages.

### Required GitHub Secrets:
| Secret | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://foknmqtemkfperlccpdz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from Supabase → Settings → API → anon key) |

### Local development:
```bash
cd walletbrain
npm install
# create .env with NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev    # runs at localhost:3000/walletbrain
npm run build  # verify static export works
```

---

## 9. WorkBuddy Automation

A WorkBuddy automation (ID: `1782656593212`) runs daily at 1:00 AM HKT:
- Checks promotions for expiry
- Marks `needs_review: true` for promotions with past end dates
- Logs results to `agent_logs` table
- **Does NOT modify user data** (cards, transactions, promotion_registrations)

This is managed by WorkBuddy itself, not via files in the repo.

---

## 10. Card Pre-fill System (`src/lib/cardData.ts`)

22 real HK credit cards across 8 banks. Data verified against official bank pages (2026 Q2).

The add-card form (`src/app/cards/new/page.tsx`) uses this data for **bank → card → auto-fill**:

1. User selects bank (dropdown from `BANK_LIST`)
2. User selects card name (filtered from `CARD_DATABASE`)
3. Form auto-fills: `rewardType`, `baseRewardRate`, `monthlyCapAmount`, `categoryRewards[]`, `network`, `notes`
4. User can switch to "manual entry" mode to override

**To add new cards**: add entries to the `CARD_DATABASE` array in `src/lib/cardData.ts`. The format is:
```typescript
{
  bank: "Bank Name",              // Must match BANK_LIST
  cardName: "Card Display Name",
  network: "Visa",                // Visa/Mastercard/Amex/UnionPay/JCB
  rewardType: "cashback",         // cashback/miles/points
  rewardCurrency: "HKD",          // HKD/Asia Miles/points — null if miles/points
  baseRewardRate: 4,              // percentage: 4 = 4%
  monthlyCapAmount: 10000,        // HKD or null
  categoryRewards: [
    { category: "dining", rewardRate: 8, capAmount: null, notes: "..." },
  ],
  notes: "Card description",
}
```

---

## 11. Key Design Rules (Do NOT Violate)

1. **No bank API connections** — no Plaid, no bank login
2. **No stored credentials** — no passwords, no tokens beyond Supabase keys
3. **Transactions are manual** (v1) — user types them in
4. **NEVER delete transactions** — soft-delete at most
5. **Recommendation is deterministic** — no LLM in the scoring path
6. **Mobile-first** — all UI designed for phone screens, bottom tab nav
7. **UI language**: Traditional Chinese (繁體中文)
8. **Code/docs language**: English
9. **No emojis in code unless user explicitly asks**

---

## 12. Common Tasks & How-To

### Add a new credit card template
→ Edit `src/lib/cardData.ts`, add to `CARD_DATABASE` array, push to `main`.

### Add/update promotions
→ Option A: Run `node scripts/seed-promotions.js` (uses service_role key, inserts via REST API)  
→ Option B: Insert directly in Supabase dashboard  
→ WorkBuddy automation will also handle daily updates

### Fix recommendation scoring
→ Edit `src/lib/recommendation.ts` → `npm run build` → push → auto-deploy

### Add a new page
→ Create page under `src/app/`, add to `BottomNav.tsx`, ensure it works with static export (no `[params]`, no `fetch` at build time)

### Debug Supabase connection issues
→ Check `.env` has correct keys  
→ Check RLS policies (Section 4.2)  
→ Check browser console for CORS errors  
→ Supabase dashboard → Table Editor to verify data exists

---

## 13. GitHub

- **Repo**: `https://github.com/edwardwanwhc-code/walletbrain`
- **GitHub Pages**: `https://edwardwanwhc-code.github.io/walletbrain/`
- **Actions**: `https://github.com/edwardwanwhc-code/walletbrain/actions`
- **Branch**: `main` (only branch)
- **Push → auto-deploy** by GitHub Actions

---

## 14. Supabase Admin

- **Dashboard**: `https://foknmqtemkfperlccpdz.supabase.co`
- **Project password**: `9DMDFewyEirQglEh`
- **SQL Editor**: for RLS policies, manual queries, data inspection

---

## 15. Known Gotchas

| Problem | Cause | Fix |
|---|---|---|
| INSERT fails "row-level security" | RLS blocks anon key | Run permissive RLS policies (Section 4.2) |
| Reward shows 250% / absurd amounts | Missing `/100` in calculation | See Section 5 — add `/100` everywhere |
| Pages 404 on GitHub Pages | Missing `basePath: "/walletbrain"` | Check `next.config.ts` |
| Dynamic route `[id]` doesn't work | Static export limitation | Use query params: `/page?id=xxx` |
| Build fails with env vars | `.env` not in CI | Set GitHub Secrets (Section 8) |
| `gh` CLI not authenticated | Never configured | Use `git push` to trigger deploy or set `GH_TOKEN` |
