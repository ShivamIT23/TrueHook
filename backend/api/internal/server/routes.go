package server

import (
	"net/http"

	"github.com/ShivamIT23/TrueHook/backend/api/internal/config"
	"github.com/ShivamIT23/TrueHook/backend/api/internal/endpoints/application"
	authRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/endpoints/auth"
	applicationHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/application"
	authHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/auth"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

// RouterConfig contains dependencies required to assemble all routes.
type RouterConfig struct {
	AuthHandler        *authHandler.Handler
	ApplicationHandler *applicationHandler.Handler
}

// NewRouter builds the root http.ServeMux with health checks and module routes.
func NewRouter(cfg RouterConfig) *http.ServeMux {
	mux := http.NewServeMux()

	jwt_secret := config.AppConfig.JWT_SECRET

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
		authRoutes.RegisterRoutes(mux, cfg.AuthHandler)
		application.RegisterRoutes(mux, cfg.ApplicationHandler, jwt_secret)
	}

	return mux
}
