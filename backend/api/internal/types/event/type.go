package event

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

// EventResponse is the public representation of a published webhook event.
type EventResponse struct {
	ID              uuid.UUID              `json:"id"`
	ApplicationID   uuid.UUID              `json:"application_id"`
	EventTypeID     uuid.UUID              `json:"event_type_id"`
	EventTypeName   string                 `json:"event_type_name"`
	Payload         map[string]interface{} `json:"payload"`
	DeliveriesCount int                    `json:"deliveries_count,omitempty"`
	CreatedAt       time.Time              `json:"created_at"`
}

// DeliverySummary provides basic delivery metadata linked to an event.
type DeliverySummary struct {
	ID          uuid.UUID `json:"id"`
	EndpointID  uuid.UUID `json:"endpoint_id"`
	EndpointUrl string    `json:"endpoint_url"`
	Status      string    `json:"status"`
	Attempts    int32     `json:"attempts"`
	CreatedAt   time.Time `json:"created_at"`
}

// EventDetailResponse returns the event along with any scheduled deliveries.
type EventDetailResponse struct {
	EventResponse
	Deliveries []DeliverySummary `json:"deliveries"`
}

// EventsListResponse provides paginated events.
type EventsListResponse struct {
	Events []EventResponse `json:"events"`
	Total  int64           `json:"total"`
	Limit  int32           `json:"limit"`
	Offset int32           `json:"offset"`
}

// PublishEventRequest represents the incoming JSON body to publish an event.
type PublishEventRequest struct {
	ApplicationId string                 `json:"application_id"`
	EventTypeId   string                 `json:"event_type_id"`
	Payload       map[string]interface{} `json:"payload"`
}

type Service interface {
	PublishEvent(ctx context.Context, req PublishEventRequest) (*EventDetailResponse, error)
	GetEvent(ctx context.Context, applicationId, eventId string) (*EventDetailResponse, error)
	ListEvents(ctx context.Context, applicationId string, limit, offset int32) (*EventsListResponse, error)
}

var (
	ErrEventNotFound       = errors.New("event not found")
	ErrApplicationNotFound = errors.New("application not found")
	ErrEventTypeNotFound   = errors.New("event type not found")
	ErrInvalidPayload      = errors.New("a valid JSON payload is required")
	ErrInvalidId           = errors.New("a valid id is required")
	ErrNotAuthorized       = errors.New("not authorized to perform this action")
)
