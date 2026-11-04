package server

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/ShivamIT23/TrueHook/backend/api/internal/lib"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type contextKey string

const (
	UserIDContextKey contextKey = "user_id"
	EmailContextKey  contextKey = "email"
)

type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (rec *statusRecorder) WriteHeader(code int) {
	rec.statusCode = code
	rec.ResponseWriter.WriteHeader(code)
}

// Logger logs each incoming request method, path, response status, and duration.
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(rec, r)

		log.Printf("[%s] %s -> %d (%s)", r.Method, r.URL.Path, rec.statusCode, time.Since(start))
	})
}

// Recovery catches any unexpected panic in a handler and returns a 500 JSON response.
func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("PANIC recovered in HTTP handler: %v", rec)
				response.Fail(w, http.StatusInternalServerError, "Internal server error", nil, "INTERNAL_ERROR")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// CORS handles Cross-Origin Resource Sharing based on allowed origins.
func CORS(allowedOrigins []string) func(http.Handler) http.Handler {
	originMap := make(map[string]bool)
	for _, o := range allowedOrigins {
		originMap[strings.ToLower(strings.TrimSpace(o))] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin != "" {
				if originMap["*"] || originMap[strings.ToLower(origin)] {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					w.Header().Set("Access-Control-Allow-Credentials", "true")
				}
			}

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireAuth validates the JWT in Authorization header and injects claims into request context.
func RequireAuth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Fail(w, http.StatusUnauthorized,
					"Authorization header required", nil,
					"UNAUTHORIZED")
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0],
				"Bearer") {
				response.Fail(w, http.StatusUnauthorized, "Invalid authorization format. Expected 'Bearer <token>'", nil, "INVALID_TOKEN")
				return
			}

			tokenStr := strings.TrimSpace(parts[1])
			claims, err := lib.ParseToken(tokenStr, jwtSecret)
			if err != nil {
				response.Fail(w, http.StatusUnauthorized, "Invalid or expired token", err.Error(), "UNAUTHORIZED")
				return
			}

			// Store parsed claims into request context
			ctx := context.WithValue(r.Context(),
				UserIDContextKey, claims.UserID)
			ctx = context.WithValue(ctx, EmailContextKey,
				claims.Email)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserID retrieves the authenticated user's UUID from the request context.
func GetUserID(ctx context.Context) (uuid.UUID, bool) {
	val, ok := ctx.Value(UserIDContextKey).(uuid.UUID)
	return val, ok
}

// GetEmail retrieves the authenticated user's email from the request context.
func GetEmail(ctx context.Context) (string, bool) {
	val, ok := ctx.Value(EmailContextKey).(string)
	return val, ok
}
