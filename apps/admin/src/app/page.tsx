import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/session";

export default async function Home() {
  const adminUser = await getAdminSessionUser();
  if (adminUser) {
    redirect("/overview");
  }
  redirect("/signin");
}
