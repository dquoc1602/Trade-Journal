"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { EquityPoint } from "@/lib/analytics";

export function EquityChart({ points }: { points: EquityPoint[] }) {
  if (points.length === 0) {
    return <div className="text-sm text-muted h-64 flex items-center justify-center">Chưa có lệnh đã đóng để vẽ biểu đồ.</div>;
  }

  const data = points.map((p, i) => ({
    index: i,
    date: new Date(p.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    cumulative: Number(p.cumulative.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f7cff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#4f7cff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#243043" />
        <XAxis dataKey="date" stroke="#8592a6" fontSize={12} tickLine={false} />
        <YAxis stroke="#8592a6" fontSize={12} tickLine={false} width={70} />
        <Tooltip
          contentStyle={{ background: "#121821", border: "1px solid #243043", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#8592a6" }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Lũy kế"]}
        />
        <Area type="monotone" dataKey="cumulative" stroke="#4f7cff" strokeWidth={2} fill="url(#equityFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
