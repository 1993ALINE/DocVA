-- transcriptionPollingService.js / deepgramBatchService.js (the async
-- Deepgram batch-transcription cost-optimization path, wired in via
-- routes/audio.js) depend on a `transcriptions` table and two `notes`
-- columns that no prior migration ever created.

CREATE TABLE IF NOT EXISTS transcriptions (
    id SERIAL PRIMARY KEY,
    visit_id INTEGER NOT NULL UNIQUE REFERENCES visits(id) ON DELETE CASCADE,
    deepgram_request_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    model VARCHAR(64),
    audio_duration_seconds INTEGER,
    transcript TEXT,
    confidence NUMERIC(5, 4),
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_transcriptions_status ON transcriptions (status);

ALTER TABLE notes ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS generated_by TEXT;

-- transcriptionPollingService.js does `INSERT INTO notes (...) ON CONFLICT
-- (visit_id) DO UPDATE ...`, which requires visit_id to be unique — matches
-- noteController.js's existing one-note-per-visit behavior (it checks for
-- an existing row by visit_id before deciding INSERT vs UPDATE).
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_visit_id_unique;
ALTER TABLE notes ADD CONSTRAINT notes_visit_id_unique UNIQUE (visit_id);
