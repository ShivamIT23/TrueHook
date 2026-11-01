package main

import (
	"context"
	"log"

	"github.com/ShivamIT23/TrueHook/backend/api/internal/config"
	authHandler "github.com/ShivamIT23/TrueHook/backend/api/internal/handlers/auth"
	"github.com/ShivamIT23/TrueHook/backend/api/internal/server"
	authService "github.com/ShivamIT23/TrueHook/backend/api/internal/service/auth"
	"github.com/ShivamIT23/TrueHook/backend/packages/database"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	customNats "github.com/ShivamIT23/TrueHook/backend/packages/nats"
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
	defer database.Close(pool)

	// 3. Run database migrations
	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	// 4. Connect to NATS JetStream
	if cfg.NATS_URL != "" {
		nc, err := customNats.ConnectNATS(cfg.NATS_URL)
		if err != nil {
			log.Printf("Warning: NATS connection failed: %v", err)
		} else {
			defer nc.Close()
			log.Println("Connected to NATS")
		}
	}

	dbQueries := core.New(pool)

	newAuthService := authService.NewService(dbQueries, cfg.JWT_SECRET)

	authHandler := authHandler.NewHandler(newAuthService)

	// 5.. Assemble HTTP Router
	router := server.NewRouter(server.RouterConfig{
		AuthHandler: authHandler,
	})

	// 6. Start HTTP Server with Graceful Shutdown
	srv := server.New(cfg, router)
	if err := srv.Start(); err != nil {
		log.Fatalf("Server stopped with error: %v", err)
	}

}
