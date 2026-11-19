-- Migration: 003_create_admins_table
-- Description: Create admins table and seed default operators

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Admin',
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Seed initial operators (password: adminSecretPass123)
INSERT INTO admins (name, email, password_hash)
VALUES 
    ('Platform Operator', 'operator@truehook.internal', '$2a$10$Xthop8dIzaeKOcazMdgRxOvvcUrHi6obRk0gMeNHKAjKB.xSJO.h.'),
    ('Super Admin', 'admin@truehook.internal', '$2a$10$Xthop8dIzaeKOcazMdgRxOvvcUrHi6obRk0gMeNHKAjKB.xSJO.h.')
ON CONFLICT (email) DO NOTHING;
