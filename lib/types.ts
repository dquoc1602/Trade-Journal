import type { AccountTypeValue, AssetClassValue, EmotionValue, MarketTrendValue, TradeSide, TradeStatusValue } from "@/lib/constants";

export type TradingAccount = {
  id: string;
  user_id: string;
  name: string;
  broker: string | null;
  account_type: AccountTypeValue;
  account_stage: string | null;
  asset_class: AssetClassValue;
  currency: string;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type StrategyRule = {
  id: string;
  strategy_id: string;
  content: string;
  position: number;
};

export type Strategy = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  strategy_rules?: StrategyRule[];
};

export type Trade = {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string;
  side: TradeSide;
  volume: number;
  open_price: number;
  close_price: number | null;
  open_time: string;
  close_time: string | null;
  commission: number;
  swap: number;
  gross_profit: number | null;
  pnl: number;
  status: TradeStatusValue;
  strategy_id: string | null;
  emotion: EmotionValue | null;
  rr_ratio: number | null;
  notes: string | null;
  screenshot_url: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  trading_accounts?: Pick<TradingAccount, "id" | "name" | "account_type">;
  strategies?: Pick<Strategy, "id" | "name">;
};

export type TradeRuleCheck = {
  id: string;
  trade_id: string;
  rule_id: string;
  checked: boolean;
};

export type DailyNote = {
  id: string;
  user_id: string;
  note_date: string;
  mood: EmotionValue | null;
  market_trend: MarketTrendValue | null;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export type TradeFilters = {
  accountId?: string;
  symbol?: string;
  side?: TradeSide;
  session?: string;
  weekday?: number;
  strategyId?: string;
  status?: TradeStatusValue;
};
