"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={rootRef} className="relative px-3 py-3 border-t border-border">
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
          <div className="px-3 py-2 text-xs text-muted truncate border-b border-border" title={email}>
            {email}
          </div>
          <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-100 hover:bg-surface2 transition-colors">
            👤 Hồ sơ cá nhân
          </Link>
          <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-100 hover:bg-surface2 transition-colors">
            ⚙️ Cài đặt
          </Link>
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-muted mb-1.5">Giao diện</div>
            <div className="flex gap-1.5">
              <button
                type="button"
                className="flex-1 text-xs px-2 py-1.5 rounded-md bg-primary/15 text-primary font-medium"
                aria-pressed="true"
              >
                🌙 Tối
              </button>
              <button
                type="button"
                disabled
                title="Sắp ra mắt"
                className="flex-1 text-xs px-2 py-1.5 rounded-md bg-surface2 text-muted cursor-not-allowed"
              >
                ☀️ Sáng
              </button>
            </div>
          </div>
          <form action={logout} className="border-t border-border">
            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-loss hover:bg-surface2 transition-colors">
              🚪 Đăng xuất
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 hover:bg-surface2 transition-colors"
      >
        <span className="text-sm text-slate-100 truncate" title={email}>
          {email}
        </span>
        <span className={`text-muted text-xs shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>▲</span>
      </button>
    </div>
  );
}
