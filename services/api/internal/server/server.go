package server

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ShivamIT23/TrueHook/services/api/internal/config"
)

type Server struct {
	httpServer *http.Server
	cfg        *config.Config
}

// New constructs a production-ready HTTP server with timeout protection and middleware.
func New(cfg *config.Config, handler http.Handler) *Server {
	chain := Logger(Recovery(CORS(cfg.AllowedOrigins)(handler)))

	return &Server{
		cfg: cfg,
		httpServer: &http.Server{
			Addr:              fmt.Sprintf(":%s", cfg.API_PORT),
			Handler:           chain,
			ReadHeaderTimeout: 5 * time.Second,
			ReadTimeout:       15 * time.Second,
			WriteTimeout:      15 * time.Second,
			IdleTimeout:       60 * time.Second,
		},
	}
}

// Start runs the HTTP server and executes graceful shutdown when receiving an OS termination signal.
func (s *Server) Start() error {
	shutdownErr := make(chan error, 1)

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		sig := <-sigChan

		log.Printf("Received termination signal (%s), shutting down gracefully...", sig)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		shutdownErr <- s.httpServer.Shutdown(ctx)
	}()

	log.Printf("TrueHook API listening on :%s", s.cfg.API_PORT)

	if err := s.httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("HTTP server error: %w", err)
	}

	err := <-shutdownErr
	if err != nil {
		return fmt.Errorf("error during graceful shutdown: %w", err)
	}

	log.Println("Server stopped cleanly")
	return nil
}
