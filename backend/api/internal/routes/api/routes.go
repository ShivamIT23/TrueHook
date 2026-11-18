package api

import (
	"net/http"

	handlers "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/api"
	TrueHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
)

// APIRoutes registers HTTP routes for managing API keys and tracking credit usage.
func APIRoutes(mux *http.ServeMux, handler *handlers.Handler, jwtSecret string) {
	if handler == nil {
		return
	}

	auth := TrueHookMiddleware.RequireAuth(jwtSecret)

	// Standard versioned routes (/api/v1/api)
	mux.Handle("POST /api/v1/api", auth(http.HandlerFunc(handler.CreateAPIHandler)))
	mux.Handle("POST /api/v1/api/create", auth(http.HandlerFunc(handler.CreateAPIHandler)))
	mux.Handle("GET /api/v1/api", auth(http.HandlerFunc(handler.GetAllAPIsHandler)))
	mux.Handle("GET /api/v1/api/{id}", auth(http.HandlerFunc(handler.GetAPIHandler)))
	mux.Handle("PUT /api/v1/api/{id}/credits", auth(http.HandlerFunc(handler.UpdateCreditsHandler)))
	mux.Handle("PATCH /api/v1/api/{id}/credits", auth(http.HandlerFunc(handler.UpdateCreditsHandler)))
	mux.Handle("POST /api/v1/api/{id}/regenerate", auth(http.HandlerFunc(handler.RegenerateKeyHandler)))
	mux.Handle("DELETE /api/v1/api/{id}", auth(http.HandlerFunc(handler.DeleteAPIHandler)))

	// Convenience unversioned routes (/api-keys)
	mux.Handle("POST /api-keys", auth(http.HandlerFunc(handler.CreateAPIHandler)))
	mux.Handle("GET /api-keys", auth(http.HandlerFunc(handler.GetAllAPIsHandler)))
	mux.Handle("GET /api-keys/{id}", auth(http.HandlerFunc(handler.GetAPIHandler)))
	mux.Handle("PUT /api-keys/{id}/credits", auth(http.HandlerFunc(handler.UpdateCreditsHandler)))
	mux.Handle("PATCH /api-keys/{id}/credits", auth(http.HandlerFunc(handler.UpdateCreditsHandler)))
	mux.Handle("POST /api-keys/{id}/regenerate", auth(http.HandlerFunc(handler.RegenerateKeyHandler)))
	mux.Handle("DELETE /api-keys/{id}", auth(http.HandlerFunc(handler.DeleteAPIHandler)))
}
