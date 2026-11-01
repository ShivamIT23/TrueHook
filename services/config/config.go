package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	POSTGRES_USER     string
	POSTGRES_PASSWORD string
	POSTGRES_DB       string
	DATABASE_URL      string
	NATS_URL          string
	GoProd            bool
	SkipTLSVerify     bool
}

// CommonConfig is an alias for Config
type CommonConfig = Config

var AppConfig *Config

// LoadEnv loads .env from common relative paths
func LoadEnv() {
	for _, envPath := range []string{".env", "../.env", "../../.env", "../../../.env", "../../../../.env"} {
		if err := godotenv.Load(envPath); err == nil {
			break
		}
	}
}

// LoadConfig loads common configurations shared across services
func LoadConfig() *Config {
	LoadEnv()

	postgresUser := GetEnv("POSTGRES_USER", "postgres")
	postgresPassword := GetEnv("POSTGRES_PASSWORD", "postgres")
	postgresDB := GetEnv("POSTGRES_DB", "postgres")

	defaultDBURL := "postgres://" + postgresUser + ":" + postgresPassword + "@localhost:5432/" + postgresDB + "?sslmode=disable"
	dbURL := GetEnv("DATABASE_URL", defaultDBURL)

	natsURL := GetEnv("NATS_URL", "nats://localhost:4222")

	// GO_PROD check: true -> production mode; false -> development mode
	goProdStr := strings.ToLower(GetEnv("GO_PROD", "false"))
	goProd := goProdStr == "true" || goProdStr == "1" || goProdStr == "yes"

	// SKIP_TLS_VERIFY check: configurable for development/testing
	// Explicit env var takes precedence; if omitted, defaults to true in dev (!goProd)
	skipTLSStr := GetEnv("SKIP_TLS_VERIFY", "")
	var skipTLSVerify bool
	if skipTLSStr != "" {
		lower := strings.ToLower(skipTLSStr)
		skipTLSVerify = lower == "true" || lower == "1" || lower == "yes"
	} else {
		skipTLSVerify = !goProd
	}

	AppConfig = &Config{
		POSTGRES_USER:     postgresUser,
		POSTGRES_PASSWORD: postgresPassword,
		POSTGRES_DB:       postgresDB,
		DATABASE_URL:      dbURL,
		NATS_URL:          natsURL,
		GoProd:            goProd,
		SkipTLSVerify:     skipTLSVerify,
	}

	return AppConfig
}

func GetEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}

func getEnv(key, fallback string) string {
	return GetEnv(key, fallback)
}
