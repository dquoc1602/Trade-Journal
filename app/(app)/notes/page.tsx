import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { NotesManager } from "@/components/notes/NotesManager";
import type { DailyNote } from "@/lib/types";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("daily_notes").select("*").order("note_date", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Nhật ký Tâm sự & Đánh giá Thị trường"
        description="Ghi chép tâm lý giao dịch, đánh giá xu hướng thị trường hàng ngày để tìm ra các lỗi hành vi."
      />
      <NotesManager notes={(notes as DailyNote[]) ?? []} />
    </div>
  );
}
