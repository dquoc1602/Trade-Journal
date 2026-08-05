import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings } from "@/lib/userSettings";
import { PageHeader } from "@/components/PageHeader";
import { TradeDetail } from "@/components/trades/TradeDetail";
import { LinkedDailyNote } from "@/components/trades/LinkedDailyNote";
import { vnDateKey, vnMidnightUtc } from "@/lib/analytics";
import type { Trade, TradingAccount, Strategy, StrategyRule, DailyNote } from "@/lib/types";

export default async function TradeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();

  const [{ data: trade }, { data: accounts }, { data: strategies }, settings] = await Promise.all([
    supabase.from("trades").select("*, trading_accounts(id,name,account_type), strategies(id,name)").eq("id", id).single(),
    supabase.from("trading_accounts").select("*").order("created_at", { ascending: false }),
    supabase.from("strategies").select("*").order("name", { ascending: true }),
    getUserSettings(supabase),
  ]);

  if (!trade) notFound();

  let strategyRules: StrategyRule[] = [];
  let checkedMap: Record<string, boolean> = {};

  if (trade.strategy_id) {
    const [{ data: rules }, { data: checks }] = await Promise.all([
      supabase.from("strategy_rules").select("*").eq("strategy_id", trade.strategy_id),
      supabase.from("trade_rule_checks").select("*").eq("trade_id", id),
    ]);
    strategyRules = (rules as StrategyRule[]) ?? [];
    checkedMap = Object.fromEntries(((checks as { rule_id: string; checked: boolean }[]) ?? []).map((c) => [c.rule_id, c.checked]));
  }

  // Nhật ký ngày liên kết theo ngày ĐÓNG lệnh (nếu đang chạy thì theo ngày MỞ lệnh), tính theo giờ VN.
  // 1 ngày có thể có nhiều nhật ký nên lấy về danh sách, sắp theo thời điểm lưu.
  const noteDate = vnDateKey(trade.close_time ?? trade.open_time);
  const [y, m, d] = noteDate.split("-").map(Number);
  const dayStart = vnMidnightUtc(y, m, d);
  const dayEnd = vnMidnightUtc(y, m, d + 1);

  const [{ data: linkedNotes }, { data: sameDayTradesRaw }] = await Promise.all([
    supabase.from("daily_notes").select("*").eq("note_date", noteDate).order("created_at", { ascending: true }),
    supabase
      .from("trades")
      .select("*, trading_accounts(id,name,account_type)")
      .not("close_time", "is", null)
      .gte("close_time", dayStart.toISOString())
      .lt("close_time", dayEnd.toISOString())
      .neq("id", id)
      .order("close_time", { ascending: true }),
  ]);

  return (
    <div>
      <PageHeader title={`Chi tiết lệnh ${trade.symbol}`} description={`Ticket ID: #${trade.id.slice(0, 8)}`} />
      <div className="space-y-6">
        <TradeDetail
          trade={trade as Trade}
          accounts={(accounts as TradingAccount[]) ?? []}
          strategies={(strategies as Strategy[]) ?? []}
          strategyRules={strategyRules}
          checkedMap={checkedMap}
          favoriteSymbols={settings.favorite_symbols}
          sameDayTrades={(sameDayTradesRaw as Trade[]) ?? []}
        />
        <LinkedDailyNote date={noteDate} notes={(linkedNotes as DailyNote[]) ?? []} strategies={(strategies as Strategy[]) ?? []} />
      </div>
    </div>
  );
}
