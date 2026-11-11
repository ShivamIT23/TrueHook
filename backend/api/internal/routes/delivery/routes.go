package delivery

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/delivery"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// DeliveryRoutes registers delivery HTTP endpoints with authentication middleware.
func DeliveryRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes
	mux.Handle("GET /api/v1/application/{application_id}/deliveries", auth(http.HandlerFunc(handler.ListDeliveriesHandler)))
	mux.Handle("GET /api/v1/application/{application_id}/deliveries/{delivery_id}", auth(http.HandlerFunc(handler.GetDeliveryHandler)))
	mux.Handle("POST /api/v1/application/{application_id}/deliveries/{delivery_id}/replay", auth(http.HandlerFunc(handler.ReplayDeliveryHandler)))
	mux.Handle("GET /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts", auth(http.HandlerFunc(handler.ListAttemptsHandler)))
	mux.Handle("GET /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts/{attempt_id}", auth(http.HandlerFunc(handler.GetAttemptHandler)))
	mux.Handle("POST /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts", auth(http.HandlerFunc(handler.CreateAttemptHandler)))

	// Convenience unversioned routes
	mux.Handle("GET /application/{application_id}/deliveries", auth(http.HandlerFunc(handler.ListDeliveriesHandler)))
	mux.Handle("GET /application/{application_id}/deliveries/{delivery_id}", auth(http.HandlerFunc(handler.GetDeliveryHandler)))
	mux.Handle("POST /application/{application_id}/deliveries/{delivery_id}/replay", auth(http.HandlerFunc(handler.ReplayDeliveryHandler)))
	mux.Handle("GET /application/{application_id}/deliveries/{delivery_id}/attempts", auth(http.HandlerFunc(handler.ListAttemptsHandler)))
	mux.Handle("GET /application/{application_id}/deliveries/{delivery_id}/attempts/{attempt_id}", auth(http.HandlerFunc(handler.GetAttemptHandler)))
	mux.Handle("POST /application/{application_id}/deliveries/{delivery_id}/attempts", auth(http.HandlerFunc(handler.CreateAttemptHandler)))
}
