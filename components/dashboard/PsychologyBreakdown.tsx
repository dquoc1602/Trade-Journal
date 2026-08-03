import type { PsychologyGroup } from "@/lib/analytics";
import { formatCurrency, formatPercent } from "@/lib/analytics";
import { emotionMeta } from "@/lib/constants";

export function PsychologyBreakdown({ groups }: { groups: PsychologyGroup[] }) {
  if (groups.length === 0) {
    return <div className="text-sm text-muted">Chưa có lệnh nào gắn tâm lý.</div>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {groups.map((g) => {
        const meta = emotionMeta(g.emotion);
        return (
          <div key={g.emotion} className="rounded-lg border border-border bg-surface2 p-4">
            <div className="text-sm font-medium text-slate-100">
              {meta?.icon} {meta?.label ?? g.emotion} <span className="text-muted font-normal">({g.count} lệnh)</span>
            </div>
            <div className={`text-lg font-bold mt-1 ${g.netPnl >= 0 ? "text-profit" : "text-loss"}`}>{formatCurrency(g.netPnl)}</div>
            <div className="text-xs text-muted mt-1">Win Rate: {formatPercent(g.winRate)}</div>
          </div>
        );
      })}
    </div>
  );
}
