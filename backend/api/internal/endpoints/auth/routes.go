package auth

import "net/http"

type Handler struct {
	service Service
}

// RegisterRoutes registers the authentication HTTP endpoints.
func RegisterRoutes(mux *http.ServeMux, handler *Handler) {
	// Standard versioned routes
	mux.HandleFunc("POST /api/v1/auth/signup", handler.Signup)
	mux.HandleFunc("POST /api/v1/auth/signin", handler.Signin)

	// Convenience unversioned routes
	mux.HandleFunc("POST /auth/signup", handler.Signup)
	mux.HandleFunc("POST /auth/signin", handler.Signin)
}
