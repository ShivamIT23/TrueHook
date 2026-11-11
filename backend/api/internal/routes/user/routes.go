package user

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/user"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// UserRoutes registers the authenticated user HTTP endpoints.
func UserRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes
	mux.Handle("GET /api/v1/user", auth(http.HandlerFunc(handler.GetUserHandler)))
	mux.Handle("GET /api/v1/user/{id}", auth(http.HandlerFunc(handler.GetUserHandler)))
	mux.Handle("PUT /api/v1/user", auth(http.HandlerFunc(handler.UpdateUserHandler)))
	mux.Handle("PUT /api/v1/user/{id}", auth(http.HandlerFunc(handler.UpdateUserHandler)))

	// Convenience unversioned routes
	mux.Handle("GET /user", auth(http.HandlerFunc(handler.GetUserHandler)))
	mux.Handle("GET /user/{id}", auth(http.HandlerFunc(handler.GetUserHandler)))
	mux.Handle("PUT /user", auth(http.HandlerFunc(handler.UpdateUserHandler)))
	mux.Handle("PUT /user/{id}", auth(http.HandlerFunc(handler.UpdateUserHandler)))
}
