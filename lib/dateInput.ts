/**
 * Ô nhập giờ trong app dùng TEXT tự do (không phải input datetime-local) để người dùng
 * dán thẳng timestamp copy từ platform giao dịch (MT5/BlackArrow/TopstepX...), ví dụ:
 * "2026-08-05 20:32:44.855". Regex bên dưới chấp nhận vài biến thể thường gặp (có/không
 * giây, có/không mili-giây, phân cách bằng dấu cách hoặc "T") rồi dựng Date bằng
 * constructor theo THÀNH PHẦN (new Date(y, m, d, h, mi, s, ms)) — constructor này luôn
 * được trình duyệt hiểu là giờ ĐỊA PHƯƠNG, nhất quán với cách datetime-local hoạt động
 * trước đây, tránh việc dựa vào cách parse chuỗi tự do (engine-specific) của new Date(string).
 */
const FLEXIBLE_DATETIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:[.,](\d{1,3}))?\s*$/;

export function parseFlexibleDateTime(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const m = FLEXIBLE_DATETIME_RE.exec(trimmed);
  if (!m) return null;

  const [, yStr, moStr, dStr, hStr, miStr, sStr, msStr] = m;
  const year = Number(yStr);
  const month = Number(moStr);
  const day = Number(dStr);
  const hour = Number(hStr);
  const minute = Number(miStr);
  const second = sStr ? Number(sStr) : 0;
  const ms = msStr ? Number(msStr.padEnd(3, "0")) : 0;

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;

  const d = new Date(year, month - 1, day, hour, minute, second, ms);
  // Validate ngược lại phòng trường hợp ngày không tồn tại (VD 2026-02-30) — Date sẽ tự "tràn" sang tháng sau.
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;

  return d;
}

export function parseFlexibleDateTimeToIso(raw: string): string | null {
  const d = parseFlexibleDateTime(raw);
  return d ? d.toISOString() : null;
}

/** Format 1 Date/ISO string thành text để hiển thị/prefill trong ô nhập, theo giờ địa phương trình duyệt. */
export function formatDateTimeForInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export const DATETIME_INPUT_PLACEHOLDER = "YYYY-MM-DD HH:MM:SS.mmm (VD: 2026-08-05 20:32:44.855)";
