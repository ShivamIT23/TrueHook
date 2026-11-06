package application

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
)

type Service interface {
	CreateApplication(ctx context.Context, req CreateApplicationRequest) (*ApplicationResponse, error)
	UpdateApplication(ctx context.Context, req UpdateApplicationRequest) (*ApplicationResponse, error)
	GetApplication(ctx context.Context, req *http.Request) (*ApplicationResponse, error)
	GetAllApplication(ctx context.Context) (*ApplicationsResponse, error)
	DeleteApplication(ctx context.Context, req *http.Request) (*ApplicationResponse, error)
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

type ApplicationsResponse struct {
	Applications []core.Application
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

// DeleteApplicationRequest defines the expected payload for application deletion.
type DeleteApplicationRequest struct {
	Id string `json:"id"`
}

var (
	ErrApplicationNotFound      = errors.New("application not found")
	ErrApplicationAlreadyExists = errors.New("application with this name already exists")
	ErrInvalidName              = errors.New("a valid application name is required")
	ErrInvalidId                = errors.New("a valid id is required")
	ErrInvalidDescription       = errors.New("description must be at least 10 characters long")
	ErrNotAuthorized            = errors.New("not authorized to perform this action")
)
