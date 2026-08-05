"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Trade } from "@/lib/types";
import { formatCurrency, vnDateKey } from "@/lib/analytics";

const WEEKDAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Lịch tháng thu gọn, gắn liền 1 tài khoản — tự quản lý điều hướng tháng bằng state cục bộ (không đụng URL của trang chi tiết tài khoản). */
export function AccountCalendar({ trades }: { trades: Trade[] }) {
  const nowVn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const [year, setYear] = useState(nowVn.getUTCFullYear());
  const [month, setMonth] = useState(nowVn.getUTCMonth() + 1); // 1-12
  const [selected, setSelected] = useState<string | null>(null);

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
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
    setSelected(null);
  }
  function nextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
    setSelected(null);
  }

  const selectedTrades = selected ? tradesByDay.get(selected) ?? [] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button className="btn-secondary text-xs" onClick={prevMonth}>
          ← Trước
        </button>
        <div className="font-semibold text-slate-100 text-sm">
          Tháng {String(month).padStart(2, "0")} / {year}
        </div>
        <button className="btn-secondary text-xs" onClick={nextMonth}>
          Sau →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] text-muted mb-1">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayTrades = tradesByDay.get(key) ?? [];
          const dayPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
          const hasTrades = dayTrades.length > 0;
          const isSelected = key === selected;

          return (
            <button
              key={key}
              onClick={() => setSelected(isSelected ? null : key)}
              className={`min-h-[2.75rem] rounded border p-1 text-left text-[10px] transition-colors ${
                isSelected ? "border-primary" : "border-border"
              } ${hasTrades ? (dayPnl >= 0 ? "bg-profit/10 hover:bg-profit/20" : "bg-loss/10 hover:bg-loss/20") : "hover:bg-surface2"}`}
            >
              <div className="text-muted">{day}</div>
              {hasTrades && (
                <div className={`font-semibold leading-tight break-all ${dayPnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {formatCurrency(dayPnl)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs font-semibold text-slate-100 mb-2">Ngày {selected}</div>
          {selectedTrades.length === 0 ? (
            <p className="text-xs text-muted">Không có lệnh.</p>
          ) : (
            <ul className="space-y-1">
              {selectedTrades.map((t) => (
                <li key={t.id}>
                  <Link href={`/trades/${t.id}`} className="flex items-center justify-between text-xs hover:bg-surface2 rounded px-1.5 py-1 -mx-1.5">
                    <span>
                      {t.symbol} <span className={t.side === "BUY" ? "text-profit" : "text-loss"}>{t.side}</span>
                    </span>
                    <span className={t.pnl >= 0 ? "text-profit font-medium" : "text-loss font-medium"}>{formatCurrency(t.pnl)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
