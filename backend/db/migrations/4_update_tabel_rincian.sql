ALTER TABLE apbdes_rincian
    ALTER COLUMN kegiatan_id DROP NOT NULL,
    DROP COLUMN uraian,
    ADD COLUMN apbdes_id TEXT REFERENCES apbdes(id) ON DELETE CASCADE;
