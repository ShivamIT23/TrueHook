package server

import (
	"net/http"

	authHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/auth"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

// RouterConfig contains dependencies required to assemble all routes.
type RouterConfig struct {
	AuthHandler *authHandler.Handler
}

// NewRouter builds the root http.ServeMux with health checks and module routes.
func NewRouter(cfg RouterConfig) *http.ServeMux {
	mux := http.NewServeMux()

	// Root & Health check endpoints
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		response.Success(w, http.StatusOK, "TrueHook API is running", map[string]string{
			"version": "v1",
			"status":  "operational",
		})
	})

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		response.Success(w, http.StatusOK, "TrueHook API Health is in Peak Condition", map[string]string{
			"status": "healthy",
		})
	})

	return mux
}
