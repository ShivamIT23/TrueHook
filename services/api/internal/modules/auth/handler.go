package auth

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/ShivamIT23/TrueHook/services/api/internal/common/response"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// Signup handles user registration.
// POST /api/v1/auth/signup
func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	// Limit request body to 1 MB to prevent memory exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	authResp, err := h.service.Signup(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidEmail):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_EMAIL")
		case errors.Is(err, ErrInvalidPassword):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "WEAK_PASSWORD")
		case errors.Is(err, ErrEmailTaken):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "EMAIL_EXISTS")
		default:
			response.Fail(w, http.StatusInternalServerError, "An unexpected error occurred during signup", nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "User registered successfully", authResp)
}

// Signin handles user authentication.
// POST /api/v1/auth/signin
func (h *Handler) Signin(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req SigninRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	authResp, err := h.service.Signin(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidCredentials):
			response.Fail(w, http.StatusUnauthorized, "Invalid email or password", nil, "INVALID_CREDENTIALS")
		default:
			response.Fail(w, http.StatusInternalServerError, "An unexpected error occurred during signin", nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Authentication successful", authResp)
}
