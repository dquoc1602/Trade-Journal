import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserSettings } from "@/lib/types";

const DEFAULT_SETTINGS: Omit<UserSettings, "user_id" | "created_at" | "updated_at"> = {
  favorite_symbols: [],
  default_account_id: null,
  time_format: "24h",
  theme: "dark",
  journal_reminder_enabled: true,
  dashboard_default_range: "",
};

/**
 * Đọc user_settings của user hiện tại. KHÔNG tự insert dòng mặc định ở đây (đây là read-path
 * dùng chung ở nhiều trang) — dòng thật chỉ được tạo khi người dùng lưu Settings lần đầu (upsert).
 * Chưa có dòng nào thì trả về giá trị mặc định để các trang khác dùng an toàn.
 */
export async function getUserSettings(supabase: SupabaseClient): Promise<UserSettings> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ...DEFAULT_SETTINGS, user_id: "", created_at: "", updated_at: "" };

  const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
  if (data) return data as UserSettings;
  return { ...DEFAULT_SETTINGS, user_id: user.id, created_at: "", updated_at: "" };
}
