"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

function parseAccountInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const broker = String(formData.get("broker") ?? "").trim();
  const account_type = String(formData.get("account_type") ?? "personal");
  const account_stage = String(formData.get("account_stage") ?? "").trim();
  const asset_class = String(formData.get("asset_class") ?? "forex_cfd");
  const currency = String(formData.get("currency") ?? "USD");
  const balanceRaw = String(formData.get("balance") ?? "0");
  const balance = balanceRaw ? Number(balanceRaw) : 0;

  return {
    name,
    broker: broker || null,
    account_type,
    account_stage: account_stage || null,
    asset_class,
    currency,
    balance,
  };
}

function validateAccountInput(input: ReturnType<typeof parseAccountInput>): string | null {
  if (!input.name) return "Vui lòng nhập tên tài khoản.";
  if (input.name.length > 100) return "Tên tài khoản tối đa 100 ký tự.";
  if (input.broker && input.broker.length > 100) return "Tên sàn tối đa 100 ký tự.";
  if (input.account_stage && input.account_stage.length > 100) return "Giai đoạn tài khoản tối đa 100 ký tự.";
  if (!["forex_cfd", "futures"].includes(input.asset_class)) return "Loại tài sản không hợp lệ.";
  if (Number.isNaN(input.balance)) return "Số dư không hợp lệ.";
  return null;
}

export async function createAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const input = parseAccountInput(formData);
  const validationError = validateAccountInput(input);
  if (validationError) return { error: validationError };

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
  if (!id) return { error: "Thiếu ID tài khoản." };
  const input = parseAccountInput(formData);
  const validationError = validateAccountInput(input);
  if (validationError) return { error: validationError };

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
