-- Phase 5: nhiều nhật ký/ngày + đánh dấu tài khoản Disabled/Cháy

-- Trước đây mỗi ngày chỉ được 1 nhật ký (unique user_id+note_date, upsert theo ngày).
-- Giờ cho phép ghi nhiều nhật ký độc lập trong cùng 1 ngày, sắp theo created_at.
alter table daily_notes drop constraint if exists daily_notes_user_id_note_date_key;

-- Đánh dấu tài khoản đã cháy/vô hiệu hoá — chỉ là nhãn cảnh báo hiển thị,
-- KHÔNG ẩn khỏi danh sách chọn khi tạo lệnh mới hay các dropdown khác.
alter table trading_accounts add column if not exists is_disabled boolean not null default false;
