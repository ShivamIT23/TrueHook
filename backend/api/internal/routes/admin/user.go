package admin

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/admin"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// UserRoutes registers the admin user management endpoints with authentication middleware.
func UserRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes
	mux.Handle("GET /api/v1/admin/users", auth(http.HandlerFunc(handler.GetAllUsersHandler)))
	mux.Handle("GET /api/v1/admin/users/{id}", auth(http.HandlerFunc(handler.GetUserHandler)))

	// Convenience unversioned routes
	mux.Handle("GET /admin/users", auth(http.HandlerFunc(handler.GetAllUsersHandler)))
	mux.Handle("GET /admin/users/{id}", auth(http.HandlerFunc(handler.GetUserHandler)))
}
