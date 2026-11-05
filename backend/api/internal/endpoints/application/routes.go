package application

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/application"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// RegisterRoutes registers the application HTTP endpoints with authentication middleware.
func RegisterRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes
	mux.Handle("POST /api/v1/application/create", auth(http.HandlerFunc(handler.CreateApplication)))
	mux.Handle("POST /api/v1/application/update", auth(http.HandlerFunc(handler.UpdateApplication)))
	mux.Handle("GET /api/v1/application/{id}", auth(http.HandlerFunc(handler.GetApplication)))
	mux.Handle("GET /api/v1/application", auth(http.HandlerFunc(handler.GetAllApplication)))
	mux.Handle("DELETE /api/v1/application/{id}", auth(http.HandlerFunc(handler.DeleteApplication)))

	// Convenience unversioned routes
	mux.Handle("POST /application/create", auth(http.HandlerFunc(handler.CreateApplication)))
	mux.Handle("POST /application/update", auth(http.HandlerFunc(handler.UpdateApplication)))
	mux.Handle("GET /application/{id}", auth(http.HandlerFunc(handler.GetApplication)))
	mux.Handle("GET /application", auth(http.HandlerFunc(handler.GetAllApplication)))
	mux.Handle("DELETE /application/{id}", auth(http.HandlerFunc(handler.DeleteApplication)))
}
