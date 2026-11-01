package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ShivamIT23/TrueHook/services/api/internal/modules/auth"
	"github.com/google/uuid"
)

func TestRecoveryMiddleware(t *testing.T) {
	panickingHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("something went critically wrong")
	})

	handler := Recovery(panickingHandler)
	req := httptest.NewRequest(http.MethodGet, "/panic", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 Internal Server Error, got %d", w.Code)
	}
}

func TestCORSMiddleware(t *testing.T) {
	allowedOrigins := []string{"http://localhost:3000"}
	cors := CORS(allowedOrigins)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler := cors(next)

	// Test OPTIONS preflight
	reqOptions := httptest.NewRequest(http.MethodOptions, "/test", nil)
	reqOptions.Header.Set("Origin", "http://localhost:3000")
	wOptions := httptest.NewRecorder()

	handler.ServeHTTP(wOptions, reqOptions)

	if wOptions.Code != http.StatusNoContent {
		t.Errorf("expected 204 No Content for OPTIONS, got %d", wOptions.Code)
	}
	if wOptions.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Errorf("expected origin header http://localhost:3000, got %s", wOptions.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestAuthenticateMiddleware(t *testing.T) {
	jwtSecret := "auth-middleware-test-secret"
	authMiddleware := Authenticate(jwtSecret)

	var capturedUser uuid.UUID
	protectedHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := UserFromContext(r.Context())
		if ok {
			capturedUser = user
		}
		w.WriteHeader(http.StatusOK)
	})

	handler := authMiddleware(protectedHandler)

	// 1. Missing Authorization header (401)
	reqNoAuth := httptest.NewRequest(http.MethodGet, "/protected", nil)
	wNoAuth := httptest.NewRecorder()
	handler.ServeHTTP(wNoAuth, reqNoAuth)
	if wNoAuth.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized for missing auth header, got %d", wNoAuth.Code)
	}

	// 2. Valid token (200 OK & user captured)
	uid := uuid.New()
	token, _ := auth.GenerateToken(uid, "test@domain.com", jwtSecret)

	reqAuth := httptest.NewRequest(http.MethodGet, "/protected", nil)
	reqAuth.Header.Set("Authorization", "Bearer "+token)
	wAuth := httptest.NewRecorder()
	handler.ServeHTTP(wAuth, reqAuth)

	if wAuth.Code != http.StatusOK {
		t.Errorf("expected 200 OK for valid auth token, got %d", wAuth.Code)
	}
	if capturedUser != uid {
		t.Errorf("expected captured user %v, got %v", uid, capturedUser)
	}
}
