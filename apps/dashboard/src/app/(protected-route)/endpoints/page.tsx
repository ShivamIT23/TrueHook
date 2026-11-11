import { getEndpointsAction } from "@/actions/endpoints";
import { getSelectedAppSession } from "@/lib/session";
import { EndpointsManager } from "@/modules/endpoints/components/EndpointsManager";

export const dynamic = "force-dynamic";

export default async function EndpointsPage() {
  const application = await getSelectedAppSession();
  const endpoints = application?.id
    ? await getEndpointsAction(application.id)
    : [];

  return (
    <EndpointsManager application={application} initialEndpoints={endpoints} />
  );
}
