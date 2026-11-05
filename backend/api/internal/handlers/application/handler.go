package application

import (
	"encoding/json"
	"errors"
	"fmt"
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
func (h *Handler) CreateApplication(w http.ResponseWriter, r *http.Request) {

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
func (h *Handler) UpdateApplication(w http.ResponseWriter, r *http.Request) {

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
			response.Fail(w, http.StatusInternalServerError, "An unexpected error occurred during signup", nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "User registered successfully", applicationResp)
}

// GetApplication handles retreving application.
// GET /api/v1/application/{id}
func (h *Handler) GetApplication(w http.ResponseWriter, r *http.Request) {

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

	fmt.Println(applicationResp)

	response.Success(w, http.StatusOK, "Retrieving successful", applicationResp)
}

// GetAllApplication handles retreving all applications.
// GET /api/v1/application
func (h *Handler) GetAllApplication(w http.ResponseWriter, r *http.Request) {

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
func (h *Handler) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req applicationTypes.DeleteApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	applicationResp, err := h.service.DeleteApplication(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, applicationTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusUnauthorized, "Applcation not found with this value", nil, "Either Invalid ID or Invalid Credentials")
		default:
			response.Fail(w, http.StatusInternalServerError, "An unexpected error occurred during signin", nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Deletion successful", applicationResp)
}
