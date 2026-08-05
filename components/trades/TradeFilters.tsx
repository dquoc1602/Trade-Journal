"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { TradingAccount, Strategy } from "@/lib/types";
import { SESSIONS, WEEKDAYS } from "@/lib/constants";
import { Spinner } from "@/components/Spinner";

const SESSION_LABELS: Record<string, string> = {
  Asia: "Asia",
  London: "London",
  NY_AM: "NY AM",
  NY_PM: "NY PM",
};

export function TradeFilters({ accounts, strategies }: { accounts: TradingAccount[]; strategies: Strategy[] }) {
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

  const val = (key: string) => searchParams.get(key) ?? "";

  return (
    <div className="card relative">
      {isPending && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-muted">
          <Spinner /> Đang lọc...
        </div>
      )}
      <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
        <div>
          <label>Tài khoản</label>
          <select value={val("accountId")} disabled={isPending} onChange={(e) => setParam("accountId", e.target.value)} className="w-full">
            <option value="">Tất cả tài khoản</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.is_disabled ? " (Đã Disabled)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Cặp tiền</label>
          <input
            defaultValue={val("symbol")}
            disabled={isPending}
            onBlur={(e) => setParam("symbol", e.target.value.trim().toUpperCase())}
            placeholder="Tất cả"
            className="w-full"
          />
        </div>
        <div>
          <label>Vị thế</label>
          <select value={val("side")} disabled={isPending} onChange={(e) => setParam("side", e.target.value)} className="w-full">
            <option value="">Tất cả</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div>
          <label>Phiên</label>
          <select value={val("session")} disabled={isPending} onChange={(e) => setParam("session", e.target.value)} className="w-full">
            <option value="">Tất cả phiên</option>
            {SESSIONS.map((s) => (
              <option key={s} value={s}>
                {SESSION_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Thứ</label>
          <select value={val("weekday")} disabled={isPending} onChange={(e) => setParam("weekday", e.target.value)} className="w-full">
            <option value="">Tất cả thứ</option>
            {WEEKDAYS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Chiến lược</label>
          <select value={val("strategyId")} disabled={isPending} onChange={(e) => setParam("strategyId", e.target.value)} className="w-full">
            <option value="">Tất cả chiến lược</option>
            <option value="none">Không chiến lược</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Trạng thái</label>
          <select value={val("status")} disabled={isPending} onChange={(e) => setParam("status", e.target.value)} className="w-full">
            <option value="">Tất cả trạng thái</option>
            <option value="OPEN">Đang chạy</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>
      </div>
    </div>
  );
}
