package auth

import (
	"context"
	"errors"
	"net/mail"
	"strings"
	"unicode"
	"unicode/utf8"

	TrueHookJWT "github.com/ShivamIT23/TrueHook/backend/api/internal/lib"
	authTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/auth"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
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

func (s *service) Register(ctx context.Context, req authTypes.RegisterRequest) (*authTypes.AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if err := validateEmail(email); err != nil {
		return nil, authTypes.ErrInvalidEmail
	}
	name := strings.ToLower(strings.TrimSpace(req.Name))
	if err := validateName(name); err != nil {
		return nil, authTypes.ErrInvalidName
	}

	if len(req.Password) < 8 {
		return nil, authTypes.ErrInvalidPassword
	}

	// Check if user already exists
	_, err := s.repo.GetUserByEmail(ctx, email)
	if err == nil {
		return nil, authTypes.ErrEmailTaken
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	// Hash password with bcrypt
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	newUser := core.CreateUserParams{
		Name:         name,
		Email:        email,
		PasswordHash: string(hashedBytes),
	}

	res, err := s.repo.CreateUser(ctx, newUser)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, authTypes.ErrEmailTaken
		}
		return nil, err
	}

	userId := core.PgUUIDToUUID(res.ID)

	token, err := TrueHookJWT.GenerateToken(userId, newUser.Email, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &authTypes.AuthResponse{
		User: authTypes.UserResponse{
			ID:        userId,
			Name:      name,
			Email:     res.Email,
			LogoUrl:   core.TextToString(res.LogoUrl),
			CreatedAt: core.TimestampToTime(res.CreatedAt),
		},
		Token: token,
	}, nil
}

func (s *service) Login(ctx context.Context, req authTypes.LoginRequest) (*authTypes.AuthResponse, error) {
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
			Name:      user.Name,
			Email:     user.Email,
			LogoUrl:   core.TextToString(user.LogoUrl),
			CreatedAt: core.TimestampToTime(user.CreatedAt),
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
