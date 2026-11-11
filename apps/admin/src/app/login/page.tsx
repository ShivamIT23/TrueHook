import { BackgroundSVG } from "@/components/background/BackgroundSVG";
import { AdminLoginForm } from "@/modules/auth/AdminLoginForm";

export default function AdminLogin() {
  return (
    <main className="dark relative isolate min-h-screen overflow-hidden bg-[#141412] px-4 text-[#f2f2e8]">
      <BackgroundSVG />
      <AdminLoginForm />
    </main>
  );
}
