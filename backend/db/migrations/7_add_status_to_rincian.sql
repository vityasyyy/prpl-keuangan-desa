DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'apbdes_rincian'
    ) THEN
        ALTER TABLE apbdes_rincian ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
    END IF;
END $$;