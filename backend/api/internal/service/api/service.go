package api

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	apiTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/api"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type service struct {
	repo *core.Queries
}

// NewService creates a new instance of api service.
func NewService(repo *core.Queries) apiTypes.Service {
	return &service{
		repo: repo,
	}
}

// generateAPIKey generates a cryptographically secure random API key.
func generateAPIKey() (string, error) {
	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return "th_live_" + hex.EncodeToString(bytes), nil
}

// validateAPIKey validates custom provided API key string.
func validateAPIKey(key string) error {
	trimmed := strings.TrimSpace(key)
	if len(trimmed) < 8 || len(trimmed) > 255 {
		return apiTypes.ErrInvalidAPIKey
	}
	return nil
}

func toAPIResponse(record core.Api) *apiTypes.APIResponse {
	return &apiTypes.APIResponse{
		ID:             core.PgUUIDToUUID(record.ID),
		APIKey:         record.ApiKey,
		UserID:         core.PgUUIDToUUID(record.UserID),
		APICreditsUsed: record.ApiCreditsUsed,
		CreatedAt:      core.TimestampToTime(record.CreatedAt),
		UpdatedAt:      core.TimestampToTime(record.UpdatedAt),
	}
}

// CreateAPI creates a new API record for the authenticated user.
func (s *service) CreateAPI(ctx context.Context, req apiTypes.CreateAPIRequest) (*apiTypes.APIResponse, error) {
	authUserID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, apiTypes.ErrNotAuthorized
	}

	apiKey := strings.TrimSpace(req.APIKey)
	if apiKey != "" {
		if err := validateAPIKey(apiKey); err != nil {
			return nil, err
		}
	} else {
		generated, err := generateAPIKey()
		if err != nil {
			return nil, err
		}
		apiKey = generated
	}

	var creditsUsed int64
	if req.APICreditsUsed != nil {
		if *req.APICreditsUsed < 0 {
			return nil, apiTypes.ErrInvalidCredits
		}
		creditsUsed = *req.APICreditsUsed
	}

	record, err := s.repo.CreateAPI(ctx, core.CreateAPIParams{
		UserID:         core.UUIDTOPgUUID(authUserID),
		ApiKey:         apiKey,
		ApiCreditsUsed: creditsUsed,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, apiTypes.ErrAPIAlreadyExists
		}
		return nil, err
	}

	return toAPIResponse(record), nil
}

// GetAPI retrieves a specific API key record by ID for the authenticated user.
func (s *service) GetAPI(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error) {
	authUserID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, apiTypes.ErrNotAuthorized
	}

	idStr := req.PathValue("id")
	if idStr == "" {
		idStr = req.URL.Query().Get("id")
	}
	if strings.TrimSpace(idStr) == "" {
		return nil, apiTypes.ErrInvalidID
	}

	parsedID, err := uuid.Parse(strings.TrimSpace(idStr))
	if err != nil {
		return nil, apiTypes.ErrInvalidID
	}

	record, err := s.repo.GetAPIById(ctx, core.GetAPIByIdParams{
		ID:     core.UUIDTOPgUUID(parsedID),
		UserID: core.UUIDTOPgUUID(authUserID),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, apiTypes.ErrAPINotFound
		}
		return nil, err
	}

	return toAPIResponse(record), nil
}

// GetAPIByKey retrieves an API record by API key value.
func (s *service) GetAPIByKey(ctx context.Context, apiKey string) (*apiTypes.APIResponse, error) {
	trimmed := strings.TrimSpace(apiKey)
	if trimmed == "" {
		return nil, apiTypes.ErrInvalidAPIKey
	}

	record, err := s.repo.GetAPIByKey(ctx, trimmed)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, apiTypes.ErrAPINotFound
		}
		return nil, err
	}

	return toAPIResponse(record), nil
}

// GetAllAPIs returns all API keys belonging to the authenticated user.
func (s *service) GetAllAPIs(ctx context.Context) (*apiTypes.APIListResponse, error) {
	authUserID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, apiTypes.ErrNotAuthorized
	}

	records, err := s.repo.GetAPIsByUserId(ctx, core.UUIDTOPgUUID(authUserID))
	if err != nil {
		return nil, err
	}

	items := make([]apiTypes.APIResponse, 0, len(records))
	for _, r := range records {
		items = append(items, *toAPIResponse(r))
	}

	return &apiTypes.APIListResponse{
		APIs: items,
	}, nil
}

// UpdateCredits updates credits used for an API key (increment or set).
func (s *service) UpdateCredits(ctx context.Context, req apiTypes.UpdateCreditsRequest) (*apiTypes.APIResponse, error) {
	authUserID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, apiTypes.ErrNotAuthorized
	}

	if strings.TrimSpace(req.ID) == "" {
		return nil, apiTypes.ErrInvalidID
	}

	parsedID, err := uuid.Parse(strings.TrimSpace(req.ID))
	if err != nil {
		return nil, apiTypes.ErrInvalidID
	}

	if req.APICreditsUsed != nil {
		if *req.APICreditsUsed < 0 {
			return nil, apiTypes.ErrInvalidCredits
		}
		record, err := s.repo.SetAPICredits(ctx, core.SetAPICreditsParams{
			ID:             core.UUIDTOPgUUID(parsedID),
			UserID:         core.UUIDTOPgUUID(authUserID),
			ApiCreditsUsed: *req.APICreditsUsed,
		})
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, apiTypes.ErrAPINotFound
			}
			return nil, err
		}
		return toAPIResponse(record), nil
	}

	if req.CreditsToAdd < 0 {
		return nil, apiTypes.ErrInvalidCredits
	}

	record, err := s.repo.UpdateAPICredits(ctx, core.UpdateAPICreditsParams{
		ID:             core.UUIDTOPgUUID(parsedID),
		UserID:         core.UUIDTOPgUUID(authUserID),
		ApiCreditsUsed: req.CreditsToAdd,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, apiTypes.ErrAPINotFound
		}
		return nil, err
	}

	return toAPIResponse(record), nil
}

// RegenerateKey regenerates or updates the API key string for an API record.
func (s *service) RegenerateKey(ctx context.Context, req apiTypes.RegenerateKeyRequest) (*apiTypes.APIResponse, error) {
	authUserID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, apiTypes.ErrNotAuthorized
	}

	if strings.TrimSpace(req.ID) == "" {
		return nil, apiTypes.ErrInvalidID
	}

	parsedID, err := uuid.Parse(strings.TrimSpace(req.ID))
	if err != nil {
		return nil, apiTypes.ErrInvalidID
	}

	var newKey string
	if strings.TrimSpace(req.APIKey) != "" {
		if err := validateAPIKey(req.APIKey); err != nil {
			return nil, err
		}
		newKey = strings.TrimSpace(req.APIKey)
	} else {
		generated, err := generateAPIKey()
		if err != nil {
			return nil, err
		}
		newKey = generated
	}

	record, err := s.repo.RegenerateAPIKey(ctx, core.RegenerateAPIKeyParams{
		ID:     core.UUIDTOPgUUID(parsedID),
		UserID: core.UUIDTOPgUUID(authUserID),
		ApiKey: newKey,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, apiTypes.ErrAPINotFound
		}
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, apiTypes.ErrAPIAlreadyExists
		}
		return nil, err
	}

	return toAPIResponse(record), nil
}

// DeleteAPI deletes an API record for the authenticated user.
func (s *service) DeleteAPI(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error) {
	authUserID, ok := TureHookMiddleware.GetUserID(ctx)
	if !ok {
		return nil, apiTypes.ErrNotAuthorized
	}

	idStr := req.PathValue("id")
	if idStr == "" {
		idStr = req.URL.Query().Get("id")
	}
	if strings.TrimSpace(idStr) == "" {
		return nil, apiTypes.ErrInvalidID
	}

	parsedID, err := uuid.Parse(strings.TrimSpace(idStr))
	if err != nil {
		return nil, apiTypes.ErrInvalidID
	}

	// Verify key exists and belongs to user first
	existing, err := s.repo.GetAPIById(ctx, core.GetAPIByIdParams{
		ID:     core.UUIDTOPgUUID(parsedID),
		UserID: core.UUIDTOPgUUID(authUserID),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, apiTypes.ErrAPINotFound
		}
		return nil, err
	}

	err = s.repo.DeleteAPI(ctx, core.DeleteAPIParams{
		ID:     core.UUIDTOPgUUID(parsedID),
		UserID: core.UUIDTOPgUUID(authUserID),
	})
	if err != nil {
		return nil, err
	}

	return toAPIResponse(existing), nil
}
