import { getEventTypesAction } from "@/actions/event-types";
import { getSelectedAppSession } from "@/lib/session";
import { EventTypesManager } from "@/modules/event-types/components/EventTypesManager";

export const dynamic = "force-dynamic";

export default async function EventTypePage() {
  const application = await getSelectedAppSession();
  const eventTypes = application?.id
    ? await getEventTypesAction(application.id)
    : [];

  return (
    <EventTypesManager
      application={application}
      initialEventTypes={eventTypes}
    />
  );
}
