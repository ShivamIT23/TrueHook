package server

import (
	"net/http"

	"github.com/ShivamIT23/TrueHook/backend/api/internal/config"
	adminRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/routes/admin"
	applicationRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/routes/application"
	authRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/routes/auth"
	deliveryRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/routes/delivery"
	endpointRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/routes/endpoint"
	eventRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/routes/event"
	eventTypeRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/routes/event-type"
	userRoutes "github.com/ShivamIT23/TrueHook/backend/api/internal/routes/user"
	adminHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/admin"
	applicationHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/application"
	authHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/auth"
	deliveryHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/delivery"
	endpointHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/endpoint"
	eventHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/event"
	eventTypeHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/event-type"
	userHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/user"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

// RouterConfig contains dependencies required to assemble all routes.
type RouterConfig struct {
	AdminHandler       *adminHandler.Handler
	AuthHandler        *authHandler.Handler
	ApplicationHandler *applicationHandler.Handler
	EndpointHandler    *endpointHandler.Handler
	EventTypeHandler   *eventTypeHandler.Handler
	EventHandler       *eventHandler.Handler
	DeliveryHandler    *deliveryHandler.Handler
	UserHandler        *userHandler.Handler
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

	// Register module routes
	if cfg.AdminHandler != nil {
		adminRoutes.AdminRoutes(mux, cfg.AdminHandler, jwt_secret)
	}
	if cfg.AuthHandler != nil {
		authRoutes.RegisterRoutes(mux, cfg.AuthHandler)
	}
	if cfg.ApplicationHandler != nil {
		applicationRoutes.ApplicationRoutes(mux, cfg.ApplicationHandler, jwt_secret)
	}
	if cfg.EndpointHandler != nil {
		endpointRoutes.EndpointRoutes(mux, cfg.EndpointHandler, jwt_secret)
	}
	if cfg.EventTypeHandler != nil {
		eventTypeRoutes.EventTypeRoutes(mux, cfg.EventTypeHandler, jwt_secret)
	}
	if cfg.EventHandler != nil {
		eventRoutes.EventRoutes(mux, cfg.EventHandler, jwt_secret)
	}
	if cfg.DeliveryHandler != nil {
		deliveryRoutes.DeliveryRoutes(mux, cfg.DeliveryHandler, jwt_secret)
	}
	if cfg.UserHandler != nil {
		userRoutes.UserRoutes(mux, cfg.UserHandler, jwt_secret)
	}

	return mux
}
