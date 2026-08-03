"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

function parseRules(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function createStrategy(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image_url = String(formData.get("image_url") ?? "").trim();
  const rules = parseRules(String(formData.get("rules") ?? ""));

  if (!name) return { error: "Vui lòng nhập tên chiến lược." };

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
  const rules = parseRules(String(formData.get("rules") ?? ""));

  if (!id) return { error: "Thiếu ID chiến lược." };
  if (!name) return { error: "Vui lòng nhập tên chiến lược." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("strategies")
    .update({ name, description: description || null, image_url: image_url || null })
    .eq("id", id);
  if (error) return { error: error.message };

  // Thay toàn bộ rule cũ bằng danh sách mới nhập (đơn giản hoá — mất lịch sử tick cũ của rule bị xóa)
  const { error: deleteError } = await supabase.from("strategy_rules").delete().eq("strategy_id", id);
  if (deleteError) return { error: deleteError.message };

  if (rules.length > 0) {
    const { error: insertError } = await supabase.from("strategy_rules").insert(
      rules.map((content, index) => ({ strategy_id: id, content, position: index }))
    );
    if (insertError) return { error: insertError.message };
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
