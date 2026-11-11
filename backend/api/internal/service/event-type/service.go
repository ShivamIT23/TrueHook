package eventtype

import (
	"context"
	"errors"
	"net/http"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	eventTypeTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/event-type"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type contextKey string

type service struct {
	repo *core.Queries
}

const (
	UserIDContextKey contextKey = "user_id"
)

func NewService(repo *core.Queries) eventTypeTypes.Service {
	return &service{
		repo: repo,
	}
}

func (s *service) CreateEventType(ctx context.Context, req eventTypeTypes.CreateEventTypeRequest) (*eventTypeTypes.EventTypeResponse, error) {
	name := req.Name
	if err := validateName(name); err != nil {
		return nil, eventTypeTypes.ErrInvalidName
	}
	description := req.Description

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	userId := core.UUIDTOPgUUID(user_id)

	applicationId, application_err := core.StringToPGUUID(req.ApplicationId)

	if application_err != nil {
		return nil, eventTypeTypes.ErrInvalidId
	}

	if !getIdErr {
		return nil, eventTypeTypes.ErrNotAuthorized
	}

	checkApplication := core.GetApplicationByIdParams{
		ID:     applicationId,
		UserID: userId,
	}
	// Check if application already exists
	_, err := s.repo.GetApplicationById(ctx, checkApplication)
	if err != nil {
		return nil, eventTypeTypes.ErrEventTypeAlreadyExists
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	newEventType := core.CreateEventTypeParams{
		ApplicationID: applicationId,
		Name:          name,
		Description:   core.StringToText(description),
	}

	result, creation_err := s.repo.CreateEventType(ctx, newEventType)
	if creation_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(creation_err, &pgErr) && pgErr.Code == "23505" {
			return nil, creation_err
		}
		return nil, creation_err
	}

	return &eventTypeTypes.EventTypeResponse{
		ID:          core.PgUUIDToUUID(result.ID),
		Name:        result.Name,
		Description: result.Description.String,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) UpdateEventType(ctx context.Context, req eventTypeTypes.UpdateEventTypeRequest) (*eventTypeTypes.EventTypeResponse, error) {
	id := req.Id
	if id == "" {
		return nil, eventTypeTypes.ErrInvalidId
	}

	name := req.Name
	if err := validateName(name); err != nil {
		return nil, eventTypeTypes.ErrInvalidName
	}
	description := req.Description

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	userId := core.UUIDTOPgUUID(user_id)

	if !getIdErr {
		return nil, eventTypeTypes.ErrNotAuthorized
	}

	event_type_id, event_type_err := core.StringToPGUUID(id)

	if event_type_err != nil {
		return nil, eventTypeTypes.ErrInvalidId
	}

	checkEventTypeById := core.GetEventTypeByIdParams{
		ID:     event_type_id,
		UserID: userId,
	}

	// Check if event_type already exists
	result, err := s.repo.GetEventTypeById(ctx, checkEventTypeById)

	if err != nil {
		return nil, eventTypeTypes.ErrEventTypeNotFound
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	updateEventType := core.UpdateEventTypeParams{
		ID:          event_type_id,
		UserID:      userId,
		Name:        name,
		Description: core.StringToText(description),
	}

	creation_err := s.repo.UpdateEventType(ctx, updateEventType)
	if creation_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(creation_err, &pgErr) && pgErr.Code == "23505" {
			return nil, creation_err
		}
		return nil, creation_err
	}

	return &eventTypeTypes.EventTypeResponse{
		ID:          core.PgUUIDToUUID(result.ID),
		Name:        req.Name,
		Description: req.Description,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) DeleteEventType(ctx context.Context, req *http.Request) (*eventTypeTypes.EventTypeResponse, error) {
	id := req.PathValue("id")
	if id == "" {
		id = req.PathValue("event_type_id")
	}
	if id == "" {
		return nil, eventTypeTypes.ErrInvalidId
	}

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	userId := core.UUIDTOPgUUID(user_id)

	if !getIdErr {
		return nil, eventTypeTypes.ErrNotAuthorized
	}

	event_type_id, event_type_err := core.StringToPGUUID(id)

	if event_type_err != nil {
		return nil, eventTypeTypes.ErrInvalidId
	}

	checkEventTypeById := core.GetEventTypeByIdParams{
		ID:     event_type_id,
		UserID: userId,
	}

	// Check if event_type already exists
	result, err := s.repo.GetEventTypeById(ctx, checkEventTypeById)
	if err != nil {
		return nil, eventTypeTypes.ErrEventTypeNotFound
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	deleteEventType := core.DeleteEventTypeParams{
		ID:     event_type_id,
		UserID: userId,
	}

	creation_err := s.repo.DeleteEventType(ctx, deleteEventType)
	if creation_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(creation_err, &pgErr) && pgErr.Code == "23505" {
			return nil, creation_err
		}
		return nil, creation_err
	}

	return &eventTypeTypes.EventTypeResponse{
		ID:          core.PgUUIDToUUID(result.ID),
		Name:        result.Name,
		Description: result.Description.String,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) GetEventTypes(ctx context.Context, req eventTypeTypes.GetEventTypeRequest) (*eventTypeTypes.EventTypesResponse, error) {

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	userId := core.UUIDTOPgUUID(user_id)

	applicationId, application_err := core.StringToPGUUID(req.ApplicationId)

	if application_err != nil {
		return nil, eventTypeTypes.ErrInvalidId
	}

	if !getIdErr {
		return nil, eventTypeTypes.ErrNotAuthorized
	}

	getEventType := core.GetEventTypesByApplicationIdParams{
		ApplicationID: applicationId,
		UserID:        userId,
	}

	result, retreval_err := s.repo.GetEventTypesByApplicationId(ctx, getEventType)

	if retreval_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(retreval_err, &pgErr) && pgErr.Code == "23505" {
			return nil, retreval_err
		}
		return nil, retreval_err
	}

	return &eventTypeTypes.EventTypesResponse{
		EventTypes: result,
	}, nil
}

func validateName(name string) error {
	if name == "" || len(name) > 255 {
		return errors.New("invalid length")
	}
	return nil
}
