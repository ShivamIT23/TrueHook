package database

import (
	"context"
	"errors"
	"log"

	"github.com/ShivamIT23/TrueHook/internal/common/errors"
	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func Connect(databaseURL string) error {
	if databaseURL == "" {
		return errors.New("DATABASE_URL is missing")
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		log.Fatal("Unable to parse database config:", err)
	}

	DB, err = pgxpool.NewWithConfig(
		context.Background(),
		config,
	)

	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

	// Verify connection
	err = DB.Ping(context.Background())

	if err != nil {
		log.Fatal("Database ping failed:", err)
	}

	log.Println("Connected to PostgreSQL")
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}
