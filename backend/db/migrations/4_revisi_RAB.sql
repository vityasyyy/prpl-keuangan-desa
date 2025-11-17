CREATE TYPE STATUS_rab AS ENUM (
    'belum diajukan',
    'diajukan',
    'terverifikasi',
    'tidak terverifikasi',
    'disetujui',
    'tidak disetujui');
ALTER TABLE rab
    DROP COLUMN IF EXISTS rkk_id,
    DROP COLUMN IF EXISTS rincian_id;
ALTER TABLE rab
    ADD COLUMN mulai DATE NOT NULL,
    ADD COLUMN selesai DATE NOT NULL,
    ADD COLUMN status_rab STATUS_rab NOT NULL DEFAULT 'belum diajukan';

ALTER TABLE rab_line
    DROP COLUMN IF EXISTS kode_ekonomi_id,
    ADD COLUMN satuan TEXT;