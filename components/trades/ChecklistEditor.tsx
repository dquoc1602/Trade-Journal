"use client";

import { useState, useTransition } from "react";
import type { StrategyRule } from "@/lib/types";
import { toggleRuleCheck } from "@/app/(app)/trades/actions";

export function ChecklistEditor({
  tradeId,
  rules,
  initialChecked,
}: {
  tradeId: string;
  rules: StrategyRule[];
  initialChecked: Record<string, boolean>;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked);
  const [isPending, startTransition] = useTransition();

  const sortedRules = rules.slice().sort((a, b) => a.position - b.position);
  const checkedCount = sortedRules.filter((r) => checked[r.id]).length;
  const compliance = sortedRules.length ? Math.round((checkedCount / sortedRules.length) * 100) : 0;

  function toggle(ruleId: string) {
    const next = !checked[ruleId];
    setChecked((prev) => ({ ...prev, [ruleId]: next }));
    startTransition(() => {
      toggleRuleCheck(tradeId, ruleId, next);
    });
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-100">Checklist kỷ luật chiến lược</h3>
        <span className={`text-sm font-bold ${compliance === 100 ? "text-profit" : "text-slate-100"}`}>
          Tuân thủ: {compliance}% ({checkedCount}/{sortedRules.length})
        </span>
      </div>
      <p className="text-xs text-muted mb-3">Bấm vào từng quy tắc để bật/tắt trạng thái tuân thủ.</p>
      <ul className="space-y-2">
        {sortedRules.map((rule, idx) => (
          <li key={rule.id}>
            <button
              type="button"
              disabled={isPending}
              onClick={() => toggle(rule.id)}
              className="w-full flex items-start gap-3 text-left text-sm rounded-md px-3 py-2 hover:bg-surface2 transition-colors"
            >
              <span className={checked[rule.id] ? "text-profit" : "text-muted"}>{checked[rule.id] ? "✓" : "○"}</span>
              <span className={checked[rule.id] ? "text-slate-100" : "text-muted"}>
                {idx + 1}. {rule.content}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
