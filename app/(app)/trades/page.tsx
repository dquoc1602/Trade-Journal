import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { TradeFilters } from "@/components/trades/TradeFilters";
import { TradesTable } from "@/components/trades/TradesTable";
import { sessionFromTime, weekdayFromTime, summarizePerformance, formatCurrency, formatPercent } from "@/lib/analytics";
import type { Trade, TradingAccount, Strategy } from "@/lib/types";

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const params = searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("trades")
    .select("*, trading_accounts(id,name,account_type), strategies(id,name)")
    .order("open_time", { ascending: false });

  if (params.accountId) query = query.eq("account_id", params.accountId);
  if (params.symbol) query = query.eq("symbol", params.symbol);
  if (params.side) query = query.eq("side", params.side);
  if (params.status) query = query.eq("status", params.status);
  if (params.strategyId === "none") query = query.is("strategy_id", null);
  else if (params.strategyId) query = query.eq("strategy_id", params.strategyId);

  const [{ data: tradesRaw }, { data: accounts }, { data: strategies }] = await Promise.all([
    query,
    supabase.from("trading_accounts").select("*").order("created_at", { ascending: false }),
    supabase.from("strategies").select("*").order("name", { ascending: true }),
  ]);

  let trades = (tradesRaw as Trade[]) ?? [];

  if (params.session) {
    trades = trades.filter((t) => (t.session ?? sessionFromTime(t.open_time)) === params.session);
  }
  if (params.weekday !== undefined && params.weekday !== "") {
    trades = trades.filter((t) => weekdayFromTime(t.open_time) === Number(params.weekday));
  }

  const summary = summarizePerformance(trades);

  return (
    <div>
      <PageHeader
        title="Lịch sử Giao dịch"
        description="Quản lý, tìm kiếm và phân tích tỷ lệ thắng theo bộ lọc nâng cao."
        action={
          <div className="flex gap-2">
            <Link href="/trades/import" className="btn-secondary">
              📥 Nhập từ CSV
            </Link>
            <Link href="/trades/new" className="btn-primary">
              + Ghi lệnh thủ công
            </Link>
          </div>
        }
      />

      <div className="mb-6">
        <TradeFilters accounts={(accounts as TradingAccount[]) ?? []} strategies={(strategies as Strategy[]) ?? []} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <KpiCard label="Lệnh khớp bộ lọc" value={String(summary.count)} />
        <KpiCard label="Lợi nhuận ròng" value={formatCurrency(summary.netPnl)} tone={summary.netPnl >= 0 ? "profit" : "loss"} />
        <KpiCard label="Win Rate" value={formatPercent(summary.winRate)} />
        <KpiCard label="Thắng / Thua" value={`${summary.wins} / ${summary.losses}`} />
        <KpiCard
          label="Profit Factor"
          value={summary.profitFactor === null ? "—" : summary.profitFactor === Infinity ? "∞" : summary.profitFactor.toFixed(2)}
        />
      </div>

      <TradesTable trades={trades} strategies={(strategies as Strategy[]) ?? []} />
    </div>
  );
}
