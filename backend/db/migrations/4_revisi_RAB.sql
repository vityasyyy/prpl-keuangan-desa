DO $$ BEGIN
    CREATE TYPE STATUS_rab AS ENUM (
        'belum diajukan',
        'diajukan',
        'terverifikasi',
        'tidak terverifikasi',
        'disetujui',
        'tidak disetujui');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE rab
    DROP COLUMN IF EXISTS rkk_id,
    DROP COLUMN IF EXISTS rincian_id;

ALTER TABLE rab
    ADD COLUMN IF NOT EXISTS mulai DATE NOT NULL DEFAULT '2024-01-01',
    ADD COLUMN IF NOT EXISTS selesai DATE NOT NULL DEFAULT '2024-12-31',
    ADD COLUMN IF NOT EXISTS status_rab STATUS_rab NOT NULL DEFAULT 'belum diajukan';

ALTER TABLE rab_line
    DROP COLUMN IF EXISTS kode_ekonomi_id,
    ADD COLUMN IF NOT EXISTS satuan TEXT;