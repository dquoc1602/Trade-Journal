"use client";

import { useMemo, useState } from "react";
import { ICT_CATEGORIES, ICT_CONCEPTS, type IctConcept } from "@/lib/ictKnowledge";

export function KnowledgeBrowser() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ICT_CONCEPTS.filter((c) => {
      if (activeCategory && c.category !== activeCategory) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.shortName?.toLowerCase().includes(q) ?? false) ||
        c.summary.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, IctConcept[]>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm khái niệm... (VD: FVG, Silver Bullet, thanh khoản...)"
          className="w-full"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === null ? "bg-primary/15 border-primary text-primary" : "border-border text-muted hover:text-slate-100"
            }`}
          >
            Tất cả ({ICT_CONCEPTS.length})
          </button>
          {ICT_CATEGORIES.map((cat) => {
            const count = ICT_CONCEPTS.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat ? "bg-primary/15 border-primary text-primary" : "border-border text-muted hover:text-slate-100"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && <div className="card text-sm text-muted">Không tìm thấy khái niệm nào khớp.</div>}

      {Array.from(grouped.entries()).map(([category, concepts]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">{category}</h3>
          <div className="space-y-2">
            {concepts.map((c) => {
              const expanded = expandedId === c.id;
              return (
                <div key={c.id} className="card !p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expanded ? null : c.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface2/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-slate-100">{c.name}</span>
                      {c.shortName && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-surface2 text-muted align-middle">
                          {c.shortName}
                        </span>
                      )}
                      <p className="text-xs text-muted mt-0.5 truncate">{c.summary}</p>
                    </div>
                    <span className={`text-muted shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
                  </button>
                  {expanded && (
                    <div className="px-4 pb-4 text-sm text-slate-300 leading-relaxed border-t border-border pt-3">{c.description}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
