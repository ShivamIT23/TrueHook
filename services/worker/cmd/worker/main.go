package main

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

func main() {
	for _, envPath := range []string{".env", "../../.env", "../../../.env", "../../../../.env"} {
		if err := godotenv.Load(envPath); err == nil {
			break
		}
	}

	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		log.Fatal("NATS_URL is required")
	}

	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatal(err)
	}
	defer nc.Close()

	js, err := jetstream.New(nc)
	if err != nil {
		log.Fatal(err)
	}

	_, err = js.CreateOrUpdateStream(
		context.Background(),
		jetstream.StreamConfig{
			Name:     "WEBHOOK_DELIVERIES",
			Subjects: []string{"webhooks.deliver"},
			Storage:  jetstream.FileStorage,
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("TrueHook worker connected to NATS")
	log.Println("WEBHOOK_DELIVERIES stream is ready")

	select {}
}
