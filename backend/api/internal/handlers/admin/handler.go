package admin

import (
	"encoding/json"
	"errors"
	"net/http"

	adminTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/admin"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service adminTypes.Service
}

func NewHandler(service adminTypes.Service) *Handler {
	return &Handler{service: service}
}

// LoginHandler handles administrator authentication.
// POST /api/v1/admin/login
// POST /admin/login
func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Limit request body to 1 MB
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req adminTypes.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	authResp, err := h.service.Login(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, adminTypes.ErrInvalidCredentials):
			response.Fail(w, http.StatusUnauthorized, "Invalid email or password", nil, "INVALID_CREDENTIALS")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Admin authentication successful", authResp)
}
