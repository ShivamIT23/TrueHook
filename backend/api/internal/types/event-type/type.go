package eventtype

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
)

type Service interface {
	CreateEventType(ctx context.Context, req CreateEventTypeRequest) (*EventTypeResponse, error)
	UpdateEventType(ctx context.Context, req UpdateEventTypeRequest) (*EventTypeResponse, error)
	GetEventTypes(ctx context.Context, req GetEventTypeRequest) (*EventTypesResponse, error)
	DeleteEventType(ctx context.Context, req *http.Request) (*EventTypeResponse, error)
}

type Handler struct {
	service Service
}

// EventTypeResponse is the safe public representation of a User.
type EventTypeResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type EventTypesResponse struct {
	EventTypes []core.EventType
}

// CreateEventTypeRequest defines the expected payload for creating an EventType.
type CreateEventTypeRequest struct {
	ApplicationId string `json:"application_id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
}

// UpdateEventTypeRequest defines the expected payload for updating an EventType.
type UpdateEventTypeRequest struct {
	Id            string `json:"id"`
	ApplicationId string `json:"application_id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
}

// GetEventTypeRequest defines the expected payload for EventType retreival.
type GetEventTypeRequest struct {
	ApplicationId string `json:"application_id"`
}

// DeleteEventTypeRequest defines the expected payload for EventType deletion.
type DeleteEventTypeRequest struct {
	Id string `json:"id"`
}

var (
	ErrEventTypeNotFound      = errors.New("EventType not found")
	ErrApplicationNotFound    = errors.New("Application not found")
	ErrEventTypeAlreadyExists = errors.New("EventType with this name already exists")
	ErrInvalidName            = errors.New("a valid EventType name is required")
	ErrInvalidId              = errors.New("a valid id is required")
	ErrInvalidDescription     = errors.New("description must be at least 10 characters long")
	ErrNotAuthorized          = errors.New("not authorized to perform this action")
)
