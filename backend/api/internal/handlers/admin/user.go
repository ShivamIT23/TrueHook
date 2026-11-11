package admin

import (
	"errors"
	"net/http"

	adminTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/admin"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

// GetAllUsersHandler retrieves all registered users (admin-only).
// GET /api/v1/admin/users
// GET /admin/users
func (h *Handler) GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	usersResp, err := h.service.GetAllUsers(r.Context())
	if err != nil {
		switch {
		case errors.Is(err, adminTypes.ErrNotAuthorized), errors.Is(err, adminTypes.ErrAdminOnly):
			response.Fail(w, http.StatusForbidden, "Admin privileges required", nil, "FORBIDDEN")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Users retrieved successfully", usersResp)
}

// GetUserHandler retrieves a specific user by ID (admin-only).
// GET /api/v1/admin/users/{id}
// GET /admin/users/{id}
func (h *Handler) GetUserHandler(w http.ResponseWriter, r *http.Request) {
	userResp, err := h.service.GetUser(r.Context(), r)
	if err != nil {
		switch {
		case errors.Is(err, adminTypes.ErrNotAuthorized), errors.Is(err, adminTypes.ErrAdminOnly):
			response.Fail(w, http.StatusForbidden, "Admin privileges required", nil, "FORBIDDEN")
		case errors.Is(err, adminTypes.ErrUserNotFound):
			response.Fail(w, http.StatusNotFound, err.Error(), nil, "USER_NOT_FOUND")
		case errors.Is(err, adminTypes.ErrInvalidID):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "User retrieved successfully", userResp)
}
