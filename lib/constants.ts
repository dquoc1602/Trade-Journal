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

export const ASSET_CLASSES = [
  { value: "forex_cfd", label: "Forex / CFD" },
  { value: "futures", label: "Futures" },
] as const;

export type AssetClassValue = (typeof ASSET_CLASSES)[number]["value"];

/**
 * Danh sách quỹ Prop Firm phổ biến kèm loại tài sản họ giao dịch và các giai
 * đoạn tài khoản thực tế của từng quỹ (đã tra cứu thông tin công khai — có thể
 * đổi theo thời gian nếu quỹ thay đổi cấu trúc chương trình, người dùng luôn
 * có thể chọn "Khác" và tự nhập nếu preset chưa cập nhật kịp).
 */
export const PROP_FIRMS = [
  {
    id: "ftmo",
    name: "FTMO",
    assetClass: "forex_cfd" as AssetClassValue,
    stages: ["Challenge (2-Step) - Phase 1", "Challenge (2-Step) - Phase 2 (Verification)", "Challenge (1-Step)", "FTMO Funded Account"],
  },
  {
    id: "the5ers",
    name: "The5ers",
    assetClass: "forex_cfd" as AssetClassValue,
    stages: ["Evaluation", "Funded"],
  },
  {
    id: "topstepx",
    name: "TopstepX (Topstep)",
    assetClass: "futures" as AssetClassValue,
    stages: ["Trading Combine (Evaluation)", "Express Funded Account", "Live Funded Account"],
  },
  {
    id: "bulenox",
    name: "Bulenox",
    assetClass: "futures" as AssetClassValue,
    stages: ["Qualification (Evaluation)", "Master Account", "Funded Account"],
  },
  {
    id: "lucid",
    name: "Lucid Trading",
    assetClass: "futures" as AssetClassValue,
    stages: ["LucidFlex - Evaluation", "LucidFlex - Funded", "LucidPro - Evaluation", "LucidPro - Funded", "LucidDirect - Instant Funded"],
  },
  {
    id: "other",
    name: "",
    assetClass: "forex_cfd" as AssetClassValue,
    stages: [] as string[],
  },
] as const;

export type PropFirmId = (typeof PROP_FIRMS)[number]["id"];

export function propFirmById(id: string | null | undefined) {
  return PROP_FIRMS.find((f) => f.id === id) ?? null;
}

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
