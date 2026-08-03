"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const open_time = String(formData.get("open_time") ?? "");
  const close_time = String(formData.get("close_time") ?? "");
  const gross_profit = numOrNull(formData.get("gross_profit")) ?? 0;
  const commission = numOrNull(formData.get("commission")) ?? 0;
  const swap = numOrNull(formData.get("swap")) ?? 0;
  const emotion = String(formData.get("emotion") ?? "") || null;
  const strategy_id = String(formData.get("strategy_id") ?? "") || null;
  const rr_ratio = numOrNull(formData.get("rr_ratio"));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const screenshot_url = String(formData.get("screenshot_url") ?? "").trim() || null;
  const status = close_price !== null && close_time ? "CLOSED" : "OPEN";

  return {
    account_id,
    symbol,
    side,
    volume,
    open_price,
    close_price,
    open_time: open_time ? new Date(open_time).toISOString() : null,
    close_time: close_time ? new Date(close_time).toISOString() : null,
    gross_profit,
    commission,
    swap,
    emotion,
    strategy_id,
    rr_ratio,
    notes,
    screenshot_url,
    status,
  };
}

export async function createTrade(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const input = parseTradeInput(formData);

  if (!input.account_id) return { error: "Vui lòng chọn tài khoản giao dịch." };
  if (!input.symbol) return { error: "Vui lòng nhập cặp tiền/tài sản." };
  if (input.volume === null || input.volume <= 0) return { error: "Khối lượng không hợp lệ." };
  if (input.open_price === null) return { error: "Vui lòng nhập giá mở lệnh." };
  if (!input.open_time) return { error: "Vui lòng nhập thời gian mở lệnh." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn." };

  const { data: trade, error } = await supabase
    .from("trades")
    .insert({ ...input, user_id: user.id, source: "manual" })
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

  if (!input.account_id) return { error: "Vui lòng chọn tài khoản giao dịch." };
  if (!input.symbol) return { error: "Vui lòng nhập cặp tiền/tài sản." };
  if (input.volume === null || input.volume <= 0) return { error: "Khối lượng không hợp lệ." };
  if (input.open_price === null) return { error: "Vui lòng nhập giá mở lệnh." };
  if (!input.open_time) return { error: "Vui lòng nhập thời gian mở lệnh." };

  const supabase = await createClient();
  const { error } = await supabase.from("trades").update(input).eq("id", id);
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
