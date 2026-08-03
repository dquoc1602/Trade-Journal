import { EMOTIONS, TRADE_SIDES } from "@/lib/constants";

export const CSV_TEMPLATE_HEADERS = [
  "symbol",
  "side",
  "volume",
  "open_price",
  "close_price",
  "open_time",
  "close_time",
  "gross_profit",
  "commission",
  "swap",
  "emotion",
  "rr_ratio",
  "notes",
] as const;

export const CSV_TEMPLATE_EXAMPLE = `symbol,side,volume,open_price,close_price,open_time,close_time,gross_profit,commission,swap,emotion,rr_ratio,notes
EURUSD,BUY,1,1.0850,1.0900,2026-07-01 14:30,2026-07-01 16:00,500,-7,-1.5,Confident,2.5,Theo đúng kế hoạch
XAUUSD,SELL,0.5,2410.00,2399.50,2026-07-02 09:15,2026-07-02 10:45,525,-6,0,Calm,3,`;

export type CsvParsedRow = {
  index: number;
  raw: Record<string, string>;
  symbol: string;
  side: string;
  volume: string;
  open_price: string;
  close_price: string;
  open_time: string;
  close_time: string;
  gross_profit: string;
  commission: string;
  swap: string;
  emotion: string;
  rr_ratio: string;
  notes: string;
  error: string | null;
};

/** Tách 1 dòng CSV thành mảng field, có hỗ trợ field bọc trong dấu ngoặc kép (chứa dấu phẩy/ngoặc kép escape). */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === "," || ch === "\t") {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

export function parseCsvText(text: string): { rows: CsvParsedRow[]; headerError: string | null } {
  const lines = text
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { rows: [], headerError: "File/nội dung trống." };

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const required = ["symbol", "side", "volume", "open_price", "open_time"];
  const missing = required.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return { rows: [], headerError: `Thiếu cột bắt buộc: ${missing.join(", ")}` };
  }

  const dataLines = lines.slice(1);
  const rows: CsvParsedRow[] = dataLines.map((line, idx) => {
    const values = splitCsvLine(line);
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => (raw[h] = values[i] ?? ""));

    return {
      index: idx,
      raw,
      symbol: (raw.symbol ?? "").toUpperCase(),
      side: (raw.side ?? "").toUpperCase(),
      volume: raw.volume ?? "",
      open_price: raw.open_price ?? "",
      close_price: raw.close_price ?? "",
      open_time: raw.open_time ?? "",
      close_time: raw.close_time ?? "",
      gross_profit: raw.gross_profit ?? "",
      commission: raw.commission ?? "",
      swap: raw.swap ?? "",
      emotion: raw.emotion ?? "",
      rr_ratio: raw.rr_ratio ?? "",
      notes: raw.notes ?? "",
      error: null,
    };
  });

  return { rows, headerError: null };
}

/** Validate 1 dòng đã parse — dùng cả ở preview phía client lẫn tham chiếu logic ở server action. */
export function validateCsvRow(row: CsvParsedRow): string | null {
  if (!row.symbol) return "Thiếu symbol";
  if (row.symbol.length > 20) return "Symbol quá dài (tối đa 20 ký tự)";
  if (!TRADE_SIDES.includes(row.side as (typeof TRADE_SIDES)[number])) return "side phải là BUY hoặc SELL";

  const volume = Number(row.volume);
  if (!row.volume || Number.isNaN(volume) || volume <= 0) return "volume không hợp lệ (phải > 0)";

  const openPrice = Number(row.open_price);
  if (!row.open_price || Number.isNaN(openPrice) || openPrice < 0) return "open_price không hợp lệ";

  if (!row.open_time) return "Thiếu open_time";
  const openMs = new Date(row.open_time).getTime();
  if (Number.isNaN(openMs)) return "open_time không đọc được (dùng định dạng YYYY-MM-DD HH:MM)";

  const hasClosePrice = row.close_price.trim() !== "";
  const hasCloseTime = row.close_time.trim() !== "";
  if (hasClosePrice !== hasCloseTime) return "Cần điền đủ cả close_price và close_time, hoặc để trống cả hai";

  if (hasClosePrice) {
    const closePrice = Number(row.close_price);
    if (Number.isNaN(closePrice) || closePrice < 0) return "close_price không hợp lệ";
    const closeMs = new Date(row.close_time).getTime();
    if (Number.isNaN(closeMs)) return "close_time không đọc được";
    if (closeMs < openMs) return "close_time phải sau open_time";
  }

  if (row.gross_profit && Number.isNaN(Number(row.gross_profit))) return "gross_profit không hợp lệ";
  if (row.commission && Number.isNaN(Number(row.commission))) return "commission không hợp lệ";
  if (row.swap && Number.isNaN(Number(row.swap))) return "swap không hợp lệ";
  if (row.rr_ratio && (Number.isNaN(Number(row.rr_ratio)) || Number(row.rr_ratio) < 0)) return "rr_ratio không hợp lệ";

  if (row.emotion && !EMOTIONS.some((e) => e.value.toLowerCase() === row.emotion.toLowerCase())) {
    return `emotion không hợp lệ (chấp nhận: ${EMOTIONS.map((e) => e.value).join(", ")})`;
  }

  if (row.notes && row.notes.length > 5000) return "notes quá dài (tối đa 5000 ký tự)";

  return null;
}
