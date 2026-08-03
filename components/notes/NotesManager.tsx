"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { DailyNote } from "@/lib/types";
import { EMOTIONS, MARKET_TRENDS } from "@/lib/constants";
import { deleteNote, saveNote, type ActionState } from "@/app/(app)/notes/actions";
import { useFormSuccessFlash } from "@/lib/useFormSuccessFlash";
import { Spinner } from "@/components/Spinner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending && <Spinner />}
      {pending ? "Đang lưu..." : "Lưu Nhật ký ngày"}
    </button>
  );
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function NotesManager({ notes }: { notes: DailyNote[] }) {
  const [editing, setEditing] = useState<DailyNote | null>(null);
  const [state, formAction] = useFormState<ActionState, FormData>(saveNote, { error: null });
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickedDate, setPickedDate] = useState<string>(editing?.note_date ?? todayStr());
  const formRef = useRef<HTMLFormElement>(null);
  const savedFlash = useFormSuccessFlash(state, () => {
    setEditing(null);
    setPickedDate(todayStr());
  });

  const noteDates = useMemo(() => new Set(notes.map((n) => n.note_date)), [notes]);
  const overwriteWarning =
    !editing && pickedDate && noteDates.has(pickedDate)
      ? "Ngày này đã có nhật ký — lưu sẽ ghi đè nội dung cũ."
      : null;

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
    if (editing?.id === id) setEditing(null);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-100">Lịch sử ghi chép</h3>
        {notes.length === 0 && <div className="card text-sm text-muted">Chưa có nhật ký nào.</div>}
        {notes.map((n) => {
          const mood = EMOTIONS.find((e) => e.value === n.mood);
          const trend = MARKET_TRENDS.find((t) => t.value === n.market_trend);
          return (
            <div key={n.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-100">
                    {new Date(n.note_date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {mood && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{mood.icon} {mood.label}</span>}
                    {trend && <span className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-muted">{trend.label}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => {
                      setConfirmId(null);
                      setEditing(n);
                      setPickedDate(n.note_date);
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
              {n.content && <p className="text-sm text-slate-300 mt-3 whitespace-pre-wrap">{n.content}</p>}
            </div>
          );
        })}
      </div>

      <div>
        <form ref={formRef} action={formAction} className="card space-y-4 sticky top-6">
          <h3 className="font-semibold text-slate-100">{editing ? `Cập nhật nhật ký ${editing.note_date}` : "Viết Nhật ký hôm nay"}</h3>

          <div>
            <label htmlFor="note_date">Chọn Ngày</label>
            <input
              id="note_date"
              name="note_date"
              type="date"
              required
              defaultValue={editing?.note_date ?? todayStr()}
              onChange={(e) => setPickedDate(e.target.value)}
              key={editing?.id ?? "new"}
              className="w-full"
            />
            {overwriteWarning && <p className="text-xs text-amber-400 mt-1">⚠️ {overwriteWarning}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="mood">Tâm trạng chính</label>
              <select id="mood" name="mood" defaultValue={editing?.mood ?? "Calm"} key={`mood-${editing?.id ?? "new"}`} className="w-full">
                {EMOTIONS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.icon} {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="market_trend">Xu hướng thị trường</label>
              <select id="market_trend" name="market_trend" defaultValue={editing?.market_trend ?? "Sideways"} key={`trend-${editing?.id ?? "new"}`} className="w-full">
                {MARKET_TRENDS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="content">Hôm nay giao dịch thế nào?</label>
            <textarea
              id="content"
              name="content"
              rows={5}
              defaultValue={editing?.content ?? ""}
              key={`content-${editing?.id ?? "new"}`}
              placeholder="Anh có mắc lỗi tâm lý gì không? Cảm xúc chung khi nhìn thị trường..."
              className="w-full"
            />
          </div>

          {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}
          {savedFlash && <p className="text-sm text-profit bg-profit/10 border border-profit/30 rounded-md px-3 py-2">✓ Đã lưu nhật ký</p>}

          <div className="flex gap-2">
            <SubmitButton />
            {editing && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditing(null);
                  setPickedDate(todayStr());
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
