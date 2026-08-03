# Đặc tả tính năng chi tiết

Dựa trên khảo sát thực tế giao diện 5 module lõi. Mỗi module liệt kê: mục đích, thành phần UI, dữ liệu hiển thị, tương tác.

---

## 1. Dashboard (Tổng quan Giao dịch)

**Mục đích**: cho trader cái nhìn nhanh về sức khoẻ tài khoản khi vừa mở app.

**Thành phần**:
- Header: lời chào + trạng thái đồng bộ ("N tài khoản kết nối", chấm xanh "đồng bộ trực tuyến hoạt động")
- Bộ lọc: theo tài khoản (dropdown, mặc định "Tất cả tài khoản") + theo khoảng thời gian
- Hàng "streak" động viên: chuỗi thắng hiện tại (kèm kỷ lục cá nhân), chuỗi lệnh tuân thủ 100% kỷ luật liên tiếp
- Dải huy hiệu thành tích (gamification) + link "Bảng Thành Tích"
- 4 thẻ chỉ số chính (KPI cards):
  - Lợi nhuận ròng (Net P&L) + lợi nhuận trung bình/lệnh
  - Tỷ lệ thắng (Win Rate) + số lệnh thắng/thua
  - Hệ số lợi nhuận (Profit Factor)
  - Chỉ số kỷ luật (Compliance %) — trung bình % tuân thủ checklist của mọi lệnh
- **Biểu đồ Equity Curve**: lợi nhuận tích luỹ theo thời gian, 3 kiểu vẽ (đường/bậc thang/cột), hiển thị số dư ví hiện tại
- **Bảng "Giao dịch gần đây"**: 8 lệnh mới nhất (rút gọn) + link "Xem tất cả" sang module Trades
- **Phân tích Tâm lý**: nhóm lệnh theo tag cảm xúc (VD: Tự tin / Tập trung / Bình tĩnh / Bình thường), mỗi nhóm hiện tổng P&L + win rate riêng → giúp trader tự thấy cảm xúc nào đang "ăn tiền" hay "cháy tiền"

**Ghi chú thiết kế**: đây là màn hình quan trọng nhất để giữ chân người dùng quay lại hàng ngày — nên ưu tiên tốc độ load và tính trực quan hơn là nhồi nhiều số liệu.

---

## 2. Trades — Lịch sử Lệnh (Trades Log)

**Mục đích**: sổ cái đầy đủ mọi lệnh, là nơi trader gắn tag chiến lược + cảm xúc sau khi lệnh đã tự động về (hoặc nhập tay).

**Bộ lọc nâng cao** (nhiều chiều, kết hợp được):
- Tài khoản (theo từng tài khoản đã kết nối, phân loại 👤 Personal / 🏆 Prop Firm)
- Cặp tiền/tài sản (EURUSD, GBPUSD, XAUUSD, US30...)
- Vị thế (BUY/SELL)
- Phiên giao dịch (Asia / London / NY AM / NY PM)
- Thứ trong tuần
- Chiến lược (danh sách chiến lược người dùng đã tạo)
- Trạng thái lệnh (Đang chạy OPEN / Đã đóng CLOSED)

**Thanh thống kê theo bộ lọc hiện tại** (tính lại real-time khi đổi filter): số lệnh, lợi nhuận ròng, win rate, thắng/thua, profit factor, lợi nhuận TB/lệnh.

**Bảng lệnh**, mỗi dòng gồm cột: Ngày & Thứ, Phiên, Tài khoản, Cặp tiền, Loại, Khối lượng, Giá mở, Giá đóng, Chiến lược (dropdown gán nhanh ngay trong bảng), Tâm lý, R:R, P&L, hành động "Chi tiết →".

**Nút hành động đầu trang**:
- "+ Ghi lệnh thủ công" — mở form nhập lệnh tay (fallback khi chưa có auto-sync)
- "Xuất Báo Cáo (PDF/Excel)" — tính năng khoá theo gói (đánh dấu 👑)

### 2.1 Trang Chi tiết Lệnh

Khi bấm "Chi tiết →" từ 1 dòng:

- Header: cặp tiền + hướng lệnh (badge màu), Ticket ID, nguồn (tên tài khoản), Net P&L nổi bật
- Nút "Tạo Ảnh Xác Thực" (tính năng khoá gói cao) — xuất ảnh card kết quả lệnh để khoe/chia sẻ
- **Biểu đồ nến khu vực entry** (tích hợp kiểu TradingView) đánh dấu điểm mở/đóng lệnh
- **Nhật ký & phân tích lệnh**: khu vực dán ảnh chụp phân tích + ô ghi chú tự do
- **Trạng thái tâm lý lúc giao dịch**: tag cảm xúc + một dòng nhận định ngắn về việc trạng thái đó có lý tưởng không
- **Chiến thuật gán**: hiển thị chiến lược đã chọn cho lệnh này
- **Khu vực nhận xét từ Mentor** (để trống nếu không thuộc lớp học nào) — liên quan tính năng Academy, có thể ẩn ở v1
- **Thông tin giao dịch dạng bảng**: khối lượng, trạng thái, giá mở/đóng, thời gian mở/đóng, phí hoa hồng, phí qua đêm (swap), tỷ lệ R:R
- **Checklist kỷ luật chiến lược**: liệt kê từng quy tắc của chiến lược đã gán, mỗi quy tắc có thể bấm tick bật/tắt tuân thủ → hệ thống tự tính % tuân thủ cho lệnh đó (VD 4/5 quy tắc = 80%)

Đây chính là cơ chế biến "checklist tĩnh" thành **điểm số kỷ luật định lượng** — là giá trị lõi khác biệt so với nhật ký kiểu Excel thông thường.

---

## 3. Calendar — Lịch Giao Dịch (Trading Calendar)

**Mục đích**: xem nhanh chuỗi ngày thắng/thua (Green Days/Red Days) theo dạng lịch tháng, giống heatmap.

**Thành phần**:
- Điều hướng tháng trước/sau, hiển thị tháng/năm hiện tại
- Tổng quan tháng: số ngày xanh, số ngày đỏ, tổng P&L tháng
- Bộ lọc theo tài khoản
- Lưới lịch 7 cột (T2→CN), mỗi ô ngày hiển thị P&L trong ngày (màu xanh/đỏ theo lãi/lỗ), ô trống nếu không giao dịch
- Cột phụ "P&L TUẦN" ở cuối mỗi hàng — tổng theo tuần
- Panel bên phải: chi tiết ngày được chọn — kết quả ngày, có/không có nhật ký viết tay, danh sách các lệnh đã chốt trong ngày đó (rút gọn: cặp tiền, hướng, khối lượng, P&L)

**Tương tác chính**: click vào 1 ngày → panel chi tiết cập nhật ngay (không chuyển trang).

---

## 4. Strategies — Quản lý Chiến lược & Kỷ luật

**Mục đích**: nơi trader định nghĩa "thế nào là vào lệnh đúng chuẩn" cho từng setup, biến kinh nghiệm cá nhân thành checklist có thể đo lường.

**Danh sách chiến lược đã tạo**, mỗi thẻ hiển thị:
- Tên chiến lược (biểu tượng + tên, có nút sửa)
- Mô tả ngắn (1–2 câu giải thích logic setup)
- Hiệu suất tổng hợp: Lợi nhuận ròng + Win Rate/số lệnh đã gắn chiến lược này (tự tính từ dữ liệu Trades)
- **Danh sách quy tắc bắt buộc tuân thủ** (rules checklist) — đây chính là danh sách hiển thị lại ở trang Chi tiết Lệnh để trader tick khi vào lệnh

**Form tạo chiến lược mới**:
- Tên chiến lược (bắt buộc)
- Mô tả ngắn
- Ảnh minh hoạ setup mẫu (kéo-thả / dán clipboard / dán link TradingView)
- Danh sách quy tắc kỷ luật — nhập mỗi quy tắc 1 dòng, hệ thống tách thành checklist items

**Tính năng phụ**: nút nạp nhanh bộ chiến lược mẫu dựng sẵn (onboarding nhanh cho người mới, tránh màn hình trắng khi chưa có dữ liệu) — với sản phẩm tham khảo là 5 mẫu chiến lược ICT phổ biến; ở bản của bạn nên thay bằng bộ mẫu trung lập hoặc để trống, tránh copy nguyên văn mô tả kỹ thuật ICT của họ.

**Giới hạn theo gói**: số lượng chiến lược tối đa có thể là điểm phân biệt gói Free/Pro/VIP (tham khảo mô hình ở PRICING.md).

---

## 5. Notes — Nhật ký Tâm sự & Đánh giá Thị trường

**Mục đích**: nhật ký hàng ngày độc lập với từng lệnh cụ thể — ghi lại trạng thái tâm lý tổng thể và nhận định thị trường, giúp nhìn ra pattern theo ngày/tuần (khác với tâm lý gắn theo từng lệnh ở module Trades).

**Thành phần**:
- **Form ghi nhật ký hôm nay**: chọn ngày, chọn tâm trạng chính (từ danh sách preset: Bình tĩnh/FOMO/Phục thù/Tham lam/Lo lắng/Tự tin...), chọn xu hướng thị trường quan sát được (Bullish/Bearish/Sideways), ô văn bản tự do ("Hôm nay giao dịch thế nào? Có mắc lỗi tâm lý gì không?")
- **Lịch sử ghi chép**: danh sách các entry theo ngày gần nhất, mỗi entry hiện: thứ/ngày, badge tâm lý, badge xu hướng thị trường, nội dung, nút sửa

**Khác biệt với Notes trong Trade Detail**: Notes ở đây là nhật ký **theo ngày** (tổng kết cuối ngày), còn ghi chú trong Trade Detail là nhật ký **theo từng lệnh**. Cả 2 nên tồn tại song song vì phục vụ mục đích review khác nhau (theo lệnh vs theo ngày).

---

## Bảng tóm tắt mô hình dữ liệu cần có (gợi ý, không phải thiết kế DB chính thức)

| Thực thể | Trường chính |
|---|---|
| User | id, name, email, password_hash, gói đang dùng |
| TradingAccount | id, user_id, tên hiển thị, loại (personal/prop_firm), broker/platform, số dư |
| Trade | id, account_id, symbol, side, volume, open_price, close_price, open_time, close_time, commission, swap, session, strategy_id (nullable), emotion_tag, rr_ratio, pnl, status |
| Strategy | id, user_id, tên, mô tả, ảnh mẫu, danh sách rule (1-n) |
| StrategyRule | id, strategy_id, nội dung rule, thứ tự |
| TradeRuleCheck | id, trade_id, rule_id, đã tuân thủ (bool) — dùng để tính % compliance mỗi lệnh |
| DailyNote | id, user_id, ngày, tâm trạng chính, xu hướng thị trường, nội dung |
| TradeJournalEntry | id, trade_id, ảnh chụp, ghi chú phân tích |

*(Tài liệu này dừng ở mức đặc tả sản phẩm; thiết kế schema/API chi tiết nên tách thành tài liệu kiến trúc kỹ thuật riêng khi bạn sẵn sàng bước sang giai đoạn code.)*
