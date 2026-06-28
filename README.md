# WalletBrain 🧠💳

**香港信用卡智能推薦助手** — 幫你喺消費時快速判斷用邊張信用卡最慳錢。

> Built with Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | 主頁儀表板，顯示摘要、到期警報、最近交易 |
| 💳 **Card Management** | 信用卡 CRUD + 類別回贈管理 + 每月上限追蹤 |
| 📝 **Transaction Tracking** | 手動輸入交易，追蹤每月消費金額 |
| 🎯 **Smart Recommendation** | 決定性推薦引擎，輸入金額/商戶/類別 → Top 3 最佳信用卡 |
| 🎉 **Promotions** | 優惠列表 + 篩選器 + 登記追蹤 |
| ⚙️ **Settings** | 基本設定頁面 |
| 🤖 **Hermes Agent** | 定時優惠更新 (Cron Webhook) |

## 🧠 推薦引擎

```
Score = Base Reward + Category Reward + Promotion Reward
        - Cap Penalty - Registration Penalty - Confidence Penalty
```

**100% 決定性計算，無需 LLM** — 即時、免費、可靠。

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)
- **Language**: UI 繁體中文, Code & Docs English

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/edwardwanwhc-code/walletbrain.git
cd walletbrain
npm install
```

### 2. Set Up Supabase

1. Create a [Supabase](https://supabase.com) project
2. Run the migration SQL in SQL Editor:

```bash
# Copy the entire contents of:
supabase/migrations/001_initial_schema.sql
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...    # For Hermes Agent
CRON_SECRET=your-random-secret              # For webhook auth
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📱 Mobile-First

Built for mobile use — open on your phone and add to home screen for a native app experience.

## 🔒 Security

- ❌ No bank API connections
- ❌ No bank credentials stored
- ✅ All transactions manually entered
- ✅ Recommendation engine runs entirely client-side / server-side logic
- ✅ Hermes Agent only updates promotion data — never touches user data

## 📂 Project Structure

```
walletbrain/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/cron/           # Hermes Agent webhook
│   │   ├── api/recommend/      # Recommendation API
│   │   ├── cards/              # Card management pages
│   │   ├── transactions/       # Transaction pages
│   │   ├── promotions/         # Promotions page
│   │   ├── recommend/          # Smart recommendation page
│   │   └── settings/           # Settings page
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Core logic
│   │   ├── recommendation.ts   # 🔥 Recommendation engine
│   │   ├── supabase.ts         # Supabase client
│   │   └── constants.ts        # App constants
│   ├── services/               # Data access layer
│   ├── types/                  # TypeScript type definitions
│   └── hooks/                  # Custom React hooks
├── supabase/
│   └── migrations/             # Database migration SQL
└── docs/                       # Specification documents
```

## 📄 License

MIT
