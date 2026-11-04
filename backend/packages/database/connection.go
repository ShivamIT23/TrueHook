package database

import (
	"context"
	_ "embed"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var defaultSchemaSQL string

// migrationAdvisoryLockID is a unique lock ID used to serialize migration execution across multiple instances.
const migrationAdvisoryLockID int64 = 0x54727565486F6F6B // "TrueHook"

// Migration represents an individual database migration step.
type Migration struct {
	Version     string
	Description string
	SQL         string
}

// Migrations is the list of registered database migrations applied in order.
var Migrations = []Migration{
	{
		Version:     "20261101_000001_initial_schema",
		Description: "Create initial TrueHook tables and indexes",
		SQL:         defaultSchemaSQL,
	},
}

// Connect establishes a connection to the PostgreSQL database using the provided connection string.
// It verifies connectivity by executing a ping against the database.
func Connect(ctx context.Context, connString string) (*pgxpool.Pool, error) {
	if connString == "" {
		return nil, fmt.Errorf("database connection string is empty")
	}

	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database configuration: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return pool, nil
}

// Migrate executes all pending database migrations using the default registered migrations.
func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	return MigrateWithMigrations(ctx, pool, Migrations)
}

// MigrateWithMigrations executes the provided migrations against the database.
// It acquires a PostgreSQL advisory lock to ensure concurrency safety across multiple application instances,
// ensures the schema_migrations tracking table exists, and applies any pending migrations in transactions.
func MigrateWithMigrations(ctx context.Context, pool *pgxpool.Pool, migrations []Migration) error {
	if pool == nil {
		return fmt.Errorf("cannot run migrations: database pool is nil")
	}

	conn, err := pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("failed to acquire connection for migrations: %w", err)
	}
	defer conn.Release()

	// Acquire advisory lock to prevent concurrent migrations from multiple processes/pods.
	if _, err := conn.Exec(ctx, "SELECT pg_advisory_lock($1)", migrationAdvisoryLockID); err != nil {
		return fmt.Errorf("failed to acquire migration advisory lock: %w", err)
	}
	defer func() {
		// Unlock using background context so unlock is attempted even if ctx was canceled.
		_, _ = conn.Exec(context.Background(), "SELECT pg_advisory_unlock($1)", migrationAdvisoryLockID)
	}()

	// Ensure the migration tracking table exists.
	createTableSQL := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			description VARCHAR(255) NOT NULL DEFAULT '',
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`
	if _, err := conn.Exec(ctx, createTableSQL); err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}

	// Retrieve already applied migrations.
	rows, err := conn.Query(ctx, "SELECT version FROM schema_migrations")
	if err != nil {
		return fmt.Errorf("failed to query applied schema_migrations: %w", err)
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return fmt.Errorf("failed to scan migration version: %w", err)
		}
		applied[version] = true
	}
	if err := rows.Err(); err != nil {
		return fmt.Errorf("failed to iterate applied migrations: %w", err)
	}

	var appliedCount int
	for _, m := range migrations {
		if applied[m.Version] {
			continue
		}

		if err := ctx.Err(); err != nil {
			return fmt.Errorf("migration run canceled before applying %s: %w", m.Version, err)
		}

		log.Printf("Applying database migration: %s (%s)...", m.Version, m.Description)
		if err := applyMigration(ctx, conn, m); err != nil {
			return fmt.Errorf("failed to apply migration %s (%s): %w", m.Version, m.Description, err)
		}

		appliedCount++
		log.Printf("Successfully applied database migration: %s", m.Version)
	}

	if appliedCount == 0 {
		log.Println("Database schema is up to date, no migrations needed")
	} else {
		log.Printf("Database migrations completed successfully (%d applied)", appliedCount)
	}

	return nil
}

// applyMigration applies a single migration within a dedicated database transaction.
func applyMigration(ctx context.Context, conn *pgxpool.Conn, m Migration) error {
	tx, err := conn.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	if _, err := tx.Exec(ctx, m.SQL); err != nil {
		return fmt.Errorf("failed to execute migration SQL: %w", err)
	}

	recordSQL := `INSERT INTO schema_migrations (version, description, applied_at) VALUES ($1, $2, NOW())`
	if _, err := tx.Exec(ctx, recordSQL, m.Version, m.Description); err != nil {
		return fmt.Errorf("failed to record migration status: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit migration transaction: %w", err)
	}

	return nil
}

// Close closes the database connection pool.
func Close(pool *pgxpool.Pool) {
	if pool != nil {
		pool.Close()
	}
}
