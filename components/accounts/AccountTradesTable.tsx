"use client";

import Link from "next/link";
import type { Trade } from "@/lib/types";
import { formatCurrency, formatDuration } from "@/lib/analytics";

export function AccountTradesTable({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return <div className="card text-sm text-muted">Không có lệnh nào trong khoảng thời gian đã chọn.</div>;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nhật ký</th>
            <th>ID</th>
            <th>Hợp đồng</th>
            <th>Size</th>
            <th>Hướng</th>
            <th>Giờ vào</th>
            <th>Giờ ra</th>
            <th>Thời lượng</th>
            <th>Giá vào</th>
            <th>Giá ra</th>
            <th className="text-right">P&L</th>
            <th className="text-right">Hoa hồng</th>
            <th className="text-right">Phí (Swap)</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td>
                <Link href={`/trades/${t.id}`} className="text-primary hover:underline" title="Xem chi tiết & nhật ký">
                  📝
                </Link>
              </td>
              <td className="text-xs text-muted whitespace-nowrap">#{t.id.slice(0, 8)}</td>
              <td className="font-medium whitespace-nowrap">{t.symbol}</td>
              <td>{t.volume}</td>
              <td>
                <span className={t.side === "BUY" ? "text-profit" : "text-loss"}>{t.side}</span>
              </td>
              <td className="text-xs whitespace-nowrap">{new Date(t.open_time).toLocaleString("vi-VN")}</td>
              <td className="text-xs whitespace-nowrap">{t.close_time ? new Date(t.close_time).toLocaleString("vi-VN") : "—"}</td>
              <td className="text-xs whitespace-nowrap">{formatDuration(t.open_time, t.close_time)}</td>
              <td className="text-xs">{t.open_price}</td>
              <td className="text-xs">{t.close_price ?? "—"}</td>
              <td className={`text-right font-semibold whitespace-nowrap ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                {formatCurrency(t.pnl)}
              </td>
              <td className="text-right text-xs whitespace-nowrap">{formatCurrency(t.commission)}</td>
              <td className="text-right text-xs whitespace-nowrap">{formatCurrency(t.swap)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
