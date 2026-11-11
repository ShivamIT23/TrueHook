import { redirect } from "next/navigation";
import { BackgroundSVG } from "@/components/background/BackgroundSVG";
import { getAuthToken } from "@/lib/session";
import { RegisterForm } from "@/modules/auth/RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const token = await getAuthToken();
  if (token) {
    redirect("/");
  }

  return (
    <main className="dark relative isolate min-h-screen overflow-hidden bg-[#141412] px-4 text-[#f2f2e8]">
      <BackgroundSVG />
      <RegisterForm />
    </main>
  );
}
