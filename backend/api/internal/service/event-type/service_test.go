package eventtype

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	eventTypeTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/event-type"
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
	if len(dest) >= 5 {
		if p, ok := dest[0].(*pgtype.UUID); ok {
			*p = app.ID
		}
		if p, ok := dest[1].(*pgtype.UUID); ok {
			*p = app.UserID
		}
		if p, ok := dest[2].(*string); ok {
			*p = app.Name
		}
		if p, ok := dest[3].(*pgtype.Text); ok {
			*p = app.Description
		}
		if p, ok := dest[4].(*pgtype.Timestamptz); ok {
			*p = app.CreatedAt
		}
	}
	return nil
}

func scanEventType(et core.EventType, dest ...interface{}) error {
	if len(dest) >= 5 {
		if p, ok := dest[0].(*pgtype.UUID); ok {
			*p = et.ID
		}
		if p, ok := dest[1].(*pgtype.UUID); ok {
			*p = et.ApplicationID
		}
		if p, ok := dest[2].(*string); ok {
			*p = et.Name
		}
		if p, ok := dest[3].(*pgtype.Text); ok {
			*p = et.Description
		}
		if p, ok := dest[4].(*pgtype.Timestamptz); ok {
			*p = et.CreatedAt
		}
	}
	return nil
}

func TestCreateEventType_ValidationAndAuth(t *testing.T) {
	s := NewService(nil)
	validUserID := uuid.New()
	validAppID := uuid.New().String()
	authedCtx := authContext(validUserID)

	tests := []struct {
		name        string
		ctx         context.Context
		req         eventTypeTypes.CreateEventTypeRequest
		expectedErr error
	}{
		{
			name: "empty event type name",
			ctx:  authedCtx,
			req: eventTypeTypes.CreateEventTypeRequest{
				ApplicationId: validAppID,
				Name:          "",
				Description:   "some description",
			},
			expectedErr: eventTypeTypes.ErrInvalidName,
		},
		{
			name: "event type name exceeds 255 chars",
			ctx:  authedCtx,
			req: eventTypeTypes.CreateEventTypeRequest{
				ApplicationId: validAppID,
				Name:          strings.Repeat("e", 256),
				Description:   "some description",
			},
			expectedErr: eventTypeTypes.ErrInvalidName,
		},
		{
			name: "invalid application id uuid",
			ctx:  authedCtx,
			req: eventTypeTypes.CreateEventTypeRequest{
				ApplicationId: "invalid-uuid",
				Name:          "user.created",
				Description:   "some description",
			},
			expectedErr: eventTypeTypes.ErrInvalidId,
		},
		{
			name: "unauthorized context (missing user_id)",
			ctx:  context.Background(),
			req: eventTypeTypes.CreateEventTypeRequest{
				ApplicationId: validAppID,
				Name:          "user.created",
				Description:   "some description",
			},
			expectedErr: eventTypeTypes.ErrNotAuthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := s.CreateEventType(tt.ctx, tt.req)
			if !errors.Is(err, tt.expectedErr) {
				t.Fatalf("expected error %v, got %v", tt.expectedErr, err)
			}
		})
	}
}

func TestCreateEventType_RepositoryFlows(t *testing.T) {
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
		_, err := s.CreateEventType(ctx, eventTypeTypes.CreateEventTypeRequest{
			ApplicationId: appID.String(),
			Name:          "order.created",
			Description:   "Order created event",
		})
		if !errors.Is(err, eventTypeTypes.ErrEventTypeAlreadyExists) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrEventTypeAlreadyExists, err)
		}
	})

	t.Run("database creation error", func(t *testing.T) {
		createErr := errors.New("event type creation failed")
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				if strings.Contains(query, "GetApplicationById") {
					return mockRow{
						scanFunc: func(dest ...interface{}) error {
							return scanApplication(core.Application{
								ID:     core.UUIDTOPgUUID(appID),
								UserID: core.UUIDTOPgUUID(userID),
								Name:   "app-name",
							}, dest...)
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
		_, err := s.CreateEventType(ctx, eventTypeTypes.CreateEventTypeRequest{
			ApplicationId: appID.String(),
			Name:          "order.created",
			Description:   "Order created event",
		})
		if !errors.Is(err, createErr) {
			t.Fatalf("expected %v, got %v", createErr, err)
		}
	})

	t.Run("successful creation", func(t *testing.T) {
		eventID := uuid.New()
		now := time.Now().UTC().Truncate(time.Second)

		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				if strings.Contains(query, "GetApplicationById") {
					return mockRow{
						scanFunc: func(dest ...interface{}) error {
							return scanApplication(core.Application{
								ID:     core.UUIDTOPgUUID(appID),
								UserID: core.UUIDTOPgUUID(userID),
								Name:   "app-name",
							}, dest...)
						},
					}
				}
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanEventType(core.EventType{
							ID:            core.UUIDTOPgUUID(eventID),
							ApplicationID: core.UUIDTOPgUUID(appID),
							Name:          "order.created",
							Description:   core.StringToText("Order created event"),
							CreatedAt:     pgtype.Timestamptz{Time: now, Valid: true},
						}, dest...)
					},
				}
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.CreateEventType(ctx, eventTypeTypes.CreateEventTypeRequest{
			ApplicationId: appID.String(),
			Name:          "order.created",
			Description:   "Order created event",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if resp.ID != eventID {
			t.Errorf("expected ID %s, got %s", eventID, resp.ID)
		}
		if resp.Name != "order.created" {
			t.Errorf("expected Name 'order.created', got '%s'", resp.Name)
		}
		if resp.Description != "Order created event" {
			t.Errorf("expected Description 'Order created event', got '%s'", resp.Description)
		}
	})
}

func TestUpdateEventType(t *testing.T) {
	userID := uuid.New()
	validEventID := uuid.New()
	validAppID := uuid.New()
	ctx := authContext(userID)

	t.Run("empty id", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateEventType(ctx, eventTypeTypes.UpdateEventTypeRequest{
			Id:   "",
			Name: "order.updated",
		})
		if !errors.Is(err, eventTypeTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrInvalidId, err)
		}
	})

	t.Run("invalid name - empty", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateEventType(ctx, eventTypeTypes.UpdateEventTypeRequest{
			Id:   validEventID.String(),
			Name: "",
		})
		if !errors.Is(err, eventTypeTypes.ErrInvalidName) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrInvalidName, err)
		}
	})

	t.Run("invalid name - exceeds 255 chars", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateEventType(ctx, eventTypeTypes.UpdateEventTypeRequest{
			Id:   validEventID.String(),
			Name: strings.Repeat("x", 256),
		})
		if !errors.Is(err, eventTypeTypes.ErrInvalidName) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrInvalidName, err)
		}
	})

	t.Run("missing authorization", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateEventType(context.Background(), eventTypeTypes.UpdateEventTypeRequest{
			Id:   validEventID.String(),
			Name: "order.updated",
		})
		if !errors.Is(err, eventTypeTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("invalid id uuid", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.UpdateEventType(ctx, eventTypeTypes.UpdateEventTypeRequest{
			Id:   "not-a-uuid",
			Name: "order.updated",
		})
		if !errors.Is(err, eventTypeTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrInvalidId, err)
		}
	})

	t.Run("event type not found", func(t *testing.T) {
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
		_, err := s.UpdateEventType(ctx, eventTypeTypes.UpdateEventTypeRequest{
			Id:   validEventID.String(),
			Name: "order.updated",
		})
		if !errors.Is(err, eventTypeTypes.ErrEventTypeNotFound) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrEventTypeNotFound, err)
		}
	})

	t.Run("database update error", func(t *testing.T) {
		updateErr := errors.New("update exec failure")
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanEventType(core.EventType{
							ID:            core.UUIDTOPgUUID(validEventID),
							ApplicationID: core.UUIDTOPgUUID(validAppID),
							Name:          "old-event",
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, updateErr
			},
		}

		s := NewService(core.New(mockDB))
		_, err := s.UpdateEventType(ctx, eventTypeTypes.UpdateEventTypeRequest{
			Id:   validEventID.String(),
			Name: "order.updated",
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
						return scanEventType(core.EventType{
							ID:            core.UUIDTOPgUUID(validEventID),
							ApplicationID: core.UUIDTOPgUUID(validAppID),
							Name:          "old-event",
							Description:   core.StringToText("old description"),
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, nil
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.UpdateEventType(ctx, eventTypeTypes.UpdateEventTypeRequest{
			Id:          validEventID.String(),
			Name:        "order.updated",
			Description: "new description",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if resp.ID != validEventID {
			t.Errorf("expected ID %s, got %s", validEventID, resp.ID)
		}
		if resp.Name != "order.updated" {
			t.Errorf("expected Name 'order.updated', got '%s'", resp.Name)
		}
		if resp.Description != "new description" {
			t.Errorf("expected Description 'new description', got '%s'", resp.Description)
		}
	})
}

func TestGetEventTypes(t *testing.T) {
	userID := uuid.New()
	validAppID := uuid.New()
	ctx := authContext(userID)

	t.Run("missing authorization", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.GetEventTypes(context.Background(), eventTypeTypes.GetEventTypeRequest{
			ApplicationId: validAppID.String(),
		})
		if !errors.Is(err, eventTypeTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("invalid application id", func(t *testing.T) {
		s := NewService(nil)
		_, err := s.GetEventTypes(ctx, eventTypeTypes.GetEventTypeRequest{
			ApplicationId: "invalid-uuid",
		})
		if !errors.Is(err, eventTypeTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrInvalidId, err)
		}
	})

	t.Run("database retrieval error", func(t *testing.T) {
		retrievalErr := errors.New("retrieval failed")
		mockDB := &mockDBTX{
			queryFunc: func(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
				return nil, retrievalErr
			},
		}

		s := NewService(core.New(mockDB))
		_, err := s.GetEventTypes(ctx, eventTypeTypes.GetEventTypeRequest{
			ApplicationId: validAppID.String(),
		})
		if !errors.Is(err, retrievalErr) {
			t.Fatalf("expected %v, got %v", retrievalErr, err)
		}
	})

	t.Run("successful retrieval", func(t *testing.T) {
		et1 := core.EventType{
			ID:            core.NewUUID(),
			ApplicationID: core.UUIDTOPgUUID(validAppID),
			Name:          "user.created",
			Description:   core.StringToText("user created"),
		}
		et2 := core.EventType{
			ID:            core.NewUUID(),
			ApplicationID: core.UUIDTOPgUUID(validAppID),
			Name:          "user.updated",
			Description:   core.StringToText("user updated"),
		}

		mockDB := &mockDBTX{
			queryFunc: func(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
				return &mockRows{
					rows: [][]interface{}{
						{et1.ID, et1.ApplicationID, et1.Name, et1.Description, et1.CreatedAt},
						{et2.ID, et2.ApplicationID, et2.Name, et2.Description, et2.CreatedAt},
					},
				}, nil
			},
		}

		s := NewService(core.New(mockDB))
		resp, err := s.GetEventTypes(ctx, eventTypeTypes.GetEventTypeRequest{
			ApplicationId: validAppID.String(),
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if len(resp.EventTypes) != 2 {
			t.Fatalf("expected 2 event types, got %d", len(resp.EventTypes))
		}
		if resp.EventTypes[0].Name != "user.created" || resp.EventTypes[1].Name != "user.updated" {
			t.Errorf("unexpected event type names: %v, %v", resp.EventTypes[0].Name, resp.EventTypes[1].Name)
		}
	})
}

func TestDeleteEventType(t *testing.T) {
	userID := uuid.New()
	validEventID := uuid.New()
	validAppID := uuid.New()
	ctx := authContext(userID)

	t.Run("missing id path value", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodDelete, "/event-type/", nil)
		_, err := s.DeleteEventType(ctx, req)
		if !errors.Is(err, eventTypeTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrInvalidId, err)
		}
	})

	t.Run("invalid id uuid format", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodDelete, "/event-type/not-valid", nil)
		req.SetPathValue("id", "invalid-uuid")
		_, err := s.DeleteEventType(ctx, req)
		if !errors.Is(err, eventTypeTypes.ErrInvalidId) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrInvalidId, err)
		}
	})

	t.Run("missing authorization", func(t *testing.T) {
		s := NewService(nil)
		req := httptest.NewRequest(http.MethodDelete, "/event-type/"+validEventID.String(), nil)
		req.SetPathValue("id", validEventID.String())
		_, err := s.DeleteEventType(context.Background(), req)
		if !errors.Is(err, eventTypeTypes.ErrNotAuthorized) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrNotAuthorized, err)
		}
	})

	t.Run("event type not found", func(t *testing.T) {
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
		req := httptest.NewRequest(http.MethodDelete, "/event-type/"+validEventID.String(), nil)
		req.SetPathValue("id", validEventID.String())
		_, err := s.DeleteEventType(ctx, req)
		if !errors.Is(err, eventTypeTypes.ErrEventTypeNotFound) {
			t.Fatalf("expected %v, got %v", eventTypeTypes.ErrEventTypeNotFound, err)
		}
	})

	t.Run("database deletion error", func(t *testing.T) {
		deleteErr := errors.New("delete exec error")
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanEventType(core.EventType{
							ID:            core.UUIDTOPgUUID(validEventID),
							ApplicationID: core.UUIDTOPgUUID(validAppID),
							Name:          "delete-me",
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, deleteErr
			},
		}

		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodDelete, "/event-type/"+validEventID.String(), nil)
		req.SetPathValue("id", validEventID.String())
		_, err := s.DeleteEventType(ctx, req)
		if !errors.Is(err, deleteErr) {
			t.Fatalf("expected %v, got %v", deleteErr, err)
		}
	})

	t.Run("successful deletion", func(t *testing.T) {
		mockDB := &mockDBTX{
			queryRowFunc: func(ctx context.Context, query string, args ...interface{}) pgx.Row {
				return mockRow{
					scanFunc: func(dest ...interface{}) error {
						return scanEventType(core.EventType{
							ID:            core.UUIDTOPgUUID(validEventID),
							ApplicationID: core.UUIDTOPgUUID(validAppID),
							Name:          "deleted.event",
							Description:   core.StringToText("event removed"),
						}, dest...)
					},
				}
			},
			execFunc: func(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
				return pgconn.CommandTag{}, nil
			},
		}

		s := NewService(core.New(mockDB))
		req := httptest.NewRequest(http.MethodDelete, "/event-type/"+validEventID.String(), nil)
		req.SetPathValue("id", validEventID.String())
		resp, err := s.DeleteEventType(ctx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp == nil {
			t.Fatal("expected response, got nil")
		}
		if resp.ID != validEventID {
			t.Errorf("expected ID %s, got %s", validEventID, resp.ID)
		}
		if resp.Name != "deleted.event" {
			t.Errorf("expected Name 'deleted.event', got '%s'", resp.Name)
		}
	})
}
