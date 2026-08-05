import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { AccountsManager } from "@/components/accounts/AccountsManager";
import type { TradingAccount } from "@/lib/types";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("trading_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Tài khoản giao dịch"
        description="Quản lý các tài khoản Cá nhân / Prop Firm dùng để gắn lệnh vào. Kết nối auto-sync (MT5/TopstepX) sẽ bổ sung ở giai đoạn sau. Lưu ý: xóa tài khoản sẽ xóa toàn bộ lệnh thuộc tài khoản đó."
      />
      <AccountsManager accounts={(accounts as TradingAccount[]) ?? []} />
    </div>
  );
}
