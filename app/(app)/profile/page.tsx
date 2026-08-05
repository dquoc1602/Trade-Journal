import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ProfileManager } from "@/components/profile/ProfileManager";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <PageHeader title="Hồ sơ cá nhân" description="Quản lý thông tin tài khoản đăng nhập của bạn." />
      <ProfileManager
        email={user?.email ?? ""}
        displayName={typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : ""}
        createdAt={user?.created_at ?? ""}
      />
    </div>
  );
}
