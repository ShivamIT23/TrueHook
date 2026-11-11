package delivery

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

// DeliveryResponse represents an HTTP delivery task created for an endpoint.
type DeliveryResponse struct {
	ID            uuid.UUID  `json:"id"`
	EventID       uuid.UUID  `json:"event_id"`
	EndpointID    uuid.UUID  `json:"endpoint_id"`
	EndpointUrl   string     `json:"endpoint_url"`
	EventTypeName string     `json:"event_type_name"`
	Status        string     `json:"status"`
	Attempts      int32      `json:"attempts"`
	NextAttemptAt *time.Time `json:"next_attempt_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

// DeliveryAttemptItem represents an individual HTTP delivery attempt.
type DeliveryAttemptItem struct {
	ID             uuid.UUID              `json:"id"`
	DeliveryID     uuid.UUID              `json:"delivery_id"`
	AttemptNumber  int32                  `json:"attempt_number"`
	RequestHeaders map[string]interface{} `json:"request_headers,omitempty"`
	ResponseStatus *int32                 `json:"response_status,omitempty"`
	ResponseBody   *string                `json:"response_body,omitempty"`
	ErrorMessage   *string                `json:"error_message,omitempty"`
	DurationMs     *int32                 `json:"duration_ms,omitempty"`
	CreatedAt      time.Time              `json:"created_at"`
}

// DeliveryDetailResponse returns full delivery state with its attempt log and original event payload.
type DeliveryDetailResponse struct {
	DeliveryResponse
	EventPayload map[string]interface{} `json:"event_payload,omitempty"`
	AttemptsList []DeliveryAttemptItem  `json:"attempts_list"`
}

// DeliveriesListResponse provides paginated deliveries.
type DeliveriesListResponse struct {
	Deliveries []DeliveryResponse `json:"deliveries"`
	Total      int64              `json:"total"`
	Limit      int32              `json:"limit"`
	Offset     int32              `json:"offset"`
}

// CreateAttemptRequest defines the payload to record an HTTP attempt.
type CreateAttemptRequest struct {
	DeliveryId     string                 `json:"delivery_id"`
	AttemptNumber  int32                  `json:"attempt_number"`
	RequestHeaders map[string]interface{} `json:"request_headers,omitempty"`
	ResponseStatus int32                  `json:"response_status"`
	ResponseBody   string                 `json:"response_body"`
	ErrorMessage   string                 `json:"error_message"`
	DurationMs     int32                  `json:"duration_ms"`
}

type Service interface {
	GetDelivery(ctx context.Context, applicationId, deliveryId string) (*DeliveryDetailResponse, error)
	ListDeliveries(ctx context.Context, applicationId string, limit, offset int32, endpointId, eventId string) (*DeliveriesListResponse, error)
	ReplayDelivery(ctx context.Context, applicationId, deliveryId string) (*DeliveryDetailResponse, error)
	CreateAttempt(ctx context.Context, applicationId string, req CreateAttemptRequest) (*DeliveryAttemptItem, error)
	ListAttempts(ctx context.Context, applicationId, deliveryId string) ([]DeliveryAttemptItem, error)
	GetAttempt(ctx context.Context, applicationId, deliveryId, attemptId string) (*DeliveryAttemptItem, error)
}

var (
	ErrDeliveryNotFound    = errors.New("delivery not found")
	ErrAttemptNotFound     = errors.New("delivery attempt not found")
	ErrEndpointNotFound    = errors.New("endpoint not found")
	ErrApplicationNotFound = errors.New("application not found")
	ErrInvalidId           = errors.New("a valid id is required")
	ErrNotAuthorized       = errors.New("not authorized to perform this action")
)
