-- Coach Database Schema
-- Initial migration

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    year_of_study INTEGER,
    specialty_interest VARCHAR(100),
    hashed_password VARCHAR(255),
    azure_ad_oid VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_scenarios_completed INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0,
    skill_levels JSONB DEFAULT '{}'::jsonb
);

-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    specialty VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'intermediate',
    status VARCHAR(20) DEFAULT 'draft',
    patient_profile JSONB NOT NULL,
    dialogue_tree JSONB NOT NULL,
    learning_objectives JSONB DEFAULT '[]'::jsonb,
    correct_diagnosis VARCHAR(255),
    differential_diagnoses JSONB DEFAULT '[]'::jsonb,
    clare_guidelines JSONB DEFAULT '[]'::jsonb,
    clare_guideline_urls JSONB DEFAULT '[]'::jsonb,
    assessment_rubric JSONB NOT NULL,
    source_clark_consultation_id VARCHAR(255),
    created_by VARCHAR(255),
    reviewed_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    times_played INTEGER DEFAULT 0,
    average_score INTEGER,
    average_completion_time INTEGER
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    scenario_id INTEGER NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER,
    transcript JSONB DEFAULT '[]'::jsonb,
    current_node_id VARCHAR(100),
    nodes_visited JSONB DEFAULT '[]'::jsonb,
    topics_covered JSONB DEFAULT '[]'::jsonb,
    red_flags_identified JSONB DEFAULT '[]'::jsonb,
    questions_asked INTEGER DEFAULT 0,
    relevant_questions INTEGER DEFAULT 0,
    time_to_diagnosis INTEGER,
    diagnosis_submitted VARCHAR(255),
    diagnosis_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    assessment_id VARCHAR(100) UNIQUE NOT NULL,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    history_taking_score INTEGER,
    clinical_reasoning_score INTEGER,
    management_score INTEGER,
    communication_score INTEGER,
    efficiency_score INTEGER,
    metrics JSONB DEFAULT '{}'::jsonb,
    skills_breakdown JSONB DEFAULT '{}'::jsonb,
    feedback_summary TEXT,
    strengths JSONB DEFAULT '[]'::jsonb,
    areas_for_improvement JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create skill_progress table
CREATE TABLE IF NOT EXISTS skill_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    current_level INTEGER DEFAULT 0,
    previous_level INTEGER,
    trend VARCHAR(20),
    sessions_count INTEGER DEFAULT 0,
    last_score INTEGER,
    average_score INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_name)
);

-- Create conversation_messages table (optional, for detailed logging)
CREATE TABLE IF NOT EXISTS conversation_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audio_url VARCHAR(500),
    audio_duration INTEGER,
    node_id VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_azure_ad_oid ON students(azure_ad_oid);
CREATE INDEX IF NOT EXISTS idx_scenarios_scenario_id ON scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_specialty ON scenarios(specialty);
CREATE INDEX IF NOT EXISTS idx_scenarios_difficulty ON scenarios(difficulty);
CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scenario_id ON sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_assessments_assessment_id ON assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_student_id ON skill_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_progress_updated_at BEFORE UPDATE ON skill_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample demo user
INSERT INTO students (email, full_name, institution, year_of_study, is_active, is_verified)
VALUES ('demo@medical-student.edu', 'Demo Student', 'Demo Medical School', 3, TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Database schema created successfully!' AS status;
