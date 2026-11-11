import { getSelectedAppSession, getSessionUser } from "@/lib/session";
import { DashboardOverview } from "@/modules/dashboard/DashboardOverview";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const application = await getSelectedAppSession();

  return <DashboardOverview user={user} application={application} />;
}
