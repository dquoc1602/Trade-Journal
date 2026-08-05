"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { DailyNote, Strategy } from "@/lib/types";
import { EMOTIONS, MARKET_TRENDS } from "@/lib/constants";
import { deleteNote, saveNote, updateNote, type ActionState } from "@/app/(app)/notes/actions";
import { useFormSuccessFlash } from "@/lib/useFormSuccessFlash";
import { Spinner } from "@/components/Spinner";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending && <Spinner />}
      {pending ? pendingLabel : label}
    </button>
  );
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function NoteForm({
  note,
  defaultDate,
  strategies,
  onDone,
}: {
  note?: DailyNote;
  defaultDate: string;
  strategies: Strategy[];
  onDone?: () => void;
}) {
  const isEdit = Boolean(note);
  const action = isEdit ? updateNote : saveNote;
  const [state, formAction] = useFormState<ActionState, FormData>(action, { error: null });
  const savedFlash = useFormSuccessFlash(state, onDone);

  const uid = note?.id ?? "new";

  return (
    <form action={formAction} className="card space-y-4">
      <h3 className="font-semibold text-slate-100">{isEdit ? "✏️ Cập nhật nhật ký" : "Viết nhật ký mới"}</h3>
      {isEdit && <input type="hidden" name="id" value={note!.id} />}

      <div>
        <label htmlFor={`note_date-${uid}`}>Chọn Ngày</label>
        <input
          id={`note_date-${uid}`}
          name="note_date"
          type="date"
          required
          defaultValue={note?.note_date ?? defaultDate}
          className="w-full"
        />
        <p className="text-xs text-muted mt-1">
          Có thể viết nhiều nhật ký trong cùng 1 ngày — mỗi lần lưu tạo 1 mục mới, sắp theo thời điểm lưu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`mood-${uid}`}>Tâm trạng chính</label>
          <select id={`mood-${uid}`} name="mood" defaultValue={note?.mood ?? "Calm"} className="w-full">
            {EMOTIONS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.icon} {e.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`trend-${uid}`}>Xu hướng thị trường</label>
          <select id={`trend-${uid}`} name="market_trend" defaultValue={note?.market_trend ?? "Sideways"} className="w-full">
            {MARKET_TRENDS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`strategy-${uid}`}>Chiến lược liên quan (tuỳ chọn)</label>
        <select id={`strategy-${uid}`} name="strategy_id" defaultValue={note?.strategy_id ?? ""} className="w-full">
          <option value="">-- Không gắn chiến lược --</option>
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`content-${uid}`}>Hôm nay giao dịch thế nào?</label>
        <textarea
          id={`content-${uid}`}
          name="content"
          rows={5}
          defaultValue={note?.content ?? ""}
          placeholder="Anh có mắc lỗi tâm lý gì không? Cảm xúc chung khi nhìn thị trường..."
          className="w-full"
        />
      </div>

      {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}
      {savedFlash && <p className="text-sm text-profit bg-profit/10 border border-profit/30 rounded-md px-3 py-2">✓ Đã lưu nhật ký</p>}

      <div className="flex gap-2">
        <SubmitButton label={isEdit ? "Lưu thay đổi" : "Lưu Nhật ký"} pendingLabel="Đang lưu..." />
        {isEdit && (
          <button type="button" className="btn-secondary" onClick={onDone}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

export function NotesManager({
  notes,
  strategies,
  initialDate,
}: {
  notes: DailyNote[];
  strategies: Strategy[];
  initialDate?: string;
}) {
  const [editingNote, setEditingNote] = useState<DailyNote | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmId) return;
    const t = setTimeout(() => setConfirmId(null), 4000);
    return () => clearTimeout(t);
  }, [confirmId]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteNote(id);
    setDeletingId(null);
    setConfirmId(null);
    if (editingNote?.id === id) setEditingNote(null);
  }

  // notes đã được sắp note_date desc, created_at asc từ server — nhóm lại theo ngày để hiển thị gọn.
  const grouped = useMemo(() => {
    const map = new Map<string, DailyNote[]>();
    for (const n of notes) {
      if (!map.has(n.note_date)) map.set(n.note_date, []);
      map.get(n.note_date)!.push(n);
    }
    return Array.from(map.entries());
  }, [notes]);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-6">
        <h3 className="font-semibold text-slate-100">Lịch sử ghi chép</h3>
        {grouped.length === 0 && <div className="card text-sm text-muted">Chưa có nhật ký nào.</div>}
        {grouped.map(([date, dayNotes]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                {new Date(date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
              {dayNotes.length > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{dayNotes.length} mục</span>
              )}
            </div>
            <div className="space-y-2">
              {dayNotes.map((n) => {
                const mood = EMOTIONS.find((e) => e.value === n.mood);
                const trend = MARKET_TRENDS.find((t) => t.value === n.market_trend);
                const isEditingThis = editingNote?.id === n.id;

                if (isEditingThis) {
                  return (
                    <NoteForm
                      key={n.id}
                      note={n}
                      defaultDate={n.note_date}
                      strategies={strategies}
                      onDone={() => setEditingNote(null)}
                    />
                  );
                }
                const strategy = strategies.find((s) => s.id === n.strategy_id);

                return (
                  <div key={n.id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {mood && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                            {mood.icon} {mood.label}
                          </span>
                        )}
                        {trend && <span className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-muted">{trend.label}</span>}
                        {strategy && <span className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-muted">🎯 {strategy.name}</span>}
                        <span className="text-[10px] text-muted">
                          lúc {new Date(n.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          className="btn-ghost text-xs"
                          onClick={() => {
                            setConfirmId(null);
                            setEditingNote(n);
                          }}
                        >
                          ✏️ Sửa
                        </button>
                        {confirmId === n.id ? (
                          <button className="btn-danger text-xs" disabled={deletingId === n.id} onClick={() => handleDelete(n.id)}>
                            {deletingId === n.id && <Spinner tone="danger" className="mr-1" />}
                            {deletingId === n.id ? "..." : "Xác nhận?"}
                          </button>
                        ) : (
                          <button className="btn-ghost text-xs text-loss" onClick={() => setConfirmId(n.id)}>
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    {n.content ? (
                      <p className="text-sm text-slate-300 mt-3 whitespace-pre-wrap">{n.content}</p>
                    ) : (
                      <p className="text-sm text-muted mt-3 italic">Không có ghi chú nội dung.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <NoteForm key={initialDate ?? "new"} defaultDate={initialDate ?? todayStr()} strategies={strategies} />
      </div>
    </div>
  );
}
