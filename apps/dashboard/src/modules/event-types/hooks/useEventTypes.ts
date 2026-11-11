"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEventTypeAction,
  deleteEventTypeAction,
  getEventTypesAction,
  updateEventTypeAction,
} from "@/actions/event-types";
import {
  type EventType,
  initialCreateEventTypeState,
  initialUpdateEventTypeState,
} from "@/modules/event-types/types";

export const eventTypesKeys = {
  all: ["event-types"] as const,
  list: (applicationId: string) =>
    [...eventTypesKeys.all, "list", applicationId] as const,
};

/**
 * Hook to fetch event types with caching, automatic revalidation, and optional SSR hydration.
 */
export function useEventTypesQuery(
  applicationId: string,
  initialData?: EventType[],
) {
  return useQuery({
    queryKey: eventTypesKeys.list(applicationId),
    queryFn: () => getEventTypesAction(applicationId),
    initialData,
    enabled: Boolean(applicationId),
  });
}

/**
 * Mutation hook to create an event type with optimistic cache update and query invalidation.
 */
export function useCreateEventTypeMutation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description: string }) => {
      const formData = new FormData();
      formData.append("application_id", applicationId);
      formData.append("name", payload.name);
      formData.append("description", payload.description);

      const result = await createEventTypeAction(
        initialCreateEventTypeState,
        formData,
      );
      if (!result.success) {
        throw result;
      }
      return result.eventType;
    },
    onSuccess: (newEventType) => {
      if (newEventType) {
        queryClient.setQueryData<EventType[]>(
          eventTypesKeys.list(applicationId),
          (prev = []) => [newEventType, ...prev],
        );
      }
      queryClient.invalidateQueries({
        queryKey: eventTypesKeys.list(applicationId),
      });
    },
  });
}

/**
 * Mutation hook to update an event type with cache synchronization.
 */
export function useUpdateEventTypeMutation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      eventTypeId: string;
      name: string;
      description: string;
    }) => {
      const formData = new FormData();
      formData.append("application_id", applicationId);
      formData.append("event_type_id", payload.eventTypeId);
      formData.append("name", payload.name);
      formData.append("description", payload.description);

      const result = await updateEventTypeAction(
        initialUpdateEventTypeState,
        formData,
      );
      if (!result.success) {
        throw result;
      }
      return result.eventType;
    },
    onSuccess: (updated) => {
      if (updated) {
        queryClient.setQueryData<EventType[]>(
          eventTypesKeys.list(applicationId),
          (prev = []) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
      queryClient.invalidateQueries({
        queryKey: eventTypesKeys.list(applicationId),
      });
    },
  });
}

/**
 * Mutation hook to delete an event type with cache eviction.
 */
export function useDeleteEventTypeMutation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventTypeId: string) => {
      const result = await deleteEventTypeAction(applicationId, eventTypeId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete event type.");
      }
      return eventTypeId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<EventType[]>(
        eventTypesKeys.list(applicationId),
        (prev = []) => prev.filter((item) => item.id !== deletedId),
      );
      queryClient.invalidateQueries({
        queryKey: eventTypesKeys.list(applicationId),
      });
    },
  });
}
