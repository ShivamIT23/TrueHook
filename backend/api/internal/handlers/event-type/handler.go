package eventtype

import (
	"encoding/json"
	"errors"
	"net/http"

	eventTypeTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/event-type"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service eventTypeTypes.Service
}

func NewHandler(service eventTypeTypes.Service) *Handler {
	return &Handler{service: service}
}

// GetEventTypesHandler handles retreving all event-type.
// GET /api/v1/application/{application_id}/event-type
// GET /application/{application_id}/event-type
func (h *Handler) GetEventTypesHandler(w http.ResponseWriter, r *http.Request) {

	application_id := r.PathValue("application_id")
	if application_id == "" {
		return
	}

	var req eventTypeTypes.GetEventTypeRequest

	req.ApplicationId = application_id

	applicationResp, err := h.service.GetEventTypes(r.Context(), req)

	if err != nil {
		switch {
		case errors.Is(err, eventTypeTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "EventType not found with this user", nil, "Invalid Credentials")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Retrieving successful", applicationResp)
}

// CreateEventTypeHandler handles event-type creation.
// POST /api/v1/application/{application_id}/event-type/create
// POST /application/{application_id}/event-type/create
func (h *Handler) CreateEventTypeHandler(w http.ResponseWriter, r *http.Request) {

	application_id := r.PathValue("application_id")
	if application_id == "" {
		return
	}
	// Limit request body to 1 MB to prevent memory exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req eventTypeTypes.CreateEventTypeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	req.ApplicationId = application_id

	eventTypeResp, err := h.service.CreateEventType(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, eventTypeTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Application Not Found With This Id")
		case errors.Is(err, eventTypeTypes.ErrEventTypeAlreadyExists):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Event_Type Already Exist")
		case errors.Is(err, eventTypeTypes.ErrInvalidDescription):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Invalid Description")
		case errors.Is(err, eventTypeTypes.ErrInvalidName):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "Name is Invalid")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "EventType Creation successfully", eventTypeResp)
}

// UpdateEventTypeHandler handles update event-type.
// PUT /api/v1/application/{application_id}/event-type/{event_type_id}
// PUT /application/{application_id}/event-type/{event_type_id}
func (h *Handler) UpdateEventTypeHandler(w http.ResponseWriter, r *http.Request) {

	application_id := r.PathValue("application_id")
	if application_id == "" {
		return
	}

	event_type_id := r.PathValue("event_type_id")
	if event_type_id == "" {
		return
	}

	// Limit request body to 1 MB to prevent memory exhaustion
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req eventTypeTypes.UpdateEventTypeRequest

	req.Id = event_type_id
	req.ApplicationId = application_id

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	applicationResp, err := h.service.UpdateEventType(r.Context(), req)

	if err != nil {
		switch {
		case errors.Is(err, eventTypeTypes.ErrEventTypeNotFound):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Event_Type Not Exist")
		case errors.Is(err, eventTypeTypes.ErrInvalidDescription):
			response.Fail(w, http.StatusBadRequest, err.Error(), nil, "Invalid Description")
		case errors.Is(err, eventTypeTypes.ErrInvalidName):
			response.Fail(w, http.StatusConflict, err.Error(), nil, "Name is Invalid")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "EventType Updation Successfully", applicationResp)
}

// DeleteEventTypeHandler handles event-type deletion.
// DELETE /api/v1/application/{application_id}/event-type/{event_type_id}
// DELETE /application/{application_id}/event-type/{event_type_id}
func (h *Handler) DeleteEventTypeHandler(w http.ResponseWriter, r *http.Request) {

	applicationResp, err := h.service.DeleteEventType(r.Context(), r)
	if err != nil {
		switch {
		case errors.Is(err, eventTypeTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "You Are Not Authorized For This Function", nil, "Either Invalid ID or Invalid Credentials")
		case errors.Is(err, eventTypeTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusUnauthorized, "Applcation not found with this value", nil, "Either Invalid ID or Invalid Credentials")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Deletion successful", applicationResp)
}
