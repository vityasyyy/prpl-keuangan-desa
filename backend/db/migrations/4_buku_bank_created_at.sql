-- Add created_at column to preserve insertion order within the same date
ALTER TABLE IF EXISTS buku_bank
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
