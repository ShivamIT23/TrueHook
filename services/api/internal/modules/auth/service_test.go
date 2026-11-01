package auth

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
)

type mockRepository struct {
	mu    sync.RWMutex
	users map[string]*User
}

func newMockRepository() *mockRepository {
	return &mockRepository{
		users: make(map[string]*User),
	}
}

func (m *mockRepository) CreateUser(_ context.Context, user *User) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.users[user.Email]; exists {
		return ErrUserAlreadyExists
	}
	m.users[user.Email] = user
	return nil
}

func (m *mockRepository) GetUserByEmail(_ context.Context, email string) (*User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	u, exists := m.users[email]
	if !exists {
		return nil, ErrUserNotFound
	}
	return u, nil
}

func (m *mockRepository) GetUserByID(_ context.Context, id uuid.UUID) (*User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, ErrUserNotFound
}

func TestAuthService_SignupAndSignin(t *testing.T) {
	repo := newMockRepository()
	jwtSecret := "test-jwt-secret-key-12345"
	svc := NewService(repo, jwtSecret)
	ctx := context.Background()

	// 1. Signup Success
	signupReq := SignupRequest{
		Email:    "Developer@Example.com",
		Password: "SecurePassword123!",
	}
	resp, err := svc.Signup(ctx, signupReq)
	if err != nil {
		t.Fatalf("unexpected signup error: %v", err)
	}
	if resp.User.Email != "developer@example.com" {
		t.Errorf("expected lowercase email developer@example.com, got %s", resp.User.Email)
	}
	if resp.Token == "" {
		t.Errorf("expected non-empty JWT token")
	}

	// Verify token is valid
	claims, err := ParseToken(resp.Token, jwtSecret)
	if err != nil {
		t.Fatalf("failed to parse generated token: %v", err)
	}
	if claims.Email != "developer@example.com" {
		t.Errorf("token email mismatch: got %s", claims.Email)
	}

	// 2. Signup Duplicate Email Failure
	_, err = svc.Signup(ctx, signupReq)
	if err != ErrEmailTaken {
		t.Errorf("expected ErrEmailTaken, got %v", err)
	}

	// 3. Signup Invalid Email Failure
	_, err = svc.Signup(ctx, SignupRequest{Email: "invalid-email", Password: "SecurePassword123!"})
	if err != ErrInvalidEmail {
		t.Errorf("expected ErrInvalidEmail, got %v", err)
	}

	// 4. Signup Short Password Failure
	_, err = svc.Signup(ctx, SignupRequest{Email: "user2@example.com", Password: "123"})
	if err != ErrInvalidPassword {
		t.Errorf("expected ErrInvalidPassword, got %v", err)
	}

	// 5. Signin Success
	signinResp, err := svc.Signin(ctx, SigninRequest{
		Email:    "Developer@Example.com",
		Password: "SecurePassword123!",
	})
	if err != nil {
		t.Fatalf("unexpected signin error: %v", err)
	}
	if signinResp.Token == "" {
		t.Errorf("expected non-empty token upon signin")
	}

	// 6. Signin Invalid Password Failure
	_, err = svc.Signin(ctx, SigninRequest{
		Email:    "developer@example.com",
		Password: "WrongPassword!",
	})
	if err != ErrInvalidCredentials {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}

	// 7. Signin Non-existent User Failure
	_, err = svc.Signin(ctx, SigninRequest{
		Email:    "unknown@example.com",
		Password: "SecurePassword123!",
	})
	if err != ErrInvalidCredentials {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}
}

func TestAuthService_TokenExpiration(t *testing.T) {
	jwtSecret := "test-secret"
	uid := uuid.New()
	token, err := GenerateToken(uid, "test@test.com", jwtSecret)
	if err != nil {
		t.Fatalf("unexpected token error: %v", err)
	}

	claims, err := ParseToken(token, jwtSecret)
	if err != nil {
		t.Fatalf("unexpected parse error: %v", err)
	}
	if claims.UserID != uid {
		t.Errorf("expected UserID %v, got %v", uid, claims.UserID)
	}
	if claims.ExpiresAt.Time.Before(time.Now()) {
		t.Errorf("token should not be expired")
	}
}
