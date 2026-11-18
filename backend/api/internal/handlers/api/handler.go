package api

import (
	"encoding/json"
	"errors"
	"net/http"

	apiTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/api"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service apiTypes.Service
}

// NewHandler creates a new API HTTP handler instance.
func NewHandler(service apiTypes.Service) *Handler {
	return &Handler{service: service}
}

// CreateAPIHandler handles creating a new API record.
// POST /api/v1/api
// POST /api/v1/api/create
// POST /api-keys
func (h *Handler) CreateAPIHandler(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req apiTypes.CreateAPIRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err.Error() != "EOF" {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	apiResp, err := h.service.CreateAPI(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, apiTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized to perform this action", nil, "UNAUTHORIZED")
		case errors.Is(err, apiTypes.ErrAPIAlreadyExists):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "API_KEY_ALREADY_EXISTS")
		case errors.Is(err, apiTypes.ErrInvalidAPIKey):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_API_KEY")
		case errors.Is(err, apiTypes.ErrInvalidCredits):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_CREDITS")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "API key created successfully", apiResp)
}

// GetAPIHandler handles retrieving an API record by ID.
// GET /api/v1/api/{id}
// GET /api-keys/{id}
func (h *Handler) GetAPIHandler(w http.ResponseWriter, r *http.Request) {
	apiResp, err := h.service.GetAPI(r.Context(), r)
	if err != nil {
		switch {
		case errors.Is(err, apiTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized to view this API key", nil, "UNAUTHORIZED")
		case errors.Is(err, apiTypes.ErrAPINotFound):
			response.Fail(w, http.StatusNotFound, "API key not found", nil, "API_KEY_NOT_FOUND")
		case errors.Is(err, apiTypes.ErrInvalidID):
			response.Fail(w, http.StatusBadRequest, "Invalid API key ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "API key retrieved successfully", apiResp)
}

// GetAllAPIsHandler handles listing all API records for the authenticated user.
// GET /api/v1/api
// GET /api-keys
func (h *Handler) GetAllAPIsHandler(w http.ResponseWriter, r *http.Request) {
	listResp, err := h.service.GetAllAPIs(r.Context())
	if err != nil {
		switch {
		case errors.Is(err, apiTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized to view API keys", nil, "UNAUTHORIZED")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "API keys retrieved successfully", listResp)
}

// UpdateCreditsHandler handles updating or incrementing credits used on an API record.
// PUT /api/v1/api/{id}/credits
// PATCH /api/v1/api/{id}/credits
// PUT /api-keys/{id}/credits
// PATCH /api-keys/{id}/credits
func (h *Handler) UpdateCreditsHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		response.Fail(w, http.StatusBadRequest, "id is required", nil, "INVALID_ID")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req apiTypes.UpdateCreditsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err.Error() != "EOF" {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}
	req.ID = id

	apiResp, err := h.service.UpdateCredits(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, apiTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized to update credits", nil, "UNAUTHORIZED")
		case errors.Is(err, apiTypes.ErrAPINotFound):
			response.Fail(w, http.StatusNotFound, "API key not found", nil, "API_KEY_NOT_FOUND")
		case errors.Is(err, apiTypes.ErrInvalidID):
			response.Fail(w, http.StatusBadRequest, "Invalid API key ID format", nil, "INVALID_ID")
		case errors.Is(err, apiTypes.ErrInvalidCredits):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_CREDITS")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "API credits updated successfully", apiResp)
}

// RegenerateKeyHandler handles regenerating or setting a new API key value.
// POST /api/v1/api/{id}/regenerate
// POST /api-keys/{id}/regenerate
func (h *Handler) RegenerateKeyHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		response.Fail(w, http.StatusBadRequest, "id is required", nil, "INVALID_ID")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req apiTypes.RegenerateKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err.Error() != "EOF" {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}
	req.ID = id

	apiResp, err := h.service.RegenerateKey(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, apiTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized to regenerate API key", nil, "UNAUTHORIZED")
		case errors.Is(err, apiTypes.ErrAPINotFound):
			response.Fail(w, http.StatusNotFound, "API key not found", nil, "API_KEY_NOT_FOUND")
		case errors.Is(err, apiTypes.ErrAPIAlreadyExists):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "API_KEY_ALREADY_EXISTS")
		case errors.Is(err, apiTypes.ErrInvalidID):
			response.Fail(w, http.StatusBadRequest, "Invalid API key ID format", nil, "INVALID_ID")
		case errors.Is(err, apiTypes.ErrInvalidAPIKey):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_API_KEY")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "API key regenerated successfully", apiResp)
}

// DeleteAPIHandler handles deleting an API record.
// DELETE /api/v1/api/{id}
// DELETE /api-keys/{id}
func (h *Handler) DeleteAPIHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		response.Fail(w, http.StatusBadRequest, "id is required", nil, "INVALID_ID")
		return
	}

	apiResp, err := h.service.DeleteAPI(r.Context(), r)
	if err != nil {
		switch {
		case errors.Is(err, apiTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized to delete this API key", nil, "UNAUTHORIZED")
		case errors.Is(err, apiTypes.ErrAPINotFound):
			response.Fail(w, http.StatusNotFound, "API key not found", nil, "API_KEY_NOT_FOUND")
		case errors.Is(err, apiTypes.ErrInvalidID):
			response.Fail(w, http.StatusBadRequest, "Invalid API key ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "API key deleted successfully", apiResp)
}
