package event

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	eventTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/event"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service eventTypes.Service
}

func NewHandler(service eventTypes.Service) *Handler {
	return &Handler{service: service}
}

// PublishEventHandler handles publishing a new webhook event.
// POST /api/v1/application/{application_id}/events
func (h *Handler) PublishEventHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	if applicationId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id is required", nil, "INVALID_APPLICATION_ID")
		return
	}

	// Limit body to 2MB for event payloads
	r.Body = http.MaxBytesReader(w, r.Body, 2*1024*1024)

	var req eventTypes.PublishEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	req.ApplicationId = applicationId

	eventResp, err := h.service.PublishEvent(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, eventTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, eventTypes.ErrApplicationNotFound):
			response.Fail(w, http.StatusNotFound, "Application not found", nil, "APPLICATION_NOT_FOUND")
		case errors.Is(err, eventTypes.ErrEventTypeNotFound):
			response.Fail(w, http.StatusNotFound, "Event type not found", nil, "EVENT_TYPE_NOT_FOUND")
		case errors.Is(err, eventTypes.ErrInvalidPayload):
			response.Fail(w, http.StatusBadRequest, "Invalid JSON payload", nil, "INVALID_PAYLOAD")
		case errors.Is(err, eventTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "Event published successfully", eventResp)
}

// GetEventHandler handles retrieving an event by ID.
// GET /api/v1/application/{application_id}/events/{event_id}
func (h *Handler) GetEventHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	eventId := r.PathValue("event_id")
	if applicationId == "" || eventId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id and event_id are required", nil, "INVALID_REQUEST")
		return
	}

	eventResp, err := h.service.GetEvent(r.Context(), applicationId, eventId)
	if err != nil {
		switch {
		case errors.Is(err, eventTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, eventTypes.ErrEventNotFound):
			response.Fail(w, http.StatusNotFound, "Event not found", nil, "EVENT_NOT_FOUND")
		case errors.Is(err, eventTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Event retrieved successfully", eventResp)
}

// ListEventsHandler handles listing events for an application.
// GET /api/v1/application/{application_id}/events
func (h *Handler) ListEventsHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	if applicationId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id is required", nil, "INVALID_APPLICATION_ID")
		return
	}

	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	var limit int32 = 50
	var offset int32 = 0

	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = int32(l)
	}
	if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
		offset = int32(o)
	}

	listResp, err := h.service.ListEvents(r.Context(), applicationId, limit, offset)
	if err != nil {
		switch {
		case errors.Is(err, eventTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, eventTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Events retrieved successfully", listResp)
}
