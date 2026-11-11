import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
    redirect("/login");
  }

  // 2. Verify active user session
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // 3. Verify selected application context
  const selectedApp = await getSelectedAppSession();
  if (!selectedApp || !selectedApp.id) {
    redirect("/");
  }

  return (
    <ProtectedLayoutShell user={user} application={selectedApp}>
      {children}
    </ProtectedLayoutShell>
  );
}
