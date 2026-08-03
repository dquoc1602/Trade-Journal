import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} — Nhật ký giao dịch kỷ luật`,
  description: "Nhật ký giao dịch cá nhân: theo dõi hiệu suất, chấm điểm kỷ luật theo chiến lược, phân tích tâm lý.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body>{children}</body>
    </html>
  );
}
