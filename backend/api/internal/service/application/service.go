package application

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	TureHookMiddleware "github.com/ShivamIT23/TrueHook/backend/api/internal/middleware"
	applicationTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/application"
	"github.com/ShivamIT23/TrueHook/backend/packages/database/core"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type contextKey string

type service struct {
	repo      *core.Queries
	jwtSecret string
}

const (
	UserIDContextKey contextKey = "user_id"
	EmailContextKey  contextKey = "email"
)

func NewService(repo *core.Queries) applicationTypes.Service {
	return &service{
		repo: repo,
	}
}

func (s *service) CreateApplication(ctx context.Context, req applicationTypes.CreateApplicationRequest) (*applicationTypes.ApplicationResponse, error) {
	name := req.Name
	if err := validateName(name); err != nil {
		return nil, applicationTypes.ErrInvalidName
	}
	description := req.Description

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	userId := core.UUIDTOPgUUID(user_id)

	if !getIdErr {
		return nil, applicationTypes.ErrNotAuthorized
	}

	checkApplication := core.GetApplicationByNameParams{
		UserID: userId,
		Name:   name,
	}
	// Check if application already exists
	_, err := s.repo.GetApplicationByName(ctx, checkApplication)
	if err == nil {
		return nil, applicationTypes.ErrApplicationAlreadyExists
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	newApplication := core.CreateApplicationParams{
		UserID:      userId,
		Name:        name,
		Description: core.StringToText(description),
	}

	result, creation_err := s.repo.CreateApplication(ctx, newApplication)
	if creation_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(creation_err, &pgErr) && pgErr.Code == "23505" {
			return nil, creation_err
		}
		return nil, creation_err
	}

	return &applicationTypes.ApplicationResponse{
		ID:          core.PgUUIDToUUID(result.ID),
		Name:        result.Name,
		Description: result.Description.String,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) UpdateApplication(ctx context.Context, req applicationTypes.UpdateApplicationRequest) (*applicationTypes.ApplicationResponse, error) {
	id := req.Id
	if id == "" {
		return nil, applicationTypes.ErrInvalidId
	}

	name := req.Name
	if err := validateName(name); err != nil {
		return nil, applicationTypes.ErrInvalidName
	}
	description := req.Description

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	userId := core.UUIDTOPgUUID(user_id)

	if !getIdErr {
		return nil, applicationTypes.ErrNotAuthorized
	}

	application_id, application_err := core.StringToPGUUID(id)

	if application_err != nil {
		return nil, applicationTypes.ErrInvalidId
	}

	checkApplication := core.GetApplicationByIdParams{
		UserID: userId,
		ID:     application_id,
	}
	// Check if application already exists
	result, err := s.repo.GetApplicationById(ctx, checkApplication)
	if err == nil {
		return nil, applicationTypes.ErrApplicationAlreadyExists
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	updateApplication := core.UpdateApplicationParams{
		ID:          application_id,
		UserID:      userId,
		Name:        name,
		Description: core.StringToText(description),
	}

	creation_err := s.repo.UpdateApplication(ctx, updateApplication)
	if creation_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(creation_err, &pgErr) && pgErr.Code == "23505" {
			return nil, creation_err
		}
		return nil, creation_err
	}

	return &applicationTypes.ApplicationResponse{
		ID:          core.PgUUIDToUUID(result.ID),
		Name:        result.Name,
		Description: result.Description.String,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) DeleteApplication(ctx context.Context, req applicationTypes.DeleteApplicationRequest) (*applicationTypes.ApplicationResponse, error) {
	id := req.Id
	if id == "" {
		return nil, applicationTypes.ErrInvalidId
	}

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	userId := core.UUIDTOPgUUID(user_id)

	if !getIdErr {
		return nil, applicationTypes.ErrNotAuthorized
	}

	application_id, application_err := core.StringToPGUUID(id)

	if application_err != nil {
		return nil, applicationTypes.ErrInvalidId
	}

	checkApplication := core.GetApplicationByIdParams{
		ID:     application_id,
		UserID: userId,
	}
	// Check if user already exists
	result, err := s.repo.GetApplicationById(ctx, checkApplication)
	if err == nil {
		return nil, applicationTypes.ErrApplicationAlreadyExists
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	deleteApplication := core.DeleteApplicationParams{
		ID:     application_id,
		UserID: userId,
	}

	creation_err := s.repo.DeleteApplication(ctx, deleteApplication)
	if creation_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(creation_err, &pgErr) && pgErr.Code == "23505" {
			return nil, creation_err
		}
		return nil, creation_err
	}

	return &applicationTypes.ApplicationResponse{
		ID:          core.PgUUIDToUUID(result.ID),
		Name:        result.Name,
		Description: result.Description.String,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) GetApplication(ctx context.Context, req *http.Request) (*applicationTypes.ApplicationResponse, error) {
	id := req.PathValue("id")
	if id == "" {
		return nil, applicationTypes.ErrInvalidId
	}

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	userId := core.UUIDTOPgUUID(user_id)

	if !getIdErr {
		return nil, applicationTypes.ErrNotAuthorized
	}

	application_id, application_err := core.StringToPGUUID(id)

	if application_err != nil {
		return nil, applicationTypes.ErrInvalidId
	}

	checkApplication := core.GetApplicationByIdParams{
		ID:     application_id,
		UserID: userId,
	}
	// fetch application
	result, err := s.repo.GetApplicationById(ctx, checkApplication)

	if err != nil {
		return nil, applicationTypes.ErrApplicationAlreadyExists
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}

	return &applicationTypes.ApplicationResponse{
		ID:          core.PgUUIDToUUID(result.ID),
		Name:        result.Name,
		Description: result.Description.String,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func (s *service) GetAllApplication(ctx context.Context) (*applicationTypes.ApplicationResponse, error) {

	user_id, getIdErr := TureHookMiddleware.GetUserID(ctx)

	fmt.Println("user_id", user_id)

	userId := core.UUIDTOPgUUID(user_id)

	if !getIdErr {
		return nil, applicationTypes.ErrNotAuthorized
	}

	result, retreval_err := s.repo.GetApplicationsByUserId(ctx, userId)
	if retreval_err != nil {
		var pgErr *pgconn.PgError
		if errors.As(retreval_err, &pgErr) && pgErr.Code == "23505" {
			return nil, retreval_err
		}
		return nil, retreval_err
	}

	return &applicationTypes.ApplicationResponse{
		ID:          core.PgUUIDToUUID(result.ID),
		Name:        result.Name,
		Description: result.Description.String,
		CreatedAt:   core.TimestampToTime(result.CreatedAt),
	}, nil
}

func validateName(name string) error {
	if name == "" || len(name) > 255 {
		return errors.New("invalid length")
	}
	return nil
}
