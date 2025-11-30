ALTER TABLE apbdes_rincian_penjabaran
    DROP COLUMN uraian,
    ADD COLUMN kode_fungsi_id TEXT REFERENCES kode_fungsi(id),
    ADD COLUMN kode_ekonomi_id TEXT REFERENCES kode_ekonomi(id);