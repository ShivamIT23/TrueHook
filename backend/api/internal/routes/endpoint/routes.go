package endpoint

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/endpoint"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// EndpointRoutes registers the endpoint HTTP endpoints with authentication middleware.
func EndpointRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes
	mux.Handle("POST /api/v1/application/{application_id}/endpoint/create", auth(http.HandlerFunc(handler.CreateEndpointHandler)))
	mux.Handle("PUT /api/v1/application/{application_id}/endpoint/{endpoint_id}", auth(http.HandlerFunc(handler.UpdateEndpointHandler)))
	mux.Handle("GET /api/v1/application/{application_id}/endpoint", auth(http.HandlerFunc(handler.GetEndpointsHandler)))
	mux.Handle("DELETE /api/v1/application/{application_id}/endpoint/{endpoint_id}", auth(http.HandlerFunc(handler.DeleteEndpointHandler)))

	// Convenience unversioned routes
	mux.Handle("POST /application/{application_id}/endpoint/create", auth(http.HandlerFunc(handler.CreateEndpointHandler)))
	mux.Handle("PUT /application/{application_id}/endpoint/{endpoint_id}", auth(http.HandlerFunc(handler.UpdateEndpointHandler)))
	mux.Handle("GET /application/{application_id}/endpoint", auth(http.HandlerFunc(handler.GetEndpointsHandler)))
	mux.Handle("DELETE /application/{application_id}/endpoint/{endpoint_id}", auth(http.HandlerFunc(handler.DeleteEndpointHandler)))
}
