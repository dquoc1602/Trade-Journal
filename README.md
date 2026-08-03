# Trading Journal App 

> Web app nhật ký giao dịch tự động cho trader cá nhân & tài khoản Quỹ (Prop Firm), lấy cảm hứng tính năng từ mô hình sản phẩm "HocICT Journal" (journal.hocict.com) — xây dựng lại với thương hiệu, nội dung và mã nguồn hoàn toàn riêng.

## Vì sao làm sản phẩm này

Trader thường bỏ ghi nhật ký thủ công (Excel/Notion) sau vài ngày vì tốn thời gian và làm đứt mạch tâm lý giao dịch. Sản phẩm giải quyết bằng cách **tự động đồng bộ lệnh** từ nền tảng giao dịch, trader chỉ cần gắn tag chiến lược + cảm xúc trong vài giây thay vì nhập tay toàn bộ Entry/SL/TP/PnL.

## Trạng thái: đã có code chạy được

Dự án đã được code đầy đủ (Next.js 14 + Supabase + Tailwind). Xem **[SETUP.md](SETUP.md)** để cài đặt và deploy.

```
app/(auth)/            Đăng nhập / Đăng ký (Supabase Auth)
app/(app)/              5 module chính + Accounts, có sidebar + auth guard
components/             UI components theo từng module
lib/analytics.ts        Toàn bộ công thức: Win Rate, Profit Factor, Equity Curve, % Kỷ luật, Tâm lý
lib/supabase/            Supabase client (browser/server) + middleware refresh session
supabase/migrations/     Schema SQL + Row Level Security
```

## Tài liệu dự án

| File | Nội dung |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Mục tiêu sản phẩm, đối tượng người dùng, phạm vi tính năng, yêu cầu phi chức năng |
| [docs/FEATURES.md](docs/FEATURES.md) | Đặc tả chi tiết từng module: Dashboard, Trades, Calendar, Strategies, Notes |
| [docs/CRUD_MATRIX.md](docs/CRUD_MATRIX.md) | Thêm/Sửa/Xóa được gì ở từng module — kèm toàn bộ field của form nhập/sửa lệnh |
| [docs/ANALYTICS_LOGIC.md](docs/ANALYTICS_LOGIC.md) | Công thức tính Win Rate/Profit Factor/Equity Curve, logic chấm điểm kỷ luật, kiến trúc AI Coach |
| [docs/PLATFORM_CONNECTIONS.md](docs/PLATFORM_CONNECTIONS.md) | Cơ chế auto-sync MT5 (EA/Webhook), TradingView (Bookmarklet), cTrader (OAuth 2.0), TopstepX |
| [docs/USER_FLOWS.md](docs/USER_FLOWS.md) | Các luồng người dùng chính (onboarding, ghi lệnh, review cuối tuần...) |
| [docs/PRICING.md](docs/PRICING.md) | Đề xuất mô hình gói giá (tham khảo, không sao chép nguyên văn) |

## Phạm vi bản v1 (theo yêu cầu)

Tập trung 5 module lõi, **bỏ qua** AI Assistant chat và Academy/Mentor mode ở giai đoạn đầu:

1. **Dashboard** — tổng quan hiệu suất, equity curve, phân tích theo tâm lý
2. **Trades (Lịch sử lệnh)** — bảng ghi lệnh có bộ lọc nâng cao + trang chi tiết từng lệnh
3. **Calendar (Lịch giao dịch)** — heatmap P&L theo ngày/tuần/tháng
4. **Strategies (Chiến lược)** — quản lý setup + checklist kỷ luật gắn theo từng chiến lược
5. **Notes (Nhật ký ngày)** — nhật ký tâm lý & nhận định thị trường hàng ngày

## Lưu ý quan trọng về bản quyền & thương hiệu

- Toàn bộ nội dung trong tài liệu này được **diễn giải lại** từ những gì quan sát được trên trang public và bản demo của journal.hocict.com, **không sao chép nguyên văn** copy quảng cáo, logo, hay mã nguồn của họ.
- Tên gọi, màu sắc thương hiệu, câu chữ UI cần do bạn tự đặt trước khi phát triển — tài liệu này dùng tên placeholder.
- Ý tưởng/tính năng (auto-sync lệnh, chấm điểm kỷ luật, nhật ký tâm lý...) không phải đối tượng được bảo hộ bản quyền, nhưng việc sao chép y hệt văn bản, giao diện pixel-for-pixel hoặc dùng lại thương hiệu "HocICT Journal" thì có thể vi phạm quyền sở hữu trí tuệ — cần tránh.
# Trade-Journal
# Trade-Journal
# Trade-Journal
