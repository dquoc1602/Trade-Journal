# Cơ chế kết nối nền tảng giao dịch (Auto-Sync)

> Tài liệu này mô tả **kiến trúc/cơ chế kỹ thuật chung** quan sát được qua trang Cài đặt của sản phẩm tham khảo. Không sao chép token bí mật hay mã nguồn thật — chỉ mô tả lại nguyên lý hoạt động để bạn tự triển khai bản của mình.

## Nguyên tắc chung cho mọi kết nối

- Mỗi user có 1 **Sync Token** riêng (chuỗi bí mật dạng UUID) — dùng để xác thực dữ liệu gửi lên từ xa (EA/Bookmarklet) mà không cần đăng nhập lại.
- Endpoint nhận dữ liệu theo pattern `POST /api/sync/{platform}` (ví dụ `/api/sync/mt5`) — mỗi platform có 1 webhook riêng.
- Cam kết cốt lõi với người dùng (nhắc lại nhiều lần trong FAQ gốc): cơ chế **chỉ đọc (read-only)** — chỉ nhận dữ liệu lịch sử lệnh, không có chiều ngược lại để đặt lệnh/rút tiền. Đây là yếu tố tin cậy quan trọng nhất, **bắt buộc giữ đúng** khi bạn tự triển khai.

## 1. MT5 — Robot EA (Expert Advisor) + Webhook

**Luồng cài đặt (4 bước) quan sát được**:
1. Người dùng tải file EA (`.mq5`) do sản phẩm cung cấp, copy vào thư mục `MQL5/Experts` của MT5 (qua File → Open Data Folder).
2. Mở MetaEditor (F4), Compile file EA (F7) → sinh ra `.ex5` chạy được.
3. Trong MT5: Tools → Options → tab Expert Advisors → bật "Allow WebRequest for listed URL" → thêm domain của app vào whitelist (bắt buộc, MT5 chặn mọi HTTP request ra ngoài domain chưa whitelist).
4. Kéo EA vào 1 chart bất kỳ → tab Inputs → nhập 2 tham số: **Sync Token** (định danh user) + **Webhook URL** (endpoint nhận dữ liệu).

**Cơ chế hoạt động phía EA**: EA lắng nghe sự kiện `OnTradeTransaction`/`OnTimer` trong MT5, khi phát hiện lệnh vừa khớp mở hoặc đóng → đóng gói dữ liệu lệnh (symbol, volume, giá, thời gian, commission, swap, ticket ID) thành JSON → gọi hàm `WebRequest()` POST lên webhook kèm Sync Token trong header/body để backend xác thực & gán đúng user.

**Điều kiện tiên quyết**: MT5 (hoặc VPS chạy MT5) phải đang mở để EA chạy nền — đây là lý do FAQ gốc khuyên dùng VPS cho tài khoản Quỹ cần theo dõi 24/5.

## 2. TradingView — Bookmarklet (Trích xuất lịch sử qua DOM)

Đây là kỹ thuật khác hẳn MT5 — vì TradingView không cho API công khai để lấy lịch sử lệnh của broker tích hợp, sản phẩm dùng **bookmarklet** (đoạn JavaScript chạy ngay trong tab trình duyệt của người dùng, dưới quyền của chính họ):

**Luồng cài đặt (3 bước)**:
1. Người dùng kéo 1 nút (chứa link dạng `javascript:(function(){...})()`) thả vào thanh Bookmark của trình duyệt.
2. Mở tradingview.com → mở Trading Panel của broker đang kết nối → chuyển tab "History" → chọn khoảng thời gian.
3. Bấm bookmarklet đã lưu → script chạy ngay trong ngữ cảnh trang TradingView hiện tại.

**Cơ chế hoạt động** (đọc được từ mã bookmarklet dự phòng hiển thị công khai trên trang):
```
javascript:(function(){
  window.HocictSyncToken = "<token của user>";
  window.HocictScriptOrigin = "https://journal.hocict.com";
  fetch("https://journal.hocict.com/tv-importer.js?v=" + Date.now())
    .then(r => r.text())
    .then(code => {
      const blob = new Blob([code], {type: "application/javascript"});
      const s = document.createElement("script");
      s.src = URL.createObjectURL(blob);
      document.head.appendChild(s);
    });
})()
```
Cơ chế: bookmarklet chỉ làm 2 việc — (1) gán token + origin vào biến global trên trang TradingView, (2) tải về một script phụ (`tv-importer.js`) lưu trên server của sản phẩm rồi tiêm (inject) vào trang. Script phụ này mới thực sự **đọc bảng "History" hiển thị trên DOM** (đọc trực tiếp các dòng `<tr>` của bảng lịch sử lệnh mà TradingView tự vẽ ra), gom thành JSON, rồi `fetch POST` thẳng lên backend kèm token.

**Ưu điểm cách làm này**: không cần TradingView cấp API chính thức, hoạt động với bất kỳ broker nào tích hợp Trading Panel trên TradingView. **Nhược điểm**: dễ vỡ nếu TradingView đổi cấu trúc DOM/class name của bảng History — cần bảo trì script định kỳ.

## 3. cTrader — OAuth 2.0 (Spotware Open API chính thức)

Đây là kết nối "sạch" nhất vì Spotware (chủ sở hữu cTrader) có cung cấp **Open API chính thức**:

- Người dùng bấm "Kết nối tài khoản cTrader" → redirect sang trang đăng nhập/cấp quyền của Spotware (chuẩn OAuth 2.0 Authorization Code flow).
- Người dùng đăng nhập trên chính trang của Spotware (app không bao giờ thấy mật khẩu cTrader của họ — đây là điểm mạnh bảo mật).
- Spotware redirect ngược về app kèm authorization code → backend đổi code lấy `access_token` + `refresh_token` → lưu server-side, gắn với user.
- Sau đó backend dùng token này gọi Spotware Open API định kỳ (hoặc qua webhook nếu API hỗ trợ) để lấy lịch sử lệnh đã đóng, ghi vào DB.

**Vì đây là API chính thức có scope rõ ràng, đây là hướng nên ưu tiên làm trước nếu tự xây — ít rủi ro pháp lý/kỹ thuật hơn 2 cách trên.**

## 4. TopstepX

FAQ/marketing của sản phẩm tham khảo có nhắc "Nhập dữ liệu TopstepX (CSV/Importer)", nhưng khi khảo sát trực tiếp trong khu vực Cài đặt giao dịch của bản demo, **không tìm thấy** một khối cấu hình riêng cho TopstepX (chỉ có 3 khối: MT5 EA, TradingView Bookmarklet, cTrader OAuth). Khả năng cao đây là:
- Tính năng dùng chung form "Nhập thủ công/CSV" ở trang thêm giao dịch (chưa quan sát được giao diện upload CSV cụ thể trong phạm vi khảo sát), hoặc
- Tính năng được quảng cáo nhưng chưa triển khai đầy đủ trong bản hiện tại.

**Khuyến nghị cho dự án của bạn**: nếu muốn hỗ trợ TopstepX, cách chắc chắn nhất là làm **CSV Importer tổng quát** (người dùng xuất báo cáo CSV từ TopstepX rồi upload lên, backend parse theo template cột chuẩn của TopstepX) — đây cũng là cách nhiều journal khác xử lý các nền tảng không có API mở.

## Gợi ý thứ tự triển khai khi tự code

1. **Nhập tay** (không phụ thuộc bên thứ 3) — làm trước tiên, đã có trong phạm vi v1.
2. **CSV Importer tổng quát** — độ phức tạp thấp, dùng được cho TopstepX và nhiều broker khác.
3. **cTrader OAuth** — API chính thức, ít rủi ro, độ phức tạp trung bình.
4. **TradingView Bookmarklet** — cần tự viết script đọc DOM, dễ vỡ, bảo trì tốn công.
5. **MT5 EA** — cần biết MQL5, hoặc thuê người viết EA; phức tạp nhất vì phải phân phối file cho user tự cài vào terminal của họ.
