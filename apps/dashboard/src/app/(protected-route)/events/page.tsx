import { getEventsAction } from "@/actions/events";
import { getEventTypesAction } from "@/actions/event-types";
import { getSelectedAppSession } from "@/lib/session";
import { EventsManager } from "@/modules/events/components/EventsManager";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const application = await getSelectedAppSession();
  const [eventsData, eventTypes] = await Promise.all([
    application?.id
      ? getEventsAction(application.id)
      : Promise.resolve({ events: [], total: 0 }),
    application?.id
      ? getEventTypesAction(application.id)
      : Promise.resolve([]),
  ]);

  return (
    <EventsManager
      application={application}
      initialEvents={eventsData.events}
      totalEvents={eventsData.total}
      eventTypes={eventTypes}
    />
  );
}
