import type { Metadata } from "next";
import { RefundContent } from "@/modules/legal/RefundContent";

export const metadata: Metadata = {
  title: "Refund Policy — TrueHook",
  description:
    "Learn about TrueHook's 14-day money-back guarantee, SLA downtime credits, and cancellation terms.",
};

export default function RefundPage() {
  return <RefundContent />;
}
