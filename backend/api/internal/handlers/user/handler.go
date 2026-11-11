package user

import (
	"encoding/json"
	"errors"
	"net/http"

	userTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/user"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service userTypes.Service
}

func NewHandler(service userTypes.Service) *Handler {
	return &Handler{service: service}
}

// UpdateUserHandler handles updating authenticated user profile.
// PUT /api/v1/user
// PUT /api/v1/user/{id}
func (h *Handler) UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req userTypes.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err.Error() != "EOF" {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	if id := r.PathValue("id"); id != "" {
		req.ID = id
	}

	userResp, err := h.service.UpdateUser(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, userTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusForbidden, err.Error(), nil, "FORBIDDEN")
		case errors.Is(err, userTypes.ErrUserNotFound):
			response.Fail(w, http.StatusNotFound, err.Error(), nil, "USER_NOT_FOUND")
		case errors.Is(err, userTypes.ErrInvalidName):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_NAME")
		case errors.Is(err, userTypes.ErrInvalidEmail):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_EMAIL")
		case errors.Is(err, userTypes.ErrInvalidPassword):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "WEAK_PASSWORD")
		case errors.Is(err, userTypes.ErrInvalidLogoUrl):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_LOGO_URL")
		case errors.Is(err, userTypes.ErrInvalidID):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_ID")
		case errors.Is(err, userTypes.ErrEmailTaken):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "EMAIL_EXISTS")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "User updated successfully", userResp)
}

// GetUserHandler retrieves authenticated user's own profile.
// GET /api/v1/user
// GET /api/v1/user/{id}
func (h *Handler) GetUserHandler(w http.ResponseWriter, r *http.Request) {
	userResp, err := h.service.GetUser(r.Context(), r)
	if err != nil {
		switch {
		case errors.Is(err, userTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusForbidden, err.Error(), nil, "FORBIDDEN")
		case errors.Is(err, userTypes.ErrUserNotFound):
			response.Fail(w, http.StatusNotFound, err.Error(), nil, "USER_NOT_FOUND")
		case errors.Is(err, userTypes.ErrInvalidID):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "User retrieved successfully", userResp)
}
