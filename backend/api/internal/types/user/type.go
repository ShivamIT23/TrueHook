package user

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	UpdateUser(ctx context.Context, req UpdateUserRequest) (*UserResponse, error)
	GetUser(ctx context.Context, req *http.Request) (*UserResponse, error)
}

type Handler struct {
	service Service
}

// UserResponse is the safe public representation of a User.
type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	LogoUrl   string    `json:"logo_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type UpdateUserRequest struct {
	ID       string `json:"id,omitempty"`
	Name     string `json:"name,omitempty"`
	Email    string `json:"email,omitempty"`
	LogoUrl  string `json:"logo_url,omitempty"`
	Password string `json:"password,omitempty"`
}

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user with this email already exists")
	ErrInvalidName       = errors.New("a valid name is needed")
	ErrInvalidEmail      = errors.New("a valid email address is required")
	ErrInvalidPassword   = errors.New("password must be at least 8 characters long")
	ErrInvalidLogoUrl    = errors.New("logo url must be at most 500 characters")
	ErrInvalidID         = errors.New("a valid user id is required")
	ErrEmailTaken        = errors.New("email is already registered")
	ErrNotAuthorized     = errors.New("not authorized to perform this action")
)
