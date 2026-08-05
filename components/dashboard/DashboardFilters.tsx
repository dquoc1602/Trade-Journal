"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { TradingAccount } from "@/lib/types";
import { Spinner } from "@/components/Spinner";

const RANGES = [
  { value: "", label: "Tất cả thời gian" },
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "month", label: "Tháng này" },
];

export function DashboardFilters({ accounts, defaultRange = "" }: { accounts: TradingAccount[]; defaultRange?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center flex-wrap gap-3">
      {isPending && (
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Spinner /> Đang tải...
        </span>
      )}
      <select
        value={searchParams.get("accountId") ?? ""}
        disabled={isPending}
        onChange={(e) => setParam("accountId", e.target.value)}
        className="w-full sm:w-56"
      >
        <option value="">🏦 Tất cả tài khoản</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.account_type === "prop_firm" ? "🏆" : "📈"} {a.name}
            {a.is_disabled ? " (Đã Disabled)" : ""}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("range") ?? defaultRange}
        disabled={isPending}
        onChange={(e) => setParam("range", e.target.value)}
        className="w-full sm:w-48"
      >
        {RANGES.map((r) => (
          <option key={r.value} value={r.value}>
            ⏱️ {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
