"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Trade, TradingAccount, Strategy } from "@/lib/types";
import { EMOTIONS } from "@/lib/constants";
import { createTrade, updateTrade, type ActionState } from "@/app/(app)/trades/actions";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TradeForm({
  trade,
  accounts,
  strategies,
  onCancel,
}: {
  trade?: Trade;
  accounts: TradingAccount[];
  strategies: Strategy[];
  onCancel?: () => void;
}) {
  const isEdit = Boolean(trade);
  const action = isEdit ? updateTrade : createTrade;
  const [state, formAction] = useFormState<ActionState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="card space-y-4 max-w-2xl">
      {isEdit && <input type="hidden" name="id" value={trade!.id} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="account_id">Tài khoản giao dịch *</label>
          <select id="account_id" name="account_id" required defaultValue={trade?.account_id ?? accounts[0]?.id} className="w-full">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_type === "prop_firm" ? "🏆" : "📈"} {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="symbol">Cặp tiền / Tài sản *</label>
          <input id="symbol" name="symbol" required defaultValue={trade?.symbol} placeholder="e.g. EURUSD, XAUUSD" className="w-full" />
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
          <input id="volume" name="volume" type="number" step="0.01" required defaultValue={trade?.volume} placeholder="e.g. 1.00" className="w-full" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="open_price">Mức giá mở (Open Price) *</label>
          <input id="open_price" name="open_price" type="number" step="0.00001" required defaultValue={trade?.open_price} placeholder="e.g. 1.0850" className="w-full" />
        </div>
        <div>
          <label htmlFor="close_price">Mức giá đóng (để trống nếu lệnh đang chạy)</label>
          <input id="close_price" name="close_price" type="number" step="0.00001" defaultValue={trade?.close_price ?? ""} placeholder="e.g. 1.0950" className="w-full" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="open_time">Thời gian mở lệnh *</label>
          <input
            id="open_time"
            name="open_time"
            type="datetime-local"
            required
            defaultValue={toLocalInputValue(trade?.open_time ?? null)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="close_time">Thời gian đóng lệnh (để trống nếu đang chạy)</label>
          <input
            id="close_time"
            name="close_time"
            type="datetime-local"
            defaultValue={toLocalInputValue(trade?.close_time ?? null)}
            className="w-full"
          />
        </div>
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
          <input id="rr_ratio" name="rr_ratio" type="number" step="0.1" defaultValue={trade?.rr_ratio ?? ""} placeholder="e.g. 2.5" className="w-full" />
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

      {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}

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
