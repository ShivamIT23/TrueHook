package auth

import (
	"time"

	"github.com/google/uuid"
)

// SignupRequest defines the expected payload for user registration.
type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SigninRequest defines the expected payload for user authentication.
type SigninRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
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
