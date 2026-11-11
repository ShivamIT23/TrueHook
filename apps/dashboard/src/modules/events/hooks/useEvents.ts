"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEventsAction,
  getEventByIdAction,
  publishEventAction,
} from "@/actions/events";
import {
  type EventItem,
  type EventDetail,
  initialPublishEventState,
} from "@/modules/events/types";

export const eventsKeys = {
  all: ["events"] as const,
  list: (applicationId: string) =>
    [...eventsKeys.all, "list", applicationId] as const,
  detail: (applicationId: string, eventId: string) =>
    [...eventsKeys.all, "detail", applicationId, eventId] as const,
};

export function useEventsQuery(
  applicationId: string,
  initialData?: { events: EventItem[]; total: number },
) {
  return useQuery({
    queryKey: eventsKeys.list(applicationId),
    queryFn: () => getEventsAction(applicationId),
    initialData,
    enabled: Boolean(applicationId),
  });
}

export function useEventDetailQuery(applicationId: string, eventId: string) {
  return useQuery({
    queryKey: eventsKeys.detail(applicationId, eventId),
    queryFn: () => getEventByIdAction(applicationId, eventId),
    enabled: Boolean(applicationId && eventId),
  });
}

export function usePublishEventMutation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      eventTypeId: string;
      payloadJson: string;
    }) => {
      const formData = new FormData();
      formData.append("application_id", applicationId);
      formData.append("event_type_id", payload.eventTypeId);
      formData.append("payload", payload.payloadJson);

      const result = await publishEventAction(
        initialPublishEventState,
        formData,
      );
      if (!result.success) {
        throw result;
      }
      return result.event;
    },
    onSuccess: (newEvent) => {
      if (newEvent) {
        queryClient.setQueryData<{ events: EventItem[]; total: number }>(
          eventsKeys.list(applicationId),
          (prev = { events: [], total: 0 }) => ({
            events: [newEvent, ...prev.events],
            total: prev.total + 1,
          }),
        );
      }
      queryClient.invalidateQueries({
        queryKey: eventsKeys.list(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries"],
      });
    },
  });
}
