package event

import (
	"context"
	"testing"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	eventTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/event"
	"github.com/google/uuid"
)

func TestPublishEventValidation(t *testing.T) {
	svc := &service{repo: nil}

	// 1. Unauthorized
	ctx := context.Background()
	_, err := svc.PublishEvent(ctx, eventTypes.PublishEventRequest{
		ApplicationId: uuid.New().String(),
		EventTypeId:   uuid.New().String(),
		Payload:       map[string]interface{}{"foo": "bar"},
	})
	if err != eventTypes.ErrNotAuthorized {
		t.Errorf("expected ErrNotAuthorized, got %v", err)
	}

	// 2. Invalid App ID
	authCtx := context.WithValue(ctx, TureHookMiddleware.UserIDContextKey, uuid.New())
	_, err = svc.PublishEvent(authCtx, eventTypes.PublishEventRequest{
		ApplicationId: "invalid-uuid",
		EventTypeId:   uuid.New().String(),
		Payload:       map[string]interface{}{"foo": "bar"},
	})
	if err != eventTypes.ErrInvalidId {
		t.Errorf("expected ErrInvalidId, got %v", err)
	}

	// 3. Nil Payload
	_, err = svc.PublishEvent(authCtx, eventTypes.PublishEventRequest{
		ApplicationId: uuid.New().String(),
		EventTypeId:   uuid.New().String(),
		Payload:       nil,
	})
	if err != eventTypes.ErrInvalidPayload {
		t.Errorf("expected ErrInvalidPayload, got %v", err)
	}
}

func TestListEventsValidation(t *testing.T) {
	svc := &service{repo: nil}
	ctx := context.Background()

	// Unauthorized
	_, err := svc.ListEvents(ctx, uuid.New().String(), 50, 0)
	if err != eventTypes.ErrNotAuthorized {
		t.Errorf("expected ErrNotAuthorized, got %v", err)
	}

	// Invalid ID
	authCtx := context.WithValue(ctx, TureHookMiddleware.UserIDContextKey, uuid.New())
	_, err = svc.ListEvents(authCtx, "invalid-uuid", 50, 0)
	if err != eventTypes.ErrInvalidId {
		t.Errorf("expected ErrInvalidId, got %v", err)
	}
}
