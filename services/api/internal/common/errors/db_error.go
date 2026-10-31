package errors

import "time"

type DBError struct {
	Timestamp time.Time `json:"timestamp"`
	Message   string    `json:"message"`
	Detail    any       `json:"detail"`
	Code      string    `json:"code"`
}

func (d *DBError) Error() string {
	return d.Message
}

func NewDBError(message string, detail any, code string) *DBError {
	return &DBError{
		Timestamp: time.Now(),
		Message:   message,
		Detail:    detail,
		Code:      code,
	}
}
