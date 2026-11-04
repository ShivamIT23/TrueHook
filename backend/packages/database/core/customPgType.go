package core

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func NewUUID() pgtype.UUID {
	id := uuid.New()

	return pgtype.UUID{
		Bytes: id,
		Valid: true,
	}
}

func NewTimestamp() pgtype.Timestamptz {
	return pgtype.Timestamptz{
		Time:  time.Now(),
		Valid: true,
	}
}

func PgUUIDToUUID(id pgtype.UUID) uuid.UUID {
	if !id.Valid {
		return uuid.Nil
	}

	return uuid.UUID(id.Bytes)
}

func StringToPGUUID(value string) (pgtype.UUID, error) {
	id, err := uuid.Parse(value)
	if err != nil {
		return pgtype.UUID{}, err
	}

	return pgtype.UUID{
		Bytes: id,
		Valid: true,
	}, nil
}

func TimestampToTime(ts pgtype.Timestamptz) time.Time {
	if !ts.Valid {
		return time.Time{}
	}

	return ts.Time
}

func StringToText(value string) pgtype.Text {
	return pgtype.Text{
		String: value,
		Valid:  true,
	}
}

func TextToString(value pgtype.Text) string {
	if !value.Valid {
		return ""
	}

	return value.String
}
