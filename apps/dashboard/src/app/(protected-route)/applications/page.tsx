import { getApplicationsAction } from "@/actions/applications";
import { getSelectedAppSession } from "@/lib/session";
import { ApplicationsManager } from "@/modules/applications/components/ApplicationsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Applications | TrueHook",
  description: "Manage your TrueHook applications and webhook environments.",
};

export default async function ApplicationsPage() {
  const [applications, selectedApp] = await Promise.all([
    getApplicationsAction(),
    getSelectedAppSession(),
  ]);

  return (
    <ApplicationsManager
      initialApplications={applications}
      activeApplication={selectedApp}
    />
  );
}
