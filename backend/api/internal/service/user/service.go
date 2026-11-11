package user

import (
	"context"
	"errors"
	"net/http"
	"net/mail"
	"strings"
	"unicode"
	"unicode/utf8"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	userTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/user"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo *core.Queries
}

func NewService(repo *core.Queries) userTypes.Service {
	return &service{
		repo: repo,
	}
}

func (s *service) UpdateUser(ctx context.Context, req userTypes.UpdateUserRequest) (*userTypes.UserResponse, error) {
	authUserID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, userTypes.ErrNotAuthorized
	}

	targetUserID := authUserID
	if strings.TrimSpace(req.ID) != "" {
		parsedID, err := uuid.Parse(strings.TrimSpace(req.ID))
		if err != nil {
			return nil, userTypes.ErrInvalidID
		}
		if parsedID != authUserID {
			return nil, userTypes.ErrNotAuthorized
		}
	}

	existingUser, err := s.repo.GetUserById(ctx, core.UUIDTOPgUUID(targetUserID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, userTypes.ErrUserNotFound
		}
		return nil, err
	}

	name := existingUser.Name
	if req.Name != "" {
		trimmedName := strings.TrimSpace(req.Name)
		if err := validateName(trimmedName); err != nil {
			return nil, userTypes.ErrInvalidName
		}
		name = trimmedName
	}

	email := existingUser.Email
	if req.Email != "" {
		trimmedEmail := strings.ToLower(strings.TrimSpace(req.Email))
		if err := validateEmail(trimmedEmail); err != nil {
			return nil, userTypes.ErrInvalidEmail
		}
		if trimmedEmail != existingUser.Email {
			otherUser, err := s.repo.GetUserByEmail(ctx, trimmedEmail)
			if err == nil && core.PgUUIDToUUID(otherUser.ID) != targetUserID {
				return nil, userTypes.ErrEmailTaken
			}
			if err != nil && !errors.Is(err, pgx.ErrNoRows) {
				return nil, err
			}
			email = trimmedEmail
		}
	}

	if len(req.LogoUrl) > 500 {
		return nil, userTypes.ErrInvalidLogoUrl
	}
	logoURL := existingUser.LogoUrl
	if req.LogoUrl != "" {
		logoURL = core.StringToText(req.LogoUrl)
	}

	passwordHash := existingUser.PasswordHash
	if req.Password != "" {
		if len(req.Password) < 8 {
			return nil, userTypes.ErrInvalidPassword
		}
		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		passwordHash = string(hashedBytes)
	}

	updateParams := core.UpdateUserParams{
		ID:           existingUser.ID,
		Name:         name,
		Email:        email,
		PasswordHash: passwordHash,
		LogoUrl:      logoURL,
	}

	if err := s.repo.UpdateUser(ctx, updateParams); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, userTypes.ErrEmailTaken
		}
		return nil, err
	}

	return &userTypes.UserResponse{
		ID:        targetUserID,
		Name:      name,
		Email:     email,
		LogoUrl:   core.TextToString(logoURL),
		CreatedAt: core.TimestampToTime(existingUser.CreatedAt),
	}, nil
}

func (s *service) GetUser(ctx context.Context, req *http.Request) (*userTypes.UserResponse, error) {
	authUserID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, userTypes.ErrNotAuthorized
	}

	targetUserID := authUserID
	if req != nil {
		id := req.PathValue("id")
		if strings.TrimSpace(id) != "" {
			parsedID, err := uuid.Parse(strings.TrimSpace(id))
			if err != nil {
				return nil, userTypes.ErrInvalidID
			}
			if parsedID != authUserID {
				return nil, userTypes.ErrNotAuthorized
			}
		}
	}

	user, err := s.repo.GetUserById(ctx, core.UUIDTOPgUUID(targetUserID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, userTypes.ErrUserNotFound
		}
		return nil, err
	}

	return &userTypes.UserResponse{
		ID:        targetUserID,
		Name:      user.Name,
		Email:     user.Email,
		LogoUrl:   core.TextToString(user.LogoUrl),
		CreatedAt: core.TimestampToTime(user.CreatedAt),
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

func validateName(name string) error {
	name = strings.TrimSpace(name)

	if name == "" || utf8.RuneCountInString(name) > 255 {
		return errors.New("invalid name length")
	}

	if !utf8.ValidString(name) {
		return errors.New("invalid UTF-8 encoding")
	}

	for _, r := range name {
		if unicode.IsControl(r) {
			return errors.New("name contains invalid characters")
		}
	}

	return nil
}
