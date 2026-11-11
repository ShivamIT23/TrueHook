package admin

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	TrueHookJWT "github.com/ShivamIT23/TrueHook/backend/api/internal/lib"
	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	adminTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/admin"
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

type mockRows struct {
	rows [][]interface{}
	idx  int
	err  error
}

func (m *mockRows) Close() {}
func (m *mockRows) Err() error { return m.err }
func (m *mockRows) CommandTag() pgconn.CommandTag { return pgconn.CommandTag{} }
func (m *mockRows) FieldDescriptions() []pgconn.FieldDescription { return nil }
func (m *mockRows) Next() bool {
	if m.idx < len(m.rows) {
		m.idx++
		return true
	}
	return false
}
func (m *mockRows) Scan(dest ...interface{}) error {
	if m.idx <= 0 || m.idx > len(m.rows) {
		return errors.New("invalid row index")
	}
	curr := m.rows[m.idx-1]
	for i, val := range curr {
		if i >= len(dest) {
			break
		}
		switch d := dest[i].(type) {
		case *pgtype.UUID:
			if v, ok := val.(pgtype.UUID); ok {
				*d = v
			}
		case *string:
			if v, ok := val.(string); ok {
				*d = v
			}
		case *pgtype.Text:
			if v, ok := val.(pgtype.Text); ok {
				*d = v
			}
		case *pgtype.Timestamptz:
			if v, ok := val.(pgtype.Timestamptz); ok {
				*d = v
			}
		}
	}
	return nil
}
func (m *mockRows) Values() ([]any, error) { return nil, nil }
func (m *mockRows) RawValues() [][]byte    { return nil }
func (m *mockRows) Conn() *pgx.Conn        { return nil }
func (m *mockRows) TypeMap() *pgtype.Map   { return pgtype.NewMap() }

type mockDBTX struct {
	execFunc     func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error)
	queryFunc    func(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error)
	queryRowFunc func(ctx context.Context, query string, args ...interface{}) pgx.Row
}

func (m *mockDBTX) Exec(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
	if m.execFunc != nil {
		return m.execFunc(ctx, query, args...)
	}
	return pgconn.CommandTag{}, nil
}

func (m *mockDBTX) Query(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
	if m.queryFunc != nil {
		return m.queryFunc(ctx, query, args...)
	}
	return &mockRows{}, nil
}

func (m *mockDBTX) QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row {
	if m.queryRowFunc != nil {
		return m.queryRowFunc(ctx, query, args...)
	}
	return mockRow{}
}

func adminAuthContext(adminID uuid.UUID, email string) context.Context {
	ctx := context.WithValue(context.Background(), TureHookMiddleware.UserIDContextKey, adminID)
	ctx = context.WithValue(ctx, TureHookMiddleware.EmailContextKey, email)
	return context.WithValue(ctx, TureHookMiddleware.RoleContextKey, "admin")
}

func userAuthContext(userID uuid.UUID, email string) context.Context {
	ctx := context.WithValue(context.Background(), TureHookMiddleware.UserIDContextKey, userID)
	ctx = context.WithValue(ctx, TureHookMiddleware.EmailContextKey, email)
	return context.WithValue(ctx, TureHookMiddleware.RoleContextKey, "user")
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

func scanAdmin(a core.Admin, dest ...interface{}) error {
	if len(dest) >= 5 {
		if p, ok := dest[0].(*pgtype.UUID); ok {
			*p = a.ID
		}
		if p, ok := dest[1].(*string); ok {
			*p = a.Name
		}
		if p, ok := dest[2].(*string); ok {
			*p = a.Email
		}
		if p, ok := dest[3].(*string); ok {
			*p = a.PasswordHash
		}
		if p, ok := dest[4].(*pgtype.Timestamptz); ok {
			*p = a.CreatedAt
		}
	}
	return nil
}

func TestAdminLogin(t *testing.T) {
	jwtSecret := "super-secret-key"
	adminID := uuid.New()
	adminEmail := "admin@truehook.internal"
	password := "adminSecretPass123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	t.Run("empty email", func(t *testing.T) {
		s := NewService(nil, jwtSecret)
		_, err := s.Login(context.Background(), adminTypes.LoginRequest{
			Email:    "",
			Password: password,
		})
		if !errors.Is(err, adminTypes.ErrInvalidCredentials) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrInvalidCredentials, err)
		}
	})

	t.Run("empty password", func(t *testing.T) {
		s := NewService(nil, jwtSecret)
		_, err := s.Login(context.Background(), adminTypes.LoginRequest{
			Email:    adminEmail,
			Password: "",
		})
		if !errors.Is(err, adminTypes.ErrInvalidCredentials) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrInvalidCredentials, err)
		}
	})

	t.Run("admin not found in database", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error { return pgx.ErrNoRows }}
			},
		}
		s := NewService(core.New(mockDB), jwtSecret)
		_, err := s.Login(context.Background(), adminTypes.LoginRequest{
			Email:    adminEmail,
			Password: password,
		})
		if !errors.Is(err, adminTypes.ErrInvalidCredentials) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrInvalidCredentials, err)
		}
	})

	t.Run("incorrect password", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error {
					return scanAdmin(core.Admin{
						ID:           core.UUIDTOPgUUID(adminID),
						Name:         "Lead Admin",
						Email:        adminEmail,
						PasswordHash: string(hashedPassword),
						CreatedAt:    core.NewTimestamp(),
					}, dest...)
				}}
			},
		}
		s := NewService(core.New(mockDB), jwtSecret)
		_, err := s.Login(context.Background(), adminTypes.LoginRequest{
			Email:    adminEmail,
			Password: "wrongPassword",
		})
		if !errors.Is(err, adminTypes.ErrInvalidCredentials) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrInvalidCredentials, err)
		}
	})

	t.Run("successful admin login", func(t *testing.T) {
		now := time.Now().UTC()
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error {
					return scanAdmin(core.Admin{
						ID:           core.UUIDTOPgUUID(adminID),
						Name:         "Super Admin",
						Email:        adminEmail,
						PasswordHash: string(hashedPassword),
						CreatedAt:    pgtype.Timestamptz{Time: now, Valid: true},
					}, dest...)
				}}
			},
		}
		s := NewService(core.New(mockDB), jwtSecret)
		resp, err := s.Login(context.Background(), adminTypes.LoginRequest{
			Email:    adminEmail,
			Password: password,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected resp, got nil")
		}
		if resp.Admin.ID != adminID {
			t.Errorf("expected admin ID %s, got %s", adminID, resp.Admin.ID)
		}
		if resp.Admin.Email != adminEmail {
			t.Errorf("expected admin Email %s, got %s", adminEmail, resp.Admin.Email)
		}
		if resp.Token == "" {
			t.Fatal("expected non-empty token")
		}

		claims, err := TrueHookJWT.ParseToken(resp.Token, jwtSecret)
		if err != nil {
			t.Fatalf("failed to parse token: %v", err)
		}
		if claims.Role != "admin" {
			t.Errorf("expected role 'admin', got '%s'", claims.Role)
		}
	})
}

func TestAdminGetAllUsers(t *testing.T) {
	adminID := uuid.New()
	userID := uuid.New()
	adminCtx := adminAuthContext(adminID, "admin@truehook.internal")
	userCtx := userAuthContext(userID, "user@example.com")

	t.Run("unauthorized context", func(t *testing.T) {
		s := NewService(nil, "secret")
		_, err := s.GetAllUsers(context.Background())
		if !errors.Is(err, adminTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("regular user forbidden", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error { return pgx.ErrNoRows }}
			},
		}
		s := NewService(core.New(mockDB), "secret")
		_, err := s.GetAllUsers(userCtx)
		if !errors.Is(err, adminTypes.ErrAdminOnly) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrAdminOnly, err)
		}
	})

	t.Run("admin successfully gets all users", func(t *testing.T) {
		now := time.Now().UTC()
		u1 := core.User{
			ID:        core.NewUUID(),
			Name:      "User 1",
			Email:     "user1@example.com",
			LogoUrl:   core.StringToText("https://example.com/u1.png"),
			CreatedAt: pgtype.Timestamptz{Time: now, Valid: true},
		}
		u2 := core.User{
			ID:        core.NewUUID(),
			Name:      "User 2",
			Email:     "user2@example.com",
			LogoUrl:   core.StringToText(""),
			CreatedAt: pgtype.Timestamptz{Time: now, Valid: true},
		}

		mockDB := &mockDBTX{
			queryFunc: func(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
				return &mockRows{
					rows: [][]interface{}{
						{u1.ID, u1.LogoUrl, u1.Name, u1.Email, u1.PasswordHash, u1.CreatedAt},
						{u2.ID, u2.LogoUrl, u2.Name, u2.Email, u2.PasswordHash, u2.CreatedAt},
					},
				}, nil
			},
		}

		s := NewService(core.New(mockDB), "secret")
		resp, err := s.GetAllUsers(adminCtx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected resp, got nil")
		}
		if len(resp.Users) != 2 {
			t.Fatalf("expected 2 users, got %d", len(resp.Users))
		}
		if resp.Users[0].Name != "User 1" || resp.Users[1].Name != "User 2" {
			t.Errorf("unexpected names: %s, %s", resp.Users[0].Name, resp.Users[1].Name)
		}
	})
}

func TestAdminGetUser(t *testing.T) {
	adminID := uuid.New()
	targetUserID := uuid.New()
	adminCtx := adminAuthContext(adminID, "admin@truehook.internal")
	userCtx := userAuthContext(uuid.New(), "user@example.com")

	t.Run("missing or invalid id path value", func(t *testing.T) {
		s := NewService(nil, "secret")
		req := httptest.NewRequest(http.MethodGet, "/admin/users/invalid-uuid", nil)
		req.SetPathValue("id", "invalid-uuid")

		_, err := s.GetUser(adminCtx, req)
		if !errors.Is(err, adminTypes.ErrInvalidID) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrInvalidID, err)
		}
	})

	t.Run("regular user forbidden", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error { return pgx.ErrNoRows }}
			},
		}
		s := NewService(core.New(mockDB), "secret")
		req := httptest.NewRequest(http.MethodGet, "/admin/users/"+targetUserID.String(), nil)
		req.SetPathValue("id", targetUserID.String())

		_, err := s.GetUser(userCtx, req)
		if !errors.Is(err, adminTypes.ErrAdminOnly) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrAdminOnly, err)
		}
	})

	t.Run("user not found", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error { return pgx.ErrNoRows }}
			},
		}
		s := NewService(core.New(mockDB), "secret")
		req := httptest.NewRequest(http.MethodGet, "/admin/users/"+targetUserID.String(), nil)
		req.SetPathValue("id", targetUserID.String())

		_, err := s.GetUser(adminCtx, req)
		if !errors.Is(err, adminTypes.ErrUserNotFound) {
			t.Fatalf("expected %v, got %v", adminTypes.ErrUserNotFound, err)
		}
	})

	t.Run("admin successfully gets user", func(t *testing.T) {
		now := time.Now().UTC()
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{scanFunc: func(dest ...interface{}) error {
					return scanUser(core.User{
						ID:        core.UUIDTOPgUUID(targetUserID),
						Name:      "Customer Account",
						Email:     "customer@domain.com",
						LogoUrl:   core.StringToText("https://domain.com/logo.png"),
						CreatedAt: pgtype.Timestamptz{Time: now, Valid: true},
					}, dest...)
				}}
			},
		}
		s := NewService(core.New(mockDB), "secret")
		req := httptest.NewRequest(http.MethodGet, "/admin/users/"+targetUserID.String(), nil)
		req.SetPathValue("id", targetUserID.String())

		resp, err := s.GetUser(adminCtx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected resp, got nil")
		}
		if resp.ID != targetUserID {
			t.Errorf("expected ID %s, got %s", targetUserID, resp.ID)
		}
		if resp.Name != "Customer Account" {
			t.Errorf("expected Name 'Customer Account', got '%s'", resp.Name)
		}
		if resp.LogoUrl != "https://domain.com/logo.png" {
			t.Errorf("expected LogoUrl, got '%s'", resp.LogoUrl)
		}
	})
}
