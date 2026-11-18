-- Create api table for API key management and credit tracking
CREATE TABLE IF NOT EXISTS api (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_credits_used BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_user_id ON api(user_id);
CREATE INDEX IF NOT EXISTS idx_api_api_key ON api(api_key);
