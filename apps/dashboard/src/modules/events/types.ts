export interface DeliverySummary {
  id: string;
  endpoint_id: string;
  endpoint_url: string;
  status: string;
  attempts: number;
  created_at: string;
}

export interface EventItem {
  id: string;
  application_id: string;
  event_type_id: string;
  event_type_name: string;
  payload: Record<string, unknown>;
  deliveries_count?: number;
  created_at: string;
}

export interface EventDetail extends EventItem {
  deliveries?: DeliverySummary[];
}

export interface PublishEventState {
  success: boolean;
  message?: string;
  errors?: {
    event_type_id?: string[];
    payload?: string[];
    _form?: string[];
  };
  event?: EventDetail;
}

export const initialPublishEventState: PublishEventState = {
  success: false,
};
