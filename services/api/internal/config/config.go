package config

import (
	"os"
	"strings"

	rootconfig "github.com/ShivamIT23/TrueHook/services/config"
)

type Config struct {
	*rootconfig.Config

	API_PORT       string
	AllowedOrigins []string
	JWT_SECRET     string
}

var AppConfig *Config

func LoadConfig() *Config {
	commonCfg := rootconfig.LoadConfig()

	apiPort := rootconfig.GetEnv("API_PORT", rootconfig.GetEnv("PORT", "8080"))
	jwtSecret := rootconfig.GetEnv("JWT_SECRET", "truehook-dev-jwt-secret-do-not-use-in-prod")

	// Base local origins for frontend dev
	devOrigins := []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3000",
		"http://127.0.0.1:3001",
	}

	var rawOrigins []string
	if !commonCfg.GoProd {
		rawOrigins = append(rawOrigins, devOrigins...)
	}

	// Add custom origins from ALLOWED_ORIGINS env var if present
	if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
		for _, o := range strings.Split(envOrigins, ",") {
			o = strings.TrimSpace(strings.TrimSuffix(o, "/"))
			if o != "" {
				rawOrigins = append(rawOrigins, o)
			}
		}
	}

	// Filter out localhost & 127.0.0.1 origins if GO_PROD is true
	var finalOrigins []string
	seen := make(map[string]bool)

	for _, o := range rawOrigins {
		lower := strings.ToLower(o)
		if commonCfg.GoProd && (strings.Contains(lower, "localhost") || strings.Contains(lower, "127.0.0.1")) {
			continue
		}
		if !seen[lower] {
			seen[lower] = true
			finalOrigins = append(finalOrigins, o)
		}
	}

	AppConfig = &Config{
		Config:         commonCfg,
		API_PORT:       apiPort,
		AllowedOrigins: finalOrigins,
		JWT_SECRET:     jwtSecret,
	}

	return AppConfig
}
