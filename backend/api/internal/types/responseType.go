package types

import (
	"time"

	"github.com/google/uuid"
)

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
