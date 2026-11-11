package endpoint

import (
	"encoding/json"
	"errors"
	"net/http"

	endpointTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/endpoint"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service endpointTypes.Service
}

func NewHandler(service endpointTypes.Service) *Handler {
	return &Handler{service: service}
}

// GetEndpointsHandler handles retrieving all endpoints for an application.
// GET /api/v1/application/{application_id}/endpoint
// GET /application/{application_id}/endpoint
func (h *Handler) GetEndpointsHandler(w http.ResponseWriter, r *http.Request) {
	application_id := r.PathValue("application_id")
	if application_id == "" {
		response.Fail(w, http.StatusBadRequest, "application_id is required", nil, "INVALID_APPLICATION_ID")
		return
	}

	var req endpointTypes.GetEndpointsRequest
	req.ApplicationId = application_id

	endpointResp, err := h.service.GetEndpoints(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, endpointTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized to view endpoints", nil, "UNAUTHORIZED")
		case errors.Is(err, endpointTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusNotFound, "Application not found", nil, "APPLICATION_NOT_FOUND")
		case errors.Is(err, endpointTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid application ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Retrieving successful", endpointResp)
}

// CreateEndpointHandler handles endpoint creation.
// POST /api/v1/application/{application_id}/endpoint/create
// POST /application/{application_id}/endpoint/create
func (h *Handler) CreateEndpointHandler(w http.ResponseWriter, r *http.Request) {
	application_id := r.PathValue("application_id")
	if application_id == "" {
		response.Fail(w, http.StatusBadRequest, "application_id is required", nil, "INVALID_APPLICATION_ID")
		return
	}

	// Limit request body to 1 MB to prevent memory exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req endpointTypes.CreateEndpointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	req.ApplicationId = application_id

	endpointResp, err := h.service.CreateEndpoint(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, endpointTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusNotFound, err.Error(), nil, "APPLICATION_NOT_FOUND")
		case errors.Is(err, endpointTypes.ErrEndpointAlreadyExists):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "ENDPOINT_ALREADY_EXISTS")
		case errors.Is(err, endpointTypes.ErrInvalidUrl):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_URL")
		case errors.Is(err, endpointTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_ID")
		case errors.Is(err, endpointTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "Endpoint created successfully", endpointResp)
}

// UpdateEndpointHandler handles endpoint updates.
// PUT /api/v1/application/{application_id}/endpoint/{endpoint_id}
// PUT /application/{application_id}/endpoint/{endpoint_id}
func (h *Handler) UpdateEndpointHandler(w http.ResponseWriter, r *http.Request) {
	application_id := r.PathValue("application_id")
	if application_id == "" {
		response.Fail(w, http.StatusBadRequest, "application_id is required", nil, "INVALID_APPLICATION_ID")
		return
	}

	endpoint_id := r.PathValue("endpoint_id")
	if endpoint_id == "" {
		endpoint_id = r.PathValue("id")
	}
	if endpoint_id == "" {
		endpoint_id = r.PathValue("event_type_id")
	}
	if endpoint_id == "" {
		response.Fail(w, http.StatusBadRequest, "endpoint_id is required", nil, "INVALID_ENDPOINT_ID")
		return
	}

	// Limit request body to 1 MB to prevent memory exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req endpointTypes.UpdateEndpointRequest
	req.Id = endpoint_id
	req.ApplicationId = application_id

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	endpointResp, err := h.service.UpdateEndpoint(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, endpointTypes.ErrEndpointNotFound):
			response.Fail(w, http.StatusNotFound, err.Error(), nil, "ENDPOINT_NOT_FOUND")
		case errors.Is(err, endpointTypes.ErrInvalidUrl):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_URL")
		case errors.Is(err, endpointTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "INVALID_ID")
		case errors.Is(err, endpointTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Endpoint updated successfully", endpointResp)
}

// DeleteEndpointHandler handles endpoint deletion.
// DELETE /api/v1/application/{application_id}/endpoint/{endpoint_id}
// DELETE /application/{application_id}/endpoint/{endpoint_id}
func (h *Handler) DeleteEndpointHandler(w http.ResponseWriter, r *http.Request) {
	endpointResp, err := h.service.DeleteEndpoint(r.Context(), r)
	if err != nil {
		switch {
		case errors.Is(err, endpointTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "You are not authorized for this action", nil, "UNAUTHORIZED")
		case errors.Is(err, endpointTypes.ErrEndpointNotFound):
			response.Fail(w, http.StatusNotFound, "Endpoint not found", nil, "ENDPOINT_NOT_FOUND")
		case errors.Is(err, endpointTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Endpoint deleted successfully", endpointResp)
}
