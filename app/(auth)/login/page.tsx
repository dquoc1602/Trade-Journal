"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "../actions";
import { APP_NAME } from "@/lib/constants";
import { Spinner } from "@/components/Spinner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending && <Spinner />}
      {pending ? "Đang đăng nhập..." : "Đăng Nhập"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, { error: null });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">{APP_NAME}</h1>
          <p className="text-sm text-muted mt-1">Đăng nhập để xem nhật ký giao dịch</p>
        </div>

        <form action={formAction} className="card space-y-4">
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="you@example.com" className="w-full" />
          </div>
          <div>
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" required placeholder="••••••••" className="w-full" />
          </div>

          {state.error && (
            <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-md px-3 py-2">{state.error}</p>
          )}

          <SubmitButton />
        </form>

        <p className="text-center text-sm text-muted mt-4">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
