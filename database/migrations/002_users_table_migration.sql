-- Coach AI Database Schema Migration
-- Migration 002: Rename students to users and add new fields
-- Date: 2025-11-28
--
-- IMPORTANT: Run this in a transaction and backup data first
-- This migration:
-- 1. Creates experience_level and user_role enums
-- 2. Adds new columns (username, first_name, last_name, experience_level, role)
-- 3. Migrates existing data from full_name to first_name/last_name
-- 4. Renames students table to users
-- 5. Updates all foreign key references

BEGIN;

-- Step 1: Create the experience_level and user_role enums
DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM (
        'medical_student',
        'physician_under_5_years',
        'physician_over_5_years'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'user',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new columns to students table BEFORE renaming
ALTER TABLE students
    ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS experience_level experience_level,
    ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Step 3: Migrate existing data - split full_name into first_name and last_name
-- Generate username from email (replace @ and . with _)
UPDATE students SET
    first_name = COALESCE(SPLIT_PART(full_name, ' ', 1), 'Unknown'),
    last_name = CASE
        WHEN POSITION(' ' IN full_name) > 0
        THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
        ELSE ''
    END,
    username = COALESCE(
        username,
        LOWER(REPLACE(REPLACE(REPLACE(email, '@', '_'), '.', '_'), '+', '_'))
    ),
    experience_level = COALESCE(experience_level, 'medical_student'),
    role = COALESCE(role, 'user')
WHERE first_name IS NULL OR username IS NULL;

-- Step 4: Make new required columns NOT NULL after data migration
ALTER TABLE students
    ALTER COLUMN username SET NOT NULL,
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name SET NOT NULL,
    ALTER COLUMN experience_level SET NOT NULL;

-- Step 5: Drop the old full_name column (optional - can keep for backwards compatibility)
ALTER TABLE students DROP COLUMN IF EXISTS full_name;

-- Step 6: Rename the table from students to users
ALTER TABLE IF EXISTS students RENAME TO users;

-- Step 7: Update foreign key references in other tables
-- Note: PostgreSQL automatically updates FK references when renaming a table,
-- but we need to rename the columns for clarity

-- Sessions table: rename student_id to user_id
DO $$ BEGIN
    ALTER TABLE sessions RENAME COLUMN student_id TO user_id;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Assessments table: rename student_id to user_id
DO $$ BEGIN
    ALTER TABLE assessments RENAME COLUMN student_id TO user_id;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Skill progress table: rename student_id to user_id
DO $$ BEGIN
    ALTER TABLE skill_progress RENAME COLUMN student_id TO user_id;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Step 8: Update indexes
-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_students_email;
DROP INDEX IF EXISTS idx_students_azure_ad_oid;
DROP INDEX IF EXISTS idx_sessions_student_id;
DROP INDEX IF EXISTS idx_assessments_student_id;
DROP INDEX IF EXISTS idx_skill_progress_student_id;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_azure_ad_oid ON users(azure_ad_oid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON users(experience_level);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_user_id ON skill_progress(user_id);

-- Step 9: Update triggers (rename trigger if needed)
DROP TRIGGER IF EXISTS update_students_updated_at ON users;

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Update unique constraints
-- Drop old constraint on skill_progress if exists
DO $$ BEGIN
    ALTER TABLE skill_progress DROP CONSTRAINT IF EXISTS skill_progress_student_id_skill_name_key;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Add new constraint
DO $$ BEGIN
    ALTER TABLE skill_progress ADD CONSTRAINT skill_progress_user_id_skill_name_key
        UNIQUE(user_id, skill_name);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 11: Update demo user with new structure
UPDATE users SET
    first_name = 'Demo',
    last_name = 'Student',
    username = 'demo_student',
    experience_level = 'medical_student',
    role = 'user'
WHERE email = 'demo@medical-student.edu';

COMMIT;

-- Verification queries (run after migration to verify)
-- SELECT COUNT(*) FROM users;
-- SELECT username, first_name, last_name, experience_level, role FROM users LIMIT 5;
-- \d users
