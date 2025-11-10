CREATE TYPE STATUS_rab AS ENUM (
  'belum diajukan',
  'diajukan',
  'terverifikasi',
  'tidak terverifikasi',
  'disetujui',
  'tidak disetujui');
ALTER TABLE rab
    DROP COLUMN IF EXISTS rkk_id;
ALTER TABLE rab
    ADD COLUMN mulai DATE,
    ADD COLUMN selesai DATE,
    ADD COLUMN status_rab STATUS_rab,
    ALTER COLUMN total_amount DROP NOT NULL;
ALTER TABLE rab_line
    DROP COLUMN IF EXISTS kode_ekonomi_id,
    ADD COLUMN satuan TEXT;