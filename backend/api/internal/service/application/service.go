package auth

import (
	"context"
	"errors"
	"strings"

	TrueHookJWT "github.com/ShivamIT23/TrueHook/backend/api/internal/lib"
	applicationTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/application"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo      *core.Queries
	user_id   string
	jwtSecret string
}

func NewService(repo *core.Queries, jwtSecret string, user_id string) applicationTypes.Service {
	return &service{
		repo:      repo,
		user_id:   user_id,
		jwtSecret: jwtSecret,
	}
}

func (s *service) CreateApplication(ctx context.Context, req applicationTypes.CreateApplicationRequest) (*applicationTypes.ApplicationResponse, error) {
	name := req.Name
	if err := validateName(name); err != nil {
		return nil, applicationTypes.ErrInvalidName
	}
	description := req.Description

	userId, conversion_err := core.StringToPGUUID(s.user_id)

	if conversion_err != nil {
		return nil, applicationTypes.ErrNotAuthorized
	}

	checkApplication := core.GetApplicationByNameParams{
		UserID: userId,
		Name:   name,
	}
	// Check if user already exists
	_, err := s.repo.GetApplicationByName(ctx, checkApplication)
	if err == nil {
		return nil, applicationTypes.ErrApplicationAlreadyExists
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	newUser := core.CreateApplicationParams{
		Name:        name,
		Description: core.StringToText(description),
	}

	result, creation_err := s.repo.CreateApplication(ctx, newUser)
	if creation_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(creation_err, &pgErr) && pgErr.Code == "23505" {
			return nil, creation_err
		}
		return nil, creation_err
	}

	return &applicationTypes.ApplicationResponse{
		ID:          result.ID,
		Name:        result.Name,
		Description: result.Description.String,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) Signin(ctx context.Context, req applicationTypes.SigninRequest) (*applicationTypes.ApplicationResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" || req.Password == "" {
		return nil, authTypes.ErrInvalidCredentials
	}

	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, authTypes.ErrInvalidCredentials
		}
		return nil, err
	}

	userId := core.PgUUIDToUUID(user.ID)

	// Constant-time hash verification via bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, authTypes.ErrInvalidCredentials
	}

	token, err := TrueHookJWT.GenerateToken(userId, user.Email, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &authTypes.AuthResponse{
		User: authTypes.UserResponse{
			ID:        userId,
			Email:     user.Email,
			CreatedAt: core.TimestampToTime(user.CreatedAt),
		},
		Token: token,
	}, nil
}

func validateName(name string) error {
	if name == "" || len(name) > 255 {
		return errors.New("invalid length")
	}
	return nil
}
