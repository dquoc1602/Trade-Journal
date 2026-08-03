import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { TradeForm } from "@/components/trades/TradeForm";
import type { TradingAccount, Strategy } from "@/lib/types";

export default async function NewTradePage() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: strategies }] = await Promise.all([
    supabase.from("trading_accounts").select("*").order("created_at", { ascending: true }),
    supabase.from("strategies").select("*").order("name", { ascending: true }),
  ]);

  const accountList = (accounts as TradingAccount[]) ?? [];

  return (
    <div>
      <PageHeader title="Thêm giao dịch mới" description="Ghi chép giao dịch thủ công vào nhật ký." />

      {accountList.length === 0 ? (
        <div className="card text-sm text-muted">
          Bạn cần tạo ít nhất 1 tài khoản giao dịch trước.{" "}
          <Link href="/accounts" className="text-primary hover:underline">
            Tạo tài khoản ngay →
          </Link>
        </div>
      ) : (
        <TradeForm accounts={accountList} strategies={(strategies as Strategy[]) ?? []} />
      )}
    </div>
  );
}
