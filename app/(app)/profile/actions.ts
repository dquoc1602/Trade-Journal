"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function updateDisplayName(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  if (displayName.length > 100) return { error: "Tên hiển thị tối đa 100 ký tự." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { display_name: displayName || null } });
  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/");
  return { error: null };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!currentPassword || !newPassword) return { error: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới." };
  if (newPassword.length < 6) return { error: "Mật khẩu mới tối thiểu 6 ký tự." };
  if (newPassword !== confirmPassword) return { error: "Mật khẩu mới nhập lại không khớp." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Phiên đăng nhập đã hết hạn." };

  // Xác thực lại mật khẩu hiện tại trước khi cho đổi, phòng trường hợp phiên đăng nhập đang mở bị người khác lợi dụng.
  const { error: reauthError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
  if (reauthError) return { error: "Mật khẩu hiện tại không đúng." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { error: null };
}
