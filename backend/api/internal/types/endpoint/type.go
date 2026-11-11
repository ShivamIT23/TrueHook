package endpoint

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
)

type Service interface {
	CreateEndpoint(ctx context.Context, req CreateEndpointRequest) (*EndpointResponse, error)
	UpdateEndpoint(ctx context.Context, req UpdateEndpointRequest) (*EndpointResponse, error)
	GetEndpoints(ctx context.Context, req GetEndpointsRequest) (*EndpointsResponse, error)
	DeleteEndpoint(ctx context.Context, req *http.Request) (*EndpointResponse, error)
}

type Handler struct {
	service Service
}

// EndpointResponse is the safe public representation of an Endpoint.
type EndpointResponse struct {
	ID              uuid.UUID `json:"id"`
	Url             string    `json:"url"`
	SecretEncrypted string    `json:"secret_encrypted,omitempty"`
	Enabled         bool      `json:"enabled"`
	CreatedAt       time.Time `json:"created_at"`
}

type EndpointsResponse struct {
	Endpoints []core.Endpoint `json:"endpoints"`
}

// CreateEndpointRequest defines the expected payload for creating an Endpoint.
type CreateEndpointRequest struct {
	ApplicationId   string `json:"application_id"`
	Url             string `json:"url"`
	SecretEncrypted string `json:"secret_encrypted,omitempty"`
}

// UpdateEndpointRequest defines the expected payload for updating an Endpoint.
type UpdateEndpointRequest struct {
	Id              string `json:"id"`
	ApplicationId   string `json:"application_id"`
	Url             string `json:"url"`
	SecretEncrypted string `json:"secret_encrypted,omitempty"`
	Enabled         bool   `json:"enabled"`
}

// GetEndpointsRequest defines the expected payload for Endpoint retrieval.
type GetEndpointsRequest struct {
	ApplicationId string `json:"application_id"`
}

// DeleteEndpointRequest defines the expected payload for Endpoint deletion.
type DeleteEndpointRequest struct {
	Id string `json:"id"`
}

var (
	ErrEndpointNotFound      = errors.New("Endpoint not found")
	ErrApplicationNotFound   = errors.New("Application not found")
	ErrEndpointAlreadyExists = errors.New("Endpoint already exists")
	ErrInvalidUrl            = errors.New("a valid HTTP or HTTPS endpoint url is required")
	ErrInvalidName           = errors.New("a valid Endpoint name is required")
	ErrInvalidId             = errors.New("a valid id is required")
	ErrInvalidDescription    = errors.New("description must be at least 10 characters long")
	ErrNotAuthorized         = errors.New("not authorized to perform this action")
)
