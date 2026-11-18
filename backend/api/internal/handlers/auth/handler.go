package auth

import (
	"encoding/json"
	"errors"
	"net/http"

	authTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/auth"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service authTypes.Service
}

func NewHandler(service authTypes.Service) *Handler {
	return &Handler{service: service}
}

// SignUpHandler handles user signup.
// POST /api/v1/auth/signup
// POST /auth/signup
func (h *Handler) SignUpHandler(w http.ResponseWriter, r *http.Request) {
	// Limit request body to 1 MB to prevent memory exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req authTypes.SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	authResp, err := h.service.SignUp(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, authTypes.ErrInvalidEmail):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_EMAIL")
		case errors.Is(err, authTypes.ErrInvalidName):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_NAME")
		case errors.Is(err, authTypes.ErrInvalidPassword):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "WEAK_PASSWORD")
		case errors.Is(err, authTypes.ErrEmailTaken):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "EMAIL_EXISTS")
		default:
			response.Fail(w, http.StatusInternalServerError, "An unexpected error occurred during signup", nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "User signed up successfully", authResp)
}

// SignInHandler handles user authentication.
// POST /api/v1/auth/signin
// POST /auth/signin
func (h *Handler) SignInHandler(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req authTypes.SignInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	authResp, err := h.service.SignIn(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, authTypes.ErrInvalidCredentials):
			response.Fail(w, http.StatusUnauthorized, "Invalid email or password", nil, "INVALID_CREDENTIALS")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Authentication successful", authResp)
}
