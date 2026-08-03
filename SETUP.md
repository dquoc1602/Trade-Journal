# Hướng dẫn cài đặt & Deploy

Đây là các bước **bạn** cần tự làm (tạo tài khoản, nhập thông tin thanh toán nếu có...) — tôi không thể tự đăng ký dịch vụ thay bạn. Sau mỗi bước, đưa tôi thông tin cần thiết (connection string, API key...) để tôi cắm vào code nếu cần.

## 1. Cài dependencies (chạy trên máy bạn, trong thư mục dự án)

```bash
npm install
```

## 2. Tạo project Supabase

1. Vào [supabase.com](https://supabase.com) → tạo tài khoản (nếu chưa có) → **New Project**.
2. Đặt tên project, chọn region gần bạn (Singapore là gần VN nhất), đặt mật khẩu DB (lưu lại).
3. Đợi project khởi tạo xong (~2 phút).
4. Vào **SQL Editor** (menu trái) → **New query** → chạy LẦN LƯỢT 2 file theo đúng thứ tự (mỗi file 1 lần Run riêng):
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — tạo toàn bộ bảng, ràng buộc, Row Level Security.
   - [`supabase/migrations/0002_prop_firms_and_balance_sync.sql`](supabase/migrations/0002_prop_firms_and_balance_sync.sql) — thêm field quỹ Prop Firm/loại tài sản cho tài khoản, và trigger tự động cộng/trừ số dư theo lời/lỗ mỗi khi thêm/sửa/xóa lệnh.
5. Vào **Project Settings → API** → copy 2 giá trị:
   - `Project URL`
   - `anon public` key

## 3. Cấu hình biến môi trường

Copy file `.env.local.example` thành `.env.local`:

```bash
cp .env.local.example .env.local
```

Mở `.env.local`, dán 2 giá trị lấy ở bước 2 vào:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxx
```

## 4. Chạy thử ở local

```bash
npm run dev
```

Mở `http://localhost:3000` → sẽ tự chuyển tới `/login`. Bấm **Đăng ký ngay** để tạo tài khoản đầu tiên cho chính bạn (đây là tài khoản Supabase Auth thật, không phải demo).

> Lưu ý: mặc định Supabase yêu cầu xác nhận email khi đăng ký. Nếu bạn chỉ dùng cá nhân và muốn bỏ qua bước xác nhận email cho nhanh, vào Supabase Dashboard → **Authentication → Providers → Email** → tắt "Confirm email".

## 5. Deploy lên Vercel

1. Đẩy code lên GitHub (tạo repo mới, push code dự án lên).
2. Vào [vercel.com](https://vercel.com) → tạo tài khoản (nếu chưa có, đăng nhập bằng GitHub cho tiện) → **Add New → Project** → chọn repo vừa push.
3. Ở bước cấu hình, thêm **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = giá trị ở bước 2
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = giá trị ở bước 2
4. Bấm **Deploy**. Sau ~1-2 phút sẽ có link dạng `https://<tên-dự-án>.vercel.app`.

## 6. Sau khi deploy

- Mỗi lần bạn (hoặc tôi) push code mới lên nhánh chính, Vercel tự động build & deploy lại (CI/CD có sẵn, không cần cấu hình thêm).
- Muốn gắn domain riêng: Vercel Project → **Settings → Domains** → thêm domain bạn đã mua → trỏ DNS theo hướng dẫn Vercel đưa ra.

## Những gì đã có trong bản này (v1)

- Đăng ký/đăng nhập (email + password qua Supabase Auth)
- 5 module: Dashboard, Trades (CRUD đầy đủ + import CSV hàng loạt), Calendar, Strategies (CRUD đầy đủ), Notes (CRUD đầy đủ)
- Quản lý Tài khoản giao dịch: preset 5 quỹ Prop Firm (FTMO, The5ers, TopstepX, Bulenox, Lucid Trading) tự động điền loại tài sản (Forex/CFD hay Futures) + giai đoạn tài khoản (Evaluation/Funded...) theo từng quỹ
- **Số dư tài khoản tự động cộng/trừ** theo lời/lỗ mỗi khi thêm/sửa/xóa lệnh (trigger Postgres, không cần tự tay cập nhật)
- Nhật ký ngày tự liên kết ngay trên trang chi tiết lệnh (theo ngày đóng lệnh, giờ VN)
- Trang **Kiến thức ICT/SMC** — tra cứu nhanh 24 khái niệm (FVG, Order Block, Silver Bullet, Judas Swing...) theo danh mục, có tìm kiếm
- Toàn bộ logic phân tích: Win Rate, Profit Factor, Equity Curve, % Kỷ luật, Phân tích tâm lý

## Chưa có trong bản này (làm sau theo bạn yêu cầu)

- Auto-sync MT5 / BlackArrow / TopstepX web (xem lại [docs/PLATFORM_CONNECTIONS.md](docs/PLATFORM_CONNECTIONS.md) để tham khảo hướng làm)
- Google OAuth login (hiện chỉ có email/password)
- Academy/Mentor mode (chủ động bỏ qua vì dùng cá nhân)
