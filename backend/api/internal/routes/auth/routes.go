package auth

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/auth"
)

// AuthRoutes registers the authentication HTTP endpoints.
func AuthRoutes(mux *http.ServeMux, handler *handlers.Handler) {
	if handler == nil {
		return
	}

	// Versioned routes
	mux.HandleFunc("POST /api/v1/auth/signup", handler.SignUpHandler)
	mux.HandleFunc("POST /api/v1/auth/signin", handler.SignInHandler)

	// Convenience unversioned routes
	mux.HandleFunc("POST /auth/signup", handler.SignUpHandler)
	mux.HandleFunc("POST /auth/signin", handler.SignInHandler)
}

// RegisterRoutes is a direct alias for AuthRoutes.
func RegisterRoutes(mux *http.ServeMux, handler *handlers.Handler) {
	AuthRoutes(mux, handler)
}
