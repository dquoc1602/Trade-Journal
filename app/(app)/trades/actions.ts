"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SESSIONS } from "@/lib/constants";

export type ActionState = { error: string | null };

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function parseTradeInput(formData: FormData) {
  const account_id = String(formData.get("account_id") ?? "");
  const symbol = String(formData.get("symbol") ?? "").trim().toUpperCase();
  const side = String(formData.get("side") ?? "BUY");
  const volume = numOrNull(formData.get("volume"));
  const open_price = numOrNull(formData.get("open_price"));
  const close_price = numOrNull(formData.get("close_price"));
  // open_time/close_time đến đây đã là chuỗi ISO UTC (được quy đổi từ giờ địa phương ngay ở
  // trình duyệt, xem components/trades/TradeForm.tsx) — không parse lại bằng new Date() ở server
  // vì server (Vercel) chạy giờ UTC, khác giờ VN của người dùng.
  const open_time = String(formData.get("open_time") ?? "");
  const close_time = String(formData.get("close_time") ?? "") || null;
  const gross_profit = numOrNull(formData.get("gross_profit")) ?? 0;
  const commission = numOrNull(formData.get("commission")) ?? 0;
  const swap = numOrNull(formData.get("swap")) ?? 0;
  const emotion = String(formData.get("emotion") ?? "") || null;
  const strategy_id = String(formData.get("strategy_id") ?? "") || null;
  const rr_ratio = numOrNull(formData.get("rr_ratio"));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const screenshot_url = String(formData.get("screenshot_url") ?? "").trim() || null;
  const session = String(formData.get("session") ?? "").trim() || null;

  return {
    account_id,
    symbol,
    side,
    volume,
    open_price,
    close_price,
    open_time,
    close_time,
    gross_profit,
    commission,
    swap,
    emotion,
    strategy_id,
    rr_ratio,
    notes,
    screenshot_url,
    session,
  };
}

function validateTradeInput(input: ReturnType<typeof parseTradeInput>): string | null {
  if (!input.account_id) return "Vui lòng chọn tài khoản giao dịch.";
  if (!input.symbol) return "Vui lòng nhập cặp tiền/tài sản.";
  if (input.symbol.length > 20) return "Mã cặp tiền/tài sản tối đa 20 ký tự.";
  if (input.notes && input.notes.length > 5000) return "Ghi chú tối đa 5000 ký tự.";
  if (input.screenshot_url && input.screenshot_url.length > 2000) return "Link ảnh quá dài.";
  if (input.volume === null || input.volume <= 0) return "Khối lượng không hợp lệ (phải lớn hơn 0).";
  if (input.open_price === null || input.open_price < 0) return "Vui lòng nhập giá mở lệnh hợp lệ.";
  if (!input.open_time) return "Vui lòng nhập thời gian mở lệnh.";
  if (Number.isNaN(new Date(input.open_time).getTime())) return "Thời gian mở lệnh không hợp lệ.";

  const hasClosePrice = input.close_price !== null;
  const hasCloseTime = Boolean(input.close_time);
  if (hasClosePrice !== hasCloseTime) {
    return "Cần điền đầy đủ cả Giá đóng và Thời gian đóng lệnh — hoặc để trống cả hai nếu lệnh đang chạy.";
  }
  if (hasClosePrice && input.close_price! < 0) return "Giá đóng lệnh không hợp lệ.";
  if (hasCloseTime) {
    const openMs = new Date(input.open_time).getTime();
    const closeMs = new Date(input.close_time!).getTime();
    if (Number.isNaN(closeMs)) return "Thời gian đóng lệnh không hợp lệ.";
    if (closeMs < openMs) return "Thời gian đóng lệnh phải sau thời gian mở lệnh.";
  }
  if (input.rr_ratio !== null && input.rr_ratio < 0) return "Tỷ lệ R:R không hợp lệ.";
  if (input.session && !(SESSIONS as readonly string[]).includes(input.session)) return "Phiên giao dịch không hợp lệ.";

  return null;
}

export async function createTrade(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const input = parseTradeInput(formData);
  const validationError = validateTradeInput(input);
  if (validationError) return { error: validationError };

  const status = input.close_price !== null && input.close_time ? "CLOSED" : "OPEN";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn." };

  const { data: trade, error } = await supabase
    .from("trades")
    .insert({ ...input, status, user_id: user.id, source: "manual" })
    .select("id")
    .single();

  if (error || !trade) return { error: error?.message ?? "Không tạo được lệnh." };

  revalidatePath("/trades");
  revalidatePath("/");
  revalidatePath("/calendar");
  redirect(`/trades/${trade.id}`);
}

export async function updateTrade(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Thiếu ID lệnh." };

  const input = parseTradeInput(formData);
  const validationError = validateTradeInput(input);
  if (validationError) return { error: validationError };

  const status = input.close_price !== null && input.close_time ? "CLOSED" : "OPEN";

  const supabase = await createClient();
  const { error } = await supabase.from("trades").update({ ...input, status }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/trades");
  revalidatePath(`/trades/${id}`);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { error: null };
}

export async function deleteTrade(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("trades").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/trades");
  revalidatePath("/");
  revalidatePath("/calendar");
  return { error: null };
}

export async function quickAssignStrategy(tradeId: string, strategyId: string | null): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trades")
    .update({ strategy_id: strategyId })
    .eq("id", tradeId);
  if (error) return { error: error.message };

  // Reset checklist cũ vì strategy đổi (rule set khác)
  await supabase.from("trade_rule_checks").delete().eq("trade_id", tradeId);

  revalidatePath("/trades");
  revalidatePath(`/trades/${tradeId}`);
  revalidatePath("/");
  return { error: null };
}

export type BulkImportRow = {
  symbol: string;
  side: string;
  volume: number;
  open_price: number;
  close_price: number | null;
  open_time: string; // ISO UTC — đã quy đổi từ giờ địa phương ngay ở trình duyệt trước khi gửi lên
  close_time: string | null; // ISO UTC
  gross_profit: number;
  commission: number;
  swap: number;
  emotion: string | null;
  rr_ratio: number | null;
  notes: string | null;
};

export type BulkImportResult = { error: string | null; insertedCount: number };

export async function bulkImportTrades(
  accountId: string,
  strategyId: string | null,
  rows: BulkImportRow[]
): Promise<BulkImportResult> {
  if (!accountId) return { error: "Vui lòng chọn tài khoản giao dịch.", insertedCount: 0 };
  if (!Array.isArray(rows) || rows.length === 0) return { error: "Không có lệnh nào để nhập.", insertedCount: 0 };
  if (rows.length > 500) return { error: "Tối đa 500 lệnh mỗi lần nhập, vui lòng chia nhỏ file.", insertedCount: 0 };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn.", insertedCount: 0 };

  // Re-kiểm tra tối thiểu ở server, phòng trường hợp dữ liệu gửi lên không qua validate phía client.
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.symbol || !["BUY", "SELL"].includes(r.side) || !(r.volume > 0) || !(r.open_price >= 0) || !r.open_time) {
      return { error: `Dòng ${i + 1}: dữ liệu không hợp lệ, vui lòng kiểm tra lại.`, insertedCount: 0 };
    }
    if (Number.isNaN(new Date(r.open_time).getTime())) {
      return { error: `Dòng ${i + 1}: open_time không hợp lệ.`, insertedCount: 0 };
    }
    const hasClosePrice = r.close_price !== null;
    const hasCloseTime = Boolean(r.close_time);
    if (hasClosePrice !== hasCloseTime) {
      return { error: `Dòng ${i + 1}: cần điền đủ cả close_price và close_time, hoặc để trống cả hai.`, insertedCount: 0 };
    }
  }

  const payload = rows.map((r) => ({
    user_id: user.id,
    account_id: accountId,
    strategy_id: strategyId,
    symbol: r.symbol,
    side: r.side,
    volume: r.volume,
    open_price: r.open_price,
    close_price: r.close_price,
    open_time: r.open_time,
    close_time: r.close_time,
    gross_profit: r.gross_profit,
    commission: r.commission,
    swap: r.swap,
    emotion: r.emotion,
    rr_ratio: r.rr_ratio,
    notes: r.notes,
    status: r.close_price !== null && r.close_time ? "CLOSED" : "OPEN",
    source: "csv_import",
  }));

  const { error } = await supabase.from("trades").insert(payload);
  if (error) return { error: error.message, insertedCount: 0 };

  revalidatePath("/trades");
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/accounts");

  return { error: null, insertedCount: rows.length };
}

export async function toggleFollowedPlan(tradeId: string, followed: boolean): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("trades").update({ followed_plan: followed }).eq("id", tradeId);
  if (error) return { error: error.message };

  revalidatePath(`/trades/${tradeId}`);
  revalidatePath("/trades");
  return { error: null };
}

export async function toggleRuleCheck(tradeId: string, ruleId: string, checked: boolean): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trade_rule_checks")
    .upsert({ trade_id: tradeId, rule_id: ruleId, checked }, { onConflict: "trade_id,rule_id" });
  if (error) return { error: error.message };

  revalidatePath(`/trades/${tradeId}`);
  revalidatePath("/trades");
  revalidatePath("/");
  return { error: null };
}
