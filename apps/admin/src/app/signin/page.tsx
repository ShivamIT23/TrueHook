import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/session";
import { AdminSignInForm } from "@/modules/auth/AdminSignInForm";

export default async function AdminSignIn() {
  const adminUser = await getAdminSessionUser();
  if (adminUser) {
    redirect("/overview");
  }

  return (
    <main className="dark relative isolate min-h-screen overflow-hidden bg-background px-4 text-foreground">
      <AdminSignInForm />
    </main>
  );
}
