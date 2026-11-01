package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Connect establishes a connection to the PostgreSQL database using the provided connection string.
func Connect(ctx context.Context, connString string) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(ctx, connString)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}
	return pool, nil
}

// Migrate runs database migrations using the provided connection pool.
func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	// Implement your migration logic here, e.g., using a migration library or executing SQL scripts.
	// For example, you can use a library like golang-migrate to run migrations.
	// This is a placeholder for the actual migration implementation.
	return nil
}

// Close closes the database connection pool.
func Close(pool *pgxpool.Pool) {
	if pool != nil {
		pool.Close()
	}
}
