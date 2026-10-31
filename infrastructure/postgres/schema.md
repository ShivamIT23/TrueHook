CREATE TABLE outbox (
    id UUID PRIMARY KEY,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE endpoints (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES applications(id),
    url TEXT NOT NULL,
    secret_encrypted TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    subscribed_events JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES applications(id),
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deliveries (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    next_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, endpoint_id)
);

CREATE TABLE delivery_attempts (
    id UUID PRIMARY KEY,
    delivery_id UUID NOT NULL REFERENCES deliveries(id),
    attempt_number INTEGER NOT NULL,
    request_headers JSONB,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
