package eventtype

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/event-type"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// EventTypeRoutes registers the event_type HTTP endpoints with authentication middleware.
func EventTypeRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes
	mux.Handle("POST /api/v1/application/{application_id}/event-type/create", auth(http.HandlerFunc(handler.CreateEventTypeHandler)))
	mux.Handle("PUT /api/v1/application/{application_id}/event-type/{event_type_id}", auth(http.HandlerFunc(handler.UpdateEventTypeHandler)))
	mux.Handle("GET /api/v1/application/{application_id}/event-type", auth(http.HandlerFunc(handler.GetEventTypesHandler)))
	mux.Handle("DELETE /api/v1/application/{application_id}/event-type/{event_type_id}", auth(http.HandlerFunc(handler.DeleteEventTypeHandler)))

	// Convenience unversioned routes
	mux.Handle("POST /application/{application_id}/event-type/create", auth(http.HandlerFunc(handler.CreateEventTypeHandler)))
	mux.Handle("PUT /application/{application_id}/event-type/{event_type_id}", auth(http.HandlerFunc(handler.UpdateEventTypeHandler)))
	mux.Handle("GET /application/{application_id}/event-type", auth(http.HandlerFunc(handler.GetEventTypesHandler)))
	mux.Handle("DELETE /application/{application_id}/event-type/{event_type_id}", auth(http.HandlerFunc(handler.DeleteEventTypeHandler)))
}
