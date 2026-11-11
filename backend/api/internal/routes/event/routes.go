package event

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/event"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// EventRoutes registers event HTTP endpoints with authentication middleware.
func EventRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes
	mux.Handle("POST /api/v1/application/{application_id}/events", auth(http.HandlerFunc(handler.PublishEventHandler)))
	mux.Handle("GET /api/v1/application/{application_id}/events", auth(http.HandlerFunc(handler.ListEventsHandler)))
	mux.Handle("GET /api/v1/application/{application_id}/events/{event_id}", auth(http.HandlerFunc(handler.GetEventHandler)))

	// Convenience unversioned routes
	mux.Handle("POST /application/{application_id}/events", auth(http.HandlerFunc(handler.PublishEventHandler)))
	mux.Handle("GET /application/{application_id}/events", auth(http.HandlerFunc(handler.ListEventsHandler)))
	mux.Handle("GET /application/{application_id}/events/{event_id}", auth(http.HandlerFunc(handler.GetEventHandler)))
}
