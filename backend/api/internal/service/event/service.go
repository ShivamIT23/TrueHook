package event

import (
	"context"
	"encoding/json"
	"errors"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	eventTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/event"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type service struct {
	repo *core.Queries
}

func NewService(repo *core.Queries) eventTypes.Service {
	return &service{
		repo: repo,
	}
}

func (s *service) PublishEvent(ctx context.Context, req eventTypes.PublishEventRequest) (*eventTypes.EventDetailResponse, error) {
	user_id, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, eventTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	appID, err := core.StringToPGUUID(req.ApplicationId)
	if err != nil {
		return nil, eventTypes.ErrInvalidId
	}

	etID, err := core.StringToPGUUID(req.EventTypeId)
	if err != nil {
		return nil, eventTypes.ErrInvalidId
	}

	if req.Payload == nil {
		return nil, eventTypes.ErrInvalidPayload
	}

	// 1. Verify application belongs to authenticated user
	app, err := s.repo.GetApplicationById(ctx, core.GetApplicationByIdParams{
		ID:     appID,
		UserID: userId,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, eventTypes.ErrApplicationNotFound
		}
		return nil, eventTypes.ErrApplicationNotFound
	}

	// 2. Verify event type belongs to application
	eventType, err := s.repo.GetEventTypeById(ctx, core.GetEventTypeByIdParams{
		ID:     etID,
		UserID: userId,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, eventTypes.ErrEventTypeNotFound
		}
		return nil, eventTypes.ErrEventTypeNotFound
	}

	payloadBytes, err := json.Marshal(req.Payload)
	if err != nil {
		return nil, eventTypes.ErrInvalidPayload
	}

	// 3. Insert event
	createdEvent, err := s.repo.CreateEvent(ctx, core.CreateEventParams{
		ApplicationID: app.ID,
		EventTypeID:   eventType.ID,
		Payload:       payloadBytes,
	})
	if err != nil {
		return nil, err
	}

	// 4. Find matching subscribed endpoints for this event delivery
	endpoints, err := s.repo.GetEndpointsForEventDelivery(ctx, core.GetEndpointsForEventDeliveryParams{
		ApplicationID: app.ID,
		EventTypeID:   eventType.ID,
	})
	if err != nil {
		return nil, err
	}

	var deliveries []eventTypes.DeliverySummary
	for _, ep := range endpoints {
		del, delErr := s.repo.CreateDelivery(ctx, core.CreateDeliveryParams{
			EventID:       createdEvent.ID,
			EndpointID:    ep.ID,
			Status:        "pending",
			Attempts:      pgtype.Int4{Int32: 0, Valid: true},
			NextAttemptAt: core.NewTimestamp(),
		})
		if delErr == nil {
			var attemptsCount int32
			if del.Attempts.Valid {
				attemptsCount = del.Attempts.Int32
			}
			deliveries = append(deliveries, eventTypes.DeliverySummary{
				ID:          core.PgUUIDToUUID(del.ID),
				EndpointID:  core.PgUUIDToUUID(del.EndpointID),
				EndpointUrl: ep.Url,
				Status:      del.Status,
				Attempts:    attemptsCount,
				CreatedAt:   core.TimestampToTime(del.CreatedAt),
			})
		}
	}

	return &eventTypes.EventDetailResponse{
		EventResponse: eventTypes.EventResponse{
			ID:              core.PgUUIDToUUID(createdEvent.ID),
			ApplicationID:   core.PgUUIDToUUID(createdEvent.ApplicationID),
			EventTypeID:     core.PgUUIDToUUID(createdEvent.EventTypeID),
			EventTypeName:   eventType.Name,
			Payload:         req.Payload,
			DeliveriesCount: len(deliveries),
			CreatedAt:       core.TimestampToTime(createdEvent.CreatedAt),
		},
		Deliveries: deliveries,
	}, nil
}

func (s *service) GetEvent(ctx context.Context, applicationId, eventId string) (*eventTypes.EventDetailResponse, error) {
	user_id, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, eventTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	evtID, err := core.StringToPGUUID(eventId)
	if err != nil {
		return nil, eventTypes.ErrInvalidId
	}

	eventRow, err := s.repo.GetEventById(ctx, core.GetEventByIdParams{
		ID:     evtID,
		UserID: userId,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, eventTypes.ErrEventNotFound
		}
		return nil, err
	}

	var payloadMap map[string]interface{}
	if len(eventRow.Payload) > 0 {
		_ = json.Unmarshal(eventRow.Payload, &payloadMap)
	}

	deliveryRows, _ := s.repo.ListDeliveriesByEventId(ctx, core.ListDeliveriesByEventIdParams{
		EventID: evtID,
		UserID:  userId,
	})

	var deliveries []eventTypes.DeliverySummary
	for _, d := range deliveryRows {
		var attemptsCount int32
		if d.Attempts.Valid {
			attemptsCount = d.Attempts.Int32
		}
		deliveries = append(deliveries, eventTypes.DeliverySummary{
			ID:          core.PgUUIDToUUID(d.ID),
			EndpointID:  core.PgUUIDToUUID(d.EndpointID),
			EndpointUrl: d.EndpointUrl,
			Status:      d.Status,
			Attempts:    attemptsCount,
			CreatedAt:   core.TimestampToTime(d.CreatedAt),
		})
	}

	return &eventTypes.EventDetailResponse{
		EventResponse: eventTypes.EventResponse{
			ID:              core.PgUUIDToUUID(eventRow.ID),
			ApplicationID:   core.PgUUIDToUUID(eventRow.ApplicationID),
			EventTypeID:     core.PgUUIDToUUID(eventRow.EventTypeID),
			EventTypeName:   eventRow.EventTypeName,
			Payload:         payloadMap,
			DeliveriesCount: len(deliveries),
			CreatedAt:       core.TimestampToTime(eventRow.CreatedAt),
		},
		Deliveries: deliveries,
	}, nil
}

func (s *service) ListEvents(ctx context.Context, applicationId string, limit, offset int32) (*eventTypes.EventsListResponse, error) {
	user_id, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, eventTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	appID, err := core.StringToPGUUID(applicationId)
	if err != nil {
		return nil, eventTypes.ErrInvalidId
	}

	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	rows, err := s.repo.ListEventsByApplicationId(ctx, core.ListEventsByApplicationIdParams{
		ApplicationID: appID,
		UserID:        userId,
		Limit:         limit,
		Offset:        offset,
	})
	if err != nil {
		return nil, err
	}

	total, _ := s.repo.CountEventsByApplicationId(ctx, core.CountEventsByApplicationIdParams{
		ApplicationID: appID,
		UserID:        userId,
	})

	var events []eventTypes.EventResponse
	for _, r := range rows {
		var payloadMap map[string]interface{}
		if len(r.Payload) > 0 {
			_ = json.Unmarshal(r.Payload, &payloadMap)
		}
		events = append(events, eventTypes.EventResponse{
			ID:            core.PgUUIDToUUID(r.ID),
			ApplicationID: core.PgUUIDToUUID(r.ApplicationID),
			EventTypeID:   core.PgUUIDToUUID(r.EventTypeID),
			EventTypeName: r.EventTypeName,
			Payload:       payloadMap,
			CreatedAt:     core.TimestampToTime(r.CreatedAt),
		})
	}

	return &eventTypes.EventsListResponse{
		Events: events,
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}, nil
}
