package application

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/application"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// ApplicationRoutes registers the application HTTP endpoints with authentication middleware.
func ApplicationRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes
	mux.Handle("POST /api/v1/application/create", auth(http.HandlerFunc(handler.CreateApplicationHandler)))
	mux.Handle("PUT /api/v1/application/{id}", auth(http.HandlerFunc(handler.UpdateApplicationHandler)))
	mux.Handle("GET /api/v1/application/{id}", auth(http.HandlerFunc(handler.GetApplicationHandler)))
	mux.Handle("GET /api/v1/application", auth(http.HandlerFunc(handler.GetAllApplicationHandler)))
	mux.Handle("DELETE /api/v1/application/{id}", auth(http.HandlerFunc(handler.DeleteApplicationHandler)))

	// Convenience unversioned routes
	mux.Handle("POST /application/create", auth(http.HandlerFunc(handler.CreateApplicationHandler)))
	mux.Handle("PUT /application/{id}", auth(http.HandlerFunc(handler.UpdateApplicationHandler)))
	mux.Handle("GET /application/{id}", auth(http.HandlerFunc(handler.GetApplicationHandler)))
	mux.Handle("GET /application", auth(http.HandlerFunc(handler.GetAllApplicationHandler)))
	mux.Handle("DELETE /application/{id}", auth(http.HandlerFunc(handler.DeleteApplicationHandler)))
}
