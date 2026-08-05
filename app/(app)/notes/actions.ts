"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

function parseNoteInput(formData: FormData) {
  const note_date = String(formData.get("note_date") ?? "");
  const mood = String(formData.get("mood") ?? "") || null;
  const market_trend = String(formData.get("market_trend") ?? "") || null;
  const content = String(formData.get("content") ?? "").trim() || null;
  const strategy_id = String(formData.get("strategy_id") ?? "") || null;
  return { note_date, mood, market_trend, content, strategy_id };
}

function validateNoteInput(input: ReturnType<typeof parseNoteInput>): string | null {
  if (!input.note_date) return "Vui lòng chọn ngày.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.note_date) || Number.isNaN(new Date(input.note_date).getTime())) {
    return "Ngày không hợp lệ.";
  }
  if (input.content && input.content.length > 5000) return "Nội dung nhật ký tối đa 5000 ký tự.";
  return null;
}

function revalidateNotePaths() {
  revalidatePath("/notes");
  revalidatePath("/trades");
  revalidatePath("/calendar");
  revalidatePath("/");
}

/** Luôn tạo 1 nhật ký MỚI — 1 ngày có thể có nhiều nhật ký, sắp theo thời điểm lưu (created_at). */
export async function saveNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const input = parseNoteInput(formData);
  const validationError = validateNoteInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn." };

  const { error } = await supabase.from("daily_notes").insert({ user_id: user.id, ...input });
  if (error) return { error: error.message };

  revalidateNotePaths();
  return { error: null };
}

/** Sửa 1 nhật ký cụ thể theo id (không còn upsert theo ngày vì 1 ngày có thể có nhiều nhật ký). */
export async function updateNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Thiếu ID nhật ký." };

  const input = parseNoteInput(formData);
  const validationError = validateNoteInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { error } = await supabase.from("daily_notes").update(input).eq("id", id);
  if (error) return { error: error.message };

  revalidateNotePaths();
  return { error: null };
}

export async function deleteNote(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_notes").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateNotePaths();
  return { error: null };
}
