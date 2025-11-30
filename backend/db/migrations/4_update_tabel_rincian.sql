-- =========================================
-- 4_update_tabel_rincian.sql (idempotent)
-- =========================================

-- Ubah struktur tabel apbdes_rincian
ALTER TABLE apbdes_rincian
    ALTER COLUMN kegiatan_id DROP NOT NULL,
    DROP COLUMN uraian,
    ADD COLUMN apbdes_id TEXT REFERENCES apbdes(id) ON DELETE CASCADE;

-- Ubah struktur tabel apbdes_rincian_penjabaran
ALTER TABLE apbdes_rincian_penjabaran
    DROP COLUMN uraian;
