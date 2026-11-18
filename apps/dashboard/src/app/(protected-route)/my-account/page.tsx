import { getUserAction } from "@/actions/user";
import { getSessionUser } from "@/lib/session";
import { MyAccountManager } from "@/modules/account/components/MyAccountManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | TrueHook",
  description:
    "View and manage your TrueHook personal account and profile settings.",
};

export default async function MyAccountPage() {
  const [dbUser, sessionUser] = await Promise.all([
    getUserAction(),
    getSessionUser(),
  ]);

  const user = dbUser || sessionUser;

  return <MyAccountManager user={user} />;
}
