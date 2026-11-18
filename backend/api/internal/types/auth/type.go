package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	SignUp(ctx context.Context, req SignUpRequest) (*AuthResponse, error)
	SignIn(ctx context.Context, req SignInRequest) (*AuthResponse, error)
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

// AuthResponse defines the payload returned upon successful signup or signin.
type AuthResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

// SignUpRequest defines the expected payload for user signup.
type SignUpRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignInRequest defines the expected payload for user authentication.
type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrUserAlreadyExists  = errors.New("user with this email already exists")
	ErrInvalidName        = errors.New("a valid name is needed")
	ErrInvalidEmail       = errors.New("a valid email address is required")
	ErrInvalidPassword    = errors.New("password must be at least 8 characters long")
	ErrEmailTaken         = errors.New("email is already registered")
	ErrInvalidCredentials = errors.New("invalid email or password")
)
