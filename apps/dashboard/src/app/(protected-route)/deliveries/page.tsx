import { Activity } from "lucide-react";
import { getSelectedAppSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const application = await getSelectedAppSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Activity className="h-4 w-4" />
          <span>Deliveries</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Delivery Attempts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect HTTP delivery attempts, response payloads, and replay failed
          messages for{" "}
          <span className="font-semibold text-foreground">
            {application?.name || "your application"}
          </span>
          .
        </p>
      </div>
    </div>
  );
}
