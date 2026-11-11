package auth

import (
	"context"
	"errors"
	"testing"

	authTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/auth"
)

func TestRegisterValidation(t *testing.T) {
	s := NewService(nil, "test-secret")
	ctx := context.Background()

	tests := []struct {
		name        string
		req         authTypes.RegisterRequest
		expectedErr error
	}{
		{
			name: "invalid email format",
			req: authTypes.RegisterRequest{
				Name:     "guest",
				Email:    "invalid-email",
				Password: "password123",
			},
			expectedErr: authTypes.ErrInvalidEmail,
		},
		{
			name: "missing email domain",
			req: authTypes.RegisterRequest{
				Name:     "guest",
				Email:    "user@nodomain",
				Password: "password123",
			},
			expectedErr: authTypes.ErrInvalidEmail,
		},
		{
			name: "empty name",
			req: authTypes.RegisterRequest{
				Name:     "",
				Email:    "test@example.com",
				Password: "password123",
			},
			expectedErr: authTypes.ErrInvalidName,
		},
		{
			name: "password too short",
			req: authTypes.RegisterRequest{
				Name:     "guest",
				Email:    "test@example.com",
				Password: "short",
			},
			expectedErr: authTypes.ErrInvalidPassword,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := s.Register(ctx, tt.req)
			if !errors.Is(err, tt.expectedErr) {
				t.Fatalf("expected error %v, got %v", tt.expectedErr, err)
			}
		})
	}
}

func TestLoginValidation(t *testing.T) {
	s := NewService(nil, "test-secret")
	ctx := context.Background()

	tests := []struct {
		name        string
		req         authTypes.LoginRequest
		expectedErr error
	}{
		{
			name: "empty email",
			req: authTypes.LoginRequest{
				Email:    "",
				Password: "password123",
			},
			expectedErr: authTypes.ErrInvalidCredentials,
		},
		{
			name: "empty password",
			req: authTypes.LoginRequest{
				Email:    "test@example.com",
				Password: "",
			},
			expectedErr: authTypes.ErrInvalidCredentials,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := s.Login(ctx, tt.req)
			if !errors.Is(err, tt.expectedErr) {
				t.Fatalf("expected error %v, got %v", tt.expectedErr, err)
			}
		})
	}
}
