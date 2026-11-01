package errors

import "time"

type Error struct {
	Timestamp time.Time `json:"timestamp"`
	Message   string    `json:"message"`
	Detail    any       `json:"detail"`
	Code      string    `json:"code"`
}

func (d *Error) Error() string {
	return d.Message
}

func NewError(message string, detail any, code string) *Error {
	return &Error{
		Timestamp: time.Now(),
		Message:   message,
		Detail:    detail,
		Code:      code,
	}
}
