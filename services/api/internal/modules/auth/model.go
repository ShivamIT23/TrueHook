package auth

import (
	"time"

	"github.com/google/uuid"
)

// User represents a registered customer account or dashboard user.
type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}
