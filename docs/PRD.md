# PRD — Trading Journal App

## 1. Vấn đề cần giải quyết

Trader (đặc biệt trader ICT/SMC, trader Prop Firm) biết ghi nhật ký là bắt buộc để tìm ra lỗi hệ thống, nhưng:

- Ghi tay (Excel/Notion) tốn thời gian → bỏ dở sau 3–4 ngày.
- Việc dừng lại giữa phiên để nhập liệu làm đứt mạch tâm lý giao dịch.
- Không đo lường được % tuân thủ kỷ luật cho từng chiến lược cụ thể.
- Không có ai/công cụ nào chỉ ra điểm mù tâm lý (FOMO, revenge trading...) dựa trên dữ liệu thật.

## 2. Đối tượng người dùng

- **Trader cá nhân** giao dịch sàn (Exness, IC Markets, XM...) qua MT5/cTrader.
- **Trader Prop Firm** đang thi hoặc đã pass challenge (FTMO, FundedNext, TopstepX...), cần tách biệt theo dõi nhiều tài khoản.
- **Trader theo trường phái ICT/SMC** cần checklist riêng cho từng setup (Silver Bullet, FVG, Order Block, Judas Swing...).
- (Giai đoạn sau) Mentor/coach cần dashboard giám sát học viên — **ngoài phạm vi v1**.

## 3. Mục tiêu sản phẩm

1. Giảm thời gian ghi nhật ký xuống gần 0 bằng đồng bộ lệnh tự động.
2. Định lượng hoá kỷ luật giao dịch bằng checklist gắn theo chiến lược, chấm % tuân thủ tự động cho mỗi lệnh.
3. Liên kết dữ liệu cảm xúc với hiệu suất để trader tự nhận ra pattern hành vi (không nhất thiết cần AI — có thể làm bằng thống kê nhóm theo tag).
4. Cung cấp cái nhìn tổng quan trực quan (equity curve, calendar heatmap) để review nhanh cuối tuần/cuối tháng.

## 4. Phạm vi v1

### Trong phạm vi
- Dashboard tổng quan
- Module Trades: bảng ghi lệnh + bộ lọc + trang chi tiết lệnh + checklist kỷ luật
- Module Calendar: heatmap P&L theo ngày
- Module Strategies: CRUD chiến lược + checklist rules tuỳ biến
- Module Notes: nhật ký tâm lý/thị trường hàng ngày
- Nhập lệnh thủ công (form) — làm nền tảng trước khi làm auto-sync
- Đăng ký/đăng nhập cơ bản (email/password), quản lý nhiều tài khoản giao dịch (sàn/quỹ) trên 1 user

### Ngoài phạm vi v1 (làm sau)
- Auto-sync MT5 (EA Webhook) / cTrader (Cloud OpenAPI) / TradingView (Bookmarklet) / TopstepX (CSV import) — do cần hạ tầng backend riêng, để giai đoạn 2
- AI Coach (chat phân tích dữ liệu bằng LLM)
- Academy / Mentor mode (quản lý học viên, phân quyền, branding riêng)
- Thanh toán, phân hạng gói trả phí
- Chia sẻ link công khai (shareable link), xuất PDF/Excel, tạo ảnh xác thực

## 5. Yêu cầu phi chức năng

- **An toàn dữ liệu kết nối sàn**: nếu làm auto-sync ở giai đoạn 2, bắt buộc dùng cơ chế **chỉ đọc (read-only)** — không bao giờ có quyền đặt lệnh, rút tiền. Đây là điểm trader quan tâm nhất (tương tự FAQ #1 của sản phẩm tham khảo).
- **Đa tài khoản**: một user quản lý nhiều tài khoản giao dịch (phân biệt loại Personal / Prop Firm), lọc dữ liệu độc lập theo tài khoản.
- **Múi giờ & phiên giao dịch**: hệ thống cần hiểu khái niệm phiên (Asia/London/NY AM/NY PM) để lọc & thống kê theo phiên.
- **Responsive**: dùng được trên mobile vì trader hay xem nhanh sau khi đóng lệnh.
- **Hiệu năng**: bảng lệnh + bộ lọc nhiều chiều cần trả kết quả nhanh dù dữ liệu vài nghìn lệnh/tài khoản.

## 6. Rủi ro & lưu ý pháp lý

- Không dùng lại tên thương hiệu, logo, nguyên văn nội dung marketing của sản phẩm tham khảo.
- Không quảng cáo "an toàn tuyệt đối" nếu chưa thực sự kiểm chứng cơ chế read-only với từng API sàn — tránh cam kết sai gây rủi ro pháp lý với người dùng.
- Nếu sau này có module Academy thu phí dựa trên hoa hồng học viên, cần cân nhắc quy định tài chính liên quan (không nằm trong phạm vi tài liệu này).
