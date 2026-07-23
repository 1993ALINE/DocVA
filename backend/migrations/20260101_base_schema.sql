-- Base schema for a fresh database. Every later migration in this directory
-- only ALTERs an assumed-existing schema (added incrementally against the
-- original AWS RDS database, which had no committed CREATE TABLE for these
-- core tables). This file fills that gap so `npm run migrate:prod` can stand
-- up a brand-new empty Postgres instance from scratch.
--
-- Columns/constraints that later migrations already add via
-- `ADD COLUMN IF NOT EXISTS` / `ADD CONSTRAINT` are deliberately left out
-- here so those files remain the single source of truth for them. The few
-- exceptions (noted inline) are columns that a later migration's ADD
-- CONSTRAINT depends on already existing, but that no migration ever creates
-- (they were previously only added by runtime `ensure*Schema` helpers).

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('clinician', 'scribe', 'qps', 'admin', 'super_admin')),
    specialty TEXT,
    phone TEXT,
    npi TEXT,
    license TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Only ever created by ensureUserProfileSchema() at runtime; added here so
    -- they exist deterministically from the first boot rather than depending
    -- on a later app-level self-heal pass.
    force_password_change BOOLEAN NOT NULL DEFAULT false,
    phi_training_acknowledged BOOLEAN NOT NULL DEFAULT false,
    phi_training_acknowledged_at TIMESTAMPTZ,
    phi_training_version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    mrn TEXT NOT NULL UNIQUE,
    date_of_birth DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    -- No later migration adds this FK, unlike clinician_id/scribe_id below.
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    -- FK added later by migrations/20260624_foreign_key_constraints.sql
    -- (fk_visits_clinician / fk_visits_scribe) — left plain here.
    clinician_id INTEGER NOT NULL,
    scribe_id INTEGER,
    visit_date DATE NOT NULL,
    visit_time VARCHAR(8),
    -- CHECK constraint added later by
    -- migrations/20260210_visits_visit_type_add_other.sql
    visit_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    audio_file TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    -- No later migration adds this FK.
    visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    transcription TEXT,
    ai_draft TEXT,
    final_note TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    -- FK added later by migrations/20260624_foreign_key_constraints.sql
    -- (fk_notes_submitted_by / fk_notes_locked_by) — left plain here.
    submitted_by INTEGER,
    locked_at TIMESTAMPTZ,
    locked_by INTEGER,
    -- No later migration adds this FK (only ever inlined by the runtime
    -- ensureEhrColumns() helper, which no-ops once the column exists).
    ehr_uploaded_at TIMESTAMPTZ,
    ehr_uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    -- UNIQUE required: submitGrade() does ON CONFLICT (note_id) DO UPDATE.
    note_id INTEGER NOT NULL UNIQUE REFERENCES notes(id) ON DELETE CASCADE,
    qps_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    accuracy INTEGER NOT NULL CHECK (accuracy BETWEEN 0 AND 100),
    completeness INTEGER NOT NULL CHECK (completeness BETWEEN 0 AND 100),
    terminology INTEGER NOT NULL CHECK (terminology BETWEEN 0 AND 100),
    formatting INTEGER NOT NULL CHECK (formatting BETWEEN 0 AND 100),
    overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scribe_assignments (
    id SERIAL PRIMARY KEY,
    clinician_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scribe_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- assignments.js relies on a 23505 unique-violation to detect duplicates.
    UNIQUE (clinician_id, scribe_id)
);

CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits (patient_id);
CREATE INDEX IF NOT EXISTS idx_notes_submitted_by ON notes (submitted_by);
CREATE INDEX IF NOT EXISTS idx_grades_qps_id ON grades (qps_id);
