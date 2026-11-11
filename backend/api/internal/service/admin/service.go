package admin

import (
	"context"
	"errors"
	"net/mail"
	"strings"

	TrueHookJWT "github.com/ShivamIT23/TrueHook/backend/api/internal/lib"
	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	adminTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/admin"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo      *core.Queries
	jwtSecret string
}

func NewService(repo *core.Queries, jwtSecret string) adminTypes.Service {
	return &service{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (s *service) Login(ctx context.Context, req adminTypes.LoginRequest) (*adminTypes.AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" || req.Password == "" {
		return nil, adminTypes.ErrInvalidCredentials
	}

	if err := validateEmail(email); err != nil {
		return nil, adminTypes.ErrInvalidCredentials
	}

	admin, err := s.repo.GetAdminByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, adminTypes.ErrInvalidCredentials
		}
		return nil, err
	}

	// Constant-time hash verification via bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		return nil, adminTypes.ErrInvalidCredentials
	}

	adminID := core.PgUUIDToUUID(admin.ID)
	token, err := TrueHookJWT.GenerateAdminToken(adminID, admin.Email, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &adminTypes.AuthResponse{
		Admin: adminTypes.AdminResponse{
			ID:        adminID,
			Name:      admin.Name,
			Email:     admin.Email,
			CreatedAt: core.TimestampToTime(admin.CreatedAt),
		},
		Token: token,
	}, nil
}

// verifyAdmin checks whether the caller in context has admin credentials.
func (s *service) verifyAdmin(ctx context.Context) (uuid.UUID, error) {
	authID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return uuid.Nil, adminTypes.ErrNotAuthorized
	}

	// Fast-path: Check role claim if present
	role, hasRole := TureHookMiddleware.GetRole(ctx)
	if hasRole && role == "admin" {
		return authID, nil
	}

	// Database check: verify presence in admins table
	if s.repo != nil {
		_, err := s.repo.GetAdminById(ctx, core.UUIDTOPgUUID(authID))
		if err == nil {
			return authID, nil
		}

		authEmail, hasEmail := TureHookMiddleware.GetEmail(ctx)
		if hasEmail && authEmail != "" {
			_, err = s.repo.GetAdminByEmail(ctx, authEmail)
			if err == nil {
				return authID, nil
			}
		}
	}

	return uuid.Nil, adminTypes.ErrAdminOnly
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
