package auth

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func TestPostgresRepository_Integration(t *testing.T) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://truehook:dev_password@localhost:5432/truehook?sslmode=disable"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		t.Skipf("Skipping integration test; could not connect to PostgreSQL: %v", err)
		return
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		t.Skipf("Skipping integration test; database not reachable: %v", err)
		return
	}

	repo := NewRepository(pool)

	testUser := &User{
		ID:           uuid.New(),
		Email:        "integration_" + uuid.NewString()[:8] + "@example.com",
		PasswordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890",
		CreatedAt:    time.Now().UTC().Truncate(time.Microsecond),
	}

	// 1. CreateUser
	if err := repo.CreateUser(ctx, testUser); err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	// 2. Duplicate CreateUser (must fail with ErrUserAlreadyExists)
	if err := repo.CreateUser(ctx, testUser); err != ErrUserAlreadyExists {
		t.Fatalf("expected ErrUserAlreadyExists on duplicate insert, got: %v", err)
	}

	// 3. GetUserByEmail
	fetched, err := repo.GetUserByEmail(ctx, testUser.Email)
	if err != nil {
		t.Fatalf("failed to get user by email: %v", err)
	}
	if fetched.ID != testUser.ID {
		t.Errorf("expected ID %v, got %v", testUser.ID, fetched.ID)
	}
	if fetched.Email != testUser.Email {
		t.Errorf("expected email %s, got %s", testUser.Email, fetched.Email)
	}

	// 4. GetUserByID
	fetchedByID, err := repo.GetUserByID(ctx, testUser.ID)
	if err != nil {
		t.Fatalf("failed to get user by ID: %v", err)
	}
	if fetchedByID.Email != testUser.Email {
		t.Errorf("expected email %s, got %s", testUser.Email, fetchedByID.Email)
	}

	// 5. Cleanup
	_, _ = pool.Exec(ctx, "DELETE FROM users WHERE id = $1", testUser.ID)
}
