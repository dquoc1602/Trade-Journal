"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const favorite_symbols = String(formData.get("favorite_symbols") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 50);
  const default_account_id = String(formData.get("default_account_id") ?? "") || null;
  const time_format = String(formData.get("time_format") ?? "24h");
  const journal_reminder_enabled = formData.get("journal_reminder_enabled") === "on";
  const dashboard_default_range = String(formData.get("dashboard_default_range") ?? "");

  if (!["12h", "24h"].includes(time_format)) return { error: "Định dạng giờ không hợp lệ." };
  if (!["", "7d", "30d", "month"].includes(dashboard_default_range)) return { error: "Khoảng thời gian mặc định không hợp lệ." };
  if (favorite_symbols.some((s) => s.length > 20)) return { error: "Mỗi cặp tiền yêu thích tối đa 20 ký tự." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn." };

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      favorite_symbols,
      default_account_id,
      time_format,
      journal_reminder_enabled,
      dashboard_default_range,
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/trades/new");
  revalidatePath("/calendar");
  revalidatePath("/");
  return { error: null };
}
