"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Strategy } from "@/lib/types";
import type { PerformanceSummary } from "@/lib/analytics";
import { formatCurrency, formatPercent } from "@/lib/analytics";
import { createStrategy, deleteStrategy, updateStrategy, type ActionState } from "@/app/(app)/strategies/actions";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function StrategyForm({ strategy, onDone }: { strategy?: Strategy; onDone?: () => void }) {
  const isEdit = Boolean(strategy);
  const action = isEdit ? updateStrategy : createStrategy;
  const [state, formAction] = useFormState<ActionState, FormData>(action, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const defaultRules = strategy?.strategy_rules
    ?.slice()
    .sort((a, b) => a.position - b.position)
    .map((r) => r.content)
    .join("\n");

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
      <h3 className="font-semibold text-slate-100">{isEdit ? "✏️ Chỉnh sửa chiến lược" : "Tạo Chiến lược mới"}</h3>
      {isEdit && <input type="hidden" name="id" value={strategy!.id} />}

      <div>
        <label htmlFor={`sname-${strategy?.id ?? "new"}`}>Tên Chiến lược *</label>
        <input
          id={`sname-${strategy?.id ?? "new"}`}
          name="name"
          required
          defaultValue={strategy?.name}
          placeholder="e.g. Breakout Retest / Trend Pullback"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor={`sdesc-${strategy?.id ?? "new"}`}>Mô tả ngắn</label>
        <textarea
          id={`sdesc-${strategy?.id ?? "new"}`}
          name="description"
          rows={2}
          defaultValue={strategy?.description ?? ""}
          placeholder="Ghi chú về định hướng hoặc cách thức giao dịch..."
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor={`simg-${strategy?.id ?? "new"}`}>Link ảnh setup mẫu (tuỳ chọn)</label>
        <input
          id={`simg-${strategy?.id ?? "new"}`}
          name="image_url"
          defaultValue={strategy?.image_url ?? ""}
          placeholder="https://..."
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor={`srules-${strategy?.id ?? "new"}`}>Quy tắc kỷ luật (mỗi dòng một quy tắc)</label>
        <textarea
          id={`srules-${strategy?.id ?? "new"}`}
          name="rules"
          rows={5}
          defaultValue={defaultRules}
          placeholder={"Quy tắc 1: Không fomo nhồi lệnh\nQuy tắc 2: R:R tối thiểu 1:2\nQuy tắc 3: Có xác nhận cấu trúc HTF"}
          className="w-full font-mono text-xs"
        />
      </div>

      {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}

      <div className="flex gap-2">
        <SubmitButton label={isEdit ? "Lưu thay đổi" : "Lưu Chiến lược"} pendingLabel="Đang lưu..." />
        {isEdit && (
          <button type="button" className="btn-secondary" onClick={onDone}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

export function StrategiesManager({
  strategies,
  performance,
}: {
  strategies: Strategy[];
  performance: Record<string, PerformanceSummary>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteStrategy(id);
    setDeletingId(null);
    setConfirmId(null);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {strategies.length === 0 && (
          <div className="card text-sm text-muted">Chưa có chiến lược nào. Tạo chiến lược đầu tiên ở form bên phải.</div>
        )}

        {strategies.map((s) => {
          const perf = performance[s.id];
          if (editingId === s.id) {
            return <StrategyForm key={s.id} strategy={s} onDone={() => setEditingId(null)} />;
          }
          return (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-100">{s.name}</h3>
                  {s.description && <p className="text-sm text-muted mt-1">{s.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn-ghost text-xs" onClick={() => setEditingId(s.id)}>
                    ✏️ Sửa
                  </button>
                  {confirmId === s.id ? (
                    <button className="btn-danger text-xs" disabled={deletingId === s.id} onClick={() => handleDelete(s.id)}>
                      {deletingId === s.id ? "Đang xóa..." : "Xác nhận xóa?"}
                    </button>
                  ) : (
                    <button className="btn-ghost text-xs text-loss" onClick={() => setConfirmId(s.id)}>
                      🗑️ Xóa
                    </button>
                  )}
                </div>
              </div>

              {perf && perf.count > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <div className="text-[10px] uppercase text-muted">Lợi nhuận ròng</div>
                    <div className={perf.netPnl >= 0 ? "text-profit font-semibold" : "text-loss font-semibold"}>
                      {formatCurrency(perf.netPnl)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted">Win Rate / Lệnh</div>
                    <div className="font-semibold text-slate-100">
                      {formatPercent(perf.winRate)} <span className="text-muted font-normal">({perf.count} lệnh)</span>
                    </div>
                  </div>
                </div>
              )}

              {s.strategy_rules && s.strategy_rules.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-primary mb-2">Quy tắc bắt buộc tuân thủ:</div>
                  <ol className="space-y-1 text-sm text-slate-200 list-decimal list-inside">
                    {s.strategy_rules
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((r) => (
                        <li key={r.id}>{r.content}</li>
                      ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <StrategyForm />
      </div>
    </div>
  );
}
