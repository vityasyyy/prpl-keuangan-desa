-- Add persetujuan column to buku_kas_umum to track approval status

ALTER TABLE buku_kas_umum
  ADD COLUMN IF NOT EXISTS persetujuan TEXT DEFAULT 'pending';

-- Create an index to help queries that filter by persetujuan
CREATE INDEX IF NOT EXISTS idx_bku_persetujuan ON buku_kas_umum(persetujuan);
