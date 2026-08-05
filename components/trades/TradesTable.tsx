"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { Trade, Strategy } from "@/lib/types";
import { sessionFromTime, weekdayFromTime, formatCurrency } from "@/lib/analytics";
import { emotionMeta, WEEKDAYS } from "@/lib/constants";
import { quickAssignStrategy } from "@/app/(app)/trades/actions";

const SESSION_LABELS: Record<string, string> = { Asia: "Asia", London: "London", NY_AM: "NY AM", NY_PM: "NY PM" };

function StrategySelect({ trade, strategies }: { trade: Trade; strategies: Strategy[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={trade.strategy_id ?? ""}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value || null;
        startTransition(() => {
          quickAssignStrategy(trade.id, value);
        });
      }}
      className="text-xs py-1"
      onClick={(e) => e.stopPropagation()}
    >
      <option value="">N/A (Chưa chọn)</option>
      {strategies.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

export function TradesTable({ trades, strategies }: { trades: Trade[]; strategies: Strategy[] }) {
  if (trades.length === 0) {
    return <div className="card text-sm text-muted">Không có lệnh nào khớp bộ lọc hiện tại.</div>;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ngày & Thứ</th>
            <th>Phiên</th>
            <th>Tài khoản</th>
            <th>Cặp tiền</th>
            <th>Loại</th>
            <th>KL</th>
            <th>Giá mở</th>
            <th>Giá đóng</th>
            <th>Chiến lược</th>
            <th>Tâm lý</th>
            <th>R:R</th>
            <th className="text-right">P&L</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const emotion = emotionMeta(t.emotion);
            const weekdayLabel = WEEKDAYS.find((w) => w.value === weekdayFromTime(t.open_time))?.label;
            return (
              <tr key={t.id}>
                <td className="whitespace-nowrap text-xs">
                  <div>{weekdayLabel}</div>
                  <div className="text-muted">{new Date(t.open_time).toLocaleString("vi-VN")}</div>
                </td>
                <td className="text-xs">{SESSION_LABELS[t.session ?? sessionFromTime(t.open_time)]}</td>
                <td className="text-xs whitespace-nowrap">{t.trading_accounts?.name ?? "—"}</td>
                <td className="font-medium">{t.symbol}</td>
                <td>
                  <span className={t.side === "BUY" ? "text-profit" : "text-loss"}>{t.side}</span>
                </td>
                <td>{t.volume}</td>
                <td className="text-xs">{t.open_price}</td>
                <td className="text-xs">{t.close_price ?? "—"}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <StrategySelect trade={t} strategies={strategies} />
                </td>
                <td className="text-xs whitespace-nowrap">
                  {emotion ? `${emotion.icon} ${emotion.label}` : "—"}
                </td>
                <td className="text-xs">{t.rr_ratio ? `1:${t.rr_ratio}` : "—"}</td>
                <td className={`text-right font-semibold ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {formatCurrency(t.pnl)}
                </td>
                <td>
                  <Link href={`/trades/${t.id}`} className="text-primary text-xs whitespace-nowrap hover:underline">
                    Chi tiết →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
