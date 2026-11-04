package database

import (
	"context"
	"os"
	"testing"
	"time"
)

func TestConnect_EmptyString(t *testing.T) {
	ctx := context.Background()
	pool, err := Connect(ctx, "")
	if err == nil {
		if pool != nil {
			pool.Close()
		}
		t.Fatal("expected error for empty connection string, got nil")
	}
}

func TestConnect_InvalidConfig(t *testing.T) {
	ctx := context.Background()
	pool, err := Connect(ctx, "://invalid-uri")
	if err == nil {
		if pool != nil {
			pool.Close()
		}
		t.Fatal("expected error for malformed connection string, got nil")
	}
}

func TestMigrate_NilPool(t *testing.T) {
	ctx := context.Background()
	err := Migrate(ctx, nil)
	if err == nil {
		t.Fatal("expected error when pool is nil, got nil")
	}
}

func getTestDatabaseURL() string {
	if url := os.Getenv("TEST_DATABASE_URL"); url != "" {
		return url
	}
	if url := os.Getenv("DATABASE_URL"); url != "" {
		return url
	}
	// Fallback to local docker-compose postgres credentials
	return "postgres://truehook:dev_password@localhost:5432/truehook?sslmode=disable"
}

func TestMigrate_LiveDatabase(t *testing.T) {
	dbURL := getTestDatabaseURL()
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pool, err := Connect(ctx, dbURL)
	if err != nil {
		t.Skipf("Skipping live database test, could not connect to PostgreSQL (%s): %v", dbURL, err)
		return
	}
	defer Close(pool)

	// 1. Run migrations
	if err := Migrate(ctx, pool); err != nil {
		t.Fatalf("Migrate failed: %v", err)
	}

	// 2. Run migrations again to verify idempotency
	if err := Migrate(ctx, pool); err != nil {
		t.Fatalf("Second Migrate (idempotency check) failed: %v", err)
	}

	// 3. Verify schema_migrations contains the applied migration
	var count int
	err = pool.QueryRow(ctx, "SELECT COUNT(*) FROM schema_migrations WHERE version = $1", "20261101_000001_initial_schema").Scan(&count)
	if err != nil {
		t.Fatalf("failed to query schema_migrations: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected 1 record in schema_migrations for initial_schema, got %d", count)
	}

	// 4. Verify core tables exist
	tables := []string{
		"users",
		"applications",
		"endpoints",
		"events",
		"deliveries",
		"delivery_attempts",
		"processed_webhooks",
		"outbox",
	}

	for _, table := range tables {
		var exists bool
		query := `SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' AND table_name = $1
		)`
		if err := pool.QueryRow(ctx, query, table).Scan(&exists); err != nil {
			t.Fatalf("failed to check existence of table %s: %v", table, err)
		}
		if !exists {
			t.Errorf("expected table %s to exist after migration", table)
		}
	}
}

func TestMigrateWithMigrations_RollbackOnFailure(t *testing.T) {
	dbURL := getTestDatabaseURL()
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pool, err := Connect(ctx, dbURL)
	if err != nil {
		t.Skipf("Skipping live rollback test, could not connect to PostgreSQL: %v", err)
		return
	}
	defer Close(pool)

	// Ensure base migrations are applied first
	if err := Migrate(ctx, pool); err != nil {
		t.Fatalf("Setup Migrate failed: %v", err)
	}

	failedMigrationVersion := "999999_failing_migration_test"
	failingMigrations := []Migration{
		{
			Version:     failedMigrationVersion,
			Description: "Migration intended to fail",
			SQL:         "CREATE TABLE should_not_exist (id UUID PRIMARY KEY); SYNTAX_ERROR_HERE;",
		},
	}

	err = MigrateWithMigrations(ctx, pool, failingMigrations)
	if err == nil {
		t.Fatal("expected migration with syntax error to fail, but got nil")
	}

	// Verify failing migration was not recorded in schema_migrations
	var exists bool
	err = pool.QueryRow(ctx, "SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1)", failedMigrationVersion).Scan(&exists)
	if err != nil {
		t.Fatalf("failed to check schema_migrations: %v", err)
	}
	if exists {
		t.Fatalf("failing migration %s should not be recorded in schema_migrations", failedMigrationVersion)
	}

	// Verify table should_not_exist was rolled back and does not exist
	var tableExists bool
	err = pool.QueryRow(ctx, "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'should_not_exist')").Scan(&tableExists)
	if err != nil {
		t.Fatalf("failed to check information_schema for rolled back table: %v", err)
	}
	if tableExists {
		t.Fatalf("table should_not_exist should have been rolled back upon transaction failure")
	}
}
