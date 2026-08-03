"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { register } from "../actions";
import { APP_NAME } from "@/lib/constants";
import { Spinner } from "@/components/Spinner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending && <Spinner />}
      {pending ? "Đang tạo tài khoản..." : "Đăng Ký Tài Khoản"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, { error: null });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">{APP_NAME}</h1>
          <p className="text-sm text-muted mt-1">Tạo tài khoản nhật ký giao dịch của riêng bạn</p>
        </div>

        <form action={formAction} className="card space-y-4">
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="you@example.com" className="w-full" />
          </div>
          <div>
            <label htmlFor="password">Mật khẩu (tối thiểu 6 ký tự)</label>
            <input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" className="w-full" />
          </div>
          <div>
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} placeholder="••••••••" className="w-full" />
          </div>

          {state.error && (
            <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>
          )}

          <SubmitButton />
        </form>

        <p className="text-center text-sm text-muted mt-4">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
