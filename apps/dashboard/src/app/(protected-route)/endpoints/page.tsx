import { getEndpointsAction } from "@/actions/endpoints";
import { getEventTypesAction } from "@/actions/event-types";
import { getSelectedAppSession } from "@/lib/session";
import { EndpointsManager } from "@/modules/endpoints/components/EndpointsManager";

export const dynamic = "force-dynamic";

export default async function EndpointsPage() {
  const application = await getSelectedAppSession();
  const [endpoints, eventTypes] = await Promise.all([
    application?.id ? getEndpointsAction(application.id) : Promise.resolve([]),
    application?.id ? getEventTypesAction(application.id) : Promise.resolve([]),
  ]);

  return (
    <EndpointsManager
      application={application}
      initialEndpoints={endpoints}
      eventTypes={eventTypes}
    />
  );
}
