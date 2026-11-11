"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDeliveriesAction,
  getDeliveryByIdAction,
  replayDeliveryAction,
} from "@/actions/deliveries";
import type { DeliveryItem, DeliveryDetail } from "@/modules/deliveries/types";

export const deliveriesKeys = {
  all: ["deliveries"] as const,
  list: (applicationId: string, filter?: string) =>
    [...deliveriesKeys.all, "list", applicationId, filter || "all"] as const,
  detail: (applicationId: string, deliveryId: string) =>
    [...deliveriesKeys.all, "detail", applicationId, deliveryId] as const,
};

export function useDeliveriesQuery(
  applicationId: string,
  initialData?: { deliveries: DeliveryItem[]; total: number },
) {
  return useQuery({
    queryKey: deliveriesKeys.list(applicationId),
    queryFn: () => getDeliveriesAction(applicationId),
    initialData,
    enabled: Boolean(applicationId),
  });
}

export function useDeliveryDetailQuery(
  applicationId: string,
  deliveryId: string,
) {
  return useQuery({
    queryKey: deliveriesKeys.detail(applicationId, deliveryId),
    queryFn: () => getDeliveryByIdAction(applicationId, deliveryId),
    enabled: Boolean(applicationId && deliveryId),
  });
}

export function useReplayDeliveryMutation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deliveryId: string) => {
      const res = await replayDeliveryAction(applicationId, deliveryId);
      if (!res.success) {
        throw new Error(res.message || "Failed to schedule replay");
      }
      return res.delivery;
    },
    onSuccess: (updated) => {
      if (updated) {
        queryClient.setQueryData(
          deliveriesKeys.detail(applicationId, updated.id),
          updated,
        );
      }
      queryClient.invalidateQueries({
        queryKey: deliveriesKeys.list(applicationId),
      });
    },
  });
}
