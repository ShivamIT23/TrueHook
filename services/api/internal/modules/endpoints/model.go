package endpoints

import "time"

type Users struct {
	id            int32
	email         string
	password_hash []byte
	created_at    time.Time
}

type Applications struct {
	id         int32
	user_id    int32
	name       string
	created_at time.Time
}

type Endpoints struct {
	id                int32
	application_id    int32
	url               string
	secret_encrypted  []byte
	enabled           bool
	subscribed_events []any
	created_at        time.Time
}

type Events struct {
	id             int32
	application_id int32
	event_type     string
	payload        []byte
	created_at     time.Time
}

type Deliveries struct {
	id              int32
	event_id        int32
	endpoint_id     int32
	status          string
	attempts        int32
	next_attempt_at time.Time
	created_at      time.Time
}

type DeliveryAttempts struct {
	id              int32
	delivery_id     int32
	attempt_number  int32
	request_headers []byte
	response_status int32
	response_body   string
	error_message   string
	duration_ms     int32
	created_at      time.Time
}

type Outbox struct {
	id           int32
	aggregate_id int32
	event_type   string
	payload      []byte
	published_at time.Time
	created_at   time.Time
}
