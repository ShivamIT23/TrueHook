export interface DeliveryAttemptItem {
  id: string;
  delivery_id: string;
  attempt_number: number;
  request_headers?: Record<string, unknown>;
  response_status?: number | null;
  response_body?: string | null;
  error_message?: string | null;
  duration_ms?: number | null;
  created_at: string;
}

export interface DeliveryItem {
  id: string;
  event_id: string;
  endpoint_id: string;
  endpoint_url: string;
  event_type_name: string;
  status: string; // 'pending' | 'success' | 'failed' | 'retrying'
  attempts: number;
  next_attempt_at?: string | null;
  created_at: string;
}

export interface DeliveryDetail extends DeliveryItem {
  event_payload?: Record<string, unknown>;
  attempts_list?: DeliveryAttemptItem[];
}
