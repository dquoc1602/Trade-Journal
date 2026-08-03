"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function saveNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const note_date = String(formData.get("note_date") ?? "");
  const mood = String(formData.get("mood") ?? "") || null;
  const market_trend = String(formData.get("market_trend") ?? "") || null;
  const content = String(formData.get("content") ?? "").trim() || null;

  if (!note_date) return { error: "Vui lòng chọn ngày." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(note_date) || Number.isNaN(new Date(note_date).getTime())) {
    return { error: "Ngày không hợp lệ." };
  }
  if (content && content.length > 5000) return { error: "Nội dung nhật ký tối đa 5000 ký tự." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn." };

  const { error } = await supabase
    .from("daily_notes")
    .upsert({ user_id: user.id, note_date, mood, market_trend, content }, { onConflict: "user_id,note_date" });

  if (error) return { error: error.message };

  revalidatePath("/notes");
  revalidatePath("/trades");
  revalidatePath("/");
  return { error: null };
}

export async function deleteNote(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_notes").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/notes");
  return { error: null };
}
