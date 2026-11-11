package admin

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	Login(ctx context.Context, req LoginRequest) (*AuthResponse, error)
	GetAllUsers(ctx context.Context) (*UsersResponse, error)
	GetUser(ctx context.Context, req *http.Request) (*UserResponse, error)
}

type Handler struct {
	service Service
}

// AdminResponse is the safe public representation of an Admin.
type AdminResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// AuthResponse defines the payload returned upon successful admin login.
type AuthResponse struct {
	Admin AdminResponse `json:"admin"`
	Token string        `json:"token"`
}

// LoginRequest defines the expected payload for admin authentication.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var (
	ErrAdminNotFound      = errors.New("admin not found")
	ErrInvalidEmail       = errors.New("a valid email address is required")
	ErrInvalidPassword    = errors.New("password is required")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrNotAuthorized      = errors.New("not authorized to perform this action")
	ErrAdminOnly          = errors.New("admin privileges required")
)
