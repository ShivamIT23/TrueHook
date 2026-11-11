import { getDeliveriesAction } from "@/actions/deliveries";
import { getSelectedAppSession } from "@/lib/session";
import { DeliveriesManager } from "@/modules/deliveries/components/DeliveriesManager";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const application = await getSelectedAppSession();
  const deliveriesData = application?.id
    ? await getDeliveriesAction(application.id)
    : { deliveries: [], total: 0 };

  return (
    <DeliveriesManager
      application={application}
      initialDeliveries={deliveriesData.deliveries}
      totalDeliveries={deliveriesData.total}
    />
  );
}
