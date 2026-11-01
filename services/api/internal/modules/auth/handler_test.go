package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAuthHandler_SignupAndSignin(t *testing.T) {
	repo := newMockRepository()
	jwtSecret := "test-handler-secret"
	svc := NewService(repo, jwtSecret)
	handler := NewHandler(svc)

	mux := http.NewServeMux()
	RegisterRoutes(mux, handler)

	// Test 1: Successful Signup
	body, _ := json.Marshal(SignupRequest{
		Email:    "testuser@truehook.dev",
		Password: "password123",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signup", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201 Created, got %d. Body: %s", w.Code, w.Body.String())
	}

	var signupResp struct {
		Status  bool         `json:"status"`
		Message string       `json:"message"`
		Data    AuthResponse `json:"data"`
	}
	if err := json.NewDecoder(w.Body).Decode(&signupResp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if !signupResp.Status {
		t.Errorf("expected response status true")
	}
	if signupResp.Data.User.Email != "testuser@truehook.dev" {
		t.Errorf("expected email testuser@truehook.dev, got %s", signupResp.Data.User.Email)
	}
	if signupResp.Data.Token == "" {
		t.Errorf("expected non-empty token")
	}

	// Test 2: Duplicate Signup (409 Conflict)
	reqDup := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signup", bytes.NewReader(body))
	reqDup.Header.Set("Content-Type", "application/json")
	wDup := httptest.NewRecorder()

	mux.ServeHTTP(wDup, reqDup)

	if wDup.Code != http.StatusConflict {
		t.Errorf("expected status 409 Conflict, got %d", wDup.Code)
	}

	// Test 3: Signin Success (200 OK)
	signinBody, _ := json.Marshal(SigninRequest{
		Email:    "testuser@truehook.dev",
		Password: "password123",
	})
	reqSignin := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signin", bytes.NewReader(signinBody))
	reqSignin.Header.Set("Content-Type", "application/json")
	wSignin := httptest.NewRecorder()

	mux.ServeHTTP(wSignin, reqSignin)

	if wSignin.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d. Body: %s", wSignin.Code, wSignin.Body.String())
	}

	// Test 4: Signin Wrong Password (401 Unauthorized)
	badSigninBody, _ := json.Marshal(SigninRequest{
		Email:    "testuser@truehook.dev",
		Password: "wrongpassword",
	})
	reqBadSignin := httptest.NewRequest(http.MethodPost, "/api/v1/auth/signin", bytes.NewReader(badSigninBody))
	reqBadSignin.Header.Set("Content-Type", "application/json")
	wBadSignin := httptest.NewRecorder()

	mux.ServeHTTP(wBadSignin, reqBadSignin)

	if wBadSignin.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401 Unauthorized, got %d", wBadSignin.Code)
	}
}
