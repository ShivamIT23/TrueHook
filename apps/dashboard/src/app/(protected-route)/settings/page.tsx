import { getSelectedAppSession, getSessionUser } from "@/lib/session";
import { SettingsManager } from "@/modules/settings/components/SettingsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings | TrueHook",
  description:
    "Configure delivery retry policy, security protections, and notifications.",
};

export default async function SettingsPage() {
  const [selectedApp, user] = await Promise.all([
    getSelectedAppSession(),
    getSessionUser(),
  ]);

  return <SettingsManager application={selectedApp} user={user} />;
}
