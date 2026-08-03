# Luồng người dùng chính (User Flows)

## 1. Onboarding lần đầu

1. User đăng ký (email + password, hoặc OAuth Google) → tên hiển thị, username, email, mật khẩu tối thiểu 6 ký tự.
2. Hệ thống tạo tài khoản mới → chuyển thẳng vào Dashboard rỗng (chưa có lệnh).
3. Gợi ý 2 hành động đầu tiên hiển thị nổi bật trên Dashboard rỗng:
   - "Thêm tài khoản giao dịch đầu tiên" (personal hoặc prop firm)
   - "Nạp bộ chiến lược mẫu" hoặc "Tạo chiến lược đầu tiên" (ở module Strategies)
4. Nếu chưa muốn cam kết, user có thể dùng nút "Dùng thử Demo" để xem app với dữ liệu mẫu có sẵn trước khi đăng ký thật.

## 2. Vòng lặp sử dụng hàng ngày (core loop)

Đây là luồng quan trọng nhất — quyết định app có "dính" người dùng hay không:

1. Trader đóng 1 lệnh trên MT5/cTrader/TradingView (giai đoạn có auto-sync) hoặc nhớ để nhập tay cuối phiên.
2. Mở app → vào module **Trades**, thấy lệnh đã nằm sẵn trong bảng (hoặc bấm "+ Ghi lệnh thủ công" nếu chưa có auto-sync).
3. Bấm "Chi tiết →" lệnh vừa xong.
4. Gán **Chiến lược** đã áp dụng (chọn từ danh sách có sẵn).
5. Tick từng mục trong **Checklist kỷ luật** của chiến lược đó theo đúng thực tế đã làm khi vào lệnh → hệ thống tự tính % tuân thủ.
6. Chọn **tag cảm xúc** lúc vào lệnh.
7. (Tuỳ chọn) Dán ảnh chụp chart phân tích + viết ghi chú ngắn.
8. Xong — toàn bộ mất khoảng vài chục giây đến 1-2 phút, không cần đo pips hay tính P&L thủ công.

## 3. Review cuối ngày

1. Vào module **Notes** → viết nhật ký ngày: tâm trạng chính trong ngày, nhận định xu hướng thị trường, vài dòng tự do.
2. (Tuỳ chọn) Ghé **Calendar** xem ô ngày hôm nay đã chuyển xanh/đỏ chưa.

## 4. Review cuối tuần/cuối tháng

1. Vào **Dashboard**, đổi bộ lọc thời gian sang "tuần này"/"tháng này".
2. Xem Equity Curve có đi đúng hướng không, Compliance % có giữ được không.
3. Xem khối "Phân tích Tâm lý" để biết trạng thái cảm xúc nào đang làm tài khoản lỗ nhiều nhất.
4. Sang **Calendar** nhìn tổng thể chuỗi ngày xanh/đỏ trong tháng.
5. Sang **Trades**, lọc theo từng Chiến lược để xem chiến lược nào đang có win rate/profit factor tốt nhất → quyết định tuần sau tập trung setup nào, bỏ setup nào.

## 5. Tạo & tinh chỉnh chiến lược mới

1. Vào **Strategies** → "Tạo chiến lược mới".
2. Đặt tên, mô tả ngắn, dán ảnh setup mẫu.
3. Viết checklist quy tắc (mỗi dòng 1 quy tắc — nên giới hạn 3-6 quy tắc để còn thực tế khi tick lúc vào lệnh nhanh).
4. Lưu → chiến lược xuất hiện ngay trong dropdown gán chiến lược ở module Trades.
5. Sau vài tuần, nếu số liệu win rate của chiến lược quá thấp → user quay lại sửa checklist (siết chặt điều kiện entry) — đây là vòng lặp cải thiện chiến lược dựa trên dữ liệu thật, giá trị cốt lõi của sản phẩm.

## 6. Nhập lệnh thủ công (fallback trước khi có auto-sync)

1. Từ **Trades** → "+ Ghi lệnh thủ công".
2. Nhập: tài khoản, cặp tiền, hướng lệnh, khối lượng, giá mở/đóng, thời gian mở/đóng, phí hoa hồng/swap (tuỳ chọn).
3. Lưu → lệnh xuất hiện trong bảng như lệnh auto-sync bình thường, có thể gán chiến lược/checklist/cảm xúc như luồng #2.

---

**Gợi ý ưu tiên xây dựng theo thứ tự**: Flow #6 (nhập tay) → Flow #2 (gán chiến lược + checklist) → Flow #3/#4 (Notes + Calendar + Dashboard review) → Flow #5 (CRUD chiến lược) → Flow #1 (onboarding hoàn chỉnh) → auto-sync (giai đoạn 2, ngoài phạm vi v1).
