package main

import (
	"context"
	"log"

	"github.com/ShivamIT23/TrueHook/services/worker/internal/config"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.NATS_URL == "" {
		log.Fatal("NATS_URL is required")
	}

	nc, err := nats.Connect(cfg.NATS_URL)
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
			Name:     cfg.StreamName,
			Subjects: []string{cfg.DeliverySubject},
			Storage:  jetstream.FileStorage,
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("TrueHook worker connected to NATS")
	log.Printf("%s stream is ready\n", cfg.StreamName)

	select {}
}
