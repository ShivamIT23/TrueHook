package database

import (
	"context"
	"log"

	apperrors "github.com/ShivamIT23/TrueHook/services/api/internal/common/errors"
	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

// Connect initializes the PostgreSQL connection pool and verifies connectivity.
func Connect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	if databaseURL == "" {
		return nil, apperrors.NewError("Database URL is missing", nil, "DB_URL_REQUIRED")
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, apperrors.NewError("Unable to parse database config", err.Error(), "DB_CONFIG_INVALID")
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, apperrors.NewError("Unable to connect to database", err.Error(), "DB_POOL_FAILED")
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, apperrors.NewError("Database ping failed", err.Error(), "DB_PING_FAILED")
	}

	DB = pool
	log.Println("Connected to PostgreSQL")
	return pool, nil
}

// Migrate applies idempotent database schema migrations.
func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	`
	_, err := pool.Exec(ctx, query)
	if err != nil {
		return apperrors.NewError("Failed to apply database migrations", err.Error(), "MIGRATION_FAILED")
	}
	log.Println("Database migrations applied successfully")
	return nil
}

// Close closes the global database connection pool if open.
func Close() {
	if DB != nil {
		DB.Close()
	}
}
