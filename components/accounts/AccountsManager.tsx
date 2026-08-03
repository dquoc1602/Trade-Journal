"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { TradingAccount } from "@/lib/types";
import { ACCOUNT_TYPES, CURRENCIES } from "@/lib/constants";
import { createAccount, deleteAccount, updateAccount, type ActionState } from "@/app/(app)/accounts/actions";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function AccountForm({
  account,
  onDone,
}: {
  account?: TradingAccount;
  onDone?: () => void;
}) {
  const isEdit = Boolean(account);
  const action = isEdit ? updateAccount : createAccount;
  const [state, formAction] = useFormState<ActionState, FormData>(action, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        if (!isEdit) formRef.current?.reset();
        onDone?.();
      }}
      className="card space-y-4"
    >
      <h3 className="font-semibold text-slate-100">{isEdit ? "✏️ Sửa tài khoản" : "Thêm tài khoản mới"}</h3>
      {isEdit && <input type="hidden" name="id" value={account!.id} />}

      <div>
        <label htmlFor={`name-${account?.id ?? "new"}`}>Tên tài khoản *</label>
        <input
          id={`name-${account?.id ?? "new"}`}
          name="name"
          required
          defaultValue={account?.name}
          placeholder="e.g. MT5 Live / cTrader Demo"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor={`broker-${account?.id ?? "new"}`}>Tên sàn (Broker)</label>
        <input
          id={`broker-${account?.id ?? "new"}`}
          name="broker"
          defaultValue={account?.broker ?? ""}
          placeholder="e.g. Exness / IC Markets"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor={`type-${account?.id ?? "new"}`}>Loại tài khoản *</label>
        <select id={`type-${account?.id ?? "new"}`} name="account_type" defaultValue={account?.account_type ?? "personal"} className="w-full">
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`currency-${account?.id ?? "new"}`}>Loại tiền tệ</label>
          <select id={`currency-${account?.id ?? "new"}`} name="currency" defaultValue={account?.currency ?? "USD"} className="w-full">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`balance-${account?.id ?? "new"}`}>Số dư hiện tại</label>
          <input
            id={`balance-${account?.id ?? "new"}`}
            name="balance"
            type="number"
            step="0.01"
            defaultValue={account?.balance ?? 0}
            className="w-full"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}

      <div className="flex gap-2">
        <SubmitButton label={isEdit ? "Lưu thay đổi" : "Thêm tài khoản mới"} pendingLabel="Đang lưu..." />
        {isEdit && (
          <button type="button" className="btn-secondary" onClick={onDone}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

export function AccountsManager({ accounts }: { accounts: TradingAccount[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteAccount(id);
    setDeletingId(null);
    setConfirmId(null);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-100">Danh sách tài khoản kết nối</h3>
        {accounts.length === 0 && (
          <div className="card text-sm text-muted">Chưa có tài khoản nào. Thêm tài khoản đầu tiên ở form bên phải.</div>
        )}
        {accounts.map((acc) =>
          editingId === acc.id ? (
            <AccountForm key={acc.id} account={acc} onDone={() => setEditingId(null)} />
          ) : (
            <div key={acc.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-100">
                    {acc.account_type === "prop_firm" ? "🏆" : "📈"} {acc.name}
                    <span className="ml-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface2 text-muted align-middle">
                      {acc.account_type === "prop_firm" ? "Prop Firm" : "Personal"}
                    </span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Broker: {acc.broker || "—"} · Tiền tệ: {acc.currency}
                  </div>
                  <div className="text-sm text-profit font-semibold mt-2">
                    Số dư: {acc.balance.toLocaleString("en-US", { style: "currency", currency: acc.currency })}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn-ghost text-xs" onClick={() => setEditingId(acc.id)}>
                    ✏️ Sửa
                  </button>
                  {confirmId === acc.id ? (
                    <button
                      className="btn-danger text-xs"
                      disabled={deletingId === acc.id}
                      onClick={() => handleDelete(acc.id)}
                    >
                      {deletingId === acc.id ? "Đang xóa..." : "Xác nhận xóa?"}
                    </button>
                  ) : (
                    <button className="btn-ghost text-xs text-loss" onClick={() => setConfirmId(acc.id)}>
                      🗑️ Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div>
        <AccountForm />
      </div>
    </div>
  );
}
