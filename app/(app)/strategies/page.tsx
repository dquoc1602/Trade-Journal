import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { StrategiesManager } from "@/components/strategies/StrategiesManager";
import { summarizePerformance, type PerformanceSummary } from "@/lib/analytics";
import type { Strategy, Trade } from "@/lib/types";

export default async function StrategiesPage() {
  const supabase = await createClient();

  const [{ data: strategies }, { data: trades }] = await Promise.all([
    supabase
      .from("strategies")
      .select("*, strategy_rules(*)")
      .order("created_at", { ascending: true }),
    supabase.from("trades").select("*").not("strategy_id", "is", null),
  ]);

  const performance: Record<string, PerformanceSummary> = {};
  for (const strategy of (strategies as Strategy[]) ?? []) {
    const strategyTrades = ((trades as Trade[]) ?? []).filter((t) => t.strategy_id === strategy.id);
    performance[strategy.id] = summarizePerformance(strategyTrades);
  }

  return (
    <div>
      <PageHeader
        title="Chiến lược & Kỷ luật"
        description="Định nghĩa setup giao dịch và checklist quy tắc bắt buộc tuân thủ. Checklist này sẽ xuất hiện lại ở trang chi tiết lệnh để chấm điểm kỷ luật."
      />
      <StrategiesManager strategies={(strategies as Strategy[]) ?? []} performance={performance} />
    </div>
  );
}
