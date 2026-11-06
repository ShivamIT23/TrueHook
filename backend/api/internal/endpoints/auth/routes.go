package auth

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/auth"
)

// RegisterRoutes registers the authentication HTTP endpoints.
func RegisterRoutes(mux *http.ServeMux, handler *handlers.Handler) {
	// Standard versioned routes
	mux.HandleFunc("POST /api/v1/auth/signup", handler.SignupHandler)
	mux.HandleFunc("POST /api/v1/auth/signin", handler.SigninHandler)

	// Convenience unversioned routes
	mux.HandleFunc("POST /auth/signup", handler.SignupHandler)
	mux.HandleFunc("POST /auth/signin", handler.SigninHandler)
}
