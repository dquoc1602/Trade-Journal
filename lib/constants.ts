export const APP_NAME = "TradeJournal";

export const EMOTIONS = [
  { value: "Calm", label: "Bình tĩnh", icon: "🧘" },
  { value: "Focused", label: "Tập trung", icon: "🎯" },
  { value: "Confident", label: "Tự tin", icon: "✨" },
  { value: "Neutral", label: "Bình thường", icon: "⚖️" },
  { value: "Anxious", label: "Lo lắng", icon: "😰" },
  { value: "Fear", label: "Sợ hãi", icon: "😨" },
  { value: "FOMO", label: "FOMO", icon: "⚠️" },
  { value: "Greedy", label: "Tham lam", icon: "🤑" },
  { value: "Revenge", label: "Phục thù", icon: "🚨" },
] as const;

export type EmotionValue = (typeof EMOTIONS)[number]["value"];

export const MARKET_TRENDS = [
  { value: "Bullish", label: "Bullish (Tăng trưởng)" },
  { value: "Bearish", label: "Bearish (Suy thoái)" },
  { value: "Sideways", label: "Sideways (Đi ngang)" },
] as const;

export type MarketTrendValue = (typeof MARKET_TRENDS)[number]["value"];

export const ACCOUNT_TYPES = [
  { value: "personal", label: "Tài khoản Cá nhân", icon: "👤" },
  { value: "prop_firm", label: "Tài khoản Quỹ (Prop Firm)", icon: "🏢" },
] as const;

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number]["value"];

export const CURRENCIES = ["USD", "EUR", "VND"] as const;

export const TRADE_SIDES = ["BUY", "SELL"] as const;
export type TradeSide = (typeof TRADE_SIDES)[number];

export const TRADE_STATUSES = ["OPEN", "CLOSED"] as const;
export type TradeStatusValue = (typeof TRADE_STATUSES)[number];

export const SESSIONS = ["Asia", "London", "NY_AM", "NY_PM"] as const;
export type SessionValue = (typeof SESSIONS)[number];

export const WEEKDAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
] as const;

export function emotionMeta(value: string | null | undefined) {
  return EMOTIONS.find((e) => e.value === value) ?? null;
}
