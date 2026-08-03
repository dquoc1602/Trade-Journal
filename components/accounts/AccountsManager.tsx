"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { TradingAccount } from "@/lib/types";
import { ACCOUNT_TYPES, ASSET_CLASSES, CURRENCIES, PROP_FIRMS, propFirmById } from "@/lib/constants";
import { createAccount, deleteAccount, updateAccount, type ActionState } from "@/app/(app)/accounts/actions";
import { useFormSuccessFlash } from "@/lib/useFormSuccessFlash";
import { Spinner } from "@/components/Spinner";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending && <Spinner />}
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Dò xem broker text đã lưu khớp với quỹ preset nào không (dùng khi mở form Sửa). */
function guessFirmId(brokerName: string | null | undefined): string {
  if (!brokerName) return "other";
  const match = PROP_FIRMS.find((f) => f.id !== "other" && f.name.toLowerCase() === brokerName.trim().toLowerCase());
  return match?.id ?? "other";
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
  const savedFlash = useFormSuccessFlash(state, isEdit ? onDone : undefined);

  const [firmId, setFirmId] = useState<string>(() => guessFirmId(account?.broker));
  const [accountType, setAccountType] = useState(account?.account_type ?? "personal");
  const firm = propFirmById(firmId);
  const isKnownFirm = Boolean(firm && firm.id !== "other");
  const uid = account?.id ?? "new";

  function handleFirmChange(id: string) {
    setFirmId(id);
    if (id !== "other") setAccountType("prop_firm");
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        if (!isEdit) {
          formRef.current?.reset();
          setFirmId("other");
          setAccountType("personal");
        }
      }}
      className="card space-y-4"
    >
      <h3 className="font-semibold text-slate-100">{isEdit ? "✏️ Sửa tài khoản" : "Thêm tài khoản mới"}</h3>
      {isEdit && <input type="hidden" name="id" value={account!.id} />}

      <div>
        <label htmlFor={`name-${uid}`}>Tên tài khoản *</label>
        <input
          id={`name-${uid}`}
          name="name"
          required
          maxLength={100}
          defaultValue={account?.name}
          placeholder="e.g. FTMO Challenge #1 / MT5 Live"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor={`firm-${uid}`}>Quỹ / Sàn giao dịch</label>
        <select id={`firm-${uid}`} value={firmId} onChange={(e) => handleFirmChange(e.target.value)} className="w-full">
          <option value="other">-- Khác / Tự nhập --</option>
          {PROP_FIRMS.filter((f) => f.id !== "other").map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {isKnownFirm ? (
        <input type="hidden" name="broker" value={firm!.name} />
      ) : (
        <div>
          <label htmlFor={`broker-${uid}`}>Tên sàn (Broker)</label>
          <input
            id={`broker-${uid}`}
            name="broker"
            maxLength={100}
            defaultValue={firmId === "other" ? account?.broker ?? "" : ""}
            placeholder="e.g. Exness / IC Markets"
            className="w-full"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`type-${uid}`}>Loại tài khoản *</label>
          <select
            id={`type-${uid}`}
            name="account_type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as typeof accountType)}
            className="w-full"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`asset-${uid}`}>Loại tài sản</label>
          {isKnownFirm ? (
            <>
              <input type="hidden" name="asset_class" value={firm!.assetClass} />
              <div className="h-[38px] flex items-center px-3 text-sm text-slate-200 bg-surface2/60 border border-border rounded-md">
                {ASSET_CLASSES.find((a) => a.value === firm!.assetClass)?.label}
                <span className="text-muted text-xs ml-1">(tự động)</span>
              </div>
            </>
          ) : (
            <select id={`asset-${uid}`} name="asset_class" defaultValue={account?.asset_class ?? "forex_cfd"} className="w-full">
              {ASSET_CLASSES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div>
        <label htmlFor={`stage-${uid}`}>Giai đoạn tài khoản</label>
        {isKnownFirm && firm!.stages.length > 0 ? (
          <select
            id={`stage-${uid}`}
            name="account_stage"
            key={firmId}
            defaultValue={
              (firm!.stages as readonly string[]).includes(account?.account_stage ?? "") ? account!.account_stage! : firm!.stages[0]
            }
            className="w-full"
          >
            {firm!.stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`stage-${uid}`}
            name="account_stage"
            key={firmId}
            maxLength={100}
            defaultValue={firmId === "other" ? account?.account_stage ?? "" : ""}
            placeholder="VD: Live, Demo, Funded..."
            className="w-full"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`currency-${uid}`}>Loại tiền tệ</label>
          <select id={`currency-${uid}`} name="currency" defaultValue={account?.currency ?? "USD"} className="w-full">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`balance-${uid}`}>Số dư ban đầu</label>
          <input
            id={`balance-${uid}`}
            name="balance"
            type="number"
            step="0.01"
            defaultValue={account?.balance ?? 0}
            className="w-full"
          />
        </div>
      </div>
      <p className="text-xs text-muted -mt-2">
        Số dư sẽ <strong>tự động cộng/trừ</strong> theo lời/lỗ mỗi khi bạn thêm, sửa hoặc xóa lệnh gắn vào tài khoản
        này — không cần tự tay cập nhật lại.
      </p>

      {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}
      {savedFlash && <p className="text-sm text-profit bg-profit/10 border border-profit/30 rounded-md px-3 py-2">✓ Đã lưu thay đổi</p>}

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

  // Nút xóa đã "vũ trang" (chờ bấm lần 2) tự tắt sau vài giây để tránh lỡ tay bấm trúng.
  useEffect(() => {
    if (!confirmId) return;
    const t = setTimeout(() => setConfirmId(null), 4000);
    return () => clearTimeout(t);
  }, [confirmId]);

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
                <div className="min-w-0">
                  <div className="font-medium text-slate-100 truncate">
                    {acc.account_type === "prop_firm" ? "🏆" : "📈"} {acc.name}
                    <span className="ml-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface2 text-muted align-middle">
                      {acc.account_type === "prop_firm" ? "Prop Firm" : "Personal"}
                    </span>
                    <span className="ml-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary align-middle">
                      {ASSET_CLASSES.find((a) => a.value === acc.asset_class)?.label ?? acc.asset_class}
                    </span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Broker: {acc.broker || "—"}
                    {acc.account_stage ? ` · Giai đoạn: ${acc.account_stage}` : ""} · Tiền tệ: {acc.currency}
                  </div>
                  <div className="text-sm text-profit font-semibold mt-2">
                    Số dư: {acc.balance.toLocaleString("en-US", { style: "currency", currency: acc.currency })}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => {
                      setConfirmId(null);
                      setEditingId(acc.id);
                    }}
                  >
                    ✏️ Sửa
                  </button>
                  {confirmId === acc.id ? (
                    <button
                      className="btn-danger text-xs"
                      disabled={deletingId === acc.id}
                      onClick={() => handleDelete(acc.id)}
                    >
                      {deletingId === acc.id && <Spinner tone="danger" className="mr-1" />}
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
