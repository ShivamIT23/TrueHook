package server

import (
	"net/http"

	"github.com/ShivamIT23/TrueHook/services/api/internal/common/response"
	"github.com/ShivamIT23/TrueHook/services/api/internal/modules/auth"
)

// RouterConfig contains dependencies required to assemble all routes.
type RouterConfig struct {
	AuthHandler *auth.Handler
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

	// Register Auth module routes
	if cfg.AuthHandler != nil {
		auth.RegisterRoutes(mux, cfg.AuthHandler)
	}

	return mux
}
