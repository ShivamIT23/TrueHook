import { redirect } from "next/navigation";
import { BackgroundSVG } from "@/components/background/BackgroundSVG";
import { getAuthToken } from "@/lib/session";
import { SignUpForm } from "@/modules/auth/SignUpForm";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const token = await getAuthToken();
  if (token) {
    redirect("/");
  }

  return (
    <main className="dark relative isolate min-h-screen overflow-hidden bg-[#111111] px-4 text-[#F3EEE3]">
      <BackgroundSVG />
      <SignUpForm />
    </main>
  );
}
