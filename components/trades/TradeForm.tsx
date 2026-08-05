"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Trade, TradingAccount, Strategy } from "@/lib/types";
import { EMOTIONS, SESSIONS, type SessionValue } from "@/lib/constants";
import { createTrade, updateTrade, type ActionState } from "@/app/(app)/trades/actions";
import { useFormSuccessFlash } from "@/lib/useFormSuccessFlash";
import { Spinner } from "@/components/Spinner";
import { parseFlexibleDateTimeToIso, parseFlexibleDateTime, formatDateTimeForInput, DATETIME_INPUT_PLACEHOLDER } from "@/lib/dateInput";
import { sessionFromTime } from "@/lib/analytics";

const SESSION_LABELS: Record<SessionValue, string> = { Asia: "Asia", London: "London", NY_AM: "NY AM", NY_PM: "NY PM" };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending && <Spinner />}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function TradeForm({
  trade,
  accounts,
  strategies,
  favoriteSymbols = [],
  defaultAccountId = null,
  onCancel,
  onDone,
}: {
  trade?: Trade;
  accounts: TradingAccount[];
  strategies: Strategy[];
  favoriteSymbols?: string[];
  defaultAccountId?: string | null;
  onCancel?: () => void;
  onDone?: () => void;
}) {
  const isEdit = Boolean(trade);
  const action = isEdit ? updateTrade : createTrade;
  const [state, formAction] = useFormState<ActionState, FormData>(action, { error: null });
  // Chỉ áp dụng cho chế độ sửa: tạo mới sẽ redirect() sang trang chi tiết nên không cần callback này.
  const savedFlash = useFormSuccessFlash(state, isEdit ? onDone : undefined);
  const [clientError, setClientError] = useState<string | null>(null);

  // Phiên tự động suy ra từ giờ mở lệnh, nhưng cho sửa tay. Chỉ khi người dùng CHỦ ĐỘNG đổi mới lưu giá trị
  // ghi đè xuống DB — nếu không đụng vào, để trống (session=null) để giá trị luôn bám theo giờ mở lệnh mới nhất.
  const [sessionTouched, setSessionTouched] = useState(Boolean(trade?.session));
  const [sessionValue, setSessionValue] = useState<SessionValue>(
    trade?.session ?? sessionFromTime(trade?.open_time ?? new Date().toISOString())
  );

  function handleOpenTimeChange(raw: string) {
    if (sessionTouched) return;
    const d = parseFlexibleDateTime(raw);
    if (d) setSessionValue(sessionFromTime(d.toISOString()));
  }

  // Ô giờ là TEXT tự do để người dùng dán thẳng timestamp copy từ platform (VD "2026-08-05 20:32:44.855").
  // Parse ở đây (trong trình duyệt, biết đúng giờ địa phương thật của người dùng) rồi quy đổi sang ISO UTC
  // trước khi gửi lên server — không để server tự new Date() vì server (Vercel) chạy giờ UTC.
  function withUtcConversion(formData: FormData) {
    setClientError(null);
    const fieldLabels: Record<string, string> = { open_time: "Thời gian mở lệnh", close_time: "Thời gian đóng lệnh" };
    for (const field of ["open_time", "close_time"] as const) {
      const raw = String(formData.get(field) ?? "").trim();
      if (!raw) {
        formData.set(field, "");
        continue;
      }
      const iso = parseFlexibleDateTimeToIso(raw);
      if (!iso) {
        setClientError(`${fieldLabels[field]} không đúng định dạng. Dùng ${DATETIME_INPUT_PLACEHOLDER}`);
        return;
      }
      formData.set(field, iso);
    }
    if (!sessionTouched) formData.set("session", "");
    return formAction(formData);
  }

  return (
    <form action={withUtcConversion} className="card space-y-4 max-w-2xl">
      {isEdit && <input type="hidden" name="id" value={trade!.id} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="account_id">Tài khoản giao dịch *</label>
          <select
            id="account_id"
            name="account_id"
            required
            defaultValue={trade?.account_id ?? defaultAccountId ?? accounts[0]?.id}
            className="w-full"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_type === "prop_firm" ? "🏆" : "📈"} {a.name}
                {a.is_disabled ? " (Đã Disabled)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="symbol">Cặp tiền / Tài sản *</label>
          <input
            id="symbol"
            name="symbol"
            required
            list="favorite-symbols-list"
            defaultValue={trade?.symbol}
            placeholder="e.g. EURUSD, XAUUSD"
            className="w-full"
          />
          {favoriteSymbols.length > 0 && (
            <datalist id="favorite-symbols-list">
              {favoriteSymbols.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="side">Vị thế giao dịch *</label>
          <select id="side" name="side" defaultValue={trade?.side ?? "BUY"} className="w-full">
            <option value="BUY">BUY (Mua)</option>
            <option value="SELL">SELL (Bán)</option>
          </select>
        </div>
        <div>
          <label htmlFor="volume">Khối lượng (Lots/Units) *</label>
          <input id="volume" name="volume" type="number" step="0.01" min="0.01" required defaultValue={trade?.volume} placeholder="e.g. 1.00" className="w-full" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="open_price">Mức giá mở (Open Price) *</label>
          <input id="open_price" name="open_price" type="number" step="0.00001" min="0" required defaultValue={trade?.open_price} placeholder="e.g. 1.0850" className="w-full" />
        </div>
        <div>
          <label htmlFor="close_price">Mức giá đóng (để trống nếu lệnh đang chạy)</label>
          <input id="close_price" name="close_price" type="number" step="0.00001" min="0" defaultValue={trade?.close_price ?? ""} placeholder="e.g. 1.0950" className="w-full" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="open_time">Thời gian mở lệnh *</label>
          <input
            id="open_time"
            name="open_time"
            type="text"
            required
            inputMode="numeric"
            placeholder={DATETIME_INPUT_PLACEHOLDER}
            defaultValue={formatDateTimeForInput(trade?.open_time ?? null)}
            onChange={(e) => handleOpenTimeChange(e.target.value)}
            className="w-full font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="close_time">Thời gian đóng lệnh (để trống nếu đang chạy)</label>
          <input
            id="close_time"
            name="close_time"
            type="text"
            inputMode="numeric"
            placeholder={DATETIME_INPUT_PLACEHOLDER}
            defaultValue={formatDateTimeForInput(trade?.close_time ?? null)}
            className="w-full font-mono text-sm"
          />
        </div>
      </div>
      <p className="text-xs text-muted -mt-2">
        Dán trực tiếp giờ copy từ platform (VD <code>2026-08-05 20:32:44.855</code>) hoặc gõ tay theo định dạng{" "}
        <code>YYYY-MM-DD HH:MM:SS</code>. Cần điền <strong>cả hai</strong> Giá đóng + Thời gian đóng để lệnh được tính
        là "Đã đóng" (CLOSED). Nếu chỉ điền một trong hai, lệnh sẽ báo lỗi.
      </p>

      <div>
        <label htmlFor="session">Phiên giao dịch {!sessionTouched && <span className="text-muted font-normal">(tự động theo giờ mở lệnh)</span>}</label>
        <select
          id="session"
          value={sessionValue}
          onChange={(e) => {
            setSessionTouched(true);
            setSessionValue(e.target.value as SessionValue);
          }}
          className="w-full sm:w-56"
        >
          {SESSIONS.map((s) => (
            <option key={s} value={s}>
              {SESSION_LABELS[s]}
            </option>
          ))}
        </select>
        {sessionTouched && (
          <button
            type="button"
            className="text-xs text-primary hover:underline mt-1"
            onClick={() => {
              setSessionTouched(false);
              const d = parseFlexibleDateTime(String((document.getElementById("open_time") as HTMLInputElement)?.value ?? ""));
              if (d) setSessionValue(sessionFromTime(d.toISOString()));
            }}
          >
            ↺ Dùng lại tự động
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="gross_profit">Lợi nhuận thô (USD)</label>
          <input id="gross_profit" name="gross_profit" type="number" step="0.01" defaultValue={trade?.gross_profit ?? ""} placeholder="+150.00 hoặc -50.00" className="w-full" />
        </div>
        <div>
          <label htmlFor="commission">Phí hoa hồng (số âm)</label>
          <input id="commission" name="commission" type="number" step="0.01" defaultValue={trade?.commission ?? 0} placeholder="-7.00" className="w-full" />
        </div>
        <div>
          <label htmlFor="swap">Phí qua đêm (Swap)</label>
          <input id="swap" name="swap" type="number" step="0.01" defaultValue={trade?.swap ?? 0} placeholder="-1.50" className="w-full" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="emotion">Tâm lý lúc giao dịch</label>
          <select id="emotion" name="emotion" defaultValue={trade?.emotion ?? "Calm"} className="w-full">
            {EMOTIONS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.icon} {e.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="strategy_id">Chiến lược áp dụng</label>
          <select id="strategy_id" name="strategy_id" defaultValue={trade?.strategy_id ?? ""} className="w-full">
            <option value="">-- Không áp dụng --</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rr_ratio">Tỷ lệ R:R</label>
          <input id="rr_ratio" name="rr_ratio" type="number" step="0.1" min="0" defaultValue={trade?.rr_ratio ?? ""} placeholder="e.g. 2.5" className="w-full" />
        </div>
      </div>

      <div>
        <label htmlFor="screenshot_url">Link ảnh chụp biểu đồ (TradingView snapshot...)</label>
        <input id="screenshot_url" name="screenshot_url" defaultValue={trade?.screenshot_url ?? ""} placeholder="https://..." className="w-full" />
      </div>

      <div>
        <label htmlFor="notes">Ghi chú chi tiết (Phân tích, bài học rút ra...)</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={trade?.notes ?? ""} className="w-full" />
      </div>

      {(clientError || state.error) && (
        <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{clientError || state.error}</p>
      )}
      {savedFlash && <p className="text-sm text-profit bg-profit/10 border border-profit/30 rounded-md px-3 py-2">✓ Đã lưu thay đổi</p>}

      <div className="flex gap-2">
        <SubmitButton label={isEdit ? "Lưu thay đổi" : "Lưu Giao Dịch"} pendingLabel="Đang lưu..." />
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
