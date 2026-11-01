package response

import (
	"encoding/json"
	"net/http"

	apperrors "github.com/ShivamIT23/TrueHook/backend/packages/common/errors"
)

type Response struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data"`
	Error   any    `json:"error"`
}

func NewResponse(status bool, message string, data any, error any) *Response {
	return &Response{
		Status:  status,
		Message: message,
		Data:    data,
		Error:   error,
	}
}

func WriteJSON(w http.ResponseWriter, statusCode int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}

func Success(w http.ResponseWriter, statusCode int, message string, data any) {
	resp := NewResponse(true, message, data, nil)
	WriteJSON(w, statusCode, resp)
}

func Fail(w http.ResponseWriter, statusCode int, message string, detail any, code string) {
	appErr := apperrors.NewError(message, detail, code)
	resp := NewResponse(false, message, nil, appErr)
	WriteJSON(w, statusCode, resp)
}
