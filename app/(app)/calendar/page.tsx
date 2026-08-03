import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { CalendarClient } from "@/components/calendar/CalendarClient";
import type { Trade, TradingAccount } from "@/lib/types";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const params = searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1; // 1-12

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const supabase = await createClient();

  let query = supabase
    .from("trades")
    .select("*, trading_accounts(id,name,account_type)")
    .not("close_time", "is", null)
    .gte("close_time", monthStart.toISOString())
    .lt("close_time", monthEnd.toISOString());

  if (params.accountId) query = query.eq("account_id", params.accountId);

  const [{ data: trades }, { data: accounts }] = await Promise.all([
    query,
    supabase.from("trading_accounts").select("*").order("created_at", { ascending: true }),
  ]);

  return (
    <div>
      <PageHeader
        title="Lịch Giao Dịch"
        description="Theo dõi chuỗi ngày Thắng (xanh) / Thua (đỏ) để phát hiện pattern theo thời gian."
      />
      <CalendarClient year={year} month={month} trades={(trades as Trade[]) ?? []} accounts={(accounts as TradingAccount[]) ?? []} />
    </div>
  );
}
