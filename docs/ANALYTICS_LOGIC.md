# Logic phân tích & chấm điểm (Analytics)

Suy ra từ hành vi quan sát được trên UI (số liệu thay đổi theo bộ lọc, cách checklist tính %...). Đây là logic nghiệp vụ cần cài đặt ở backend, không phải thiết kế AI.

## 1. Các công thức thống kê chuẩn (không cần AI, tính bằng SQL/aggregation)

| Chỉ số | Công thức |
|---|---|
| **Lợi nhuận ròng (Net P&L)** | Tổng `pnl` của các lệnh trong phạm vi lọc |
| **Lợi nhuận TB/Lệnh** | Net P&L ÷ số lệnh |
| **Tỷ lệ thắng (Win Rate)** | (số lệnh có `pnl > 0`) ÷ (tổng số lệnh đã đóng) × 100 |
| **Hệ số lợi nhuận (Profit Factor)** | Tổng lợi nhuận các lệnh thắng ÷ \|Tổng lỗ các lệnh thua\| |
| **Equity Curve** | Cộng dồn (cumulative sum) `pnl` theo thứ tự `close_time` tăng dần, cộng vào số dư ban đầu |
| **Chuỗi thắng hiện tại (Win Streak)** | Đếm số lệnh thắng liên tiếp gần nhất (dừng đếm khi gặp lệnh thua) |
| **Kỷ lục chuỗi thắng** | Max của mọi streak thắng liên tiếp trong toàn bộ lịch sử |

## 2. Chấm điểm Kỷ luật (Compliance Score) — giá trị lõi khác biệt

Đây **không phải** thuật toán AI — là phép tính tỷ lệ đơn giản nhưng chính là "chất xám" cốt lõi của sản phẩm:

```
Với mỗi lệnh đã gán 1 Strategy:
  compliance_lệnh (%) = (số rule được tick ✓) / (tổng số rule của strategy đó) × 100

Với toàn bộ tài khoản/kỳ lọc:
  compliance_tổng (%) = trung bình cộng compliance_lệnh của mọi lệnh có gán strategy
                         (lệnh không gán strategy → không tính vào mẫu số, hoặc tính là 0% tùy quyết định thiết kế)

Chuỗi kỷ luật 100% = đếm số lệnh liên tiếp gần nhất có compliance_lệnh = 100%
```

**Vì sao đây là giá trị lõi**: nó biến 1 checklist định tính ("tôi có làm đúng quy trình không") thành 1 con số định lượng theo dõi được theo thời gian — cho phép trader thấy rõ "kỷ luật của tôi đang tăng hay giảm" thay vì chỉ cảm tính.

## 3. Phân tích Tâm lý (Psychology Breakdown)

Thuần túy `GROUP BY emotion_tag`:

```
Với mỗi nhóm cảm xúc (Calm, Focused, Confident, Neutral, Anxious, Fear, FOMO, Greedy, Revenge):
  - Đếm số lệnh
  - Tổng P&L của nhóm
  - Win Rate riêng của nhóm
```

Kết quả hiển thị dạng thẻ trên Dashboard — trader tự đọc ra pattern (VD nhóm "Bình thường/Neutral" toàn thua) mà không cần AI diễn giải.

## 4. AI Coach — lớp diễn giải bằng ngôn ngữ tự nhiên (đặt trên nền dữ liệu ở mục 1-3)

Đã kiểm chứng bằng cách thử trực tiếp tính năng "Phân tích tâm lý" trong AI Assistant: câu trả lời AI trích dẫn **chính xác** các con số đã thấy ở Dashboard (VD nhóm "Neutral": 6 lệnh, win rate 0%, lỗ ròng -$1,297.8 — khớp 100% với số trên Dashboard). Điều này cho thấy kiến trúc là:

```
[Bước 1] Backend tổng hợp sẵn số liệu thật của user (win rate theo cảm xúc, danh sách N lệnh gần nhất,
          rule hay bị bỏ qua nhất...) — giống hệt logic mục 1-3.
[Bước 2] Nhồi (inject) khối dữ liệu đã tổng hợp đó vào prompt gửi cho LLM, kèm câu hỏi của user
          (hoặc 1 trong 3 câu hỏi gợi ý: "Phân tích tâm lý" / "Phân tích chiến lược" / "Đánh giá kỷ luật").
[Bước 3] LLM chỉ đóng vai trò DIỄN GIẢI số liệu thật thành lời khuyên tự nhiên, có cấu trúc
          (không tự "bịa" số liệu — số liệu luôn đến từ bước 1).
```

Đây chính là mẫu hình **RAG/tool-context đơn giản**: không cần AI truy vấn DB trực tiếp qua tool-calling phức tạp — chỉ cần backend query sẵn rồi nhét vào system/user prompt là đủ để LLM "trông như" hiểu rõ dữ liệu cá nhân của user.

**Gợi ý triển khai nếu tự làm tính năng tương tự**:
1. Viết các query tổng hợp (giống mục 1-3) thành 1 hàm `buildUserTradingContext(userId, filters)` trả về JSON gọn.
2. Khi user bấm 1 trong các nút gợi ý (hoặc gõ câu hỏi tự do), gọi hàm trên lấy context → nhét vào prompt dạng: *"Đây là dữ liệu giao dịch thật của user: {json}. Hãy phân tích [chủ đề] dựa trên dữ liệu này, không suy diễn ngoài số liệu cho sẵn."*
3. Gọi LLM (Claude/GPT) với prompt đó → trả lời cho user.
4. Giới hạn số lượt gọi/tháng theo gói (đã thấy ở bảng giá) để kiểm soát chi phí token.

## 5. Điểm cần cẩn trọng khi tự triển khai

- Compliance % chỉ có ý nghĩa nếu checklist được thiết kế tốt (rule rõ ràng, không mơ hồ) — phần này phụ thuộc UX của module Strategies, không phải thuật toán.
- Nếu 1 lệnh không gán chiến lược, cần quyết định rõ: có tính vào compliance_tổng không? (ảnh hưởng lớn đến con số hiển thị, dễ gây hiểu nhầm nếu không nhất quán).
- AI Coach cần ràng buộc prompt chặt để tránh LLM đưa lời khuyên tài chính mang tính cam kết lợi nhuận — nên thêm disclaimer rõ ràng ("không phải lời khuyên đầu tư") để tránh rủi ro pháp lý.
