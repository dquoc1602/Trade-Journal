"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/Spinner";

const RANGES = [
  { value: "", label: "Toàn bộ thời gian" },
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "month", label: "Tháng này" },
  { value: "90d", label: "90 ngày qua" },
];

export function AccountRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setRange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("range", value);
    else params.delete("range");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {isPending && <Spinner />}
      <select value={searchParams.get("range") ?? ""} disabled={isPending} onChange={(e) => setRange(e.target.value)} className="w-full sm:w-48">
        {RANGES.map((r) => (
          <option key={r.value} value={r.value}>
            ⏱️ {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
