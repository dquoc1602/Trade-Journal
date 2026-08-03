# Ma trận CRUD & hành vi chỉnh sửa theo module

Khảo sát trực tiếp trên app thật (không suy đoán) — ghi lại chính xác cái gì Thêm/Sửa/Xóa được, cái gì không, và vì sao.

| Module | Thêm (Create) | Sửa (Update) | Xóa (Delete) | Ghi chú thiết kế |
|---|---|---|---|---|
| **Trades** | ✅ 2 cách: Form nhập tay đầy đủ field, hoặc Import từ TradingView (bookmarklet) | ⚠️ **Có giới hạn** — chỉ sửa được lớp "journal" của lệnh: ảnh/link chụp màn hình, tag cảm xúc, chiến lược gán, tỷ lệ R:R. **Không sửa được** các field gốc (giá mở/đóng, khối lượng, thời gian, symbol) | ❌ Không tìm thấy nút xóa lệnh ở bất kỳ đâu trong UI | Thiết kế có chủ đích: dữ liệu lệnh gốc coi như "sự thật" đến từ sàn/tay nhập ban đầu, không cho sửa lại để tránh làm sai lệch thống kê hiệu suất thật. Nếu tự build, nên cân nhắc: có cho sửa/xóa lệnh nhập tay (do người dùng tự chịu trách nhiệm) nhưng khóa sửa/xóa lệnh đến từ auto-sync? |
| **Strategies** | ✅ Form đầy đủ: tên, mô tả, ảnh mẫu, danh sách rule | ✅ Form edit inline pre-fill toàn bộ field cũ, có nút Hủy/Lưu thay đổi | ✅ Có nút "🗑️ Xóa chiến lược" ngay trong form edit | CRUD đầy đủ nhất trong 5 module — hợp lý vì đây là nội dung 100% do user tự tạo, không liên quan dữ liệu sync từ sàn |
| **Notes (nhật ký ngày)** | ✅ Form: ngày, tâm trạng, xu hướng thị trường, nội dung tự do | ✅ Nút "Sửa" load lại toàn bộ field vào form bên phải để chỉnh, cùng 1 form với Create (chuyển sang chế độ "Cập nhật") | ❌ Không thấy nút xóa entry | Có thể xóa được nhưng ẩn sau 1 thao tác khác chưa khảo sát tới (vd: xóa khi để trống nội dung rồi lưu) — nếu tự build, nên có xóa tường minh cho UX tốt hơn |
| **Trading Accounts** (tài khoản giao dịch, trong Settings) | ✅ Form: tên, broker, loại (Personal/Prop Firm), tiền tệ, số dư | Không quan sát thấy nút sửa riêng (có thể sửa qua xóa rồi thêm lại) | ✅ Có nút "Xóa" rõ ràng trên từng thẻ tài khoản | |
| **Checklist tuân thủ / lệnh** | (tự sinh theo Strategy đã gán) | ✅ Từng rule trong trang Chi tiết Lệnh có thể **click để bật/tắt** trạng thái tuân thủ → % tự tính lại ngay | N/A (rule chỉ mất khi xóa cả Strategy) | Đây là tương tác chỉnh sửa quan trọng nhất về mặt sản phẩm — biến checklist tĩnh thành dữ liệu định lượng |
| **Dashboard / Calendar** | N/A (view tổng hợp, không có entity riêng) | N/A | N/A | Thuần hiển thị + bộ lọc, không có CRUD |

## Chi tiết modal "Chỉnh sửa nhật ký" của 1 lệnh (Trades)

Khi bấm "✏️ Chỉnh sửa nhật ký" trong trang chi tiết lệnh, form hiện ra gồm:
- Ô dán link ảnh TradingView (hoặc Base64) + nút "Xóa ảnh"
- Dropdown Tâm lý lúc giao dịch (9 lựa chọn, xem danh sách đầy đủ bên dưới)
- Dropdown Chiến lược áp dụng
- Ô nhập tỷ lệ R:R
- Nút "Hủy" / "Lưu thay đổi"

**9 giá trị enum tâm lý dùng cho Trades** (khác với Notes — xem bên dưới):
`Calm (Bình tĩnh)`, `Focused (Tập trung)`, `Confident (Tự tin)`, `Neutral (Bình thường)`, `Anxious (Lo lắng)`, `Fear (Sợ hãi)`, `FOMO`, `Greedy (Tham lam)`, `Revenge (Phục thù)`

**6 giá trị enum tâm lý dùng cho Notes (nhật ký ngày)** — tập con khác, không đồng bộ 100% với Trades:
`Calm (Bình tĩnh)`, `FOMO`, `Revenge (Phục thù)`, `Greedy (Tham lam)`, `Anxious (Lo lắng)`, `Confident (Tự tin)`

> **Lưu ý khi tự thiết kế**: đây có vẻ là điểm chưa nhất quán của sản phẩm gốc (2 danh sách cảm xúc khác nhau cho 2 module). Nếu tự build, nên **dùng chung 1 enum cảm xúc** cho toàn hệ thống để dữ liệu so sánh được xuyên suốt (vd: Dashboard có thể muốn đối chiếu tâm lý theo lệnh với tâm lý theo ngày).

## Form "Thêm giao dịch mới" — đầy đủ field (chế độ Nhập thủ công)

| Field | Bắt buộc | Loại input |
|---|---|---|
| Tài khoản giao dịch | ✅ | select (danh sách account đã tạo) |
| Cặp tiền / Tài sản | ✅ | text |
| Vị thế | ✅ | select BUY/SELL |
| Khối lượng (Lots/Units) | ✅ | number |
| Mức giá mở | ✅ | number |
| Mức giá đóng | tùy chọn (bỏ trống = lệnh đang chạy) | number |
| Thời gian mở lệnh | ✅ | datetime-local |
| Thời gian đóng lệnh | tùy chọn | datetime-local |
| Lợi nhuận thô (Gross Profit) | tùy chọn | number |
| Phí hoa hồng (Commission) | tùy chọn, nhập số âm | number |
| Phí qua đêm (Swap) | tùy chọn, +/- | number |
| Tâm lý lúc giao dịch | tùy chọn (mặc định Calm) | select (9 giá trị) |
| Tỷ lệ R:R | tùy chọn | number |
| Chiến lược áp dụng | tùy chọn | select |
| Ghi chú chi tiết | tùy chọn | textarea |
| Ảnh chụp biểu đồ | tùy chọn | file upload / paste (Ctrl+V) / dán link |

**Tab thứ 2 cùng màn hình**: "Nhập từ TradingView" — không phải form nhập liệu khác, mà chỉ là lối tắt trỏ tới hướng dẫn cài Bookmarklet (xem [PLATFORM_CONNECTIONS.md](PLATFORM_CONNECTIONS.md)).

## Tính năng gán nhanh Chiến lược ngay trong bảng Trades

Ở bảng danh sách lệnh (không cần vào trang chi tiết), cột "Chiến lược" là 1 dropdown gán nhanh — chọn xong tự lưu ngay, không cần bấm nút Lưu riêng. Đây là chi tiết UX đáng học theo: giảm số click cần thiết cho thao tác lặp lại nhiều nhất (gán chiến lược cho lệnh mới về).
