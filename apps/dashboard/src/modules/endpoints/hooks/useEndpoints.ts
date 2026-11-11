"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEndpointAction,
  deleteEndpointAction,
  getEndpointsAction,
  updateEndpointAction,
} from "@/actions/endpoints";
import {
  type Endpoint,
  initialCreateEndpointState,
  initialUpdateEndpointState,
} from "@/modules/endpoints/types";

export const endpointsKeys = {
  all: ["endpoints"] as const,
  list: (applicationId: string) =>
    [...endpointsKeys.all, "list", applicationId] as const,
};

/**
 * Hook to fetch endpoints with caching, automatic revalidation, and SSR hydration.
 */
export function useEndpointsQuery(
  applicationId: string,
  initialData?: Endpoint[],
) {
  return useQuery({
    queryKey: endpointsKeys.list(applicationId),
    queryFn: () => getEndpointsAction(applicationId),
    initialData,
    enabled: Boolean(applicationId),
  });
}

/**
 * Mutation hook to create an endpoint with cache synchronization.
 */
export function useCreateEndpointMutation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      url: string;
      secret?: string;
      event_type_ids?: string[];
    }) => {
      const formData = new FormData();
      formData.append("application_id", applicationId);
      formData.append("url", payload.url);
      if (payload.secret) {
        formData.append("secret", payload.secret);
      }
      if (payload.event_type_ids) {
        for (const id of payload.event_type_ids) {
          formData.append("event_type_ids", id);
        }
      }

      const result = await createEndpointAction(
        initialCreateEndpointState,
        formData,
      );
      if (!result.success) {
        throw result;
      }
      return result.endpoint;
    },
    onSuccess: (newEndpoint) => {
      if (newEndpoint) {
        queryClient.setQueryData<Endpoint[]>(
          endpointsKeys.list(applicationId),
          (prev = []) => [newEndpoint, ...prev],
        );
      }
      queryClient.invalidateQueries({
        queryKey: endpointsKeys.list(applicationId),
      });
    },
  });
}

/**
 * Mutation hook to update an endpoint with cache synchronization.
 */
export function useUpdateEndpointMutation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      endpointId: string;
      url: string;
      secret?: string;
      enabled: boolean;
      event_type_ids?: string[];
    }) => {
      const formData = new FormData();
      formData.append("application_id", applicationId);
      formData.append("endpoint_id", payload.endpointId);
      formData.append("url", payload.url);
      if (payload.secret) {
        formData.append("secret", payload.secret);
      }
      formData.append("enabled", payload.enabled ? "true" : "false");
      if (payload.event_type_ids) {
        for (const id of payload.event_type_ids) {
          formData.append("event_type_ids", id);
        }
      }

      const result = await updateEndpointAction(
        initialUpdateEndpointState,
        formData,
      );
      if (!result.success) {
        throw result;
      }
      return result.endpoint;
    },
    onSuccess: (updated) => {
      if (updated) {
        queryClient.setQueryData<Endpoint[]>(
          endpointsKeys.list(applicationId),
          (prev = []) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
      queryClient.invalidateQueries({
        queryKey: endpointsKeys.list(applicationId),
      });
    },
  });
}

/**
 * Mutation hook to delete an endpoint with cache eviction.
 */
export function useDeleteEndpointMutation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (endpointId: string) => {
      const result = await deleteEndpointAction(applicationId, endpointId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete endpoint.");
      }
      return endpointId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Endpoint[]>(
        endpointsKeys.list(applicationId),
        (prev = []) => prev.filter((item) => item.id !== deletedId),
      );
      queryClient.invalidateQueries({
        queryKey: endpointsKeys.list(applicationId),
      });
    },
  });
}
