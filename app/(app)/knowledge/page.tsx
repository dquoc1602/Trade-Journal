import { PageHeader } from "@/components/PageHeader";
import { KnowledgeBrowser } from "@/components/knowledge/KnowledgeBrowser";

export default function KnowledgePage() {
  return (
    <div>
      <PageHeader
        title="Kiến thức ICT / Smart Money Concepts"
        description="Tra cứu nhanh các khái niệm cốt lõi để đặt tên & viết checklist chiến lược chuẩn hơn."
      />
      <KnowledgeBrowser />
    </div>
  );
}
