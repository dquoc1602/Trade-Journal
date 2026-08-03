export type IctConcept = {
  id: string;
  category: string;
  name: string;
  shortName?: string;
  summary: string;
  description: string;
};

export const ICT_CATEGORIES = [
  "Cấu trúc thị trường",
  "Vùng giá & Thanh khoản",
  "Mô hình Setup",
  "Thời gian & Phiên giao dịch",
  "Tư duy Smart Money",
] as const;

/**
 * Tổng hợp lại các khái niệm cốt lõi của trường phái ICT/SMC (Inner Circle Trader /
 * Smart Money Concepts) — nội dung được diễn giải lại theo hiểu biết chung, phổ biến
 * rộng rãi trong cộng đồng trading, không sao chép nguyên văn từ bất kỳ khóa học hay
 * tài liệu có bản quyền cụ thể nào. Dùng làm tài liệu tham khảo nhanh khi đặt tên
 * chiến lược / viết checklist ở module Chiến lược.
 */
export const ICT_CONCEPTS: IctConcept[] = [
  // ===== Cấu trúc thị trường =====
  {
    id: "market-structure",
    category: "Cấu trúc thị trường",
    name: "Cấu trúc thị trường (Market Structure)",
    summary: "Chuỗi đỉnh/đáy xác định xu hướng đang tăng, giảm hay đi ngang.",
    description:
      "Thị trường di chuyển bằng các đợt sóng tạo đỉnh (swing high) và đáy (swing low) liên tiếp. Xu hướng tăng là chuỗi Higher High (HH) và Higher Low (HL); xu hướng giảm là chuỗi Lower High (LH) và Lower Low (LL). Đọc đúng cấu trúc là nền tảng để biết nên tìm lệnh mua hay bán, và để nhận ra khi nào xu hướng có dấu hiệu đảo chiều.",
  },
  {
    id: "bos",
    category: "Cấu trúc thị trường",
    name: "Phá vỡ cấu trúc (Break of Structure)",
    shortName: "BOS",
    summary: "Giá phá qua đỉnh/đáy gần nhất theo đúng hướng xu hướng hiện tại — xác nhận xu hướng tiếp diễn.",
    description:
      "BOS xảy ra khi giá đóng cửa vượt qua một đỉnh (trong xu hướng tăng) hoặc đáy (trong xu hướng giảm) trước đó, xác nhận xu hướng hiện tại vẫn còn hiệu lực. Khác với MSS, BOS đi CÙNG chiều với xu hướng đang diễn ra, nên thường được dùng để xác nhận tiếp tục nắm giữ hoặc vào thêm lệnh thuận xu hướng.",
  },
  {
    id: "mss",
    category: "Cấu trúc thị trường",
    name: "Đảo chiều cấu trúc (Market Structure Shift)",
    shortName: "MSS",
    summary: "Giá phá vỡ đỉnh/đáy theo hướng NGƯỢC xu hướng hiện tại — tín hiệu đảo chiều sớm.",
    description:
      "MSS là khi giá phá vỡ một điểm cấu trúc quan trọng theo chiều ngược lại với xu hướng đang diễn ra (VD: trong downtrend, giá phá qua 1 đỉnh nội bộ) — đây là tín hiệu sớm cho thấy phe kiểm soát thị trường có thể đang đổi chủ. MSS thường đi kèm một cú đẩy giá mạnh (displacement) và thường tạo ra FVG ngay tại điểm phá vỡ, là 2 yếu tố hay được dùng để xác nhận MSS thật (không phải nhiễu).",
  },
  {
    id: "displacement",
    category: "Cấu trúc thị trường",
    name: "Cú đẩy giá mạnh (Displacement)",
    summary: "Một hoặc vài nến di chuyển rất nhanh, thân dài, thể hiện dòng lệnh tổ chức đang tham gia.",
    description:
      "Displacement là chuyển động giá mạnh, dứt khoát, thường vượt xa biên độ trung bình các nến trước đó — dấu hiệu cho thấy dòng tiền lớn (smart money) đang thực sự nhập cuộc chứ không phải biến động ngẫu nhiên. Displacement thường đi kèm việc để lại 1 hoặc nhiều FVG, và là điều kiện bắt buộc trong hầu hết các mô hình entry của ICT để phân biệt tín hiệu thật với nhiễu giá.",
  },

  // ===== Vùng giá & Thanh khoản =====
  {
    id: "fvg",
    category: "Vùng giá & Thanh khoản",
    name: "Khoảng trống giá trị hợp lý (Fair Value Gap)",
    shortName: "FVG",
    summary: "Khoảng trống giá giữa 3 nến liên tiếp, nơi giá di chuyển quá nhanh chưa kịp khớp lệnh 2 chiều.",
    description:
      "FVG hình thành khi đuôi nến 1 và đuôi nến 3 (trong chuỗi 3 nến liên tiếp) không giao nhau — để lại một khoảng trống thể hiện sự mất cân bằng cung/cầu tạm thời. Giá thường có xu hướng quay lại 'lấp đầy' (fill) vùng này trước khi tiếp tục di chuyển, nên FVG hay được dùng làm vùng chờ giá hồi về để vào lệnh theo hướng của cú đẩy đã tạo ra nó.",
  },
  {
    id: "order-block",
    category: "Vùng giá & Thanh khoản",
    name: "Khối lệnh tổ chức (Order Block)",
    shortName: "OB",
    summary: "Nến ngược chiều cuối cùng trước một cú đẩy giá mạnh — nơi được cho là còn lệnh tổ chức chưa khớp hết.",
    description:
      "Order Block thường là cây nến giảm cuối cùng trước một đợt tăng mạnh (bullish OB) hoặc nến tăng cuối cùng trước một đợt giảm mạnh (bearish OB). Giả thuyết là tổ chức lớn đã đặt lệnh tại vùng này nhưng chưa khớp hết, nên khi giá quay lại đây thường có phản ứng — order block hay được dùng kết hợp với FVG để xác định vùng entry có xác suất cao hơn.",
  },
  {
    id: "breaker-block",
    category: "Vùng giá & Thanh khoản",
    name: "Khối phá vỡ (Breaker Block)",
    shortName: "BB",
    summary: "Một Order Block bị phá vỡ rồi đổi vai trò: từ kháng cự thành hỗ trợ hoặc ngược lại.",
    description:
      "Khi giá phá vỡ qua một Order Block (thường kèm MSS), chính vùng đó có thể đổi vai trò: một OB tăng bị phá vỡ có thể trở thành vùng kháng cự khi giá hồi lại, và ngược lại. Breaker Block thường được dùng làm vùng entry cho các lệnh đảo chiều, đặc biệt hiệu quả khi hợp lưu (confluence) với một FVG nằm đè lên nó.",
  },
  {
    id: "mitigation-block",
    category: "Vùng giá & Thanh khoản",
    name: "Khối bù trừ (Mitigation Block)",
    summary: "Vùng giá tổ chức quay lại để 'bù' cho lệnh vào giá xấu trước khi đẩy giá tiếp tục.",
    description:
      "Tương tự Breaker Block nhưng hình thành trong bối cảnh khác: đây là vùng cấu trúc hình thành ngay TRƯỚC khi có cú đẩy giá mạnh phá vỡ cấu trúc theo hướng ngược, thể hiện tổ chức 'bù trừ' vị thế vào giá không tối ưu trước đó rồi mới đẩy giá đi tiếp. Thường dùng để tìm điểm vào lệnh khi giá hồi về đúng vùng này lần nữa.",
  },
  {
    id: "liquidity-pool",
    category: "Vùng giá & Thanh khoản",
    name: "Vùng thanh khoản (Liquidity Pool — BSL/SSL)",
    summary: "Nơi tập trung lệnh dừng lỗ/chờ của số đông trader — nam châm hút giá trước khi đảo chiều thật.",
    description:
      "Buy-side Liquidity (BSL) nằm phía trên các đỉnh gần nhau (nơi trader bán đặt SL, trader breakout đặt lệnh mua); Sell-side Liquidity (SSL) nằm dưới các đáy gần nhau. Vì đây là nơi tập trung số lượng lệnh chờ lớn, giá thường bị 'hút' đến các vùng này trước khi thực sự đảo chiều — ICT gọi đây là điểm đến (draw on liquidity) mà giá có xu hướng tìm tới.",
  },
  {
    id: "liquidity-sweep",
    category: "Vùng giá & Thanh khoản",
    name: "Quét thanh khoản (Liquidity Sweep / Stop Hunt)",
    summary: "Giá xuyên qua 1 đỉnh/đáy để kích hoạt lệnh dừng, rồi đảo chiều ngay sau đó.",
    description:
      "Đây là hành vi giá đâm xuyên qua một vùng liquidity pool (thường chỉ vài pip đến vài chục pip), quét sạch các lệnh dừng lỗ/chờ tại đó, rồi đảo chiều mạnh ngay sau đó — thường để lại một cây nến có râu (wick) dài. Sweep thường là bước đầu tiên trong nhiều mô hình ICT (Turtle Soup, Judas Swing) vì nó cung cấp thanh khoản để tổ chức lớn vào lệnh theo hướng ngược lại.",
  },
  {
    id: "premium-discount",
    category: "Vùng giá & Thanh khoản",
    name: "Vùng Premium / Discount & Equilibrium",
    summary: "Chia đôi 1 con sóng bằng mốc 50% để biết đang mua đắt (premium) hay mua rẻ (discount).",
    description:
      "Lấy điểm cao nhất và thấp nhất của một con sóng (dao động), mốc 50% ở giữa gọi là Equilibrium. Nửa phía trên là vùng Premium (giá 'đắt' — ưu tiên tìm lệnh bán); nửa phía dưới là vùng Discount (giá 'rẻ' — ưu tiên tìm lệnh mua). Nguyên tắc chung: chỉ tìm lệnh mua khi giá đang ở vùng Discount của xu hướng tăng, và tìm lệnh bán khi giá đang ở vùng Premium của xu hướng giảm.",
  },

  // ===== Mô hình Setup =====
  {
    id: "silver-bullet",
    category: "Mô hình Setup",
    name: "Silver Bullet",
    summary: "Setup săn FVG trong khung giờ 1 tiếng đầu mỗi phiên giao dịch chính (10-11h NY, 3-4h London...).",
    description:
      "Silver Bullet tập trung vào khung giờ 1 tiếng cố định ngay đầu phiên (phổ biến nhất là 10:00-11:00 sáng giờ New York), tìm một cú MSS/displacement tạo FVG trong khung giờ đó rồi vào lệnh limit tại FVG theo hướng của cú đẩy. Điểm mạnh của mô hình là khung thời gian rất cụ thể giúp trader dễ kỷ luật hơn (chỉ theo dõi thị trường trong khung giờ vàng thay vì cả ngày).",
  },
  {
    id: "judas-swing",
    category: "Mô hình Setup",
    name: "Judas Swing",
    summary: "Giá 'lừa' phá vỡ giả biên độ phiên Á ngay khi phiên London/NY mở cửa, rồi đảo chiều mạnh.",
    description:
      "Đặt tên theo hành vi 'phản bội' phe đang thắng thế: khi một phiên lớn (London hoặc New York) vừa mở cửa, giá thường quét qua đỉnh hoặc đáy của biên độ tích lũy phiên trước đó (thường là phiên Á) để lấy thanh khoản, tạo cảm giác breakout giả, rồi đảo chiều dứt khoát theo hướng thật của ngày. Trader chờ cú quét này kết hợp MSS ngược lại để vào lệnh.",
  },
  {
    id: "turtle-soup",
    category: "Mô hình Setup",
    name: "Turtle Soup",
    summary: "Đánh ngược lại một cú phá vỡ đỉnh/đáy 20 ngày (hoặc đỉnh/đáy gần nhất) thất bại.",
    description:
      "Lấy cảm hứng (và đặt tên nghịch) từ chiến lược breakout kinh điển 'Turtle Trading'. Khi giá phá vỡ qua một đỉnh/đáy quan trọng (VD đỉnh/đáy ngày hôm trước) nhưng không duy trì được đà đi, nhanh chóng bị đẩy ngược trở lại — đây là dấu hiệu breakout giả (liquidity sweep) và trader vào lệnh ngược hướng breakout đó ngay khi giá xác nhận quay đầu.",
  },
  {
    id: "unicorn-model",
    category: "Mô hình Setup",
    name: "Unicorn Model",
    summary: "Hợp lưu hiếm gặp giữa Breaker Block và FVG nằm đè lên nhau — vùng entry chất lượng cao.",
    description:
      "Đây là setup hợp lưu (confluence) giữa 2 yếu tố: một Breaker Block và một Fair Value Gap trùng khớp lên cùng một vùng giá. Vì xác suất cả hai yếu tố xuất hiện đồng thời tại cùng 1 vùng không cao, mô hình được đặt tên 'Unicorn' (hiếm) — khi xảy ra thường được xem là vùng entry có chất lượng và tỷ lệ Risk:Reward tốt hơn setup đơn lẻ.",
  },
  {
    id: "mmxm",
    category: "Mô hình Setup",
    name: "Market Maker Model (MMXM)",
    summary: "Chu kỳ 4 giai đoạn dòng vốn tổ chức: Tích lũy → Thao túng → Phân phối → Tiếp diễn/Đảo chiều.",
    description:
      "Mô hình mô tả cách 'nhà tạo lập thị trường' vận hành theo chu kỳ: Tích lũy (đi ngang, gom lệnh), Thao túng (quét thanh khoản 1 hướng để đánh lừa số đông), Phân phối (đẩy giá thật theo hướng đã định từ đầu), rồi lặp lại chu kỳ mới hoặc đảo chiều toàn bộ. Hiểu MMXM giúp trader tránh bị 'thao túng' vào lệnh sai pha và canh đúng giai đoạn Phân phối để vào lệnh thuận dòng tiền lớn.",
  },
  {
    id: "ote",
    category: "Mô hình Setup",
    name: "Optimal Trade Entry (OTE)",
    summary: "Vùng thoái lui 62%-79% (Fibonacci) của một con sóng — điểm vào lệnh tối ưu theo ICT.",
    description:
      "Sau khi xác định một con sóng đẩy (impulse leg) rõ ràng, ICT khuyến nghị chờ giá hồi về vùng Fibonacci retracement 62%-79% (đặc biệt quanh mốc 70.5%) trước khi vào lệnh theo hướng con sóng đó — đây là vùng cân bằng giữa việc vào giá đủ tốt (risk nhỏ) và xác suất giá còn quay lại đủ sâu để hợp lưu với Order Block/FVG bên dưới/trên.",
  },
  {
    id: "power-of-three",
    category: "Mô hình Setup",
    name: "Power of Three (AMD)",
    summary: "Mọi khung thời gian (ngày/tuần/phiên) đều vận động theo 3 giai đoạn: Accumulation – Manipulation – Distribution.",
    description:
      "Power of Three mô tả nhịp điệu lặp lại ở mọi khung thời gian: (1) Accumulation — giá tích lũy đi ngang trong biên độ hẹp; (2) Manipulation — giá quét thanh khoản 1 hướng (thường ngược xu hướng thật) để lấy dữ liệu/thanh khoản; (3) Distribution — giá di chuyển mạnh theo hướng thật trong ngày/phiên đó. Nhận diện đúng giai đoạn Manipulation giúp trader không bị 'mắc bẫy' và chờ đúng thời điểm Distribution để vào lệnh.",
  },

  // ===== Thời gian & Phiên giao dịch =====
  {
    id: "killzones",
    category: "Thời gian & Phiên giao dịch",
    name: "Khung giờ vàng (Killzones)",
    summary: "Các khung giờ có xác suất biến động mạnh cao nhất trong ngày, gắn với giờ mở cửa các phiên lớn.",
    description:
      "ICT chia ngày giao dịch thành các khung giờ trọng điểm nơi thanh khoản và biến động thường cao nhất: London Killzone (khoảng 2h-5h sáng giờ NY, tức ~14h-17h giờ VN), New York Killzone (7h-10h sáng giờ NY, ~19h-22h giờ VN), và Asian Killzone (khung tích lũy trước 2 phiên trên). Phần lớn các mô hình entry của ICT (Silver Bullet, Judas Swing) được thiết kế để hoạt động trong các khung giờ này.",
  },
  {
    id: "daily-bias",
    category: "Thời gian & Phiên giao dịch",
    name: "Nhận định thiên hướng ngày (Daily Bias)",
    summary: "Xác định trước xu hướng dự kiến trong ngày dựa trên cấu trúc khung lớn, trước khi vào lệnh khung nhỏ.",
    description:
      "Trước khi tìm entry ở khung thời gian nhỏ (M5, M15), ICT khuyến khích xác định thiên hướng tổng thể của ngày (tăng hay giảm) dựa trên cấu trúc ở khung H4/H1, các vùng liquidity chưa được quét, và vị trí giá đang ở Premium hay Discount. Daily bias giúp trader chỉ tìm lệnh THEO đúng hướng đã nhận định, tránh đánh ngược dòng tiền lớn trong ngày.",
  },
  {
    id: "asian-range",
    category: "Thời gian & Phiên giao dịch",
    name: "Biên độ phiên Á (Asian Range)",
    summary: "Vùng tích lũy giá hình thành trong phiên Á, thường là 'mồi' bị quét khi phiên London/NY mở cửa.",
    description:
      "Trong phiên Á (thường thanh khoản thấp), giá có xu hướng đi ngang tạo một biên độ (range) rõ ràng. Đỉnh/đáy của biên độ này thường trở thành mục tiêu thanh khoản bị quét (liquidity sweep) ngay khi phiên London hoặc New York mở cửa — đây chính là cơ sở của mô hình Judas Swing.",
  },

  // ===== Tư duy Smart Money =====
  {
    id: "smart-money-concepts",
    category: "Tư duy Smart Money",
    name: "Smart Money Concepts (SMC)",
    summary: "Tư duy đọc thị trường theo góc nhìn dòng tiền tổ chức thay vì chỉ dùng chỉ báo kỹ thuật truyền thống.",
    description:
      "SMC là tên gọi chung cho hệ tư duy phân tích thị trường dựa trên hành vi của dòng tiền lớn (ngân hàng, quỹ, tổ chức) thay vì các chỉ báo trễ (lagging indicators) truyền thống. Cốt lõi là hiểu rằng giá không di chuyển ngẫu nhiên mà bị dẫn dắt bởi nhu cầu tạo thanh khoản và tái cân bằng giá trị của các bên tham gia lớn — ICT là một trong những trường phái phổ biến nhất thuộc nhóm tư duy này.",
  },
  {
    id: "institutional-order-flow",
    category: "Tư duy Smart Money",
    name: "Dòng lệnh tổ chức (Institutional Order Flow)",
    summary: "Hướng di chuyển giá thực sự mà dòng tiền lớn đang đẩy, thường khác với cảm nhận của số đông.",
    description:
      "Institutional Order Flow là hướng đi thật của thị trường theo góc nhìn dòng tiền lớn — thường KHÔNG trùng với chuyển động giá 'trực quan' mà trader nhỏ lẻ nhìn thấy trong ngắn hạn. Việc xác định đúng dòng lệnh tổ chức (qua cấu trúc khung lớn, các vùng liquidity đã/chưa bị quét) là mục tiêu cốt lõi của toàn bộ phương pháp ICT, thay vì chỉ phản ứng theo giá ở khung nhỏ.",
  },
  {
    id: "draw-on-liquidity",
    category: "Tư duy Smart Money",
    name: "Điểm đến thanh khoản (Draw on Liquidity)",
    summary: "Mục tiêu giá nhiều khả năng sẽ tìm đến tiếp theo, dựa trên nơi tập trung thanh khoản chưa bị quét.",
    description:
      "Thay vì đoán 'giá sẽ đi đâu' một cách cảm tính, ICT khuyến khích xác định draw on liquidity — tức là vùng liquidity pool (BSL/SSL) hoặc FVG gần nhất CHƯA bị quét/lấp, vì đó thường là nơi giá có động lực để tìm đến tiếp theo. Xác định đúng draw on liquidity giúp đặt mục tiêu chốt lời (TP) hợp lý hơn thay vì chốt lời tùy ý theo tỷ lệ R:R cố định.",
  },
];

export function ictConceptsByCategory(): Record<string, IctConcept[]> {
  const map: Record<string, IctConcept[]> = {};
  for (const cat of ICT_CATEGORIES) map[cat] = [];
  for (const c of ICT_CONCEPTS) {
    if (!map[c.category]) map[c.category] = [];
    map[c.category].push(c);
  }
  return map;
}
