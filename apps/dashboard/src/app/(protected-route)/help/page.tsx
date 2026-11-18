import { HelpSupportManager } from "@/modules/help/components/HelpSupportManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Help & Support | TrueHook",
  description:
    "Developer resources, documentation guides, and TrueHook technical support.",
};

export default function HelpPage() {
  return <HelpSupportManager />;
}
