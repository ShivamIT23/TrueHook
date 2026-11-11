package delivery

import (
	"context"
	"testing"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	deliveryTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/delivery"
	"github.com/google/uuid"
)

func TestDeliveryValidation(t *testing.T) {
	svc := &service{repo: nil}

	// 1. Unauthorized GetDelivery
	ctx := context.Background()
	_, err := svc.GetDelivery(ctx, uuid.New().String(), uuid.New().String())
	if err != deliveryTypes.ErrNotAuthorized {
		t.Errorf("expected ErrNotAuthorized, got %v", err)
	}

	// 2. Invalid Delivery ID
	authCtx := context.WithValue(ctx, TureHookMiddleware.UserIDContextKey, uuid.New())
	_, err = svc.GetDelivery(authCtx, uuid.New().String(), "invalid-uuid")
	if err != deliveryTypes.ErrInvalidId {
		t.Errorf("expected ErrInvalidId, got %v", err)
	}

	// 3. Unauthorized ListDeliveries
	_, err = svc.ListDeliveries(ctx, uuid.New().String(), 50, 0, "", "")
	if err != deliveryTypes.ErrNotAuthorized {
		t.Errorf("expected ErrNotAuthorized, got %v", err)
	}

	// 4. Invalid App ID in ListDeliveries
	_, err = svc.ListDeliveries(authCtx, "invalid-app-id", 50, 0, "", "")
	if err != deliveryTypes.ErrInvalidId {
		t.Errorf("expected ErrInvalidId, got %v", err)
	}

	// 5. Unauthorized ReplayDelivery
	_, err = svc.ReplayDelivery(ctx, uuid.New().String(), uuid.New().String())
	if err != deliveryTypes.ErrNotAuthorized {
		t.Errorf("expected ErrNotAuthorized, got %v", err)
	}

	// 6. Unauthorized CreateAttempt
	_, err = svc.CreateAttempt(ctx, uuid.New().String(), deliveryTypes.CreateAttemptRequest{
		DeliveryId: uuid.New().String(),
	})
	if err != deliveryTypes.ErrNotAuthorized {
		t.Errorf("expected ErrNotAuthorized, got %v", err)
	}
}
