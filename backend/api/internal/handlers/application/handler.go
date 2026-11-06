package application

import (
	"encoding/json"
	"errors"
	"net/http"

	applicationTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/application"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service applicationTypes.Service
}

func NewHandler(service applicationTypes.Service) *Handler {
	return &Handler{service: service}
}

// CreateApplication handles application creation.
// POST /api/v1/application/create
func (h *Handler) CreateApplicationHandler(w http.ResponseWriter, r *http.Request) {

	// Limit request body to 1 MB to prevent memory exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req applicationTypes.CreateApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	applicationResp, err := h.service.CreateApplication(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, applicationTypes.ErrApplicationAlreadyExists):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Application Already Exist")
		case errors.Is(err, applicationTypes.ErrInvalidDescription):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Invalid Description")
		case errors.Is(err, applicationTypes.ErrInvalidName):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "Name is Invalid")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "User registered successfully", applicationResp)
}

// UpdateApplication handles update application.
// POST /api/v1/application/update
func (h *Handler) UpdateApplicationHandler(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	if id == "" {
		return
	}

	// Limit request body to 1 MB to prevent memory exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req applicationTypes.UpdateApplicationRequest

	req.Id = id

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	applicationResp, err := h.service.UpdateApplication(r.Context(), req)

	if err != nil {
		switch {
		case errors.Is(err, applicationTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Application Not Exist")
		case errors.Is(err, applicationTypes.ErrInvalidDescription):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Invalid Description")
		case errors.Is(err, applicationTypes.ErrInvalidName):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "Name is Invalid")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "User registered successfully", applicationResp)
}

// GetApplication handles retreving application.
// GET /api/v1/application/{id}
func (h *Handler) GetApplicationHandler(w http.ResponseWriter, r *http.Request) {

	applicationResp, err := h.service.GetApplication(r.Context(), r)
	if err != nil {
		switch {
		case errors.Is(err, applicationTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusUnauthorized, "Applcation not found with this value", nil, "Either Invalid ID or Invalid Credentials")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Retrieving successful", applicationResp)
}

// GetAllApplication handles retreving all applications.
// GET /api/v1/application
func (h *Handler) GetAllApplicationHandler(w http.ResponseWriter, r *http.Request) {

	applicationResp, err := h.service.GetAllApplication(r.Context())

	if err != nil {
		switch {
		case errors.Is(err, applicationTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Applcation not found with this user", nil, "Invalid Credentials")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Retrieving successful", applicationResp)
}

// DeleteApplication handles application deletion.
// DELETE /api/v1/application/{id}
func (h *Handler) DeleteApplicationHandler(w http.ResponseWriter, r *http.Request) {

	applicationResp, err := h.service.DeleteApplication(r.Context(), r)
	if err != nil {
		switch {
		case errors.Is(err, applicationTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "You Are Not Authorized For This Function", nil, "Either Invalid ID or Invalid Credentials")
		case errors.Is(err, applicationTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusUnauthorized, "Applcation not found with this value", nil, "Either Invalid ID or Invalid Credentials")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Deletion successful", applicationResp)
}
