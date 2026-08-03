-- TradeJournal — migration 0002
-- Chạy trong Supabase Dashboard -> SQL Editor -> New query -> dán toàn bộ file này -> Run

-- ==========================================================================
-- 1. Thông tin quỹ Prop Firm + loại tài sản cho trading_accounts
-- ==========================================================================
alter table trading_accounts add column if not exists broker text;
alter table trading_accounts add column if not exists account_stage text;
alter table trading_accounts add column if not exists asset_class text not null default 'forex_cfd';

do $$ begin
  alter table trading_accounts add constraint trading_accounts_asset_class_check
    check (asset_class in ('forex_cfd', 'futures'));
exception when duplicate_object then null; end $$;

-- ==========================================================================
-- 2. Bảo vệ tính toàn vẹn: 1 lệnh (trades) chỉ được gắn vào tài khoản
--    (trading_accounts) thuộc CHÍNH CHỦ user đó — chặn trường hợp chèn
--    account_id của người khác (RLS của bảng trades chỉ kiểm tra user_id
--    của chính lệnh, không tự kiểm tra account_id có cùng chủ hay không).
-- ==========================================================================
create or replace function check_trade_account_ownership()
returns trigger as $$
begin
  if not exists (
    select 1 from trading_accounts a
    where a.id = new.account_id and a.user_id = new.user_id
  ) then
    raise exception 'account_id không thuộc về user sở hữu lệnh này';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_check_trade_account_ownership on trades;
create trigger trg_check_trade_account_ownership
  before insert or update of account_id, user_id on trades
  for each row execute function check_trade_account_ownership();

-- ==========================================================================
-- 3. Tự động cập nhật Số dư tài khoản (trading_accounts.balance) theo
--    lời/lỗ (pnl) mỗi khi lệnh (trades) được thêm / sửa / xóa.
--    balance = số dư ban đầu người dùng nhập lúc tạo tài khoản
--             + tổng cộng dồn pnl của mọi lệnh gắn vào tài khoản đó.
-- ==========================================================================
create or replace function apply_trade_pnl_to_account()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update trading_accounts set balance = balance + new.pnl where id = new.account_id;
  elsif TG_OP = 'UPDATE' then
    if old.account_id = new.account_id then
      update trading_accounts set balance = balance - old.pnl + new.pnl where id = new.account_id;
    else
      update trading_accounts set balance = balance - old.pnl where id = old.account_id;
      update trading_accounts set balance = balance + new.pnl where id = new.account_id;
    end if;
  elsif TG_OP = 'DELETE' then
    update trading_accounts set balance = balance - old.pnl where id = old.account_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_apply_trade_pnl_insert on trades;
create trigger trg_apply_trade_pnl_insert
  after insert on trades
  for each row execute function apply_trade_pnl_to_account();

drop trigger if exists trg_apply_trade_pnl_update on trades;
create trigger trg_apply_trade_pnl_update
  after update of pnl, account_id, gross_profit, commission, swap on trades
  for each row execute function apply_trade_pnl_to_account();

drop trigger if exists trg_apply_trade_pnl_delete on trades;
create trigger trg_apply_trade_pnl_delete
  after delete on trades
  for each row execute function apply_trade_pnl_to_account();
