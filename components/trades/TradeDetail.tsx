"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Trade, TradingAccount, Strategy, StrategyRule } from "@/lib/types";
import { emotionMeta } from "@/lib/constants";
import { formatCurrency } from "@/lib/analytics";
import { deleteTrade } from "@/app/(app)/trades/actions";
import { TradeForm } from "./TradeForm";
import { ChecklistEditor } from "./ChecklistEditor";
import { Spinner } from "@/components/Spinner";

export function TradeDetail({
  trade,
  accounts,
  strategies,
  strategyRules,
  checkedMap,
}: {
  trade: Trade;
  accounts: TradingAccount[];
  strategies: Strategy[];
  strategyRules: StrategyRule[];
  checkedMap: Record<string, boolean>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Nút xóa đã "vũ trang" (chờ bấm lần 2) sẽ tự tắt sau vài giây để tránh trường hợp
  // người dùng lỡ tay bấm trúng lần 2 sau khi đã rời mắt khỏi màn hình.
  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 4000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  async function handleDelete() {
    setDeleting(true);
    await deleteTrade(trade.id);
    router.push("/trades");
  }

  if (editing) {
    return (
      <div>
        <button type="button" onClick={() => router.back()} className="btn-ghost text-xs mb-3">
          ← Quay lại
        </button>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Chỉnh sửa lệnh {trade.symbol}</h2>
        <TradeForm
          trade={trade}
          accounts={accounts}
          strategies={strategies}
          onCancel={() => setEditing(false)}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  const emotion = emotionMeta(trade.emotion);

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => router.back()} className="btn-ghost text-xs -mb-2">
        ← Quay lại
      </button>
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">{trade.symbol}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trade.side === "BUY" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                {trade.side}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-muted">{trade.status}</span>
            </div>
            <div className="text-xs text-muted mt-1">
              Nguồn: {trade.trading_accounts?.name ?? "—"} · Tạo lúc {new Date(trade.created_at).toLocaleString("vi-VN")}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted uppercase">Lợi nhuận ròng</div>
            <div className={`text-2xl font-bold ${trade.pnl >= 0 ? "text-profit" : "text-loss"}`}>{formatCurrency(trade.pnl)}</div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="btn-secondary"
            onClick={() => {
              setConfirmDelete(false);
              setEditing(true);
            }}
          >
            ✏️ Chỉnh sửa lệnh
          </button>
          {confirmDelete ? (
            <button className="btn-danger" disabled={deleting} onClick={handleDelete}>
              {deleting && <Spinner tone="danger" className="mr-1.5" />}
              {deleting ? "Đang xóa..." : "Xác nhận xóa lệnh này?"}
            </button>
          ) : (
            <button className="btn-ghost text-loss" onClick={() => setConfirmDelete(true)}>
              🗑️ Xóa lệnh
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-100">Thông tin giao dịch</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Khối lượng</dt>
              <dd>{trade.volume} Lots</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">R:R</dt>
              <dd>{trade.rr_ratio ? `1:${trade.rr_ratio}` : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Giá mở</dt>
              <dd>{trade.open_price}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Giá đóng</dt>
              <dd>{trade.close_price ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Thời gian mở</dt>
              <dd>{new Date(trade.open_time).toLocaleString("vi-VN")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Thời gian đóng</dt>
              <dd>{trade.close_time ? new Date(trade.close_time).toLocaleString("vi-VN") : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Phí hoa hồng</dt>
              <dd>{formatCurrency(trade.commission)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Phí qua đêm (Swap)</dt>
              <dd>{formatCurrency(trade.swap)}</dd>
            </div>
          </dl>
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-100">Tâm lý & Chiến lược</h3>
          <div>
            <div className="text-xs text-muted mb-1">Trạng thái tâm lý lúc giao dịch</div>
            <div className="text-sm font-medium text-slate-100">
              {emotion ? `${emotion.icon} ${emotion.label}` : "Chưa gán"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Chiến lược gán</div>
            <div className="text-sm font-medium text-slate-100">{trade.strategies?.name ?? "Chưa gán chiến lược"}</div>
          </div>
          {trade.screenshot_url && (
            <div>
              <div className="text-xs text-muted mb-1">Ảnh chụp phân tích</div>
              <a href={trade.screenshot_url} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline break-all">
                {trade.screenshot_url}
              </a>
            </div>
          )}
          {trade.notes && (
            <div>
              <div className="text-xs text-muted mb-1">Ghi chú phân tích</div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}
        </div>
      </div>

      {trade.strategy_id && strategyRules.length > 0 ? (
        <ChecklistEditor tradeId={trade.id} rules={strategyRules} initialChecked={checkedMap} />
      ) : (
        <div className="card text-sm text-muted">
          {trade.strategy_id ? "Chiến lược này chưa có quy tắc checklist nào." : "Gán chiến lược ở form chỉnh sửa để mở checklist kỷ luật."}
        </div>
      )}
    </div>
  );
}
