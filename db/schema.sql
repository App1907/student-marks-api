CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marks (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject    VARCHAR(100) NOT NULL,
  marks      NUMERIC(5, 2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Drop legacy case-sensitive unique constraint if an older schema created it.
ALTER TABLE marks DROP CONSTRAINT IF EXISTS marks_student_subject_unique;

-- One mark per student + subject (case-insensitive subject match).
CREATE UNIQUE INDEX IF NOT EXISTS marks_student_subject_unique
  ON marks (student_id, LOWER(subject));

CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks (student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject ON marks (LOWER(subject));
