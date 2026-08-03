import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { CalendarClient } from "@/components/calendar/CalendarClient";
import { vnMidnightUtc } from "@/lib/analytics";
import type { Trade, TradingAccount } from "@/lib/types";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const params = searchParams;
  // "Hôm nay" phải tính theo giờ VN chứ không phải giờ server (Vercel chạy UTC),
  // nếu không tháng mặc định hiển thị có thể sai lệch gần ranh giới nửa đêm.
  const nowVn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const year = params.year ? Number(params.year) : nowVn.getUTCFullYear();
  const month = params.month ? Number(params.month) : nowVn.getUTCMonth() + 1; // 1-12

  const monthStart = vnMidnightUtc(year, month, 1);
  const monthEnd = month === 12 ? vnMidnightUtc(year + 1, 1, 1) : vnMidnightUtc(year, month + 1, 1);

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
      <CalendarClient
        key={`${year}-${month}`}
        year={year}
        month={month}
        trades={(trades as Trade[]) ?? []}
        accounts={(accounts as TradingAccount[]) ?? []}
      />
    </div>
  );
}
