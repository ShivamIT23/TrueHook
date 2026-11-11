import { Send } from "lucide-react";
import { getSelectedAppSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const application = await getSelectedAppSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brass">
          <Send className="h-4 w-4" />
          <span>Events</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Event Stream
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor incoming and published events for{" "}
          <span className="font-semibold text-foreground">
            {application?.name || "your application"}
          </span>
          .
        </p>
      </div>
    </div>
  );
}
