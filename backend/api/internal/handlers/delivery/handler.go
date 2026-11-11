package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	deliveryTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/delivery"
	"github.com/ShivamIT23/TrueHook/backend/packages/common/response"
)

type Handler struct {
	service deliveryTypes.Service
}

func NewHandler(service deliveryTypes.Service) *Handler {
	return &Handler{service: service}
}

// GetDeliveryHandler returns the delivery details including its attempt history.
// GET /api/v1/application/{application_id}/deliveries/{delivery_id}
func (h *Handler) GetDeliveryHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	deliveryId := r.PathValue("delivery_id")
	if applicationId == "" || deliveryId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id and delivery_id are required", nil, "INVALID_REQUEST")
		return
	}

	detail, err := h.service.GetDelivery(r.Context(), applicationId, deliveryId)
	if err != nil {
		switch {
		case errors.Is(err, deliveryTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, deliveryTypes.ErrDeliveryNotFound):
			response.Fail(w, http.StatusNotFound, "Delivery not found", nil, "DELIVERY_NOT_FOUND")
		case errors.Is(err, deliveryTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Delivery retrieved successfully", detail)
}

// ListDeliveriesHandler returns a list of deliveries for the application.
// GET /api/v1/application/{application_id}/deliveries
func (h *Handler) ListDeliveriesHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	if applicationId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id is required", nil, "INVALID_APPLICATION_ID")
		return
	}

	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")
	endpointId := r.URL.Query().Get("endpoint_id")
	eventId := r.URL.Query().Get("event_id")

	var limit int32 = 50
	var offset int32 = 0

	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = int32(l)
	}
	if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
		offset = int32(o)
	}

	listResp, err := h.service.ListDeliveries(r.Context(), applicationId, limit, offset, endpointId, eventId)
	if err != nil {
		switch {
		case errors.Is(err, deliveryTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, deliveryTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Deliveries retrieved successfully", listResp)
}

// ReplayDeliveryHandler replays/retries a failed or past delivery.
// POST /api/v1/application/{application_id}/deliveries/{delivery_id}/replay
func (h *Handler) ReplayDeliveryHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	deliveryId := r.PathValue("delivery_id")
	if applicationId == "" || deliveryId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id and delivery_id are required", nil, "INVALID_REQUEST")
		return
	}

	updated, err := h.service.ReplayDelivery(r.Context(), applicationId, deliveryId)
	if err != nil {
		switch {
		case errors.Is(err, deliveryTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, deliveryTypes.ErrDeliveryNotFound):
			response.Fail(w, http.StatusNotFound, "Delivery not found", nil, "DELIVERY_NOT_FOUND")
		case errors.Is(err, deliveryTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Delivery replay scheduled successfully", updated)
}

// ListAttemptsHandler lists all attempts recorded for a delivery.
// GET /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts
func (h *Handler) ListAttemptsHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	deliveryId := r.PathValue("delivery_id")
	if applicationId == "" || deliveryId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id and delivery_id are required", nil, "INVALID_REQUEST")
		return
	}

	attempts, err := h.service.ListAttempts(r.Context(), applicationId, deliveryId)
	if err != nil {
		switch {
		case errors.Is(err, deliveryTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, deliveryTypes.ErrDeliveryNotFound):
			response.Fail(w, http.StatusNotFound, "Delivery not found", nil, "DELIVERY_NOT_FOUND")
		case errors.Is(err, deliveryTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Delivery attempts retrieved successfully", map[string]interface{}{
		"attempts": attempts,
	})
}

// GetAttemptHandler retrieves details of a specific attempt.
// GET /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts/{attempt_id}
func (h *Handler) GetAttemptHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	deliveryId := r.PathValue("delivery_id")
	attemptId := r.PathValue("attempt_id")
	if applicationId == "" || deliveryId == "" || attemptId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id, delivery_id, and attempt_id are required", nil, "INVALID_REQUEST")
		return
	}

	attempt, err := h.service.GetAttempt(r.Context(), applicationId, deliveryId, attemptId)
	if err != nil {
		switch {
		case errors.Is(err, deliveryTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, deliveryTypes.ErrAttemptNotFound):
			response.Fail(w, http.StatusNotFound, "Delivery attempt not found", nil, "ATTEMPT_NOT_FOUND")
		case errors.Is(err, deliveryTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusOK, "Delivery attempt retrieved successfully", attempt)
}

// CreateAttemptHandler records a new attempt for a delivery.
// POST /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts
func (h *Handler) CreateAttemptHandler(w http.ResponseWriter, r *http.Request) {
	applicationId := r.PathValue("application_id")
	deliveryId := r.PathValue("delivery_id")
	if applicationId == "" || deliveryId == "" {
		response.Fail(w, http.StatusBadRequest, "application_id and delivery_id are required", nil, "INVALID_REQUEST")
		return
	}

	var req deliveryTypes.CreateAttemptRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request payload", err.Error(), "INVALID_REQUEST_BODY")
		return
	}

	req.DeliveryId = deliveryId

	attempt, err := h.service.CreateAttempt(r.Context(), applicationId, req)
	if err != nil {
		switch {
		case errors.Is(err, deliveryTypes.ErrNotAuthorized):
			response.Fail(w, http.StatusUnauthorized, "Not authorized", nil, "UNAUTHORIZED")
		case errors.Is(err, deliveryTypes.ErrDeliveryNotFound):
			response.Fail(w, http.StatusNotFound, "Delivery not found", nil, "DELIVERY_NOT_FOUND")
		case errors.Is(err, deliveryTypes.ErrInvalidId):
			response.Fail(w, http.StatusBadRequest, "Invalid ID format", nil, "INVALID_ID")
		default:
			response.Fail(w, http.StatusInternalServerError, err.Error(), nil, "INTERNAL_ERROR")
		}
		return
	}

	response.Success(w, http.StatusCreated, "Delivery attempt recorded successfully", attempt)
}
