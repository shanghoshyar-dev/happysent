import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/topbar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  return (
    <div className="flex min-h-screen bg-cream-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopBar email={user.email} />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
