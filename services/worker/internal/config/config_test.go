package config

import (
	"os"
	"testing"
	"time"
)

func TestWorkerLoadConfig(t *testing.T) {
	// Set mock environment variables
	os.Setenv("NATS_URL", "nats://127.0.0.1:4222")
	os.Setenv("DATABASE_URL", "postgres://worker_user:worker_pass@worker_host:5432/worker_db?sslmode=disable")
	os.Setenv("GO_PROD", "true")
	os.Setenv("SKIP_TLS_VERIFY", "true")
	os.Setenv("NATS_STREAM_NAME", "CUSTOM_STREAM")
	os.Setenv("NATS_DELIVERY_SUBJECT", "custom.deliver")
	os.Setenv("NATS_CONSUMER_NAME", "CUSTOM_WORKER")
	os.Setenv("WORKER_CONCURRENCY", "25")
	os.Setenv("DELIVERY_TIMEOUT_SECONDS", "30")
	os.Setenv("MAX_RESPONSE_BODY_BYTES", "204800")
	os.Setenv("MAX_RETRIES", "7")

	defer func() {
		os.Unsetenv("NATS_URL")
		os.Unsetenv("DATABASE_URL")
		os.Unsetenv("GO_PROD")
		os.Unsetenv("SKIP_TLS_VERIFY")
		os.Unsetenv("NATS_STREAM_NAME")
		os.Unsetenv("NATS_DELIVERY_SUBJECT")
		os.Unsetenv("NATS_CONSUMER_NAME")
		os.Unsetenv("WORKER_CONCURRENCY")
		os.Unsetenv("DELIVERY_TIMEOUT_SECONDS")
		os.Unsetenv("MAX_RESPONSE_BODY_BYTES")
		os.Unsetenv("MAX_RETRIES")
	}()

	cfg := LoadConfig()

	// Check worker-unique configs
	if cfg.StreamName != "CUSTOM_STREAM" {
		t.Errorf("expected StreamName CUSTOM_STREAM, got %s", cfg.StreamName)
	}
	if cfg.DeliverySubject != "custom.deliver" {
		t.Errorf("expected DeliverySubject custom.deliver, got %s", cfg.DeliverySubject)
	}
	if cfg.ConsumerName != "CUSTOM_WORKER" {
		t.Errorf("expected ConsumerName CUSTOM_WORKER, got %s", cfg.ConsumerName)
	}
	if cfg.Concurrency != 25 {
		t.Errorf("expected Concurrency 25, got %d", cfg.Concurrency)
	}
	if cfg.HTTPTimeout != 30*time.Second {
		t.Errorf("expected HTTPTimeout 30s, got %v", cfg.HTTPTimeout)
	}
	if cfg.MaxResponseBodyBytes != 204800 {
		t.Errorf("expected MaxResponseBodyBytes 204800, got %d", cfg.MaxResponseBodyBytes)
	}
	if cfg.MaxRetries != 7 {
		t.Errorf("expected MaxRetries 7, got %d", cfg.MaxRetries)
	}

	// Check common configs inherited from root config
	if cfg.NATS_URL != "nats://127.0.0.1:4222" {
		t.Errorf("expected NATS_URL nats://127.0.0.1:4222, got %s", cfg.NATS_URL)
	}
	if cfg.DATABASE_URL != "postgres://worker_user:worker_pass@worker_host:5432/worker_db?sslmode=disable" {
		t.Errorf("unexpected DATABASE_URL: %s", cfg.DATABASE_URL)
	}
	if !cfg.GoProd {
		t.Errorf("expected GoProd true, got %v", cfg.GoProd)
	}
	if !cfg.SkipTLSVerify {
		t.Errorf("expected SkipTLSVerify true, got %v", cfg.SkipTLSVerify)
	}
}

func TestWorkerLoadConfigDefaults(t *testing.T) {
	cfg := LoadConfig()

	if cfg.StreamName != "WEBHOOK_DELIVERIES" {
		t.Errorf("expected default StreamName WEBHOOK_DELIVERIES, got %s", cfg.StreamName)
	}
	if cfg.DeliverySubject != "webhooks.deliver" {
		t.Errorf("expected default DeliverySubject webhooks.deliver, got %s", cfg.DeliverySubject)
	}
	if cfg.ConsumerName != "WEBHOOK_WORKER" {
		t.Errorf("expected default ConsumerName WEBHOOK_WORKER, got %s", cfg.ConsumerName)
	}
	if cfg.Concurrency != 10 {
		t.Errorf("expected default Concurrency 10, got %d", cfg.Concurrency)
	}
	if cfg.HTTPTimeout != 15*time.Second {
		t.Errorf("expected default HTTPTimeout 15s, got %v", cfg.HTTPTimeout)
	}
	if cfg.MaxResponseBodyBytes != 100*1024 {
		t.Errorf("expected default MaxResponseBodyBytes 102400, got %d", cfg.MaxResponseBodyBytes)
	}
	if cfg.MaxRetries != 5 {
		t.Errorf("expected default MaxRetries 5, got %d", cfg.MaxRetries)
	}
}
