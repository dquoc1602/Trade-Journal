import clsx from "clsx";

export function KpiCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "profit" | "loss" | "neutral";
}) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-muted font-medium">{label}</div>
      <div
        className={clsx(
          "text-2xl font-bold mt-2 break-words",
          tone === "profit" && "text-profit",
          tone === "loss" && "text-loss",
          tone === "neutral" && "text-slate-100"
        )}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
