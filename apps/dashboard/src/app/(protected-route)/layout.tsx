import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getApplicationsAction } from "@/actions/applications";
import { ProtectedLayoutShell } from "@/components/layout/ProtectedLayoutShell";
import {
  getAuthToken,
  getSelectedAppSession,
  getSessionUser,
} from "@/lib/session";

export const metadata: Metadata = {
  title: "TrueHook Dashboard",
  description: "A Dashboard for users to access their applications",
};

export const dynamic = "force-dynamic";

export default async function ProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verify authentication token
  const token = await getAuthToken();
  if (!token) {
    redirect("/signin");
  }

  // 2. Verify active user session
  const user = await getSessionUser();
  if (!user) {
    redirect("/signin");
  }

  // 3. Verify selected application context & fetch applications
  const [selectedApp, applications] = await Promise.all([
    getSelectedAppSession(),
    getApplicationsAction(),
  ]);
  if (!selectedApp || !selectedApp.id) {
    redirect("/");
  }

  return (
    <ProtectedLayoutShell
      user={user}
      application={selectedApp}
      applications={applications}
    >
      {children}
    </ProtectedLayoutShell>
  );
}
