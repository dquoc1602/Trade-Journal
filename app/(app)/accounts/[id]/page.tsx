import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { AccountRangeFilter } from "@/components/accounts/AccountRangeFilter";
import { AccountBalanceChart } from "@/components/accounts/AccountBalanceChart";
import { AccountCalendar } from "@/components/accounts/AccountCalendar";
import { AccountTradesTable } from "@/components/accounts/AccountTradesTable";
import {
  summarizePerformance,
  computeAccountStats,
  buildDailyBalanceSeries,
  formatCurrency,
  formatPercent,
  vnDateKey,
} from "@/lib/analytics";
import { ASSET_CLASSES } from "@/lib/constants";
import type { Trade, TradingAccount } from "@/lib/types";

function rangeCutoff(range: string | undefined): Date | null {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (range === "90d") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  if (range === "month") {
    const nowVn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return new Date(Date.UTC(nowVn.getUTCFullYear(), nowVn.getUTCMonth(), 1) - 7 * 60 * 60 * 1000);
  }
  return null;
}

export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | undefined>;
}) {
  const { id } = params;
  const supabase = await createClient();

  const { data: account } = await supabase.from("trading_accounts").select("*").eq("id", id).single();
  if (!account) notFound();

  const { data: tradesRaw } = await supabase
    .from("trades")
    .select("*, strategies(id,name)")
    .eq("account_id", id)
    .order("open_time", { ascending: false });

  const allTrades = (tradesRaw as Trade[]) ?? [];

  const cutoff = rangeCutoff(searchParams.range);
  const rangeTrades = cutoff ? allTrades.filter((t) => new Date(t.close_time ?? t.open_time) >= cutoff) : allTrades;

  const summary = summarizePerformance(rangeTrades);
  const stats = computeAccountStats(rangeTrades);

  // Chuỗi số dư dựng từ TOÀN BỘ lệnh (để mốc số dư luôn đúng lịch sử thật), sau đó mới cắt theo khoảng đang xem.
  const fullBalanceSeries = buildDailyBalanceSeries(allTrades, account.balance);
  const cutoffKey = cutoff ? vnDateKey(cutoff.toISOString()) : null;
  const balanceSeries = cutoffKey ? fullBalanceSeries.filter((p) => p.date >= cutoffKey) : fullBalanceSeries;

  const acc = account as TradingAccount;

  return (
    <div>
      <div className="mb-2">
        <Link href="/accounts" className="text-xs text-muted hover:text-slate-200">
          ← Quay lại danh sách tài khoản
        </Link>
      </div>
      <PageHeader
        title={
          <span className="flex items-center gap-2 flex-wrap">
            {acc.account_type === "prop_firm" ? "🏆" : "📈"} {acc.name}
            {acc.is_disabled && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-loss/15 text-loss align-middle">🔥 Disabled</span>
            )}
          </span>
        }
        description={`${acc.broker || "—"}${acc.account_stage ? ` · ${acc.account_stage}` : ""} · ${
          ASSET_CLASSES.find((a) => a.value === acc.asset_class)?.label ?? acc.asset_class
        } · Số dư hiện tại: ${acc.balance.toLocaleString("en-US", { style: "currency", currency: acc.currency })}`}
        action={<AccountRangeFilter />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Tổng P&L" value={formatCurrency(summary.netPnl)} tone={summary.netPnl >= 0 ? "profit" : "loss"} />
        <KpiCard label="Trade Win %" value={formatPercent(summary.winRate)} sub={`${summary.wins} Thắng / ${summary.losses} Thua`} />
        <KpiCard
          label="Avg Win / Avg Loss"
          value={`${formatCurrency(stats.avgWin)} / ${formatCurrency(stats.avgLoss)}`}
        />
        <KpiCard label="Day Win %" value={formatPercent(stats.dayWinRate)} sub="% số ngày lãi / tổng số ngày có lệnh" />
        <KpiCard
          label="Profit Factor"
          value={summary.profitFactor === null ? "—" : summary.profitFactor === Infinity ? "∞" : summary.profitFactor.toFixed(2)}
        />
        <KpiCard
          label="Best Day % of Total Profit"
          value={formatPercent(stats.bestDayPct)}
          sub={stats.bestDay ? `${stats.bestDay.date}: ${formatCurrency(stats.bestDay.pnl)}` : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-slate-100 mb-4">Số dư tài khoản theo ngày</h3>
          <AccountBalanceChart points={balanceSeries} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-100 mb-2">Lịch giao dịch tài khoản</h3>
          <AccountCalendar trades={allTrades} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-100 mb-3">
          Danh sách lệnh <span className="text-muted font-normal text-sm">({rangeTrades.length} lệnh)</span>
        </h3>
        <AccountTradesTable trades={rangeTrades} />
      </div>
    </div>
  );
}
