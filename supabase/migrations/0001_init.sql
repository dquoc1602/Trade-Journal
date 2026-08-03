-- TradeJournal — schema khởi tạo
-- Chạy trong Supabase Dashboard -> SQL Editor -> New query -> dán toàn bộ file này -> Run

create extension if not exists "pgcrypto";

-- ==========================================================================
-- ENUM TYPES
-- ==========================================================================
do $$ begin
  create type account_type as enum ('personal', 'prop_firm');
exception when duplicate_object then null; end $$;

do $$ begin
  create type trade_side as enum ('BUY', 'SELL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type trade_status as enum ('OPEN', 'CLOSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type emotion_tag as enum ('Calm','Focused','Confident','Neutral','Anxious','Fear','FOMO','Greedy','Revenge');
exception when duplicate_object then null; end $$;

do $$ begin
  create type market_trend as enum ('Bullish','Bearish','Sideways');
exception when duplicate_object then null; end $$;

-- ==========================================================================
-- TABLES
-- ==========================================================================

create table if not exists trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  broker text,
  account_type account_type not null default 'personal',
  currency text not null default 'USD',
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists strategy_rules (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references strategies(id) on delete cascade,
  content text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references trading_accounts(id) on delete cascade,
  symbol text not null,
  side trade_side not null,
  volume numeric(14,4) not null,
  open_price numeric(18,6) not null,
  close_price numeric(18,6),
  open_time timestamptz not null,
  close_time timestamptz,
  commission numeric(14,2) not null default 0,
  swap numeric(14,2) not null default 0,
  gross_profit numeric(14,2) not null default 0,
  pnl numeric(14,2) generated always as (gross_profit + commission + swap) stored,
  status trade_status not null default 'CLOSED',
  strategy_id uuid references strategies(id) on delete set null,
  emotion emotion_tag,
  rr_ratio numeric(8,2),
  notes text,
  screenshot_url text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trades_user_idx on trades(user_id);
create index if not exists trades_account_idx on trades(account_id);
create index if not exists trades_strategy_idx on trades(strategy_id);
create index if not exists trades_close_time_idx on trades(close_time);

create table if not exists trade_rule_checks (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references trades(id) on delete cascade,
  rule_id uuid not null references strategy_rules(id) on delete cascade,
  checked boolean not null default false,
  unique(trade_id, rule_id)
);

create table if not exists daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_date date not null,
  mood emotion_tag,
  market_trend market_trend,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, note_date)
);

-- ==========================================================================
-- updated_at auto-touch trigger
-- ==========================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_trading_accounts_updated on trading_accounts;
create trigger trg_trading_accounts_updated before update on trading_accounts
  for each row execute function set_updated_at();

drop trigger if exists trg_strategies_updated on strategies;
create trigger trg_strategies_updated before update on strategies
  for each row execute function set_updated_at();

drop trigger if exists trg_trades_updated on trades;
create trigger trg_trades_updated before update on trades
  for each row execute function set_updated_at();

drop trigger if exists trg_daily_notes_updated on daily_notes;
create trigger trg_daily_notes_updated before update on daily_notes
  for each row execute function set_updated_at();

-- ==========================================================================
-- ROW LEVEL SECURITY — mỗi user chỉ thấy/sửa được dữ liệu của chính mình
-- ==========================================================================
alter table trading_accounts enable row level security;
alter table strategies enable row level security;
alter table strategy_rules enable row level security;
alter table trades enable row level security;
alter table trade_rule_checks enable row level security;
alter table daily_notes enable row level security;

drop policy if exists "own accounts" on trading_accounts;
create policy "own accounts" on trading_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own strategies" on strategies;
create policy "own strategies" on strategies for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own strategy rules" on strategy_rules;
create policy "own strategy rules" on strategy_rules for all
  using (exists (select 1 from strategies s where s.id = strategy_rules.strategy_id and s.user_id = auth.uid()))
  with check (exists (select 1 from strategies s where s.id = strategy_rules.strategy_id and s.user_id = auth.uid()));

drop policy if exists "own trades" on trades;
create policy "own trades" on trades for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own trade rule checks" on trade_rule_checks;
create policy "own trade rule checks" on trade_rule_checks for all
  using (exists (select 1 from trades t where t.id = trade_rule_checks.trade_id and t.user_id = auth.uid()))
  with check (exists (select 1 from trades t where t.id = trade_rule_checks.trade_id and t.user_id = auth.uid()));

drop policy if exists "own notes" on daily_notes;
create policy "own notes" on daily_notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
