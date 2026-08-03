"use client";

import { useEffect, useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Đóng menu mobile mỗi khi chuyển trang, tránh việc bấm 1 link xong vẫn còn che nội dung.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Khóa scroll nền khi drawer mobile đang mở.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Thanh trên cùng chỉ hiện ở màn hình nhỏ (< md) */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border bg-surface">
        <Link href="/" className="text-lg font-bold text-slate-100">
          {APP_NAME}
        </Link>
        <button
          type="button"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 -mr-2 text-slate-100"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Lớp phủ nền tối khi drawer mobile mở */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "w-64 shrink-0 border-r border-border bg-surface flex flex-col",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out",
          "md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="hidden md:block px-5 py-5 border-b border-border">
          <Link href="/" className="text-lg font-bold text-slate-100">
            {APP_NAME}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
    </>
  );
}
