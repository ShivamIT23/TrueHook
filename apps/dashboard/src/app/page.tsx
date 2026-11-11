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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ switch?: string }>;
}) {
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  const params = await searchParams;
  const isSwitching = params?.switch === "true";

  // If user already has a saved application, send to dashboard page
  const selectedApp = await getSelectedAppSession();
  if (selectedApp && !isSwitching) {
    redirect("/dashboard");
  }

  const user = await getSessionUser();
  const applications = await getApplicationsAction();

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-canvas text-foreground">
      {/* Top Header: Logo on left, user avatar with first letter on right */}
      <DashboardHeader user={user} />

      {/* Main Content: Application Selector Card matching user's design */}
      <main className="flex flex-1 items-center justify-center p-4">
        <ApplicationSelector initialApplications={applications} />
      </main>
      <BottomWaves />
    </div>
  );
}
