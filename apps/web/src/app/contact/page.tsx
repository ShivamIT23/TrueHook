import type { Metadata } from "next";
import { ContactSection } from "@/modules/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact & Support — TrueHook",
  description:
    "Get in touch with TrueHook for developer support, enterprise inquiries, security audits, and billing requests.",
};

export default function ContactPage() {
  return <ContactSection />;
}
