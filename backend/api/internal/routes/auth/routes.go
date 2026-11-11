package auth

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/auth"
)

// RegisterRoutes registers the authentication HTTP endpoints.
func RegisterRoutes(mux *http.ServeMux, handler *handlers.Handler) {
	if handler == nil {
		return
	}

	// Standard versioned routes
	mux.HandleFunc("POST /api/v1/auth/register", handler.RegisterHandler)
	mux.HandleFunc("POST /api/v1/auth/login", handler.LogininHandler)

	// Convenience unversioned routes
	mux.HandleFunc("POST /auth/register", handler.RegisterHandler)
	mux.HandleFunc("POST /auth/login", handler.LogininHandler)
}
