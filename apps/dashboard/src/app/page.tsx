import { redirect } from "next/navigation";
import { getApplicationsAction } from "@/actions/applications";
import { BottomWaves } from "@/components/background/BottomWaves";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  getAuthToken,
  getSelectedAppSession,
  getSessionUser,
} from "@/lib/session";
import { ApplicationSelector } from "@/modules/applications/components/ApplicationSelector";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const token = await getAuthToken();
  if (!token) {
    redirect("/signin");
  }

  const [user, applications, selectedApp] = await Promise.all([
    getSessionUser(),
    getApplicationsAction(),
    getSelectedAppSession(),
  ]);

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-canvas text-foreground">
      {/* Top Header: Logo on left, application switcher, theme toggle & user avatar */}
      <DashboardHeader
        user={user}
        application={selectedApp}
        applications={applications}
      />

      {/* Main Content: Application Selector Card */}
      <main className="flex flex-1 items-center justify-center p-4">
        <ApplicationSelector initialApplications={applications} />
      </main>
      <BottomWaves />
    </div>
  );
}
