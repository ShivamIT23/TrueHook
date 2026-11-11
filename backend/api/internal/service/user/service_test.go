package user

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	userTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/user"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"
)

type mockRow struct {
	scanFunc func(dest ...interface{}) error
}

func (r mockRow) Scan(dest ...interface{}) error {
	if r.scanFunc != nil {
		return r.scanFunc(dest...)
	}
	return nil
}

type mockDBTX struct {
	execFunc     func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error)
	queryRowFunc func(ctx context.Context, query string, args ...interface{}) pgx.Row
}

func (m *mockDBTX) Exec(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
	if m.execFunc != nil {
		return m.execFunc(ctx, query, args...)
	}
	return pgconn.CommandTag{}, nil
}

func (m *mockDBTX) Query(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
	return nil, nil
}

func (m *mockDBTX) QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row {
	if m.queryRowFunc != nil {
		return m.queryRowFunc(ctx, query, args...)
	}
	return mockRow{}
}

func authContext(userID uuid.UUID, email string) context.Context {
	ctx := context.WithValue(context.Background(), TureHookMiddleware.UserIDContextKey, userID)
	return context.WithValue(ctx, TureHookMiddleware.EmailContextKey, email)
}

func scanUser(u core.User, dest ...interface{}) error {
	if len(dest) >= 6 {
		if p, ok := dest[0].(*pgtype.UUID); ok {
			*p = u.ID
		}
		if p, ok := dest[1].(*pgtype.Text); ok {
			*p = u.LogoUrl
		}
		if p, ok := dest[2].(*string); ok {
			*p = u.Name
		}
		if p, ok := dest[3].(*string); ok {
			*p = u.Email
		}
		if p, ok := dest[4].(*string); ok {
			*p = u.PasswordHash
		}
		if p, ok := dest[5].(*pgtype.Timestamptz); ok {
			*p = u.CreatedAt
		}
	}
	return nil
}

func TestUpdateUser_ValidationAndAuth(t *testing.T) {
	s := NewService(nil)
	userID := uuid.New()
	authedCtx := authContext(userID, "user@example.com")

	t.Run("unauthorized context", func(t *testing.T) {
		_, err := s.UpdateUser(context.Background(), userTypes.UpdateUserRequest{
			Name: "Updated Name",
		})
		if !errors.Is(err, userTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", userTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("invalid target id format", func(t *testing.T) {
		_, err := s.UpdateUser(authedCtx, userTypes.UpdateUserRequest{
			ID:   "invalid-uuid",
			Name: "Updated Name",
		})
		if !errors.Is(err, userTypes.ErrInvalidID) {
			t.Fatalf("expected %v, got %v", userTypes.ErrInvalidID, err)
		}
	})

	t.Run("user attempting to update another user", func(t *testing.T) {
		otherID := uuid.New()
		_, err := s.UpdateUser(authedCtx, userTypes.UpdateUserRequest{
			ID:   otherID.String(),
			Name: "Hacker Name",
		})
		if !errors.Is(err, userTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", userTypes.ErrNotAuthorized, err)
		}
	})
}

func TestUpdateUser_RepositoryFlows(t *testing.T) {
	userID := uuid.New()
	userCtx := authContext(userID, "user@example.com")

	t.Run("user updates own profile successfully", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error {
					return scanUser(core.User{
						ID:           core.UUIDTOPgUUID(userID),
						Name:         "Old Name",
						Email:        "user@example.com",
						PasswordHash: "hashedpass",
						CreatedAt:    core.NewTimestamp(),
					}, dest...)
				}}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, nil
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.UpdateUser(userCtx, userTypes.UpdateUserRequest{
			Name:    "New Name",
			LogoUrl: "https://example.com/logo.png",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected resp, got nil")
		}
		if resp.Name != "New Name" {
			t.Errorf("expected Name 'New Name', got '%s'", resp.Name)
		}
		if resp.LogoUrl != "https://example.com/logo.png" {
			t.Errorf("expected LogoUrl 'https://example.com/logo.png', got '%s'", resp.LogoUrl)
		}
	})

	t.Run("user not found", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error { return pgx.ErrNoRows }}
			},
		}
		s := NewService(core.New(mockDB))
		_, err := s.UpdateUser(userCtx, userTypes.UpdateUserRequest{
			Name: "Some Name",
		})
		if !errors.Is(err, userTypes.ErrUserNotFound) {
			t.Fatalf("expected %v, got %v", userTypes.ErrUserNotFound, err)
		}
	})

	t.Run("email taken by other user", func(t *testing.T) {
		otherID := uuid.New()
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				var sqlQuery = query
				if len(args) > 0 {
					// Check whether querying by id or email
					if _, ok := args[0].(pgtype.UUID); ok {
						return mockRow{scanFunc: func(dest ...interface{}) error {
							return scanUser(core.User{
								ID:        core.UUIDTOPgUUID(userID),
								Name:      "My User",
								Email:     "myuser@example.com",
								CreatedAt: core.NewTimestamp(),
							}, dest...)
						}}
					}
					if emailArg, ok := args[0].(string); ok && emailArg == "taken@example.com" {
						return mockRow{scanFunc: func(dest ...interface{}) error {
							return scanUser(core.User{
								ID:        core.UUIDTOPgUUID(otherID),
								Email:     "taken@example.com",
								CreatedAt: core.NewTimestamp(),
							}, dest...)
						}}
					}
				}
				_ = sqlQuery
				return mockRow{}
			},
		}
		s := NewService(core.New(mockDB))
		_, err := s.UpdateUser(userCtx, userTypes.UpdateUserRequest{
			Email: "taken@example.com",
		})
		if !errors.Is(err, userTypes.ErrEmailTaken) {
			t.Fatalf("expected %v, got %v", userTypes.ErrEmailTaken, err)
		}
	})
}

func TestGetUser(t *testing.T) {
	userID := uuid.New()
	userCtx := authContext(userID, "user@example.com")

	t.Run("user gets own profile", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error {
					return scanUser(core.User{
						ID:        core.UUIDTOPgUUID(userID),
						Name:      "Self User",
						Email:     "user@example.com",
						CreatedAt: core.NewTimestamp(),
					}, dest...)
				}}
			},
		}
		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodGet, "/user", nil)

		resp, err := s.GetUser(userCtx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.ID != userID {
			t.Errorf("expected ID %s, got %s", userID, resp.ID)
		}
	})

	t.Run("user forbidden from getting other user profile", func(t *testing.T) {
		otherID := uuid.New()
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodGet, "/user/"+otherID.String(), nil)
		req.SetPathValue("id", otherID.String())

		_, err := s.GetUser(userCtx, req)
		if !errors.Is(err, userTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", userTypes.ErrNotAuthorized, err)
		}
	})
}

// Silence bcrypt import unused if any
var _ = bcrypt.DefaultCost
