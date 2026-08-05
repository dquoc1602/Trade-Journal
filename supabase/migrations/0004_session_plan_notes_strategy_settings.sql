-- Phase 6: override phiên giao dịch, checkbox theo plan, chiến lược cho nhật ký, settings cá nhân

-- Phiên giao dịch: mặc định vẫn tự suy ra từ open_time (sessionFromTime ở lib/analytics.ts),
-- cột này CHỈ lưu khi người dùng chủ động sửa tay để ghi đè giá trị tự động.
alter table trades add column if not exists session text
  check (session is null or session in ('Asia', 'London', 'NY_AM', 'NY_PM'));

-- Xác nhận có tuân thủ đúng kế hoạch giao dịch hay không — độc lập với checklist chiến lược.
alter table trades add column if not exists followed_plan boolean not null default false;

-- Cho phép gắn 1 nhật ký ngày với 1 chiến lược cụ thể (VD hôm nay tập trung đánh theo chiến lược X).
alter table daily_notes add column if not exists strategy_id uuid references strategies(id) on delete set null;

-- Cài đặt cá nhân, mỗi user 1 dòng.
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorite_symbols text[] not null default '{}',
  default_account_id uuid references trading_accounts(id) on delete set null,
  time_format text not null default '24h' check (time_format in ('12h', '24h')),
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  journal_reminder_enabled boolean not null default true,
  dashboard_default_range text not null default '' check (dashboard_default_range in ('', '7d', '30d', 'month')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_settings_updated on user_settings;
create trigger trg_user_settings_updated before update on user_settings
  for each row execute function set_updated_at();

alter table user_settings enable row level security;

drop policy if exists "own settings" on user_settings;
create policy "own settings" on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
