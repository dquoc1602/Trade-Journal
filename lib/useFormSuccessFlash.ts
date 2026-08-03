"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Theo dõi state trả về từ useFormState và bật cờ "vừa lưu thành công" trong `flashMs`
 * sau mỗi lần submit không lỗi. Bỏ qua lần render đầu (mount) bằng cách so sánh REFERENCE
 * của object `state` với giá trị khởi tạo ban đầu — KHÔNG dùng cờ boolean qua useRef, vì
 * React StrictMode (dev mode) cố tình chạy effect 2 lần lúc mount để phát hiện side-effect
 * không sạch; một cờ boolean đơn giản sẽ bị "lật" sai ở lần chạy thứ 2 đó và khiến hàm
 * onSuccess bị gọi nhầm ngay khi component vừa mount (chưa hề có submit nào xảy ra).
 * So sánh reference thì an toàn: state chỉ đổi reference sau khi dispatch thật sự chạy.
 */
export function useFormSuccessFlash(state: { error: string | null }, onSuccess?: () => void, flashMs = 2500) {
  const [flash, setFlash] = useState(false);
  const initialStateRef = useRef(state);

  useEffect(() => {
    if (state === initialStateRef.current) return; // chưa có submit nào — kể cả khi effect bị StrictMode gọi lại
    if (!state.error) {
      setFlash(true);
      onSuccess?.();
      const t = setTimeout(() => setFlash(false), flashMs);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return flash;
}
