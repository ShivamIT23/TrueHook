package api

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	apiTypes "github.com/ShivamIT23/TrueHook/backend/api/internal/types/api"
	"github.com/google/uuid"
)

type mockService struct {
	createAPIFunc    func(ctx context.Context, req apiTypes.CreateAPIRequest) (*apiTypes.APIResponse, error)
	getAPIFunc       func(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error)
	getAPIByKeyFunc  func(ctx context.Context, apiKey string) (*apiTypes.APIResponse, error)
	getAllAPIsFunc   func(ctx context.Context) (*apiTypes.APIListResponse, error)
	updateCreditsFunc func(ctx context.Context, req apiTypes.UpdateCreditsRequest) (*apiTypes.APIResponse, error)
	regenerateKeyFunc func(ctx context.Context, req apiTypes.RegenerateKeyRequest) (*apiTypes.APIResponse, error)
	deleteAPIFunc    func(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error)
}

func (m *mockService) CreateAPI(ctx context.Context, req apiTypes.CreateAPIRequest) (*apiTypes.APIResponse, error) {
	if m.createAPIFunc != nil {
		return m.createAPIFunc(ctx, req)
	}
	return nil, nil
}

func (m *mockService) GetAPI(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error) {
	if m.getAPIFunc != nil {
		return m.getAPIFunc(ctx, req)
	}
	return nil, nil
}

func (m *mockService) GetAPIByKey(ctx context.Context, apiKey string) (*apiTypes.APIResponse, error) {
	if m.getAPIByKeyFunc != nil {
		return m.getAPIByKeyFunc(ctx, apiKey)
	}
	return nil, nil
}

func (m *mockService) GetAllAPIs(ctx context.Context) (*apiTypes.APIListResponse, error) {
	if m.getAllAPIsFunc != nil {
		return m.getAllAPIsFunc(ctx)
	}
	return nil, nil
}

func (m *mockService) UpdateCredits(ctx context.Context, req apiTypes.UpdateCreditsRequest) (*apiTypes.APIResponse, error) {
	if m.updateCreditsFunc != nil {
		return m.updateCreditsFunc(ctx, req)
	}
	return nil, nil
}

func (m *mockService) RegenerateKey(ctx context.Context, req apiTypes.RegenerateKeyRequest) (*apiTypes.APIResponse, error) {
	if m.regenerateKeyFunc != nil {
		return m.regenerateKeyFunc(ctx, req)
	}
	return nil, nil
}

func (m *mockService) DeleteAPI(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error) {
	if m.deleteAPIFunc != nil {
		return m.deleteAPIFunc(ctx, req)
	}
	return nil, nil
}

func TestHandlerCreateAPI(t *testing.T) {
	mockID := uuid.New()
	mockUserID := uuid.New()

	t.Run("success", func(t *testing.T) {
		svc := &mockService{
			createAPIFunc: func(ctx context.Context, req apiTypes.CreateAPIRequest) (*apiTypes.APIResponse, error) {
				return &apiTypes.APIResponse{
					ID:             mockID,
					APIKey:         "th_live_sample_key",
					UserID:         mockUserID,
					APICreditsUsed: 0,
					CreatedAt:      time.Now(),
					UpdatedAt:      time.Now(),
				}, nil
			},
		}
		h := NewHandler(svc)

		reqBody := `{"api_key":"th_live_sample_key"}`
		req := httptest.NewRequest("POST", "/api/v1/api", bytes.NewBufferString(reqBody))
		w := httptest.NewRecorder()

		h.CreateAPIHandler(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected status 201, got %d", w.Code)
		}
	})

	t.Run("conflict already exists", func(t *testing.T) {
		svc := &mockService{
			createAPIFunc: func(ctx context.Context, req apiTypes.CreateAPIRequest) (*apiTypes.APIResponse, error) {
				return nil, apiTypes.ErrAPIAlreadyExists
			},
		}
		h := NewHandler(svc)

		req := httptest.NewRequest("POST", "/api/v1/api", bytes.NewBufferString(`{}`))
		w := httptest.NewRecorder()

		h.CreateAPIHandler(w, req)

		if w.Code != http.StatusConflict {
			t.Fatalf("expected status 409, got %d", w.Code)
		}
	})
}

func TestHandlerGetAPI(t *testing.T) {
	mockID := uuid.New()

	t.Run("success", func(t *testing.T) {
		svc := &mockService{
			getAPIFunc: func(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error) {
				return &apiTypes.APIResponse{
					ID: mockID,
				}, nil
			},
		}
		h := NewHandler(svc)

		req := httptest.NewRequest("GET", "/api/v1/api/"+mockID.String(), nil)
		req.SetPathValue("id", mockID.String())
		w := httptest.NewRecorder()

		h.GetAPIHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}
	})

	t.Run("not found", func(t *testing.T) {
		svc := &mockService{
			getAPIFunc: func(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error) {
				return nil, apiTypes.ErrAPINotFound
			},
		}
		h := NewHandler(svc)

		req := httptest.NewRequest("GET", "/api/v1/api/"+mockID.String(), nil)
		req.SetPathValue("id", mockID.String())
		w := httptest.NewRecorder()

		h.GetAPIHandler(w, req)

		if w.Code != http.StatusNotFound {
			t.Fatalf("expected status 404, got %d", w.Code)
		}
	})
}

func TestHandlerGetAllAPIs(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc := &mockService{
			getAllAPIsFunc: func(ctx context.Context) (*apiTypes.APIListResponse, error) {
				return &apiTypes.APIListResponse{
					APIs: []apiTypes.APIResponse{},
				}, nil
			},
		}
		h := NewHandler(svc)

		req := httptest.NewRequest("GET", "/api/v1/api", nil)
		w := httptest.NewRecorder()

		h.GetAllAPIsHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}
	})
}

func TestHandlerUpdateCredits(t *testing.T) {
	mockID := uuid.New()

	t.Run("success", func(t *testing.T) {
		svc := &mockService{
			updateCreditsFunc: func(ctx context.Context, req apiTypes.UpdateCreditsRequest) (*apiTypes.APIResponse, error) {
				return &apiTypes.APIResponse{
					ID:             mockID,
					APICreditsUsed: 50,
				}, nil
			},
		}
		h := NewHandler(svc)

		payload, _ := json.Marshal(map[string]int64{"credits_to_add": 25})
		req := httptest.NewRequest("PUT", "/api/v1/api/"+mockID.String()+"/credits", bytes.NewBuffer(payload))
		req.SetPathValue("id", mockID.String())
		w := httptest.NewRecorder()

		h.UpdateCreditsHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}
	})
}

func TestHandlerRegenerateKey(t *testing.T) {
	mockID := uuid.New()

	t.Run("success", func(t *testing.T) {
		svc := &mockService{
			regenerateKeyFunc: func(ctx context.Context, req apiTypes.RegenerateKeyRequest) (*apiTypes.APIResponse, error) {
				return &apiTypes.APIResponse{
					ID:     mockID,
					APIKey: "th_live_new_key",
				}, nil
			},
		}
		h := NewHandler(svc)

		req := httptest.NewRequest("POST", "/api/v1/api/"+mockID.String()+"/regenerate", bytes.NewBufferString(`{}`))
		req.SetPathValue("id", mockID.String())
		w := httptest.NewRecorder()

		h.RegenerateKeyHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}
	})
}

func TestHandlerDeleteAPI(t *testing.T) {
	mockID := uuid.New()

	t.Run("success", func(t *testing.T) {
		svc := &mockService{
			deleteAPIFunc: func(ctx context.Context, req *http.Request) (*apiTypes.APIResponse, error) {
				return &apiTypes.APIResponse{
					ID: mockID,
				}, nil
			},
		}
		h := NewHandler(svc)

		req := httptest.NewRequest("DELETE", "/api/v1/api/"+mockID.String(), nil)
		req.SetPathValue("id", mockID.String())
		w := httptest.NewRecorder()

		h.DeleteAPIHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}
	})
}
