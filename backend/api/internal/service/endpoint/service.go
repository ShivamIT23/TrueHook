package endpoint

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"net/url"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	endpointTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/endpoint"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type service struct {
	repo *core.Queries
}

func NewService(repo *core.Queries) endpointTypes.Service {
	return &service{
		repo: repo,
	}
}

func validateUrl(endpointUrl string) error {
	if endpointUrl == "" || len(endpointUrl) > 2048 {
		return endpointTypes.ErrInvalidUrl
	}
	parsed, err := url.ParseRequestURI(endpointUrl)
	if err != nil {
		return endpointTypes.ErrInvalidUrl
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return endpointTypes.ErrInvalidUrl
	}
	if parsed.Host == "" {
		return endpointTypes.ErrInvalidUrl
	}
	return nil
}

func generateSecret() (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return "whsec_" + hex.EncodeToString(b), nil
}

func (s *service) CreateEndpoint(ctx context.Context, req endpointTypes.CreateEndpointRequest) (*endpointTypes.EndpointResponse, error) {
	if err := validateUrl(req.Url); err != nil {
		return nil, err
	}

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)
	if !getIdErr {
		return nil, endpointTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	applicationId, application_err := core.StringToPGUUID(req.ApplicationId)
	if application_err != nil {
		return nil, endpointTypes.ErrInvalidId
	}

	checkApplication := core.GetApplicationByIdParams{
		ID:     applicationId,
		UserID: userId,
	}

	// Verify application exists and belongs to the user
	_, err := s.repo.GetApplicationById(ctx, checkApplication)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, endpointTypes.ErrApplicationNotFound
		}
		return nil, endpointTypes.ErrApplicationNotFound
	}

	secret := req.SecretEncrypted
	if secret == "" {
		var genErr error
		secret, genErr = generateSecret()
		if genErr != nil {
			return nil, genErr
		}
	}

	newEndpoint := core.CreateEndpointsParams{
		ApplicationID:   applicationId,
		Url:             req.Url,
		SecretEncrypted: secret,
	}

	result, creation_err := s.repo.CreateEndpoints(ctx, newEndpoint)
	if creation_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(creation_err, &pgErr) && pgErr.Code == "23505" {
			return nil, endpointTypes.ErrEndpointAlreadyExists
		}
		return nil, creation_err
	}

	return &endpointTypes.EndpointResponse{
		ID:              core.PgUUIDToUUID(result.ID),
		Url:             result.Url,
		SecretEncrypted: result.SecretEncrypted,
		Enabled:         result.Enabled,
		CreatedAt:       core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) UpdateEndpoint(ctx context.Context, req endpointTypes.UpdateEndpointRequest) (*endpointTypes.EndpointResponse, error) {
	id := req.Id
	if id == "" {
		return nil, endpointTypes.ErrInvalidId
	}

	if err := validateUrl(req.Url); err != nil {
		return nil, err
	}

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)
	if !getIdErr {
		return nil, endpointTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	endpointId, err := core.StringToPGUUID(id)
	if err != nil {
		return nil, endpointTypes.ErrInvalidId
	}

	checkEndpointById := core.GetEndpointsByIdParams{
		ID:     endpointId,
		UserID: userId,
	}

	existing, err := s.repo.GetEndpointsById(ctx, checkEndpointById)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, endpointTypes.ErrEndpointNotFound
		}
		return nil, endpointTypes.ErrEndpointNotFound
	}

	secret := req.SecretEncrypted
	if secret == "" {
		secret = existing.SecretEncrypted
	}

	updateEndpoint := core.UpdateEndpointsParams{
		ID:              endpointId,
		UserID:          userId,
		Url:             req.Url,
		SecretEncrypted: secret,
		Enabled:         req.Enabled,
	}

	if err := s.repo.UpdateEndpoints(ctx, updateEndpoint); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, endpointTypes.ErrEndpointAlreadyExists
		}
		return nil, err
	}

	return &endpointTypes.EndpointResponse{
		ID:              core.PgUUIDToUUID(existing.ID),
		Url:             req.Url,
		SecretEncrypted: secret,
		Enabled:         req.Enabled,
		CreatedAt:       core.TimestampToTime(existing.CreatedAt),
	}, nil
}

func (s *service) DeleteEndpoint(ctx context.Context, req *http.Request) (*endpointTypes.EndpointResponse, error) {
	id := req.PathValue("endpoint_id")
	if id == "" {
		id = req.PathValue("id")
	}
	if id == "" {
		id = req.PathValue("event_type_id")
	}
	if id == "" {
		return nil, endpointTypes.ErrInvalidId
	}

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)
	if !getIdErr {
		return nil, endpointTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	endpointId, err := core.StringToPGUUID(id)
	if err != nil {
		return nil, endpointTypes.ErrInvalidId
	}

	checkEndpointById := core.GetEndpointsByIdParams{
		ID:     endpointId,
		UserID: userId,
	}

	existing, err := s.repo.GetEndpointsById(ctx, checkEndpointById)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, endpointTypes.ErrEndpointNotFound
		}
		return nil, endpointTypes.ErrEndpointNotFound
	}

	deleteEndpoint := core.DeleteEndpointsParams{
		ID:     endpointId,
		UserID: userId,
	}

	if err := s.repo.DeleteEndpoints(ctx, deleteEndpoint); err != nil {
		return nil, err
	}

	return &endpointTypes.EndpointResponse{
		ID:              core.PgUUIDToUUID(existing.ID),
		Url:             existing.Url,
		SecretEncrypted: existing.SecretEncrypted,
		Enabled:         existing.Enabled,
		CreatedAt:       core.TimestampToTime(existing.CreatedAt),
	}, nil
}

func (s *service) GetEndpoints(ctx context.Context, req endpointTypes.GetEndpointsRequest) (*endpointTypes.EndpointsResponse, error) {
	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)
	if !getIdErr {
		return nil, endpointTypes.ErrNotAuthorized
	}
	userId := core.UUIDTOPgUUID(user_id)

	applicationId, application_err := core.StringToPGUUID(req.ApplicationId)
	if application_err != nil {
		return nil, endpointTypes.ErrInvalidId
	}

	checkApplication := core.GetApplicationByIdParams{
		ID:     applicationId,
		UserID: userId,
	}
	if _, err := s.repo.GetApplicationById(ctx, checkApplication); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, endpointTypes.ErrApplicationNotFound
		}
		return nil, endpointTypes.ErrApplicationNotFound
	}

	getEndpoint := core.GetEndpointsByApplicationIdParams{
		ApplicationID: applicationId,
		UserID:        userId,
	}

	result, retreval_err := s.repo.GetEndpointsByApplicationId(ctx, getEndpoint)
	if retreval_err != nil {
		return nil, retreval_err
	}

	return &endpointTypes.EndpointsResponse{
		Endpoints: result,
	}, nil
}
