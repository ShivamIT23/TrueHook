package admin

import (
	"context"
	"errors"
	"net/http"
	"strings"

	adminTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/admin"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// GetAllUsers retrieves all registered users for admin inspection.
func (s *service) GetAllUsers(ctx context.Context) (*adminTypes.UsersResponse, error) {
	if _, err := s.verifyAdmin(ctx); err != nil {
		return nil, err
	}

	users, err := s.repo.ListUsers(ctx)
	if err != nil {
		return nil, err
	}

	resp := make([]adminTypes.UserResponse, len(users))
	for i, u := range users {
		resp[i] = adminTypes.UserResponse{
			ID:        core.PgUUIDToUUID(u.ID),
			Name:      u.Name,
			Email:     u.Email,
			LogoUrl:   core.TextToString(u.LogoUrl),
			CreatedAt: core.TimestampToTime(u.CreatedAt),
		}
	}

	return &adminTypes.UsersResponse{
		Users: resp,
	}, nil
}

// GetUser retrieves a specific user by ID for an admin.
func (s *service) GetUser(ctx context.Context, req *http.Request) (*adminTypes.UserResponse, error) {
	if _, err := s.verifyAdmin(ctx); err != nil {
		return nil, err
	}

	id := req.PathValue("id")
	if strings.TrimSpace(id) == "" {
		return nil, adminTypes.ErrInvalidID
	}

	targetID, err := uuid.Parse(strings.TrimSpace(id))
	if err != nil {
		return nil, adminTypes.ErrInvalidID
	}

	user, err := s.repo.GetUserById(ctx, core.UUIDTOPgUUID(targetID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, adminTypes.ErrUserNotFound
		}
		return nil, err
	}

	return &adminTypes.UserResponse{
		ID:        targetID,
		Name:      user.Name,
		Email:     user.Email,
		LogoUrl:   core.TextToString(user.LogoUrl),
		CreatedAt: core.TimestampToTime(user.CreatedAt),
	}, nil
}
