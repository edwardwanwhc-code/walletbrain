create extension if not exists "uuid-ossp";

create table if not exists cards (
  id uuid primary key default uuid_generate_v4(),
  owner_name text,
  bank text not null,
  card_name text not null,
  network text,
  reward_type text not null,
  reward_currency text,
  base_reward_rate numeric default 0,
  monthly_cap_amount numeric,
  cap_reset_day integer default 1,
  official_url text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists card_category_rewards (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid references cards(id) on delete cascade,
  category text not null,
  reward_rate numeric not null,
  cap_amount numeric,
  notes text
);

create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid references cards(id) on delete set null,
  transaction_date date not null,
  amount_hkd numeric not null,
  merchant text,
  location text,
  category text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists promotions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  bank text,
  applicable_cards text[],
  merchant text,
  mall text,
  category text,
  reward_description text,
  reward_rate numeric,
  minimum_spend numeric,
  maximum_reward numeric,
  registration_required boolean default false,
  registration_url text,
  terms_summary text,
  start_date date,
  end_date date,
  source_url text not null,
  confidence_score numeric default 0.5,
  status text default 'active',
  needs_review boolean default false,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists promotion_registrations (
  id uuid primary key default uuid_generate_v4(),
  promotion_id uuid references promotions(id) on delete cascade,
  registered boolean default false,
  registered_at timestamptz,
  notes text
);

create table if not exists agent_logs (
  id uuid primary key default uuid_generate_v4(),
  task_type text not null,
  status text not null,
  summary text,
  checked_count integer default 0,
  added_count integer default 0,
  updated_count integer default 0,
  expired_count integer default 0,
  needs_review_count integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_transactions_card_date on transactions(card_id, transaction_date);
create index if not exists idx_promotions_status_end_date on promotions(status, end_date);
create index if not exists idx_promotions_bank on promotions(bank);
create index if not exists idx_promotions_category on promotions(category);
