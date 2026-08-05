"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { TradingAccount, UserSettings } from "@/lib/types";
import { updateSettings, type ActionState } from "@/app/(app)/settings/actions";
import { useFormSuccessFlash } from "@/lib/useFormSuccessFlash";
import { Spinner } from "@/components/Spinner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending && <Spinner />}
      {pending ? "Đang lưu..." : "Lưu cài đặt"}
    </button>
  );
}

function FavoriteSymbolsEditor({ initial }: { initial: string[] }) {
  const [symbols, setSymbols] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");

  function addSymbol() {
    const value = draft.trim().toUpperCase();
    if (!value || symbols.includes(value)) {
      setDraft("");
      return;
    }
    setSymbols((prev) => [...prev, value]);
    setDraft("");
  }

  function removeSymbol(value: string) {
    setSymbols((prev) => prev.filter((s) => s !== value));
  }

  return (
    <div>
      <label htmlFor="favorite-symbol-input">Cặp tiền yêu thích</label>
      <input type="hidden" name="favorite_symbols" value={symbols.join(",")} />
      <div className="flex gap-2">
        <input
          id="favorite-symbol-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSymbol();
            }
          }}
          placeholder="VD: EURUSD, XAUUSD..."
          className="flex-1"
        />
        <button type="button" className="btn-secondary" onClick={addSymbol}>
          + Thêm
        </button>
      </div>
      {symbols.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {symbols.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">
              {s}
              <button type="button" onClick={() => removeSymbol(s)} className="hover:text-loss" aria-label={`Xóa ${s}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-muted mt-2">Dùng làm gợi ý nhanh trong ô chọn cặp tiền khi ghi lệnh mới.</p>
    </div>
  );
}

export function SettingsManager({ settings, accounts }: { settings: UserSettings; accounts: TradingAccount[] }) {
  const [state, formAction] = useFormState<ActionState, FormData>(updateSettings, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const savedFlash = useFormSuccessFlash(state);

  return (
    <form ref={formRef} action={formAction} className="max-w-xl space-y-6">
      <div className="card space-y-4">
        <h3 className="font-semibold text-slate-100">Ghi lệnh</h3>
        <FavoriteSymbolsEditor initial={settings.favorite_symbols} />

        <div>
          <label htmlFor="default_account_id">Tài khoản mặc định khi ghi lệnh mới</label>
          <select id="default_account_id" name="default_account_id" defaultValue={settings.default_account_id ?? ""} className="w-full">
            <option value="">-- Không đặt mặc định --</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_type === "prop_firm" ? "🏆" : "📈"} {a.name}
                {a.is_disabled ? " (Đã Disabled)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-slate-100">Hiển thị</h3>
        <div>
          <label htmlFor="time_format">Định dạng giờ</label>
          <select id="time_format" name="time_format" defaultValue={settings.time_format} className="w-full">
            <option value="24h">24 giờ (VD 20:32)</option>
            <option value="12h">12 giờ (VD 8:32 PM)</option>
          </select>
        </div>

        <div>
          <label htmlFor="dashboard_default_range">Khoảng thời gian mặc định ở Dashboard</label>
          <select id="dashboard_default_range" name="dashboard_default_range" defaultValue={settings.dashboard_default_range} className="w-full">
            <option value="">Tất cả thời gian</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="month">Tháng này</option>
          </select>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-slate-100">Nhắc nhở</h3>
        <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            name="journal_reminder_enabled"
            defaultChecked={settings.journal_reminder_enabled}
            className="w-auto"
          />
          📝 Nhắc viết nhật ký cho ngày có lệnh nhưng chưa journal
        </label>
        <p className="text-xs text-muted -mt-2">Hiện badge cảnh báo trên Lịch giao dịch — tắt nếu bạn thấy không cần thiết.</p>
      </div>

      {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}
      {savedFlash && <p className="text-sm text-profit bg-profit/10 border border-profit/30 rounded-md px-3 py-2">✓ Đã lưu cài đặt</p>}

      <SubmitButton />
    </form>
  );
}
