"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { BalancePoint } from "@/lib/analytics";

export function AccountBalanceChart({ points }: { points: BalancePoint[] }) {
  if (points.length === 0) {
    return <div className="text-sm text-muted h-64 flex items-center justify-center">Chưa có dữ liệu số dư trong khoảng thời gian này.</div>;
  }

  const data = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    balance: Number(p.balance.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#243043" />
        <XAxis dataKey="date" stroke="#8592a6" fontSize={12} tickLine={false} />
        <YAxis stroke="#8592a6" fontSize={12} tickLine={false} width={80} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{ background: "#121821", border: "1px solid #243043", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#8592a6" }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Số dư"]}
        />
        <Line type="monotone" dataKey="balance" stroke="#4f7cff" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
