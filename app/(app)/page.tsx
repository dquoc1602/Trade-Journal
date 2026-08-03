import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { PsychologyBreakdown } from "@/components/dashboard/PsychologyBreakdown";
import { RecentTradesList } from "@/components/dashboard/RecentTradesList";
import {
  summarizePerformance,
  buildEquityCurve,
  currentWinStreak,
  groupByEmotion,
  complianceForTrade,
  averageCompliance,
  currentDisciplineStreak,
  formatCurrency,
  formatPercent,
} from "@/lib/analytics";
import type { Trade, TradingAccount } from "@/lib/types";

function rangeCutoff(range: string | undefined): Date | null {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (range === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

export default async function DashboardPage({
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

  const cutoff = rangeCutoff(params.range);
  if (cutoff) query = query.gte("open_time", cutoff.toISOString());

  const [{ data: tradesRaw }, { data: accounts }] = await Promise.all([
    query,
    supabase.from("trading_accounts").select("*").order("created_at", { ascending: true }),
  ]);

  const trades = (tradesRaw as Trade[]) ?? [];
  const accountList = (accounts as TradingAccount[]) ?? [];

  const summary = summarizePerformance(trades);
  const equityPoints = buildEquityCurve(trades);
  const streak = currentWinStreak(trades);
  const psychology = groupByEmotion(trades);

  // ---- Compliance % kỷ luật ----
  const strategyTrades = trades.filter((t) => t.strategy_id && t.close_time);
  let complianceAvg: number | null = null;
  let disciplineStreak = 0;

  if (strategyTrades.length > 0) {
    const strategyIds = Array.from(new Set(strategyTrades.map((t) => t.strategy_id!)));
    const tradeIds = strategyTrades.map((t) => t.id);

    const [{ data: rules }, { data: checks }] = await Promise.all([
      supabase.from("strategy_rules").select("id, strategy_id").in("strategy_id", strategyIds),
      supabase.from("trade_rule_checks").select("trade_id, checked").in("trade_id", tradeIds).eq("checked", true),
    ]);

    const rulesCountByStrategy = new Map<string, number>();
    for (const r of (rules as { strategy_id: string }[]) ?? []) {
      rulesCountByStrategy.set(r.strategy_id, (rulesCountByStrategy.get(r.strategy_id) ?? 0) + 1);
    }
    const checkedCountByTrade = new Map<string, number>();
    for (const c of (checks as { trade_id: string }[]) ?? []) {
      checkedCountByTrade.set(c.trade_id, (checkedCountByTrade.get(c.trade_id) ?? 0) + 1);
    }

    const complianceByTrade = strategyTrades.map((t) => ({
      closeTime: t.close_time,
      compliance: complianceForTrade(checkedCountByTrade.get(t.id) ?? 0, rulesCountByStrategy.get(t.strategy_id!) ?? 0),
    }));

    complianceAvg = averageCompliance(complianceByTrade.map((c) => c.compliance));
    disciplineStreak = currentDisciplineStreak(
      complianceByTrade.slice().sort((a, b) => new Date(b.closeTime!).getTime() - new Date(a.closeTime!).getTime())
    );
  }

  return (
    <div>
      <PageHeader
        title="Tổng quan Giao dịch"
        description="Chào mừng quay trở lại. Đây là phân tích tài khoản của bạn."
        action={<DashboardFilters accounts={accountList} />}
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card">
          <div className="text-xs uppercase text-muted">🔥 Chuỗi thắng hiện tại</div>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {streak.current} lệnh <span className="text-xs text-muted font-normal">(Kỷ lục: {streak.best})</span>
          </div>
        </div>
        <div className="card">
          <div className="text-xs uppercase text-muted">🛡️ Chuỗi kỷ luật 100%</div>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {disciplineStreak} lệnh{" "}
            <span className="text-xs text-muted font-normal">
              (Tuân thủ TB: {complianceAvg === null ? "—" : formatPercent(complianceAvg)})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Lợi nhuận ròng" value={formatCurrency(summary.netPnl)} sub={`TB/Lệnh: ${formatCurrency(summary.avgPnlPerTrade)}`} tone={summary.netPnl >= 0 ? "profit" : "loss"} />
        <KpiCard label="Tỷ lệ thắng" value={formatPercent(summary.winRate)} sub={`${summary.wins} Thắng / ${summary.losses} Thua`} />
        <KpiCard
          label="Hệ số lợi nhuận"
          value={summary.profitFactor === null ? "—" : summary.profitFactor === Infinity ? "∞" : summary.profitFactor.toFixed(2)}
          sub="Tổng thắng / Tổng thua"
        />
        <KpiCard label="Chỉ số kỷ luật" value={complianceAvg === null ? "—" : formatPercent(complianceAvg)} sub="Trung bình checklist" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-slate-100 mb-4">Biểu đồ tăng trưởng vốn (Equity Curve)</h3>
          <EquityChart points={equityPoints} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-100 mb-2">Giao dịch gần đây</h3>
          <RecentTradesList trades={trades} />
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold text-slate-100 mb-1">Phân tích Tâm lý</h3>
        <p className="text-xs text-muted mb-4">Hiệu suất lợi nhuận phân nhóm theo trạng thái tâm lý lúc vào lệnh.</p>
        <PsychologyBreakdown groups={psychology} />
      </div>
    </div>
  );
}
