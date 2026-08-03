# Đề xuất mô hình gói giá (tham khảo)

> Lưu ý: đây là mô hình **tham khảo cấu trúc phân hạng tính năng**, không phải bản sao nguyên văn bảng giá của sản phẩm tham khảo. Con số cụ thể (giá, số lượng giới hạn) bạn nên tự quyết định dựa trên chi phí vận hành (hạ tầng đồng bộ, chi phí gọi LLM nếu có AI Coach) và thị trường mục tiêu.

## Nguyên tắc phân hạng quan sát được

Sản phẩm tham khảo dùng 2 trục để phân hạng gói:

1. **Giới hạn số lượng** (số tài khoản giao dịch quản lý được, số chiến lược tạo được, số lượt phân tích AI/tháng)
2. **Mở khoá tính năng nâng cao** (bộ lọc tài khoản độc lập, thống kê điểm mù tâm lý, xuất báo cáo, tạo link chia sẻ, tạo ảnh xác thực...)

Đây là mô hình freemium khá chuẩn cho SaaS công cụ cá nhân: gói Free đủ dùng để tạo thói quen, gói trả phí mở khoá khi nhu cầu tăng (nhiều tài khoản hơn, cần báo cáo chuyên sâu hơn).

## Gợi ý cấu trúc 3 gói cho v1 (bỏ gói Academy vì ngoài phạm vi)

| Tiêu chí | Free | Pro (trả phí) |
|---|---|---|
| Số tài khoản giao dịch | Giới hạn thấp (VD 2-3) | Cao hơn hoặc không giới hạn |
| Số chiến lược tạo được | Giới hạn (VD 1-2) | Không giới hạn |
| Bộ lọc tài khoản độc lập | Không | Có |
| Xuất báo cáo (PDF/Excel) | Không | Có |
| Lịch P&L, Notes, Checklist kỷ luật | Có (đầy đủ, đây là giá trị lõi nên để free rộng rãi) | Có |

**Khuyến nghị**: đừng giới hạn tính năng **checklist kỷ luật** hay **nhật ký tâm lý** ở gói free — đây là giá trị lõi tạo thói quen sử dụng hàng ngày. Nên giới hạn ở các trục ít ảnh hưởng đến trải nghiệm cốt lõi: số lượng tài khoản, xuất báo cáo, tính năng "chuyên sâu" (AI, ảnh xác thực, chia sẻ link).

## Yếu tố chưa nên định giá ở v1

- AI Coach / phân tích LLM: chi phí biến đổi theo token, nên đợi có traction rồi mới thiết kế gói riêng cho tính năng này.
- Academy/Mentor mode: mô hình B2B2C khác hẳn (thu qua hoa hồng affiliate + subscription riêng) — tách thành sản phẩm phụ, không trộn vào bảng giá chính ở giai đoạn đầu.
