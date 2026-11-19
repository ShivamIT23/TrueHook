import type { Metadata } from "next";
import { PrivacyContent } from "@/modules/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — TrueHook",
  description:
    "Learn how TrueHook protects your account credentials, ephemerally processes webhook payloads, and upholds zero payload monetization.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
