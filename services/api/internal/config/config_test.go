package config

import (
	"os"
	"reflect"
	"testing"
)

func TestApiLoadConfig(t *testing.T) {
	// Set mock environment variables
	os.Setenv("API_PORT", "9090")
	os.Setenv("JWT_SECRET", "super-secret-key")
	os.Setenv("POSTGRES_USER", "api_user")
	os.Setenv("POSTGRES_PASSWORD", "api_pass")
	os.Setenv("POSTGRES_DB", "api_db")
	os.Setenv("DATABASE_URL", "postgres://api_user:api_pass@api_host:5432/api_db?sslmode=disable")
	os.Setenv("GO_PROD", "true")
	os.Setenv("ALLOWED_ORIGINS", "https://app.example.com,https://dashboard.example.com")
	os.Setenv("SKIP_TLS_VERIFY", "false")
	os.Setenv("NATS_URL", "nats://127.0.0.1:4222")

	defer func() {
		os.Unsetenv("API_PORT")
		os.Unsetenv("JWT_SECRET")
		os.Unsetenv("POSTGRES_USER")
		os.Unsetenv("POSTGRES_PASSWORD")
		os.Unsetenv("POSTGRES_DB")
		os.Unsetenv("DATABASE_URL")
		os.Unsetenv("GO_PROD")
		os.Unsetenv("ALLOWED_ORIGINS")
		os.Unsetenv("SKIP_TLS_VERIFY")
		os.Unsetenv("NATS_URL")
	}()

	cfg := LoadConfig()

	// Check API-unique configs
	if cfg.API_PORT != "9090" {
		t.Errorf("expected API_PORT 9090, got %s", cfg.API_PORT)
	}
	if cfg.JWT_SECRET != "super-secret-key" {
		t.Errorf("expected JWT_SECRET super-secret-key, got %s", cfg.JWT_SECRET)
	}

	expectedOrigins := []string{"https://app.example.com", "https://dashboard.example.com"}
	if !reflect.DeepEqual(cfg.AllowedOrigins, expectedOrigins) {
		t.Errorf("expected AllowedOrigins %v, got %v", expectedOrigins, cfg.AllowedOrigins)
	}

	// Check common configs inherited from root config
	if cfg.POSTGRES_USER != "api_user" {
		t.Errorf("expected POSTGRES_USER api_user, got %s", cfg.POSTGRES_USER)
	}
	if cfg.POSTGRES_PASSWORD != "api_pass" {
		t.Errorf("expected POSTGRES_PASSWORD api_pass, got %s", cfg.POSTGRES_PASSWORD)
	}
	if cfg.POSTGRES_DB != "api_db" {
		t.Errorf("expected POSTGRES_DB api_db, got %s", cfg.POSTGRES_DB)
	}
	if cfg.DATABASE_URL != "postgres://api_user:api_pass@api_host:5432/api_db?sslmode=disable" {
		t.Errorf("unexpected DATABASE_URL: %s", cfg.DATABASE_URL)
	}
	if !cfg.GoProd {
		t.Errorf("expected GoProd true, got %v", cfg.GoProd)
	}
	if cfg.SkipTLSVerify {
		t.Errorf("expected SkipTLSVerify false, got %v", cfg.SkipTLSVerify)
	}
	if cfg.NATS_URL != "nats://127.0.0.1:4222" {
		t.Errorf("expected NATS_URL nats://127.0.0.1:4222, got %s", cfg.NATS_URL)
	}
}
