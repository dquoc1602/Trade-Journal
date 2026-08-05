"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateDisplayName, updatePassword, type ActionState } from "@/app/(app)/profile/actions";
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

export function ProfileManager({ email, displayName, createdAt }: { email: string; displayName: string; createdAt: string }) {
  const [nameState, nameAction] = useFormState<ActionState, FormData>(updateDisplayName, { error: null });
  const nameFlash = useFormSuccessFlash(nameState);

  const [pwState, pwAction] = useFormState<ActionState, FormData>(updatePassword, { error: null });
  const pwFormRef = useRef<HTMLFormElement>(null);
  const pwFlash = useFormSuccessFlash(pwState, () => pwFormRef.current?.reset());

  return (
    <div className="max-w-xl space-y-6">
      <div className="card space-y-4">
        <h3 className="font-semibold text-slate-100">Thông tin tài khoản</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted">Email đăng nhập</div>
            <div className="text-slate-100 mt-0.5">{email}</div>
          </div>
          {createdAt && (
            <div>
              <div className="text-xs text-muted">Tạo tài khoản lúc</div>
              <div className="text-slate-100 mt-0.5">{new Date(createdAt).toLocaleDateString("vi-VN")}</div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted">Đổi email đăng nhập chưa hỗ trợ ở bản này.</p>
      </div>

      <form action={nameAction} className="card space-y-4">
        <h3 className="font-semibold text-slate-100">Tên hiển thị</h3>
        <div>
          <label htmlFor="display_name">Tên hiển thị</label>
          <input id="display_name" name="display_name" maxLength={100} defaultValue={displayName} placeholder="VD: Minh" className="w-full" />
        </div>
        {nameState.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{nameState.error}</p>}
        {nameFlash && <p className="text-sm text-profit bg-profit/10 border border-profit/30 rounded-md px-3 py-2">✓ Đã lưu thay đổi</p>}
        <SubmitButton label="Lưu tên hiển thị" pendingLabel="Đang lưu..." />
      </form>

      <form ref={pwFormRef} action={pwAction} className="card space-y-4">
        <h3 className="font-semibold text-slate-100">Đổi mật khẩu</h3>
        <div>
          <label htmlFor="current_password">Mật khẩu hiện tại</label>
          <input id="current_password" name="current_password" type="password" required autoComplete="current-password" className="w-full" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="new_password">Mật khẩu mới</label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="confirm_password">Nhập lại mật khẩu mới</label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full"
            />
          </div>
        </div>
        {pwState.error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{pwState.error}</p>}
        {pwFlash && <p className="text-sm text-profit bg-profit/10 border border-profit/30 rounded-md px-3 py-2">✓ Đã đổi mật khẩu thành công</p>}
        <SubmitButton label="Đổi mật khẩu" pendingLabel="Đang xử lý..." />
      </form>
    </div>
  );
}
