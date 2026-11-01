package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	Signup(ctx context.Context, req SignupRequest) (*AuthResponse, error)
	Signin(ctx context.Context, req SigninRequest) (*AuthResponse, error)
}

type Handler struct {
	service Service
}

// UserResponse is the safe public representation of a User.
type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// AuthResponse defines the payload returned upon successful signup or signin.
type AuthResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SigninRequest defines the expected payload for user authentication.
type SigninRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrUserAlreadyExists  = errors.New("user with this email already exists")
	ErrInvalidEmail       = errors.New("a valid email address is required")
	ErrInvalidPassword    = errors.New("password must be at least 8 characters long")
	ErrEmailTaken         = errors.New("email is already registered")
	ErrInvalidCredentials = errors.New("invalid email or password")
)
