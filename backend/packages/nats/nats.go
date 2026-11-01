package nats

import (
	"github.com/nats-io/nats.go"
)

func ConnectNATS(natsURL string) (*nats.Conn, error) {
	nc, err := nats.Connect(natsURL)
	if err != nil {
		return nil, err
	}
	return nc, nil
}
