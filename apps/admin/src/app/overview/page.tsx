import { redirect } from "next/navigation";
import { getAdminUsersAction, getSystemHealthAction } from "@/actions/users";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminSessionUser } from "@/lib/session";
import { OverviewManager } from "@/modules/overview/OverviewManager";

export default async function AdminOverviewPage() {
  const adminUser = await getAdminSessionUser();
  if (!adminUser) {
    redirect("/signin");
  }

  const [usersResult, healthResult] = await Promise.all([
    getAdminUsersAction(),
    getSystemHealthAction(),
  ]);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <AdminHeader user={adminUser} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <OverviewManager
          initialUsers={usersResult.users}
          initialHealth={healthResult}
          adminUser={adminUser}
          error={usersResult.error}
        />
      </main>
    </div>
  );
}
