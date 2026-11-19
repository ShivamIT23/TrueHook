import type { Metadata } from "next";
import { TermsContent } from "@/modules/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms and Conditions — TrueHook",
  description:
    "Review the terms of service, acceptable use policy, and delivery semantics governing the TrueHook webhook platform.",
};

export default function TermsPage() {
  return <TermsContent />;
}
