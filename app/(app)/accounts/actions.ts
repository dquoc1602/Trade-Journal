"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

function parseAccountInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const broker = String(formData.get("broker") ?? "").trim();
  const account_type = String(formData.get("account_type") ?? "personal");
  const currency = String(formData.get("currency") ?? "USD");
  const balanceRaw = String(formData.get("balance") ?? "0");
  const balance = balanceRaw ? Number(balanceRaw) : 0;

  return { name, broker: broker || null, account_type, currency, balance };
}

export async function createAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const input = parseAccountInput(formData);
  if (!input.name) return { error: "Vui lòng nhập tên tài khoản." };
  if (Number.isNaN(input.balance)) return { error: "Số dư không hợp lệ." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn." };

  const { error } = await supabase.from("trading_accounts").insert({ ...input, user_id: user.id });
  if (error) return { error: error.message };

  revalidatePath("/accounts");
  revalidatePath("/trades");
  return { error: null };
}

export async function updateAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const input = parseAccountInput(formData);
  if (!id) return { error: "Thiếu ID tài khoản." };
  if (!input.name) return { error: "Vui lòng nhập tên tài khoản." };

  const supabase = await createClient();
  const { error } = await supabase.from("trading_accounts").update(input).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/accounts");
  revalidatePath("/trades");
  return { error: null };
}

export async function deleteAccount(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("trading_accounts").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/accounts");
  revalidatePath("/trades");
  return { error: null };
}
