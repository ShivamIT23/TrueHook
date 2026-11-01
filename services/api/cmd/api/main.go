package main

import (
	"context"
	"log"

	"github.com/ShivamIT23/TrueHook/services/api/internal/config"
	"github.com/ShivamIT23/TrueHook/services/api/internal/database"
	"github.com/ShivamIT23/TrueHook/services/api/internal/modules/auth"
	"github.com/ShivamIT23/TrueHook/services/api/internal/server"
	"github.com/nats-io/nats.go"
)

func main() {
	// 1. Load configuration
	cfg := config.LoadConfig()

	if cfg.DATABASE_URL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	ctx := context.Background()

	// 2. Initialize database connection pool
	pool, err := database.Connect(ctx, cfg.DATABASE_URL)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer database.Close()

	// 3. Run database migrations
	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	// 4. Connect to NATS JetStream
	if cfg.NATS_URL != "" {
		nc, err := nats.Connect(cfg.NATS_URL)
		if err != nil {
			log.Printf("Warning: NATS connection failed: %v", err)
		} else {
			defer nc.Close()
			log.Println("Connected to NATS")
		}
	}

	// 5. Wire dependencies (Repository -> Service -> Handler)
	authRepo := auth.NewRepository(pool)
	authService := auth.NewService(authRepo, cfg.JWT_SECRET)
	authHandler := auth.NewHandler(authService)

	// 6. Assemble HTTP Router
	router := server.NewRouter(server.RouterConfig{
		AuthHandler: authHandler,
	})

	// 7. Start HTTP Server with Graceful Shutdown
	srv := server.New(cfg, router)
	if err := srv.Start(); err != nil {
		log.Fatalf("Server stopped with error: %v", err)
	}
}
