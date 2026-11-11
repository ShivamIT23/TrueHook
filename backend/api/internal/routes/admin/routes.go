package admin

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/admin"
)

// AdminRoutes registers all admin module HTTP endpoints.
func AdminRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	// Public Admin Auth Routes
	mux.HandleFunc("POST /api/v1/admin/login", handler.LoginHandler)
	mux.HandleFunc("POST /admin/login", handler.LoginHandler)

	// Protected Admin User Management Routes
	UserRoutes(mux, handler, jwtSecret)
}
