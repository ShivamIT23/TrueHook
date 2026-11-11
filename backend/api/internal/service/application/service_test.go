package application

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	applicationTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/application"
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

func authContext(userID uuid.UUID) context.Context {
	return context.WithValue(context.Background(), TureHookMiddleware.UserIDContextKey, userID)
}

func scanApplication(app core.Application, dest ...interface{}) error {
	if len(dest) >= 6 {
		if p, ok := dest[0].(*pgtype.UUID); ok {
			*p = app.ID
		}
		if p, ok := dest[1].(*pgtype.Text); ok {
			*p = app.LogoUrl
		}
		if p, ok := dest[2].(*pgtype.UUID); ok {
			*p = app.UserID
		}
		if p, ok := dest[3].(*string); ok {
			*p = app.Name
		}
		if p, ok := dest[4].(*pgtype.Text); ok {
			*p = app.Description
		}
		if p, ok := dest[5].(*pgtype.Timestamptz); ok {
			*p = app.CreatedAt
		}
	}
	return nil
}

func TestCreateApplication_ValidationAndAuth(t *testing.T) {
	s := NewService(nil)
	validUserID := uuid.New()
	authedCtx := authContext(validUserID)

	tests := []struct {
		name        string
		ctx         context.Context
		req         applicationTypes.CreateApplicationRequest
		expectedErr error
	}{
		{
			name: "empty application name",
			ctx:  authedCtx,
			req: applicationTypes.CreateApplicationRequest{
				Name:        "",
				Description: "some description",
			},
			expectedErr: applicationTypes.ErrInvalidName,
		},
		{
			name: "application name exceeds 255 chars",
			ctx:  authedCtx,
			req: applicationTypes.CreateApplicationRequest{
				Name:        strings.Repeat("a", 256),
				Description: "some description",
			},
			expectedErr: applicationTypes.ErrInvalidName,
		},
		{
			name: "logo url exceeds 500 chars",
			ctx:  authedCtx,
			req: applicationTypes.CreateApplicationRequest{
				Name:    "My Application",
				LogoUrl: strings.Repeat("https://example.com/", 30),
			},
			expectedErr: applicationTypes.ErrInvalidLogoUrl,
		},
		{
			name: "unauthorized context (missing user_id)",
			ctx:  context.Background(),
			req: applicationTypes.CreateApplicationRequest{
				Name:        "My Application",
				Description: "some description",
			},
			expectedErr: applicationTypes.ErrNotAuthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := s.CreateApplication(tt.ctx, tt.req)
			if !errors.Is(err, tt.expectedErr) {
				t.Fatalf("expected error %v, got %v", tt.expectedErr, err)
			}
		})
	}
}

func TestCreateApplication_RepositoryFlows(t *testing.T) {
	userID := uuid.New()
	ctx := authContext(userID)

	t.Run("application already exists", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						// Found existing application
						return scanApplication(core.Application{
							ID:     core.NewUUID(),
							UserID: core.UUIDTOPgUUID(userID),
							Name:   "existing-app",
						}, dest...)
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		_, err := s.CreateApplication(ctx, applicationTypes.CreateApplicationRequest{
			Name: "existing-app",
		})
		if !errors.Is(err, applicationTypes.ErrApplicationAlreadyExists) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrApplicationAlreadyExists, err)
		}
	})

	t.Run("database check error", func(t *testing.T) {
		dbErr := errors.New("db query timeout")
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return dbErr
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		_, err := s.CreateApplication(ctx, applicationTypes.CreateApplicationRequest{
			Name: "my-app",
		})
		if !errors.Is(err, dbErr) {
			t.Fatalf("expected %v, got %v", dbErr, err)
		}
	})

	t.Run("database creation error", func(t *testing.T) {
		createErr := errors.New("db insert failed")
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				if strings.Contains(query, "GetApplicationByName") {
					return mockRow{
						scanFunc: func(dest ...interface{}) error {
							return pgx.ErrNoRows
						},
					}
				}
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return createErr
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		_, err := s.CreateApplication(ctx, applicationTypes.CreateApplicationRequest{
			Name: "my-app",
		})
		if !errors.Is(err, createErr) {
			t.Fatalf("expected %v, got %v", createErr, err)
		}
	})

	t.Run("successful creation", func(t *testing.T) {
		appID := uuid.New()
		now := time.Now().UTC().Truncate(time.Second)

		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				if strings.Contains(query, "GetApplicationByName") {
					return mockRow{
						scanFunc: func(dest ...interface{}) error {
							return pgx.ErrNoRows
						},
					}
				}
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApplication(core.Application{
							ID:          core.UUIDTOPgUUID(appID),
							UserID:      core.UUIDTOPgUUID(userID),
							Name:        "new-app",
							Description: core.StringToText("test description"),
							CreatedAt:   pgtype.Timestamptz{Time: now, Valid: true},
						}, dest...)
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.CreateApplication(ctx, applicationTypes.CreateApplicationRequest{
			Name:        "new-app",
			Description: "test description",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if resp.ID != appID {
			t.Errorf("expected ID %s, got %s", appID, resp.ID)
		}
		if resp.Name != "new-app" {
			t.Errorf("expected Name 'new-app', got '%s'", resp.Name)
		}
		if resp.Description != "test description" {
			t.Errorf("expected Description 'test description', got '%s'", resp.Description)
		}
	})
}

func TestUpdateApplication(t *testing.T) {
	userID := uuid.New()
	validAppID := uuid.New()
	ctx := authContext(userID)

	t.Run("empty id", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateApplication(ctx, applicationTypes.UpdateApplicationRequest{
			Id:   "",
			Name: "updated-name",
		})
		if !errors.Is(err, applicationTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrInvalidId, err)
		}
	})

	t.Run("invalid id uuid", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateApplication(ctx, applicationTypes.UpdateApplicationRequest{
			Id:   "not-a-valid-uuid",
			Name: "updated-name",
		})
		if !errors.Is(err, applicationTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrInvalidId, err)
		}
	})

	t.Run("invalid name", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateApplication(ctx, applicationTypes.UpdateApplicationRequest{
			Id:   validAppID.String(),
			Name: "",
		})
		if !errors.Is(err, applicationTypes.ErrInvalidName) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrInvalidName, err)
		}
	})

	t.Run("logo url exceeds 500 chars", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateApplication(ctx, applicationTypes.UpdateApplicationRequest{
			Id:      validAppID.String(),
			Name:    "valid-name",
			LogoUrl: strings.Repeat("https://example.com/", 30),
		})
		if !errors.Is(err, applicationTypes.ErrInvalidLogoUrl) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrInvalidLogoUrl, err)
		}
	})

	t.Run("missing authorization", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateApplication(context.Background(), applicationTypes.UpdateApplicationRequest{
			Id:   validAppID.String(),
			Name: "updated-name",
		})
		if !errors.Is(err, applicationTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("application not found", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return pgx.ErrNoRows
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		_, err := s.UpdateApplication(ctx, applicationTypes.UpdateApplicationRequest{
			Id:   validAppID.String(),
			Name: "updated-name",
		})
		if !errors.Is(err, applicationTypes.ErrApplicationNotFound) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrApplicationNotFound, err)
		}
	})

	t.Run("update exec error", func(t *testing.T) {
		updateErr := errors.New("update failed")
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApplication(core.Application{
							ID:     core.UUIDTOPgUUID(validAppID),
							UserID: core.UUIDTOPgUUID(userID),
							Name:   "old-name",
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, updateErr
			},
		}

		s := NewService(core.New(mockDB))
		_, err := s.UpdateApplication(ctx, applicationTypes.UpdateApplicationRequest{
			Id:   validAppID.String(),
			Name: "updated-name",
		})
		if !errors.Is(err, updateErr) {
			t.Fatalf("expected %v, got %v", updateErr, err)
		}
	})

	t.Run("successful update", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApplication(core.Application{
							ID:          core.UUIDTOPgUUID(validAppID),
							UserID:      core.UUIDTOPgUUID(userID),
							Name:        "old-name",
							Description: core.StringToText("old-desc"),
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, nil
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.UpdateApplication(ctx, applicationTypes.UpdateApplicationRequest{
			Id:          validAppID.String(),
			Name:        "new-name",
			Description: "new-desc",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if resp.ID != validAppID {
			t.Errorf("expected ID %s, got %s", validAppID, resp.ID)
		}
		if resp.Name != "new-name" {
			t.Errorf("expected Name 'new-name', got '%s'", resp.Name)
		}
		if resp.Description != "new-desc" {
			t.Errorf("expected Description 'new-desc', got '%s'", resp.Description)
		}
	})
}

func TestGetApplication(t *testing.T) {
	userID := uuid.New()
	validAppID := uuid.New()
	ctx := authContext(userID)

	t.Run("missing id path value", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodGet, "/application/", nil)
		_, err := s.GetApplication(ctx, req)
		if !errors.Is(err, applicationTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrInvalidId, err)
		}
	})

	t.Run("invalid id uuid format", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodGet, "/application/abc", nil)
		req.SetPathValue("id", "invalid-uuid")
		_, err := s.GetApplication(ctx, req)
		if !errors.Is(err, applicationTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrInvalidId, err)
		}
	})

	t.Run("missing authorization", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodGet, "/application/"+validAppID.String(), nil)
		req.SetPathValue("id", validAppID.String())
		_, err := s.GetApplication(context.Background(), req)
		if !errors.Is(err, applicationTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("application not found", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return pgx.ErrNoRows
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodGet, "/application/"+validAppID.String(), nil)
		req.SetPathValue("id", validAppID.String())
		_, err := s.GetApplication(ctx, req)
		if !errors.Is(err, applicationTypes.ErrApplicationNotFound) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrApplicationNotFound, err)
		}
	})

	t.Run("successful get", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApplication(core.Application{
							ID:          core.UUIDTOPgUUID(validAppID),
							UserID:      core.UUIDTOPgUUID(userID),
							Name:        "retrieved-app",
							Description: core.StringToText("my app"),
						}, dest...)
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodGet, "/application/"+validAppID.String(), nil)
		req.SetPathValue("id", validAppID.String())
		resp, err := s.GetApplication(ctx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if resp.ID != validAppID {
			t.Errorf("expected ID %s, got %s", validAppID, resp.ID)
		}
		if resp.Name != "retrieved-app" {
			t.Errorf("expected Name 'retrieved-app', got '%s'", resp.Name)
		}
	})
}

func TestGetAllApplication(t *testing.T) {
	userID := uuid.New()
	ctx := authContext(userID)

	t.Run("missing authorization", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.GetAllApplication(context.Background())
		if !errors.Is(err, applicationTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("database retrieval error", func(t *testing.T) {
		dbErr := errors.New("retrieval failed")
		mockDB := &mockDBTX{
			queryFunc: func(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
				return nil, dbErr
			},
		}

		s := NewService(core.New(mockDB))
		_, err := s.GetAllApplication(ctx)
		if !errors.Is(err, dbErr) {
			t.Fatalf("expected %v, got %v", dbErr, err)
		}
	})

	t.Run("successful get all", func(t *testing.T) {
		app1 := core.Application{
			ID:          core.NewUUID(),
			UserID:      core.UUIDTOPgUUID(userID),
			Name:        "app-1",
			Description: core.StringToText("desc-1"),
		}
		app2 := core.Application{
			ID:          core.NewUUID(),
			UserID:      core.UUIDTOPgUUID(userID),
			Name:        "app-2",
			Description: core.StringToText("desc-2"),
		}

		mockDB := &mockDBTX{
			queryFunc: func(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
				return &mockRows{
					rows: [][]interface{}{
						{app1.ID, app1.LogoUrl, app1.UserID, app1.Name, app1.Description, app1.CreatedAt},
						{app2.ID, app2.LogoUrl, app2.UserID, app2.Name, app2.Description, app2.CreatedAt},
					},
				}, nil
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.GetAllApplication(ctx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if len(resp.Applications) != 2 {
			t.Fatalf("expected 2 applications, got %d", len(resp.Applications))
		}
		if resp.Applications[0].Name != "app-1" || resp.Applications[1].Name != "app-2" {
			t.Errorf("unexpected application names: %v, %v", resp.Applications[0].Name, resp.Applications[1].Name)
		}
	})
}

func TestDeleteApplication(t *testing.T) {
	userID := uuid.New()
	validAppID := uuid.New()
	ctx := authContext(userID)

	t.Run("missing id path value", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodDelete, "/application/", nil)
		_, err := s.DeleteApplication(ctx, req)
		if !errors.Is(err, applicationTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrInvalidId, err)
		}
	})

	t.Run("invalid id uuid format", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodDelete, "/application/xyz", nil)
		req.SetPathValue("id", "invalid-uuid")
		_, err := s.DeleteApplication(ctx, req)
		if !errors.Is(err, applicationTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrInvalidId, err)
		}
	})

	t.Run("missing authorization", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodDelete, "/application/"+validAppID.String(), nil)
		req.SetPathValue("id", validAppID.String())
		_, err := s.DeleteApplication(context.Background(), req)
		if !errors.Is(err, applicationTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("application not found", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return pgx.ErrNoRows
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodDelete, "/application/"+validAppID.String(), nil)
		req.SetPathValue("id", validAppID.String())
		_, err := s.DeleteApplication(ctx, req)
		if !errors.Is(err, applicationTypes.ErrApplicationNotFound) {
			t.Fatalf("expected %v, got %v", applicationTypes.ErrApplicationNotFound, err)
		}
	})

	t.Run("database deletion error", func(t *testing.T) {
		deleteErr := errors.New("delete exec failure")
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApplication(core.Application{
							ID:          core.UUIDTOPgUUID(validAppID),
							UserID:      core.UUIDTOPgUUID(userID),
							Name:        "app-to-delete",
							Description: core.StringToText("will be deleted"),
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, deleteErr
			},
		}

		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodDelete, "/application/"+validAppID.String(), nil)
		req.SetPathValue("id", validAppID.String())
		_, err := s.DeleteApplication(ctx, req)
		if !errors.Is(err, deleteErr) {
			t.Fatalf("expected %v, got %v", deleteErr, err)
		}
	})

	t.Run("successful deletion", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanApplication(core.Application{
							ID:          core.UUIDTOPgUUID(validAppID),
							UserID:      core.UUIDTOPgUUID(userID),
							Name:        "deleted-app",
							Description: core.StringToText("deleted description"),
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, nil
			},
		}

		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodDelete, "/application/"+validAppID.String(), nil)
		req.SetPathValue("id", validAppID.String())
		resp, err := s.DeleteApplication(ctx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if resp.ID != validAppID {
			t.Errorf("expected ID %s, got %s", validAppID, resp.ID)
		}
		if resp.Name != "deleted-app" {
			t.Errorf("expected Name 'deleted-app', got '%s'", resp.Name)
		}
	})
}
