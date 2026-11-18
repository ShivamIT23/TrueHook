package api

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// Service defines the interface for managing API keys and credits.
type Service interface {
	CreateAPI(ctx context.Context, req CreateAPIRequest) (*APIResponse, error)
	GetAPI(ctx context.Context, req *http.Request) (*APIResponse, error)
	GetAPIByKey(ctx context.Context, apiKey string) (*APIResponse, error)
	GetAllAPIs(ctx context.Context) (*APIListResponse, error)
	UpdateCredits(ctx context.Context, req UpdateCreditsRequest) (*APIResponse, error)
	RegenerateKey(ctx context.Context, req RegenerateKeyRequest) (*APIResponse, error)
	DeleteAPI(ctx context.Context, req *http.Request) (*APIResponse, error)
}

// Handler defines the interface for HTTP handlers managing API keys.
type Handler struct {
	service Service
}

// APIResponse represents the public representation of an API record.
type APIResponse struct {
	ID             uuid.UUID `json:"id"`
	APIKey         string    `json:"api_key"`
	UserID         uuid.UUID `json:"user_id"`
	APICreditsUsed int64     `json:"api_credits_used"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// APIListResponse represents a collection of API records.
type APIListResponse struct {
	APIs []APIResponse `json:"apis"`
}

// CreateAPIRequest defines the payload for creating an API record.
type CreateAPIRequest struct {
	APIKey         string `json:"api_key,omitempty"`
	APICreditsUsed *int64 `json:"api_credits_used,omitempty"`
}

// UpdateCreditsRequest defines the payload for updating API credits.
type UpdateCreditsRequest struct {
	ID             string `json:"id,omitempty"`
	CreditsToAdd   int64  `json:"credits_to_add,omitempty"`
	APICreditsUsed *int64 `json:"api_credits_used,omitempty"`
}

// RegenerateKeyRequest defines the payload for regenerating an API key.
type RegenerateKeyRequest struct {
	ID     string `json:"id,omitempty"`
	APIKey string `json:"api_key,omitempty"`
}

// DeleteAPIRequest defines the payload for deleting an API record.
type DeleteAPIRequest struct {
	ID string `json:"id,omitempty"`
}

var (
	ErrAPINotFound      = errors.New("api key not found")
	ErrAPIAlreadyExists = errors.New("api key already exists")
	ErrInvalidID        = errors.New("a valid id is required")
	ErrInvalidAPIKey    = errors.New("a valid api key is required")
	ErrInvalidCredits   = errors.New("credits value cannot be negative")
	ErrNotAuthorized    = errors.New("not authorized to perform this action")
)
