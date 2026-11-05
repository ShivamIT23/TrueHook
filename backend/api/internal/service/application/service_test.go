package application

// import (
// 	"context"
// 	"errors"
// 	"testing"

// 	authTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/auth"
// )

// func TestSignupValidation(t *testing.T) {
// 	s := NewService(nil, "test-secret")
// 	ctx := context.Background()

// 	tests := []struct {
// 		name        string
// 		req         authTypes.SignupRequest
// 		expectedErr error
// 	}{
// 		{
// 			name: "invalid email format",
// 			req: authTypes.SignupRequest{
// 				Email:    "invalid-email",
// 				Password: "password123",
// 			},
// 			expectedErr: authTypes.ErrInvalidEmail,
// 		},
// 		{
// 			name: "missing email domain",
// 			req: authTypes.SignupRequest{
// 				Email:    "user@nodomain",
// 				Password: "password123",
// 			},
// 			expectedErr: authTypes.ErrInvalidEmail,
// 		},
// 		{
// 			name: "password too short",
// 			req: authTypes.SignupRequest{
// 				Email:    "test@example.com",
// 				Password: "short",
// 			},
// 			expectedErr: authTypes.ErrInvalidPassword,
// 		},
// 	}

// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			_, err := s.Signup(ctx, tt.req)
// 			if !errors.Is(err, tt.expectedErr) {
// 				t.Fatalf("expected error %v, got %v", tt.expectedErr, err)
// 			}
// 		})
// 	}
// }

// func TestSigninValidation(t *testing.T) {
// 	s := NewService(nil, "test-secret")
// 	ctx := context.Background()

// 	tests := []struct {
// 		name        string
// 		req         authTypes.SigninRequest
// 		expectedErr error
// 	}{
// 		{
// 			name: "empty email",
// 			req: authTypes.SigninRequest{
// 				Email:    "",
// 				Password: "password123",
// 			},
// 			expectedErr: authTypes.ErrInvalidCredentials,
// 		},
// 		{
// 			name: "empty password",
// 			req: authTypes.SigninRequest{
// 				Email:    "test@example.com",
// 				Password: "",
// 			},
// 			expectedErr: authTypes.ErrInvalidCredentials,
// 		},
// 	}

// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			_, err := s.Signin(ctx, tt.req)
// 			if !errors.Is(err, tt.expectedErr) {
// 				t.Fatalf("expected error %v, got %v", tt.expectedErr, err)
// 			}
// 		})
// 	}
// }
