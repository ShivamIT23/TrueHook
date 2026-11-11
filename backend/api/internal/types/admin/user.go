package admin

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// UserResponse is the safe public representation of a User for admin views.
type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	LogoUrl   string    `json:"logo_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// UsersResponse represents a list of users returned to an admin.
type UsersResponse struct {
	Users []UserResponse `json:"users"`
}

var (
	ErrUserNotFound = errors.New("user not found")
	ErrInvalidID    = errors.New("a valid user id is required")
)
