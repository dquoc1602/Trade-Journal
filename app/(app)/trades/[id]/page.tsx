import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { TradeDetail } from "@/components/trades/TradeDetail";
import type { Trade, TradingAccount, Strategy, StrategyRule } from "@/lib/types";

export default async function TradeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();

  const [{ data: trade }, { data: accounts }, { data: strategies }] = await Promise.all([
    supabase.from("trades").select("*, trading_accounts(id,name,account_type), strategies(id,name)").eq("id", id).single(),
    supabase.from("trading_accounts").select("*").order("created_at", { ascending: true }),
    supabase.from("strategies").select("*").order("name", { ascending: true }),
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

  return (
    <div>
      <PageHeader title={`Chi tiết lệnh ${trade.symbol}`} description={`Ticket ID: #${trade.id.slice(0, 8)}`} />
      <TradeDetail
        trade={trade as Trade}
        accounts={(accounts as TradingAccount[]) ?? []}
        strategies={(strategies as Strategy[]) ?? []}
        strategyRules={strategyRules}
        checkedMap={checkedMap}
      />
    </div>
  );
}
