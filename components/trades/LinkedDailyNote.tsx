"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import type { DailyNote } from "@/lib/types";
import { EMOTIONS, MARKET_TRENDS } from "@/lib/constants";
import { saveNote, type ActionState } from "@/app/(app)/notes/actions";
import { useFormSuccessFlash } from "@/lib/useFormSuccessFlash";
import { Spinner } from "@/components/Spinner";

export function LinkedDailyNote({ date, note }: { date: string; note: DailyNote | null }) {
  const [editing, setEditing] = useState(!note);
  const [state, formAction] = useFormState<ActionState, FormData>(saveNote, { error: null });
  const savedFlash = useFormSuccessFlash(state, () => setEditing(false));

  const mood = note ? EMOTIONS.find((e) => e.value === note.mood) : null;
  const trend = note ? MARKET_TRENDS.find((t) => t.value === note.market_trend) : null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-100">
          📝 Nhật ký ngày {new Date(date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
        </h3>
        {note && !editing && (
          <button className="btn-ghost text-xs" onClick={() => setEditing(true)}>
            ✏️ Sửa
          </button>
        )}
      </div>

      {!editing && note ? (
        <div>
          <div className="flex gap-2 mb-2">
            {mood && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{mood.icon} {mood.label}</span>}
            {trend && <span className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-muted">{trend.label}</span>}
          </div>
          {note.content ? (
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{note.content}</p>
          ) : (
            <p className="text-sm text-muted">Chưa có ghi chú nội dung.</p>
          )}
        </div>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="note_date" value={date} />
          <p className="text-xs text-muted">
            Chưa có nhật ký cho ngày này. Ghi nhanh cảm xúc/nhận định thị trường ngay tại đây — sẽ tự động liên kết
            với ngày của lệnh vừa journal, hoặc xem đầy đủ ở{" "}
            <Link href="/notes" className="text-primary hover:underline">
              trang Nhật ký ngày
            </Link>
            .
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="linked-mood">Tâm trạng chính</label>
              <select id="linked-mood" name="mood" defaultValue={note?.mood ?? "Calm"} className="w-full">
                {EMOTIONS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.icon} {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="linked-trend">Xu hướng thị trường</label>
              <select id="linked-trend" name="market_trend" defaultValue={note?.market_trend ?? "Sideways"} className="w-full">
                {MARKET_TRENDS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            name="content"
            rows={3}
            defaultValue={note?.content ?? ""}
            placeholder="Hôm nay giao dịch thế nào? Có mắc lỗi tâm lý gì không?"
            className="w-full"
          />
          {state.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>}
          <div className="flex gap-2">
            <SubmitButton />
            {note && (
              <button type="button" className="btn-secondary text-sm" onClick={() => setEditing(false)}>
                Hủy
              </button>
            )}
          </div>
        </form>
      )}
      {savedFlash && <p className="text-sm text-profit mt-2">✓ Đã lưu nhật ký ngày</p>}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary text-sm" disabled={pending}>
      {pending && <Spinner />}
      {pending ? "Đang lưu..." : "Lưu Nhật ký ngày"}
    </button>
  );
}
