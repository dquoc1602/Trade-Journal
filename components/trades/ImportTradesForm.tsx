"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TradingAccount, Strategy } from "@/lib/types";
import { CSV_TEMPLATE_EXAMPLE, parseCsvText, validateCsvRow, type CsvParsedRow } from "@/lib/csvImport";
import { bulkImportTrades, type BulkImportRow } from "@/app/(app)/trades/actions";
import { Spinner } from "@/components/Spinner";
import { parseFlexibleDateTimeToIso } from "@/lib/dateInput";

export function ImportTradesForm({ accounts, strategies }: { accounts: TradingAccount[]; strategies: Strategy[] }) {
  const router = useRouter();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [strategyId, setStrategyId] = useState("");
  const [csvText, setCsvText] = useState("");
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rows: CsvParsedRow[] = useMemo(() => {
    if (!csvText.trim()) {
      setHeaderError(null);
      return [];
    }
    const { rows, headerError } = parseCsvText(csvText);
    setHeaderError(headerError);
    return rows.map((r) => ({ ...r, error: validateCsvRow(r) }));
  }, [csvText]);

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    setResult(null);
  }

  async function handleImport() {
    if (!accountId || validRows.length === 0) return;
    setSubmitting(true);
    setResult(null);

    // Quy đổi open_time/close_time sang ISO UTC NGAY TẠI TRÌNH DUYỆT (giống TradeForm) — nếu để server
    // tự new Date() thì sẽ bị hiểu theo giờ server (UTC trên Vercel), sai lệch so với giờ VN người dùng nhập.
    const payload: BulkImportRow[] = validRows.map((r) => ({
      symbol: r.symbol,
      side: r.side,
      volume: Number(r.volume),
      open_price: Number(r.open_price),
      close_price: r.close_price.trim() ? Number(r.close_price) : null,
      open_time: parseFlexibleDateTimeToIso(r.open_time)!,
      close_time: r.close_time.trim() ? parseFlexibleDateTimeToIso(r.close_time) : null,
      gross_profit: r.gross_profit.trim() ? Number(r.gross_profit) : 0,
      commission: r.commission.trim() ? Number(r.commission) : 0,
      swap: r.swap.trim() ? Number(r.swap) : 0,
      emotion: r.emotion.trim() || null,
      rr_ratio: r.rr_ratio.trim() ? Number(r.rr_ratio) : null,
      notes: r.notes.trim() || null,
    }));

    const res = await bulkImportTrades(accountId, strategyId || null, payload);
    setSubmitting(false);

    if (res.error) {
      setResult({ ok: false, message: res.error });
    } else {
      setResult({ ok: true, message: `Đã nhập thành công ${res.insertedCount} lệnh.` });
      setCsvText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="import-account">Tài khoản giao dịch *</label>
            <select id="import-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_type === "prop_firm" ? "🏆" : "📈"} {a.name}
                  {a.is_disabled ? " (Đã Disabled)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted mt-1">Toàn bộ lệnh nhập vào đợt này sẽ gắn vào tài khoản đã chọn.</p>
          </div>
          <div>
            <label htmlFor="import-strategy">Gán chiến lược cho tất cả (tuỳ chọn)</label>
            <select id="import-strategy" value={strategyId} onChange={(e) => setStrategyId(e.target.value)} className="w-full">
              <option value="">-- Không gán --</option>
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="import-file">Tải lên file CSV</label>
          <input ref={fileInputRef} id="import-file" type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="w-full" />
        </div>

        <div>
          <label htmlFor="import-textarea">Hoặc dán nội dung CSV trực tiếp</label>
          <textarea
            id="import-textarea"
            rows={8}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setResult(null);
            }}
            placeholder={CSV_TEMPLATE_EXAMPLE}
            className="w-full font-mono text-xs"
          />
        </div>

        <details className="text-xs text-muted">
          <summary className="cursor-pointer select-none">Xem mẫu định dạng CSV chuẩn</summary>
          <pre className="mt-2 bg-surface2 rounded-md p-3 overflow-x-auto whitespace-pre">{CSV_TEMPLATE_EXAMPLE}</pre>
          <ul className="list-disc list-inside mt-2 space-y-0.5">
            <li>Cột bắt buộc: <code>symbol, side, volume, open_price, open_time</code></li>
            <li>
              Thời gian dùng định dạng <code>YYYY-MM-DD HH:MM:SS.mmm</code> (giây/mili-giây tuỳ chọn) theo giờ địa
              phương máy bạn — dán thẳng được từ platform.
            </li>
            <li>Cần điền đủ cả <code>close_price</code> + <code>close_time</code>, hoặc để trống cả hai (lệnh đang chạy).</li>
            <li><code>emotion</code> (nếu có) phải là 1 trong: Calm, Focused, Confident, Neutral, Anxious, Fear, FOMO, Greedy, Revenge.</li>
          </ul>
        </details>
      </div>

      {headerError && <div className="card text-sm text-loss">{headerError}</div>}

      {rows.length > 0 && !headerError && (
        <div className="card">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-semibold text-slate-100">
              Xem trước: <span className="text-profit">{validRows.length} hợp lệ</span>
              {invalidRows.length > 0 && <span className="text-loss"> · {invalidRows.length} lỗi</span>}
            </h3>
            <button className="btn-primary" disabled={submitting || validRows.length === 0 || !accountId} onClick={handleImport}>
              {submitting && <Spinner />}
              {submitting ? "Đang nhập..." : `Nhập ${validRows.length} lệnh hợp lệ`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Symbol</th>
                  <th>Loại</th>
                  <th>KL</th>
                  <th>Giá mở</th>
                  <th>Giá đóng</th>
                  <th>Thời gian mở</th>
                  <th>P&L thô</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.index} className={r.error ? "bg-loss/5" : ""}>
                    <td className="text-xs text-muted">{r.index + 1}</td>
                    <td>{r.symbol || "—"}</td>
                    <td>{r.side || "—"}</td>
                    <td>{r.volume || "—"}</td>
                    <td className="text-xs">{r.open_price || "—"}</td>
                    <td className="text-xs">{r.close_price || "—"}</td>
                    <td className="text-xs whitespace-nowrap">{r.open_time || "—"}</td>
                    <td className="text-xs">{r.gross_profit || "0"}</td>
                    <td className="text-xs">
                      {r.error ? <span className="text-loss">✗ {r.error}</span> : <span className="text-profit">✓ Hợp lệ</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className={`card text-sm ${result.ok ? "text-profit" : "text-loss"}`}>
          {result.ok ? "✓ " : "✗ "}
          {result.message}
        </div>
      )}
    </div>
  );
}
