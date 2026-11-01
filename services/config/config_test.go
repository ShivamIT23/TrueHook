package config

import (
	"os"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	// Set mock environment variables
	os.Setenv("POSTGRES_USER", "custom_user")
	os.Setenv("POSTGRES_PASSWORD", "custom_pass")
	os.Setenv("POSTGRES_DB", "custom_db")
	os.Setenv("DATABASE_URL", "postgres://custom_user:custom_pass@custom_host:5432/custom_db?sslmode=disable")
	os.Setenv("GO_PROD", "true")
	os.Setenv("SKIP_TLS_VERIFY", "false")
	os.Setenv("NATS_URL", "nats://127.0.0.1:4222")

	defer func() {
		os.Unsetenv("POSTGRES_USER")
		os.Unsetenv("POSTGRES_PASSWORD")
		os.Unsetenv("POSTGRES_DB")
		os.Unsetenv("DATABASE_URL")
		os.Unsetenv("GO_PROD")
		os.Unsetenv("SKIP_TLS_VERIFY")
		os.Unsetenv("NATS_URL")
	}()

	cfg := LoadConfig()

	if cfg.POSTGRES_USER != "custom_user" {
		t.Errorf("expected POSTGRES_USER custom_user, got %s", cfg.POSTGRES_USER)
	}
	if cfg.POSTGRES_PASSWORD != "custom_pass" {
		t.Errorf("expected POSTGRES_PASSWORD custom_pass, got %s", cfg.POSTGRES_PASSWORD)
	}
	if cfg.POSTGRES_DB != "custom_db" {
		t.Errorf("expected POSTGRES_DB custom_db, got %s", cfg.POSTGRES_DB)
	}
	if cfg.DATABASE_URL != "postgres://custom_user:custom_pass@custom_host:5432/custom_db?sslmode=disable" {
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
