import type { Trade } from "@/lib/types";
import type { EmotionValue, SessionValue } from "@/lib/constants";

/**
 * Toàn bộ tính toán ngày/giờ hiển thị (phiên, thứ, nhóm theo ngày lịch) trong app
 * đều cố định theo giờ Việt Nam (UTC+7, không tính DST) thay vì dựa vào timezone
 * của máy đang chạy code. Bắt buộc phải làm vậy vì hàm này chạy ở CẢ server
 * (Vercel mặc định chạy giờ UTC) lẫn client (trình duyệt của người dùng ở VN) —
 * nếu dùng Date.getHours()/getDay() "local" thông thường, kết quả sẽ khác nhau
 * tuỳ nơi code chạy, gây sai lệch phiên/thứ khi lên production.
 */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function toVnShiftedDate(isoTime: string): Date {
  return new Date(new Date(isoTime).getTime() + VN_OFFSET_MS);
}

/**
 * Phiên giao dịch suy ra từ giờ VN của open_time, không lưu trong DB.
 * Asia: 06:00-14:00 | London: 14:00-21:00 | NY AM: 21:00-24:00 | NY PM: 00:00-06:00
 */
export function sessionFromTime(isoTime: string): SessionValue {
  const vnHour = toVnShiftedDate(isoTime).getUTCHours();
  if (vnHour >= 6 && vnHour < 14) return "Asia";
  if (vnHour >= 14 && vnHour < 21) return "London";
  if (vnHour >= 21) return "NY_AM";
  return "NY_PM";
}

/** Thứ trong tuần theo giờ VN (0 = Chủ nhật ... 6 = Thứ 7), không phụ thuộc timezone máy chạy code. */
export function weekdayFromTime(isoTime: string): number {
  return toVnShiftedDate(isoTime).getUTCDay();
}

/** Mã ngày lịch YYYY-MM-DD theo giờ VN — dùng để nhóm lệnh theo ngày (Calendar) nhất quán server/client. */
export function vnDateKey(isoTime: string): string {
  const d = toVnShiftedDate(isoTime);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Trả về Date UTC tương ứng với 00:00 giờ VN của ngày `day` tháng `month` (1-12) năm `year`. */
export function vnMidnightUtc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - VN_OFFSET_MS);
}

export function isWin(trade: Trade): boolean {
  return trade.pnl > 0;
}

export function isClosed(trade: Trade): boolean {
  return trade.status === "CLOSED" && trade.close_price !== null;
}

export type PerformanceSummary = {
  count: number;
  netPnl: number;
  wins: number;
  losses: number;
  winRate: number; // 0-100
  profitFactor: number | null;
  avgPnlPerTrade: number;
};

export function summarizePerformance(trades: Trade[]): PerformanceSummary {
  const closed = trades.filter(isClosed);
  const wins = closed.filter(isWin);
  const losses = closed.filter((t) => t.pnl < 0);
  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const netPnl = closed.reduce((sum, t) => sum + t.pnl, 0);

  return {
    count: closed.length,
    netPnl,
    wins: wins.length,
    losses: losses.length,
    winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : wins.length > 0 ? Infinity : null,
    avgPnlPerTrade: closed.length ? netPnl / closed.length : 0,
  };
}

export type EquityPoint = { date: string; cumulative: number; pnl: number };

export function buildEquityCurve(trades: Trade[], startingBalance = 0): EquityPoint[] {
  const closed = trades
    .filter(isClosed)
    .filter((t) => t.close_time)
    .sort((a, b) => new Date(a.close_time!).getTime() - new Date(b.close_time!).getTime());

  let running = startingBalance;
  return closed.map((t) => {
    running += t.pnl;
    return { date: t.close_time!, cumulative: running, pnl: t.pnl };
  });
}

export function currentWinStreak(trades: Trade[]): { current: number; best: number } {
  const closed = trades
    .filter(isClosed)
    .filter((t) => t.close_time)
    .sort((a, b) => new Date(b.close_time!).getTime() - new Date(a.close_time!).getTime());

  let current = 0;
  for (const t of closed) {
    if (isWin(t)) current++;
    else break;
  }

  let best = 0;
  let running = 0;
  // duyệt theo thứ tự thời gian tăng dần để tính kỷ lục chuỗi thắng
  for (const t of [...closed].reverse()) {
    if (isWin(t)) {
      running++;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }

  return { current, best };
}

export type PsychologyGroup = {
  emotion: EmotionValue;
  count: number;
  netPnl: number;
  winRate: number;
};

export function groupByEmotion(trades: Trade[]): PsychologyGroup[] {
  const closed = trades.filter(isClosed).filter((t) => t.emotion);
  const map = new Map<EmotionValue, Trade[]>();

  for (const t of closed) {
    const key = t.emotion as EmotionValue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }

  return Array.from(map.entries())
    .map(([emotion, list]) => {
      const wins = list.filter(isWin).length;
      return {
        emotion,
        count: list.length,
        netPnl: list.reduce((s, t) => s + t.pnl, 0),
        winRate: list.length ? (wins / list.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

/**
 * % tuân thủ của 1 lệnh = số rule đã tick / tổng số rule của chiến lược đã gán.
 * Trả về null nếu lệnh không gán chiến lược hoặc chiến lược không có rule nào.
 */
export function complianceForTrade(checkedCount: number, totalRules: number): number | null {
  if (totalRules === 0) return null;
  return (checkedCount / totalRules) * 100;
}

/**
 * % kỷ luật trung bình toàn tài khoản = trung bình cộng compliance của các lệnh
 * CÓ gán chiến lược (lệnh không gán chiến lược không tính vào mẫu số).
 */
export function averageCompliance(complianceValues: (number | null)[]): number | null {
  const valid = complianceValues.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return valid.reduce((s, v) => s + v, 0) / valid.length;
}

export function currentDisciplineStreak(
  tradesNewestFirst: { closeTime: string | null; compliance: number | null }[]
): number {
  let streak = 0;
  for (const t of tradesNewestFirst) {
    if (t.compliance === 100) streak++;
    else if (t.compliance === null) continue; // bỏ qua lệnh không có checklist, không phá chuỗi
    else break;
  }
  return streak;
}

export function formatCurrency(value: number, currency = "USD"): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}
