import { createClient } from "@/lib/supabase/server";
import { getUserSettings } from "@/lib/userSettings";
import { PageHeader } from "@/components/PageHeader";
import { SettingsManager } from "@/components/settings/SettingsManager";
import type { TradingAccount } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();

  const [settings, { data: accounts }] = await Promise.all([
    getUserSettings(supabase),
    supabase.from("trading_accounts").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader title="Cài đặt" description="Tuỳ chỉnh trải nghiệm ghi lệnh và hiển thị theo ý bạn." />
      <SettingsManager settings={settings} accounts={(accounts as TradingAccount[]) ?? []} />
    </div>
  );
}
