"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

function parseRules(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30); // giới hạn hợp lý, checklist quá dài sẽ mất tác dụng khi thao tác thực tế
}

function validateStrategyBasics(name: string, rules: string[]): string | null {
  if (!name) return "Vui lòng nhập tên chiến lược.";
  if (name.length > 100) return "Tên chiến lược tối đa 100 ký tự.";
  if (rules.some((r) => r.length > 500)) return "Mỗi quy tắc tối đa 500 ký tự.";
  return null;
}

export async function createStrategy(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image_url = String(formData.get("image_url") ?? "").trim();
  const rules = parseRules(String(formData.get("rules") ?? ""));

  const validationError = validateStrategyBasics(name, rules);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn." };

  const { data: strategy, error } = await supabase
    .from("strategies")
    .insert({ name, description: description || null, image_url: image_url || null, user_id: user.id })
    .select("id")
    .single();

  if (error || !strategy) return { error: error?.message ?? "Không tạo được chiến lược." };

  if (rules.length > 0) {
    const { error: rulesError } = await supabase.from("strategy_rules").insert(
      rules.map((content, index) => ({ strategy_id: strategy.id, content, position: index }))
    );
    if (rulesError) return { error: rulesError.message };
  }

  revalidatePath("/strategies");
  return { error: null };
}

export async function updateStrategy(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image_url = String(formData.get("image_url") ?? "").trim();
  const newRules = parseRules(String(formData.get("rules") ?? ""));

  if (!id) return { error: "Thiếu ID chiến lược." };
  const validationError = validateStrategyBasics(name, newRules);
  if (validationError) return { error: validationError };

  const supabase = await createClient();

  const { error } = await supabase
    .from("strategies")
    .update({ name, description: description || null, image_url: image_url || null })
    .eq("id", id);
  if (error) return { error: error.message };

  // Cập nhật danh sách rule theo VỊ TRÍ (position) thay vì xóa hết rồi tạo lại từ đầu.
  // Cách này giữ nguyên `id` của các rule không đổi vị trí, nhờ đó KHÔNG xóa mất lịch sử
  // tick checklist (trade_rule_checks) của các lệnh cũ đã chấm điểm kỷ luật theo rule đó.
  const { data: existingRules, error: fetchError } = await supabase
    .from("strategy_rules")
    .select("id, position")
    .eq("strategy_id", id)
    .order("position", { ascending: true });
  if (fetchError) return { error: fetchError.message };

  const existing = existingRules ?? [];
  const maxLen = Math.max(existing.length, newRules.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < newRules.length && i < existing.length) {
      const { error: updateError } = await supabase
        .from("strategy_rules")
        .update({ content: newRules[i] })
        .eq("id", existing[i].id);
      if (updateError) return { error: updateError.message };
    } else if (i < newRules.length) {
      const { error: insertError } = await supabase
        .from("strategy_rules")
        .insert({ strategy_id: id, content: newRules[i], position: i });
      if (insertError) return { error: insertError.message };
    }
  }

  // Xóa các rule dư ở cuối (nếu danh sách mới ngắn hơn) — thực hiện SAU CÙNG để giảm rủi ro
  // mất dữ liệu nếu bước update/insert phía trên gặp lỗi giữa chừng.
  if (existing.length > newRules.length) {
    const idsToDelete = existing.slice(newRules.length).map((r) => r.id);
    const { error: deleteError } = await supabase.from("strategy_rules").delete().in("id", idsToDelete);
    if (deleteError) return { error: deleteError.message };
  }

  revalidatePath("/strategies");
  revalidatePath("/trades");
  return { error: null };
}

export async function deleteStrategy(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("strategies").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/strategies");
  revalidatePath("/trades");
  return { error: null };
}
