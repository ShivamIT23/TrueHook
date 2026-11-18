package api

import (
	"context"
	"errors"
	"net/http/httptest"
	"testing"
	"time"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	apiTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/api"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
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

func (m *mockRows) Close()                                       {}
func (m *mockRows) Err() error                                   { return m.err }
func (m *mockRows) CommandTag() pgconn.CommandTag               { return pgconn.CommandTag{} }
func (m *mockRows) FieldDescriptions() []pgconn.FieldDescription { return nil }
func (m *mockRows) Values() ([]any, error)                       { return nil, nil }
func (m *mockRows) RawValues() [][]byte                          { return nil }
func (m *mockRows) Conn() *pgx.Conn                             { return nil }
func (m *mockRows) TypeMap() *pgtype.Map                         { return pgtype.NewMap() }
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
		case *int64:
			if v, ok := val.(int64); ok {
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

func authContext(userID uuid.UUID) context.Context {
	return context.WithValue(context.Background(), TureHookMiddleware.UserIDContextKey, userID)
}

func scanApi(a core.Api, dest ...interface{}) error {
	if len(dest) >= 6 {
		if p, ok := dest[0].(*pgtype.UUID); ok {
			*p = a.ID
		}
		if p, ok := dest[1].(*string); ok {
			*p = a.ApiKey
		}
		if p, ok := dest[2].(*pgtype.UUID); ok {
			*p = a.UserID
		}
		if p, ok := dest[3].(*int64); ok {
			*p = a.ApiCreditsUsed
		}
		if p, ok := dest[4].(*pgtype.Timestamptz); ok {
			*p = a.CreatedAt
		}
		if p, ok := dest[5].(*pgtype.Timestamptz); ok {
			*p = a.UpdatedAt
		}
	}
	return nil
}

func TestCreateAPI(t *testing.T) {
	userID := uuid.New()
	apiID := uuid.New()

	t.Run("unauthorized", func(t *testing.T) {
		svc := NewService(core.New(&mockDBTX{}))
		_, err := svc.CreateAPI(context.Background(), apiTypes.CreateAPIRequest{})
		if !errors.Is(err, apiTypes.ErrNotAuthorized) {
			t.Fatalf("expected ErrNotAuthorized, got %v", err)
		}
	})

	t.Run("invalid custom key", func(t *testing.T) {
		svc := NewService(core.New(&mockDBTX{}))
		_, err := svc.CreateAPI(authContext(userID), apiTypes.CreateAPIRequest{APIKey: "short"})
		if !errors.Is(err, apiTypes.ErrInvalidAPIKey) {
			t.Fatalf("expected ErrInvalidAPIKey, got %v", err)
		}
	})

	t.Run("negative credits", func(t *testing.T) {
		svc := NewService(core.New(&mockDBTX{}))
		neg := int64(-5)
		_, err := svc.CreateAPI(authContext(userID), apiTypes.CreateAPIRequest{APICreditsUsed: &neg})
		if !errors.Is(err, apiTypes.ErrInvalidCredits) {
			t.Fatalf("expected ErrInvalidCredits, got %v", err)
		}
	})

	t.Run("success with generated key", func(t *testing.T) {
		now := time.Now()
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApi(core.Api{
							ID:             core.UUIDTOPgUUID(apiID),
							ApiKey:         args[1].(string),
							UserID:         args[0].(pgtype.UUID),
							ApiCreditsUsed: args[2].(int64),
							CreatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
							UpdatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
						}, dest...)
					},
				}
			},
		}
		svc := NewService(core.New(db))
		resp, err := svc.CreateAPI(authContext(userID), apiTypes.CreateAPIRequest{})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.ID != apiID {
			t.Fatalf("expected id %v, got %v", apiID, resp.ID)
		}
		if resp.UserID != userID {
			t.Fatalf("expected user id %v, got %v", userID, resp.UserID)
		}
		if resp.APICreditsUsed != 0 {
			t.Fatalf("expected 0 credits, got %d", resp.APICreditsUsed)
		}
	})

	t.Run("already exists", func(t *testing.T) {
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return &pgconn.PgError{Code: "23505"}
					},
				}
			},
		}
		svc := NewService(core.New(db))
		_, err := svc.CreateAPI(authContext(userID), apiTypes.CreateAPIRequest{APIKey: "th_custom_key_12345"})
		if !errors.Is(err, apiTypes.ErrAPIAlreadyExists) {
			t.Fatalf("expected ErrAPIAlreadyExists, got %v", err)
		}
	})
}

func TestGetAPI(t *testing.T) {
	userID := uuid.New()
	apiID := uuid.New()

	t.Run("success", func(t *testing.T) {
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApi(core.Api{
							ID:             core.UUIDTOPgUUID(apiID),
							ApiKey:         "th_live_test_key_12345",
							UserID:         core.UUIDTOPgUUID(userID),
							ApiCreditsUsed: 42,
							CreatedAt:      pgtype.Timestamptz{Time: time.Now(), Valid: true},
							UpdatedAt:      pgtype.Timestamptz{Time: time.Now(), Valid: true},
						}, dest...)
					},
				}
			},
		}
		svc := NewService(core.New(db))
		req := httptest.NewRequest("GET", "/api/v1/api/"+apiID.String(), nil)
		req.SetPathValue("id", apiID.String())

		resp, err := svc.GetAPI(authContext(userID), req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.ID != apiID {
			t.Fatalf("expected api id %v, got %v", apiID, resp.ID)
		}
		if resp.APICreditsUsed != 42 {
			t.Fatalf("expected credits 42, got %d", resp.APICreditsUsed)
		}
	})

	t.Run("not found", func(t *testing.T) {
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return pgx.ErrNoRows
					},
				}
			},
		}
		svc := NewService(core.New(db))
		req := httptest.NewRequest("GET", "/api/v1/api/"+apiID.String(), nil)
		req.SetPathValue("id", apiID.String())

		_, err := svc.GetAPI(authContext(userID), req)
		if !errors.Is(err, apiTypes.ErrAPINotFound) {
			t.Fatalf("expected ErrAPINotFound, got %v", err)
		}
	})

	t.Run("invalid id", func(t *testing.T) {
		svc := NewService(core.New(&mockDBTX{}))
		req := httptest.NewRequest("GET", "/api/v1/api/invalid-id", nil)
		req.SetPathValue("id", "invalid-id")

		_, err := svc.GetAPI(authContext(userID), req)
		if !errors.Is(err, apiTypes.ErrInvalidID) {
			t.Fatalf("expected ErrInvalidID, got %v", err)
		}
	})
}

func TestGetAPIByKey(t *testing.T) {
	apiID := uuid.New()
	userID := uuid.New()

	t.Run("success", func(t *testing.T) {
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApi(core.Api{
							ID:             core.UUIDTOPgUUID(apiID),
							ApiKey:         "th_live_lookup_key_12345",
							UserID:         core.UUIDTOPgUUID(userID),
							ApiCreditsUsed: 10,
							CreatedAt:      pgtype.Timestamptz{Time: time.Now(), Valid: true},
							UpdatedAt:      pgtype.Timestamptz{Time: time.Now(), Valid: true},
						}, dest...)
					},
				}
			},
		}
		svc := NewService(core.New(db))
		resp, err := svc.GetAPIByKey(context.Background(), "th_live_lookup_key_12345")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.APIKey != "th_live_lookup_key_12345" {
			t.Fatalf("expected key th_live_lookup_key_12345, got %s", resp.APIKey)
		}
	})

	t.Run("empty key", func(t *testing.T) {
		svc := NewService(core.New(&mockDBTX{}))
		_, err := svc.GetAPIByKey(context.Background(), "   ")
		if !errors.Is(err, apiTypes.ErrInvalidAPIKey) {
			t.Fatalf("expected ErrInvalidAPIKey, got %v", err)
		}
	})
}

func TestGetAllAPIs(t *testing.T) {
	userID := uuid.New()
	apiID1 := uuid.New()
	apiID2 := uuid.New()
	now := time.Now()

	t.Run("success", func(t *testing.T) {
		db := &mockDBTX{
			queryFunc: func(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
				return &mockRows{
					rows: [][]interface{}{
						{core.UUIDTOPgUUID(apiID1), "th_key_1_12345", core.UUIDTOPgUUID(userID), int64(10), pgtype.Timestamptz{Time: now, Valid: true}, pgtype.Timestamptz{Time: now, Valid: true}},
						{core.UUIDTOPgUUID(apiID2), "th_key_2_12345", core.UUIDTOPgUUID(userID), int64(20), pgtype.Timestamptz{Time: now, Valid: true}, pgtype.Timestamptz{Time: now, Valid: true}},
					},
				}, nil
			},
		}
		svc := NewService(core.New(db))
		res, err := svc.GetAllAPIs(authContext(userID))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(res.APIs) != 2 {
			t.Fatalf("expected 2 apis, got %d", len(res.APIs))
		}
	})
}

func TestUpdateCredits(t *testing.T) {
	userID := uuid.New()
	apiID := uuid.New()
	now := time.Now()

	t.Run("add credits success", func(t *testing.T) {
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApi(core.Api{
							ID:             core.UUIDTOPgUUID(apiID),
							ApiKey:         "th_test_key_12345",
							UserID:         core.UUIDTOPgUUID(userID),
							ApiCreditsUsed: 15,
							CreatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
							UpdatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
						}, dest...)
					},
				}
			},
		}
		svc := NewService(core.New(db))
		resp, err := svc.UpdateCredits(authContext(userID), apiTypes.UpdateCreditsRequest{
			ID:           apiID.String(),
			CreditsToAdd: 5,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.APICreditsUsed != 15 {
			t.Fatalf("expected credits 15, got %d", resp.APICreditsUsed)
		}
	})

	t.Run("set credits success", func(t *testing.T) {
		val := int64(100)
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApi(core.Api{
							ID:             core.UUIDTOPgUUID(apiID),
							ApiKey:         "th_test_key_12345",
							UserID:         core.UUIDTOPgUUID(userID),
							ApiCreditsUsed: 100,
							CreatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
							UpdatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
						}, dest...)
					},
				}
			},
		}
		svc := NewService(core.New(db))
		resp, err := svc.UpdateCredits(authContext(userID), apiTypes.UpdateCreditsRequest{
			ID:             apiID.String(),
			APICreditsUsed: &val,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.APICreditsUsed != 100 {
			t.Fatalf("expected credits 100, got %d", resp.APICreditsUsed)
		}
	})

	t.Run("negative credits error", func(t *testing.T) {
		svc := NewService(core.New(&mockDBTX{}))
		_, err := svc.UpdateCredits(authContext(userID), apiTypes.UpdateCreditsRequest{
			ID:           apiID.String(),
			CreditsToAdd: -10,
		})
		if !errors.Is(err, apiTypes.ErrInvalidCredits) {
			t.Fatalf("expected ErrInvalidCredits, got %v", err)
		}
	})
}

func TestRegenerateKey(t *testing.T) {
	userID := uuid.New()
	apiID := uuid.New()
	now := time.Now()

	t.Run("success", func(t *testing.T) {
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApi(core.Api{
							ID:             core.UUIDTOPgUUID(apiID),
							ApiKey:         args[2].(string),
							UserID:         core.UUIDTOPgUUID(userID),
							ApiCreditsUsed: 10,
							CreatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
							UpdatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
						}, dest...)
					},
				}
			},
		}
		svc := NewService(core.New(db))
		resp, err := svc.RegenerateKey(authContext(userID), apiTypes.RegenerateKeyRequest{
			ID: apiID.String(),
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.ID != apiID {
			t.Fatalf("expected id %v, got %v", apiID, resp.ID)
		}
	})
}

func TestDeleteAPI(t *testing.T) {
	userID := uuid.New()
	apiID := uuid.New()
	now := time.Now()

	t.Run("success", func(t *testing.T) {
		db := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApi(core.Api{
							ID:             core.UUIDTOPgUUID(apiID),
							ApiKey:         "th_test_key_12345",
							UserID:         core.UUIDTOPgUUID(userID),
							ApiCreditsUsed: 10,
							CreatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
							UpdatedAt:      pgtype.Timestamptz{Time: now, Valid: true},
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, nil
			},
		}
		svc := NewService(core.New(db))
		req := httptest.NewRequest("DELETE", "/api/v1/api/"+apiID.String(), nil)
		req.SetPathValue("id", apiID.String())

		resp, err := svc.DeleteAPI(authContext(userID), req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.ID != apiID {
			t.Fatalf("expected deleted id %v, got %v", apiID, resp.ID)
		}
	})
}
