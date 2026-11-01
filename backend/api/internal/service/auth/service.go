package auth

import (
	"context"
	"errors"
	"net/mail"
	"strings"
	"time"

	"github.com/ShivamIT23/TrueHook/backend/api/internal/lib/jwt"
	authTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/auth"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo      *core.Queries
	jwtSecret string
}

func NewService(repo *core.Queries, jwtSecret string) authTypes.Service {
	return &service{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (s *service) Signup(ctx context.Context, req authTypes.SignupRequest) (*authTypes.AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if err := validateEmail(email); err != nil {
		return nil, authTypes.ErrInvalidEmail
	}

	if len(req.Password) < 8 {
		return nil, authTypes.ErrInvalidPassword
	}

	// Check if user already exists
	existingUser, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil && !errors.Is(err, authTypes.ErrUserNotFound) {
		return nil, err
	}
	if existingUser != nil {
		return nil, authTypes.ErrEmailTaken
	}

	// Hash password with bcrypt
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	newUser := &authTypes.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(hashedBytes),
		CreatedAt:    time.Now().UTC(),
	}

	if err := s.repo.CreateUser(ctx, newUser); err != nil {
		if errors.Is(err, authTypes.ErrUserAlreadyExists) {
			return nil, authTypes.ErrEmailTaken
		}
		return nil, err
	}

	token, err := jwt.GenerateToken(newUser.ID, newUser.Email, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &authTypes.AuthResponse{
		User: authTypes.UserResponse{
			ID:        newUser.ID,
			Email:     newUser.Email,
			CreatedAt: newUser.CreatedAt,
		},
		Token: token,
	}, nil
}

func (s *service) Signin(ctx context.Context, req authTypes.SigninRequest) (*authTypes.AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" || req.Password == "" {
		return nil, authTypes.ErrInvalidCredentials
	}

	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, authTypes.ErrUserNotFound) {
			return nil, authTypes.ErrInvalidCredentials
		}
		return nil, err
	}

	// Constant-time hash verification via bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, authTypes.ErrInvalidCredentials
	}

	token, err := jwt.GenerateToken(user.ID, user.Email, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &authTypes.AuthResponse{
		User: authTypes.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			CreatedAt: user.CreatedAt,
		},
		Token: token,
	}, nil
}

func validateEmail(email string) error {
	if email == "" || len(email) > 255 {
		return errors.New("invalid length")
	}
	addr, err := mail.ParseAddress(email)
	if err != nil || addr.Address != email {
		return errors.New("invalid format")
	}
	if !strings.Contains(email, ".") {
		return errors.New("missing domain")
	}
	return nil
}
