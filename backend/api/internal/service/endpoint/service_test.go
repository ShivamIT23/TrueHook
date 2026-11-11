package endpoint

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	endpointTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/endpoint"
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
		case *bool:
			if v, ok := val.(bool); ok {
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

func timeToTimestamptz(t time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{
		Time:  t,
		Valid: true,
	}
}

func scanEndpoint(ep core.Endpoint, dest ...interface{}) error {
	if len(dest) >= 6 {
		if p, ok := dest[0].(*pgtype.UUID); ok {
			*p = ep.ID
		}
		if p, ok := dest[1].(*pgtype.UUID); ok {
			*p = ep.ApplicationID
		}
		if p, ok := dest[2].(*string); ok {
			*p = ep.Url
		}
		if p, ok := dest[3].(*string); ok {
			*p = ep.SecretEncrypted
		}
		if p, ok := dest[4].(*bool); ok {
			*p = ep.Enabled
		}
		if p, ok := dest[5].(*pgtype.Timestamptz); ok {
			*p = ep.CreatedAt
		}
	}
	return nil
}

func TestCreateEndpoint_ValidationAndAuth(t *testing.T) {
	s := NewService(nil)
	validUserID := uuid.New()
	validAppID := uuid.New().String()
	authedCtx := authContext(validUserID)

	tests := []struct {
		name        string
		ctx         context.Context
		req         endpointTypes.CreateEndpointRequest
		expectedErr error
	}{
		{
			name: "empty url",
			ctx:  authedCtx,
			req: endpointTypes.CreateEndpointRequest{
				ApplicationId: validAppID,
				Url:           "",
			},
			expectedErr: endpointTypes.ErrInvalidUrl,
		},
		{
			name: "invalid url format",
			ctx:  authedCtx,
			req: endpointTypes.CreateEndpointRequest{
				ApplicationId: validAppID,
				Url:           "not-a-valid-url",
			},
			expectedErr: endpointTypes.ErrInvalidUrl,
		},
		{
			name: "invalid url scheme ftp",
			ctx:  authedCtx,
			req: endpointTypes.CreateEndpointRequest{
				ApplicationId: validAppID,
				Url:           "ftp://example.com/webhook",
			},
			expectedErr: endpointTypes.ErrInvalidUrl,
		},
		{
			name: "invalid application id uuid",
			ctx:  authedCtx,
			req: endpointTypes.CreateEndpointRequest{
				ApplicationId: "invalid-uuid",
				Url:           "https://example.com/webhook",
			},
			expectedErr: endpointTypes.ErrInvalidId,
		},
		{
			name: "unauthorized context (missing user_id)",
			ctx:  context.Background(),
			req: endpointTypes.CreateEndpointRequest{
				ApplicationId: validAppID,
				Url:           "https://example.com/webhook",
			},
			expectedErr: endpointTypes.ErrNotAuthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := s.CreateEndpoint(tt.ctx, tt.req)
			if !errors.Is(err, tt.expectedErr) {
				t.Fatalf("expected error %v, got %v", tt.expectedErr, err)
			}
		})
	}
}

func TestCreateEndpoint_RepositoryFlows(t *testing.T) {
	userID := uuid.New()
	appID := uuid.New()
	ctx := authContext(userID)

	t.Run("application lookup error", func(t *testing.T) {
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
		_, err := s.CreateEndpoint(ctx, endpointTypes.CreateEndpointRequest{
			ApplicationId: appID.String(),
			Url:           "https://example.com/webhook",
		})
		if !errors.Is(err, endpointTypes.ErrApplicationNotFound) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrApplicationNotFound, err)
		}
	})

	t.Run("successful endpoint creation with auto-generated secret", func(t *testing.T) {
		epID := uuid.New()
		now := time.Now().UTC()

		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				// First queryRow: GetApplicationById
				// Second queryRow: CreateEndpoints
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						if len(dest) == 6 {
							// Check if it's application or endpoint
							if _, ok := dest[4].(*bool); ok {
								// Endpoint
								return scanEndpoint(core.Endpoint{
									ID:              core.UUIDTOPgUUID(epID),
									ApplicationID:   core.UUIDTOPgUUID(appID),
									Url:             "https://example.com/webhook",
									SecretEncrypted: "whsec_auto",
									Enabled:         true,
									CreatedAt:       timeToTimestamptz(now),
								}, dest...)
							}
						}
						return nil
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.CreateEndpoint(ctx, endpointTypes.CreateEndpointRequest{
			ApplicationId: appID.String(),
			Url:           "https://example.com/webhook",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil || resp.ID != epID {
			t.Fatalf("unexpected response: %+v", resp)
		}
	})
}

func TestUpdateEndpoint_ValidationAndFlows(t *testing.T) {
	userID := uuid.New()
	appID := uuid.New()
	epID := uuid.New()
	ctx := authContext(userID)

	t.Run("empty id", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateEndpoint(ctx, endpointTypes.UpdateEndpointRequest{
			Id:  "",
			Url: "https://example.com/webhook",
		})
		if !errors.Is(err, endpointTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrInvalidId, err)
		}
	})

	t.Run("invalid url", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateEndpoint(ctx, endpointTypes.UpdateEndpointRequest{
			Id:  epID.String(),
			Url: "invalid-url",
		})
		if !errors.Is(err, endpointTypes.ErrInvalidUrl) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrInvalidUrl, err)
		}
	})

	t.Run("unauthorized context", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateEndpoint(context.Background(), endpointTypes.UpdateEndpointRequest{
			Id:  epID.String(),
			Url: "https://example.com/webhook",
		})
		if !errors.Is(err, endpointTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("endpoint not found", func(t *testing.T) {
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
		_, err := s.UpdateEndpoint(ctx, endpointTypes.UpdateEndpointRequest{
			Id:  epID.String(),
			Url: "https://example.com/webhook-updated",
		})
		if !errors.Is(err, endpointTypes.ErrEndpointNotFound) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrEndpointNotFound, err)
		}
	})

	t.Run("successful update", func(t *testing.T) {
		now := time.Now().UTC()
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanEndpoint(core.Endpoint{
							ID:              core.UUIDTOPgUUID(epID),
							ApplicationID:   core.UUIDTOPgUUID(appID),
							Url:             "https://example.com/webhook",
							SecretEncrypted: "whsec_orig",
							Enabled:         true,
							CreatedAt:       timeToTimestamptz(now),
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, nil
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.UpdateEndpoint(ctx, endpointTypes.UpdateEndpointRequest{
			Id:      epID.String(),
			Url:     "https://example.com/webhook-updated",
			Enabled: true,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil || resp.Url != "https://example.com/webhook-updated" {
			t.Fatalf("unexpected response: %+v", resp)
		}
	})
}

func TestDeleteEndpoint_Flows(t *testing.T) {
	userID := uuid.New()
	epID := uuid.New()
	ctx := authContext(userID)

	t.Run("missing id", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodDelete, "/api/v1/application/123/endpoint/", nil)
		_, err := s.DeleteEndpoint(ctx, req)
		if !errors.Is(err, endpointTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrInvalidId, err)
		}
	})

	t.Run("unauthorized", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodDelete, "/api/v1/application/123/endpoint/"+epID.String(), nil)
		req.SetPathValue("endpoint_id", epID.String())
		_, err := s.DeleteEndpoint(context.Background(), req)
		if !errors.Is(err, endpointTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("endpoint not found", func(t *testing.T) {
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
		req := httptest.NewRequest(http.MethodDelete, "/api/v1/application/123/endpoint/"+epID.String(), nil)
		req.SetPathValue("endpoint_id", epID.String())
		_, err := s.DeleteEndpoint(ctx, req)
		if !errors.Is(err, endpointTypes.ErrEndpointNotFound) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrEndpointNotFound, err)
		}
	})

	t.Run("successful deletion", func(t *testing.T) {
		now := time.Now().UTC()
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanEndpoint(core.Endpoint{
							ID:              core.UUIDTOPgUUID(epID),
							Url:             "https://example.com/webhook",
							SecretEncrypted: "whsec_test",
							Enabled:         true,
							CreatedAt:       timeToTimestamptz(now),
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, nil
			},
		}

		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodDelete, "/api/v1/application/123/endpoint/"+epID.String(), nil)
		req.SetPathValue("endpoint_id", epID.String())
		resp, err := s.DeleteEndpoint(ctx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil || resp.ID != epID {
			t.Fatalf("unexpected response: %+v", resp)
		}
	})
}

func TestGetEndpoints_Flows(t *testing.T) {
	userID := uuid.New()
	appID := uuid.New()
	ctx := authContext(userID)

	t.Run("unauthorized", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.GetEndpoints(context.Background(), endpointTypes.GetEndpointsRequest{
			ApplicationId: appID.String(),
		})
		if !errors.Is(err, endpointTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("invalid app id", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.GetEndpoints(ctx, endpointTypes.GetEndpointsRequest{
			ApplicationId: "not-a-uuid",
		})
		if !errors.Is(err, endpointTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrInvalidId, err)
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
		_, err := s.GetEndpoints(ctx, endpointTypes.GetEndpointsRequest{
			ApplicationId: appID.String(),
		})
		if !errors.Is(err, endpointTypes.ErrApplicationNotFound) {
			t.Fatalf("expected %v, got %v", endpointTypes.ErrApplicationNotFound, err)
		}
	})

	t.Run("successful retrieval", func(t *testing.T) {
		epID := uuid.New()
		now := time.Now().UTC()

		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{}
			},
			queryFunc: func(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
				return &mockRows{
					rows: [][]interface{}{
						{
							core.UUIDTOPgUUID(epID),
							core.UUIDTOPgUUID(appID),
							"https://example.com/webhook",
							"whsec_test",
							true,
							timeToTimestamptz(now),
						},
					},
				}, nil
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.GetEndpoints(ctx, endpointTypes.GetEndpointsRequest{
			ApplicationId: appID.String(),
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil || len(resp.Endpoints) != 1 {
			t.Fatalf("unexpected response: %+v", resp)
		}
	})
}
