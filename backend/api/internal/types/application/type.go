package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	CreateApplication(ctx context.Context, req CreateApplicationRequest) (*ApplicationResponse, error)
	UpdateApplication(ctx context.Context, req UpdateApplicationRequest) (*ApplicationResponse, error)
	GetApplication(ctx context.Context, req GetApplicationRequest) (*ApplicationResponse, error)
	DeleteApplication(ctx context.Context, req DeleteApplicationRequest) (*ApplicationResponse, error)
}

type Handler struct {
	service Service
}

// ApplicationResponse is the safe public representation of a User.
type ApplicationResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

// CreateApplicationRequest defines the expected payload for creating an application.
type CreateApplicationRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// UpdateApplicationRequest defines the expected payload for updating an application.
type UpdateApplicationRequest struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// GetApplicationRequest defines the expected payload for retrieving an application.
type GetApplicationRequest struct {
	Id string `json:"id"`
}

// DeleteApplicationRequest defines the expected payload for application deletion.
type DeleteApplicationRequest struct {
	Id string `json:"id"`
}

var (
	ErrApplicationNotFound      = errors.New("application not found")
	ErrApplicationAlreadyExists = errors.New("application with this name already exists")
	ErrInvalidName              = errors.New("a valid application name is required")
	ErrInvalidDescription       = errors.New("description must be at least 10 characters long")
	ErrNotAuthorized            = errors.New("not authorized to perform this action")
)
