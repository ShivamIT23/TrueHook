package delivery

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	deliveryTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/delivery"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type service struct {
	repo *core.Queries
}

func NewService(repo *core.Queries) deliveryTypes.Service {
	return &service{
		repo: repo,
	}
}

func (s *service) GetDelivery(ctx context.Context, applicationId, deliveryId string) (*deliveryTypes.DeliveryDetailResponse, error) {
	user_id, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, deliveryTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	delID, err := core.StringToPGUUID(deliveryId)
	if err != nil {
		return nil, deliveryTypes.ErrInvalidId
	}

	row, err := s.repo.GetDeliveryById(ctx, core.GetDeliveryByIdParams{
		ID:     delID,
		UserID: userId,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, deliveryTypes.ErrDeliveryNotFound
		}
		return nil, err
	}

	var payloadMap map[string]interface{}
	if len(row.EventPayload) > 0 {
		_ = json.Unmarshal(row.EventPayload, &payloadMap)
	}

	attemptsRows, _ := s.repo.ListDeliveryAttemptsByDeliveryId(ctx, core.ListDeliveryAttemptsByDeliveryIdParams{
		DeliveryID: delID,
		UserID:     userId,
	})

	var attemptsList []deliveryTypes.DeliveryAttemptItem
	for _, a := range attemptsRows {
		var reqHeaders map[string]interface{}
		if len(a.RequestHeaders) > 0 {
			_ = json.Unmarshal(a.RequestHeaders, &reqHeaders)
		}
		var respStatus *int32
		if a.ResponseStatus.Valid {
			respStatus = &a.ResponseStatus.Int32
		}
		var respBody *string
		if a.ResponseBody.Valid {
			respBody = &a.ResponseBody.String
		}
		var errMsg *string
		if a.ErrorMessage.Valid {
			errMsg = &a.ErrorMessage.String
		}
		var durMs *int32
		if a.DurationMs.Valid {
			durMs = &a.DurationMs.Int32
		}

		attemptsList = append(attemptsList, deliveryTypes.DeliveryAttemptItem{
			ID:             core.PgUUIDToUUID(a.ID),
			DeliveryID:     core.PgUUIDToUUID(a.DeliveryID),
			AttemptNumber:  a.AttemptNumber,
			RequestHeaders: reqHeaders,
			ResponseStatus: respStatus,
			ResponseBody:   respBody,
			ErrorMessage:   errMsg,
			DurationMs:     durMs,
			CreatedAt:      core.TimestampToTime(a.CreatedAt),
		})
	}

	var attemptsCount int32
	if row.Attempts.Valid {
		attemptsCount = row.Attempts.Int32
	}
	var nextAttempt *time.Time
	if row.NextAttemptAt.Valid {
		t := row.NextAttemptAt.Time
		nextAttempt = &t
	}

	return &deliveryTypes.DeliveryDetailResponse{
		DeliveryResponse: deliveryTypes.DeliveryResponse{
			ID:            core.PgUUIDToUUID(row.ID),
			EventID:       core.PgUUIDToUUID(row.EventID),
			EndpointID:    core.PgUUIDToUUID(row.EndpointID),
			EndpointUrl:   row.EndpointUrl,
			EventTypeName: row.EventTypeName,
			Status:        row.Status,
			Attempts:      attemptsCount,
			NextAttemptAt: nextAttempt,
			CreatedAt:     core.TimestampToTime(row.CreatedAt),
		},
		EventPayload: payloadMap,
		AttemptsList: attemptsList,
	}, nil
}

func (s *service) ListDeliveries(ctx context.Context, applicationId string, limit, offset int32, endpointId, eventId string) (*deliveryTypes.DeliveriesListResponse, error) {
	user_id, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, deliveryTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	appID, err := core.StringToPGUUID(applicationId)
	if err != nil {
		return nil, deliveryTypes.ErrInvalidId
	}

	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	var deliveries []deliveryTypes.DeliveryResponse
	var total int64

	if eventId != "" {
		evtID, err := core.StringToPGUUID(eventId)
		if err == nil {
			rows, _ := s.repo.ListDeliveriesByEventId(ctx, core.ListDeliveriesByEventIdParams{
				EventID: evtID,
				UserID:  userId,
			})
			for _, r := range rows {
				var attemptsCount int32
				if r.Attempts.Valid {
					attemptsCount = r.Attempts.Int32
				}
				var nextAttempt *time.Time
				if r.NextAttemptAt.Valid {
					t := r.NextAttemptAt.Time
					nextAttempt = &t
				}
				deliveries = append(deliveries, deliveryTypes.DeliveryResponse{
					ID:            core.PgUUIDToUUID(r.ID),
					EventID:       core.PgUUIDToUUID(r.EventID),
					EndpointID:    core.PgUUIDToUUID(r.EndpointID),
					EndpointUrl:   r.EndpointUrl,
					EventTypeName: r.EventTypeName,
					Status:        r.Status,
					Attempts:      attemptsCount,
					NextAttemptAt: nextAttempt,
					CreatedAt:     core.TimestampToTime(r.CreatedAt),
				})
			}
			total = int64(len(deliveries))
		}
	} else if endpointId != "" {
		epID, err := core.StringToPGUUID(endpointId)
		if err == nil {
			rows, _ := s.repo.ListDeliveriesByEndpointId(ctx, core.ListDeliveriesByEndpointIdParams{
				EndpointID: epID,
				UserID:     userId,
				Limit:      limit,
				Offset:     offset,
			})
			for _, r := range rows {
				var attemptsCount int32
				if r.Attempts.Valid {
					attemptsCount = r.Attempts.Int32
				}
				var nextAttempt *time.Time
				if r.NextAttemptAt.Valid {
					t := r.NextAttemptAt.Time
					nextAttempt = &t
				}
				deliveries = append(deliveries, deliveryTypes.DeliveryResponse{
					ID:            core.PgUUIDToUUID(r.ID),
					EventID:       core.PgUUIDToUUID(r.EventID),
					EndpointID:    core.PgUUIDToUUID(r.EndpointID),
					EndpointUrl:   r.EndpointUrl,
					EventTypeName: r.EventTypeName,
					Status:        r.Status,
					Attempts:      attemptsCount,
					NextAttemptAt: nextAttempt,
					CreatedAt:     core.TimestampToTime(r.CreatedAt),
				})
			}
			total = int64(len(deliveries))
		}
	} else {
		rows, err := s.repo.ListDeliveriesByApplicationId(ctx, core.ListDeliveriesByApplicationIdParams{
			ID:     appID,
			UserID: userId,
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			return nil, err
		}

		for _, r := range rows {
			var attemptsCount int32
			if r.Attempts.Valid {
				attemptsCount = r.Attempts.Int32
			}
			var nextAttempt *time.Time
			if r.NextAttemptAt.Valid {
				t := r.NextAttemptAt.Time
				nextAttempt = &t
			}
			deliveries = append(deliveries, deliveryTypes.DeliveryResponse{
				ID:            core.PgUUIDToUUID(r.ID),
				EventID:       core.PgUUIDToUUID(r.EventID),
				EndpointID:    core.PgUUIDToUUID(r.EndpointID),
				EndpointUrl:   r.EndpointUrl,
				EventTypeName: r.EventTypeName,
				Status:        r.Status,
				Attempts:      attemptsCount,
				NextAttemptAt: nextAttempt,
				CreatedAt:     core.TimestampToTime(r.CreatedAt),
			})
		}

		total, _ = s.repo.CountDeliveriesByApplicationId(ctx, core.CountDeliveriesByApplicationIdParams{
			ID:     appID,
			UserID: userId,
		})
	}

	return &deliveryTypes.DeliveriesListResponse{
		Deliveries: deliveries,
		Total:      total,
		Limit:      limit,
		Offset:     offset,
	}, nil
}

func (s *service) ReplayDelivery(ctx context.Context, applicationId, deliveryId string) (*deliveryTypes.DeliveryDetailResponse, error) {
	user_id, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, deliveryTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	delID, err := core.StringToPGUUID(deliveryId)
	if err != nil {
		return nil, deliveryTypes.ErrInvalidId
	}

	existing, err := s.repo.GetDeliveryById(ctx, core.GetDeliveryByIdParams{
		ID:     delID,
		UserID: userId,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, deliveryTypes.ErrDeliveryNotFound
		}
		return nil, err
	}

	// Update delivery to pending state for replay
	now := core.NewTimestamp()
	err = s.repo.UpdateDeliveryStatus(ctx, core.UpdateDeliveryStatusParams{
		ID:            existing.ID,
		Status:        "pending",
		Attempts:      existing.Attempts,
		NextAttemptAt: now,
	})
	if err != nil {
		return nil, err
	}

	return s.GetDelivery(ctx, applicationId, deliveryId)
}

func (s *service) CreateAttempt(ctx context.Context, applicationId string, req deliveryTypes.CreateAttemptRequest) (*deliveryTypes.DeliveryAttemptItem, error) {
	user_id, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, deliveryTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	delID, err := core.StringToPGUUID(req.DeliveryId)
	if err != nil {
		return nil, deliveryTypes.ErrInvalidId
	}

	existing, err := s.repo.GetDeliveryById(ctx, core.GetDeliveryByIdParams{
		ID:     delID,
		UserID: userId,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, deliveryTypes.ErrDeliveryNotFound
		}
		return nil, err
	}

	var headersBytes []byte
	if req.RequestHeaders != nil {
		headersBytes, _ = json.Marshal(req.RequestHeaders)
	}

	attemptNum := req.AttemptNumber
	if attemptNum <= 0 {
		var curAttempts int32 = 0
		if existing.Attempts.Valid {
			curAttempts = existing.Attempts.Int32
		}
		attemptNum = curAttempts + 1
	}

	attemptRow, err := s.repo.CreateDeliveryAttempt(ctx, core.CreateDeliveryAttemptParams{
		DeliveryID:     existing.ID,
		AttemptNumber:  attemptNum,
		RequestHeaders: headersBytes,
		ResponseStatus: pgtype.Int4{Int32: req.ResponseStatus, Valid: req.ResponseStatus > 0},
		ResponseBody:   core.StringToText(req.ResponseBody),
		ErrorMessage:   core.StringToText(req.ErrorMessage),
		DurationMs:     pgtype.Int4{Int32: req.DurationMs, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	// Determine new delivery status
	newStatus := "failed"
	if req.ResponseStatus >= 200 && req.ResponseStatus < 300 {
		newStatus = "success"
	}

	_ = s.repo.UpdateDeliveryStatus(ctx, core.UpdateDeliveryStatusParams{
		ID:            existing.ID,
		Status:        newStatus,
		Attempts:      pgtype.Int4{Int32: attemptNum, Valid: true},
		NextAttemptAt: core.NewTimestamp(),
	})

	var respStatus *int32
	if attemptRow.ResponseStatus.Valid {
		respStatus = &attemptRow.ResponseStatus.Int32
	}
	var respBody *string
	if attemptRow.ResponseBody.Valid {
		respBody = &attemptRow.ResponseBody.String
	}
	var errMsg *string
	if attemptRow.ErrorMessage.Valid {
		errMsg = &attemptRow.ErrorMessage.String
	}
	var durMs *int32
	if attemptRow.DurationMs.Valid {
		durMs = &attemptRow.DurationMs.Int32
	}

	return &deliveryTypes.DeliveryAttemptItem{
		ID:             core.PgUUIDToUUID(attemptRow.ID),
		DeliveryID:     core.PgUUIDToUUID(attemptRow.DeliveryID),
		AttemptNumber:  attemptRow.AttemptNumber,
		RequestHeaders: req.RequestHeaders,
		ResponseStatus: respStatus,
		ResponseBody:   respBody,
		ErrorMessage:   errMsg,
		DurationMs:     durMs,
		CreatedAt:      core.TimestampToTime(attemptRow.CreatedAt),
	}, nil
}

func (s *service) ListAttempts(ctx context.Context, applicationId, deliveryId string) ([]deliveryTypes.DeliveryAttemptItem, error) {
	detail, err := s.GetDelivery(ctx, applicationId, deliveryId)
	if err != nil {
		return nil, err
	}
	return detail.AttemptsList, nil
}

func (s *service) GetAttempt(ctx context.Context, applicationId, deliveryId, attemptId string) (*deliveryTypes.DeliveryAttemptItem, error) {
	user_id, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, deliveryTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	attID, err := core.StringToPGUUID(attemptId)
	if err != nil {
		return nil, deliveryTypes.ErrInvalidId
	}

	a, err := s.repo.GetDeliveryAttemptById(ctx, core.GetDeliveryAttemptByIdParams{
		ID:     attID,
		UserID: userId,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, deliveryTypes.ErrAttemptNotFound
		}
		return nil, err
	}

	var reqHeaders map[string]interface{}
	if len(a.RequestHeaders) > 0 {
		_ = json.Unmarshal(a.RequestHeaders, &reqHeaders)
	}
	var respStatus *int32
	if a.ResponseStatus.Valid {
		respStatus = &a.ResponseStatus.Int32
	}
	var respBody *string
	if a.ResponseBody.Valid {
		respBody = &a.ResponseBody.String
	}
	var errMsg *string
	if a.ErrorMessage.Valid {
		errMsg = &a.ErrorMessage.String
	}
	var durMs *int32
	if a.DurationMs.Valid {
		durMs = &a.DurationMs.Int32
	}

	return &deliveryTypes.DeliveryAttemptItem{
		ID:             core.PgUUIDToUUID(a.ID),
		DeliveryID:     core.PgUUIDToUUID(a.DeliveryID),
		AttemptNumber:  a.AttemptNumber,
		RequestHeaders: reqHeaders,
		ResponseStatus: respStatus,
		ResponseBody:   respBody,
		ErrorMessage:   errMsg,
		DurationMs:     durMs,
		CreatedAt:      core.TimestampToTime(a.CreatedAt),
	}, nil
}
