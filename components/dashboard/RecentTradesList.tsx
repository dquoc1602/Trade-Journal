import Link from "next/link";
import type { Trade } from "@/lib/types";
import { formatCurrency } from "@/lib/analytics";
import { emotionMeta } from "@/lib/constants";

export function RecentTradesList({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return <div className="text-sm text-muted">Chưa có giao dịch nào. Bắt đầu bằng cách ghi lệnh thủ công.</div>;
  }

  return (
    <div className="divide-y divide-border">
      {trades.slice(0, 8).map((t) => {
        const emotion = emotionMeta(t.emotion);
        return (
          <Link
            key={t.id}
            href={`/trades/${t.id}`}
            className="flex items-center justify-between py-3 hover:bg-surface2/60 -mx-2 px-2 rounded-md transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-100">{t.symbol}</span>
                <span className={`text-xs font-semibold ${t.side === "BUY" ? "text-profit" : "text-loss"}`}>{t.side}</span>
                <span className="text-xs text-muted">{t.volume} lot</span>
              </div>
              <div className="text-xs text-muted mt-0.5 truncate">
                {t.strategies?.name ?? "Chưa gán chiến lược"} {emotion ? `· ${emotion.icon} ${emotion.label}` : ""}
              </div>
            </div>
            <div className={`font-semibold shrink-0 ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}>{formatCurrency(t.pnl)}</div>
          </Link>
        );
      })}
    </div>
  );
}
