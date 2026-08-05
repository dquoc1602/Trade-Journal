"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import type { DailyNote } from "@/lib/types";
import { EMOTIONS, MARKET_TRENDS } from "@/lib/constants";
import { saveNote, type ActionState } from "@/app/(app)/notes/actions";
import { useFormSuccessFlash } from "@/lib/useFormSuccessFlash";
import { Spinner } from "@/components/Spinner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary text-sm" disabled={pending}>
      {pending && <Spinner />}
      {pending ? "Đang lưu..." : "Lưu Nhật ký ngày"}
    </button>
  );
}

function NewNoteForm({ date, onSaved }: { date: string; onSaved: () => void }) {
  const [state, formAction] = useFormState<ActionState, FormData>(saveNote, { error: null });
  const savedFlash = useFormSuccessFlash(state, onSaved);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="note_date" value={date} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="linked-mood">Tâm trạng chính</label>
          <select id="linked-mood" name="mood" defaultValue="Calm" className="w-full">
            {EMOTIONS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.icon} {e.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="linked-trend">Xu hướng thị trường</label>
          <select id="linked-trend" name="market_trend" defaultValue="Sideways" className="w-full">
            {MARKET_TRENDS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <textarea name="content" rows={3} placeholder="Hôm nay giao dịch thế nào? Có mắc lỗi tâm lý gì không?" className="w-full" />
      {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}
      {savedFlash && <p className="text-sm text-profit">✓ Đã lưu nhật ký ngày</p>}
      <SubmitButton />
    </form>
  );
}

export function LinkedDailyNote({ date, notes }: { date: string; notes: DailyNote[] }) {
  const [adding, setAdding] = useState(notes.length === 0);
  const dateLabel = new Date(date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-100">📝 Nhật ký ngày {dateLabel}</h3>
        {!adding && (
          <button className="btn-ghost text-xs" onClick={() => setAdding(true)}>
            + Thêm nhật ký
          </button>
        )}
      </div>

      {notes.length > 0 && (
        <div className="space-y-2 mb-3">
          {notes.map((n) => {
            const mood = EMOTIONS.find((e) => e.value === n.mood);
            const trend = MARKET_TRENDS.find((t) => t.value === n.market_trend);
            return (
              <div key={n.id} className="rounded-md bg-surface2/60 border border-border px-3 py-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {mood && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {mood.icon} {mood.label}
                    </span>
                  )}
                  {trend && <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-muted">{trend.label}</span>}
                  <span className="text-[10px] text-muted">
                    lúc {new Date(n.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {n.content && <p className="text-sm text-slate-300 whitespace-pre-wrap">{n.content}</p>}
              </div>
            );
          })}
          <Link href={`/notes?date=${date}`} className="text-xs text-primary hover:underline inline-block">
            Xem / sửa đầy đủ tại trang Nhật ký ngày →
          </Link>
        </div>
      )}

      {adding && (
        <NewNoteForm
          date={date}
          onSaved={() => {
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}
