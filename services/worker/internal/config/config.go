package config

import (
	"strconv"
	"time"

	rootconfig "github.com/ShivamIT23/TrueHook/services/config"
)

type Config struct {
	*rootconfig.Config

	StreamName           string
	DeliverySubject      string
	ConsumerName         string
	Concurrency          int
	HTTPTimeout          time.Duration
	MaxResponseBodyBytes int64
	MaxRetries           int
}

var AppConfig *Config

func LoadConfig() *Config {
	commonCfg := rootconfig.LoadConfig()

	streamName := rootconfig.GetEnv("NATS_STREAM_NAME", "WEBHOOK_DELIVERIES")
	deliverySubject := rootconfig.GetEnv("NATS_DELIVERY_SUBJECT", "webhooks.deliver")
	consumerName := rootconfig.GetEnv("NATS_CONSUMER_NAME", "WEBHOOK_WORKER")

	concurrency := 10
	if val := rootconfig.GetEnv("WORKER_CONCURRENCY", ""); val != "" {
		if n, err := strconv.Atoi(val); err == nil && n > 0 {
			concurrency = n
		}
	}

	timeoutSec := 15
	if val := rootconfig.GetEnv("DELIVERY_TIMEOUT_SECONDS", rootconfig.GetEnv("HTTP_TIMEOUT", "")); val != "" {
		if n, err := strconv.Atoi(val); err == nil && n > 0 {
			timeoutSec = n
		}
	}

	maxBytes := int64(100 * 1024) // 100 KB
	if val := rootconfig.GetEnv("MAX_RESPONSE_BODY_BYTES", ""); val != "" {
		if n, err := strconv.ParseInt(val, 10, 64); err == nil && n > 0 {
			maxBytes = n
		}
	}

	maxRetries := 5
	if val := rootconfig.GetEnv("MAX_RETRIES", rootconfig.GetEnv("MAX_ATTEMPTS", "")); val != "" {
		if n, err := strconv.Atoi(val); err == nil && n >= 0 {
			maxRetries = n
		}
	}

	AppConfig = &Config{
		Config:               commonCfg,
		StreamName:           streamName,
		DeliverySubject:      deliverySubject,
		ConsumerName:         consumerName,
		Concurrency:          concurrency,
		HTTPTimeout:          time.Duration(timeoutSec) * time.Second,
		MaxResponseBodyBytes: maxBytes,
		MaxRetries:           maxRetries,
	}

	return AppConfig
}
