"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { TradingAccount } from "@/lib/types";

const RANGES = [
  { value: "", label: "Tất cả thời gian" },
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "month", label: "Tháng này" },
];

export function DashboardFilters({ accounts }: { accounts: TradingAccount[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select value={searchParams.get("accountId") ?? ""} onChange={(e) => setParam("accountId", e.target.value)} className="w-56">
        <option value="">🏦 Tất cả tài khoản</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.account_type === "prop_firm" ? "🏆" : "📈"} {a.name}
          </option>
        ))}
      </select>
      <select value={searchParams.get("range") ?? ""} onChange={(e) => setParam("range", e.target.value)} className="w-48">
        {RANGES.map((r) => (
          <option key={r.value} value={r.value}>
            ⏱️ {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
