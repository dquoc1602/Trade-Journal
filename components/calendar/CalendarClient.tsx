"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Trade, TradingAccount } from "@/lib/types";
import { formatCurrency, vnDateKey } from "@/lib/analytics";
import { Spinner } from "@/components/Spinner";

const WEEKDAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const SATURDAY_COL = 5; // index trong hàng 7 cột T2..CN

export function CalendarClient({
  year,
  month, // 1-12
  trades,
  accounts,
  noteDates,
  showAccountLabels = true,
  journalReminderEnabled = true,
}: {
  year: number;
  month: number;
  trades: Trade[];
  accounts: TradingAccount[];
  noteDates: string[];
  showAccountLabels?: boolean;
  journalReminderEnabled?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const noteDateSet = useMemo(() => new Set(noteDates), [noteDates]);

  const tradesByDay = useMemo(() => {
    const map = new Map<string, Trade[]>();
    for (const t of trades) {
      if (!t.close_time) continue;
      const key = vnDateKey(t.close_time);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [trades]);

  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  // getDay(): 0=CN..6=T7 -> chuyển về thứ tự T2..CN
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const [selected, setSelected] = useState<string>(() => {
    const todayKey = vnDateKey(new Date().toISOString());
    if (tradesByDay.has(todayKey)) return todayKey;
    const keys = Array.from(tradesByDay.keys()).sort();
    return keys[keys.length - 1] ?? todayKey;
  });

  const monthPnl = Array.from(tradesByDay.values())
    .flat()
    .reduce((sum, t) => sum + t.pnl, 0);
  const greenDays = Array.from(tradesByDay.values()).filter((list) => list.reduce((s, t) => s + t.pnl, 0) > 0).length;
  const redDays = Array.from(tradesByDay.values()).filter((list) => list.reduce((s, t) => s + t.pnl, 0) < 0).length;

  function navigate(newYear: number, newMonth: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(newYear));
    params.set("month", String(newMonth));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function setAccount(accountId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (accountId) params.set("accountId", accountId);
    else params.delete("accountId");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function prevMonth() {
    if (month === 1) navigate(year - 1, 12);
    else navigate(year, month - 1);
  }
  function nextMonth() {
    if (month === 12) navigate(year + 1, 1);
    else navigate(year, month + 1);
  }

  const cells: (number | null)[] = [...Array(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const weekRows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weekRows.push(cells.slice(i, i + 7));

  const selectedTrades = tradesByDay.get(selected) ?? [];
  const selectedPnl = selectedTrades.reduce((s, t) => s + t.pnl, 0);
  const selectedHasNote = noteDateSet.has(selected);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-xs" disabled={isPending} onClick={prevMonth}>
              ← Tháng trước
            </button>
            <div className="font-semibold text-slate-100 w-32 text-center flex items-center justify-center gap-2">
              {isPending && <Spinner />}
              Tháng {String(month).padStart(2, "0")} / {year}
            </div>
            <button className="btn-secondary text-xs" disabled={isPending} onClick={nextMonth}>
              Tháng sau →
            </button>
          </div>
          <select
            value={searchParams.get("accountId") ?? ""}
            disabled={isPending}
            onChange={(e) => setAccount(e.target.value)}
            className="w-56"
          >
            <option value="">👤 Tất cả tài khoản</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_type === "prop_firm" ? "🏆" : "📈"} {a.name}
                {a.is_disabled ? " (Đã Disabled)" : ""}
              </option>
            ))}
          </select>
          <div className="text-sm flex gap-4">
            <span>
              Ngày xanh: <span className="text-profit font-semibold">{greenDays}</span>
            </span>
            <span>
              Ngày đỏ: <span className="text-loss font-semibold">{redDays}</span>
            </span>
            <span>
              Tháng P&L:{" "}
              <span className={monthPnl >= 0 ? "text-profit font-semibold" : "text-loss font-semibold"}>{formatCurrency(monthPnl)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-xs text-muted mb-2">
          {WEEKDAY_HEADERS.map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        <div className={`space-y-2 transition-opacity ${isPending ? "opacity-60" : ""}`}>
          {weekRows.map((row, rowIdx) => {
            const weekPnl = row
              .flatMap((day) => (day === null ? [] : tradesByDay.get(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`) ?? []))
              .reduce((s, t) => s + t.pnl, 0);
            const weekTradeCount = row
              .flatMap((day) => (day === null ? [] : tradesByDay.get(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`) ?? []))
              .length;
            const weekHasAnyDay = row.some((d) => d !== null);

            return (
              <div key={rowIdx} className="grid grid-cols-7 gap-2">
                {row.map((day, colIdx) => {
                  if (day === null) return <div key={colIdx} />;

                  const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayTrades = tradesByDay.get(key) ?? [];
                  const dayPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
                  const hasTrades = dayTrades.length > 0;
                  const isSelected = key === selected;
                  const needsJournal = journalReminderEnabled && hasTrades && !noteDateSet.has(key);

                  if (colIdx === SATURDAY_COL && weekHasAnyDay) {
                    return (
                      <button
                        key={key}
                        onClick={() => setSelected(key)}
                        className={`min-h-[4.5rem] sm:min-h-20 rounded-md border p-1.5 text-left text-[11px] sm:text-xs transition-colors flex flex-col justify-between ${
                          isSelected ? "border-primary" : "border-border"
                        } bg-surface2/60 hover:bg-surface2`}
                      >
                        <div className="text-muted font-medium">Tuần {rowIdx + 1}</div>
                        <div>
                          <div className={`font-semibold break-words ${weekPnl >= 0 ? "text-profit" : "text-loss"}`}>
                            {weekTradeCount > 0 ? formatCurrency(weekPnl) : "—"}
                          </div>
                          <div className="text-muted text-[10px] mt-0.5">{weekTradeCount} lệnh</div>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(key)}
                      className={`relative min-h-[4.5rem] sm:min-h-20 rounded-md border p-1.5 text-left text-[11px] sm:text-xs transition-colors ${
                        isSelected ? "border-primary" : "border-border"
                      } ${hasTrades ? (dayPnl >= 0 ? "bg-profit/10 hover:bg-profit/20" : "bg-loss/10 hover:bg-loss/20") : "hover:bg-surface2"}`}
                    >
                      {needsJournal && (
                        <span
                          title="Chưa viết nhật ký cho ngày này"
                          className="absolute top-1 right-1 text-[10px] leading-none"
                        >
                          📝
                        </span>
                      )}
                      <div className="text-muted">{day}</div>
                      {hasTrades && (
                        <div className="mt-1">
                          <div className={`font-semibold break-words ${dayPnl >= 0 ? "text-profit" : "text-loss"}`}>{formatCurrency(dayPnl)}</div>
                          <div className="text-muted text-[10px]">{dayTrades.length} lệnh</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card h-fit">
        <h3 className="font-semibold text-slate-100 mb-1">Chi tiết ngày {selected}</h3>
        <div className={`text-lg font-bold mb-3 ${selectedPnl >= 0 ? "text-profit" : "text-loss"}`}>{formatCurrency(selectedPnl)}</div>

        {selectedTrades.length === 0 ? (
          <p className="text-sm text-muted">Không có giao dịch nào trong ngày này.</p>
        ) : (
          <ul className="space-y-2">
            {selectedTrades.map((t) => (
              <li key={t.id}>
                <Link href={`/trades/${t.id}`} className="flex items-center justify-between text-sm hover:bg-surface2 rounded-md px-2 py-1.5 -mx-2">
                  <span>
                    {t.symbol} <span className={t.side === "BUY" ? "text-profit" : "text-loss"}>{t.side}</span>{" "}
                    <span className="text-muted">{t.volume} lot</span>
                    {showAccountLabels && (
                      <span className="text-muted text-xs block">{t.trading_accounts?.name ?? "—"}</span>
                    )}
                  </span>
                  <span className={t.pnl >= 0 ? "text-profit font-medium" : "text-loss font-medium"}>{formatCurrency(t.pnl)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {selectedTrades.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            {selectedHasNote ? (
              <Link href={`/notes?date=${selected}`} className="text-xs text-primary hover:underline">
                📝 Xem / thêm nhật ký cho ngày này →
              </Link>
            ) : journalReminderEnabled ? (
              <div className="text-xs bg-amber-400/10 border border-amber-400/30 rounded-md px-3 py-2">
                <span className="text-amber-400">⚠️ Chưa có nhật ký cho ngày này.</span>{" "}
                <Link href={`/notes?date=${selected}`} className="text-primary hover:underline font-medium">
                  Viết ngay →
                </Link>
              </div>
            ) : (
              <Link href={`/notes?date=${selected}`} className="text-xs text-primary hover:underline">
                📝 Viết nhật ký cho ngày này →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
