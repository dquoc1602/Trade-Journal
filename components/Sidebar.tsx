"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { APP_NAME } from "@/lib/constants";
import { logout } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/trades", label: "Lịch sử lệnh", icon: "📋" },
  { href: "/calendar", label: "Lịch giao dịch", icon: "📅" },
  { href: "/strategies", label: "Chiến lược", icon: "🎯" },
  { href: "/notes", label: "Nhật ký ngày", icon: "📝" },
  { href: "/accounts", label: "Tài khoản giao dịch", icon: "🏦" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="text-lg font-bold text-slate-100">
          {APP_NAME}
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/15 text-primary" : "text-muted hover:text-slate-100 hover:bg-surface2"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 py-2 text-xs text-muted truncate" title={email}>
          {email}
        </div>
        <form action={logout}>
          <button type="submit" className="btn-ghost w-full justify-start px-3">
            🚪 Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
