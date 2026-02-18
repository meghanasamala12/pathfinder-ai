-- Initial database schema for PathFinder AI
-- Alumni Network tables

-- Alumni table
CREATE TABLE IF NOT EXISTS alumni (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    batch VARCHAR(50),
    degree VARCHAR(255),
    department VARCHAR(255),
    contact_no VARCHAR(20),
    date_of_birth DATE,
    specialization VARCHAR(255),
    current_job VARCHAR(255),
    company_name VARCHAR(255),
    industry VARCHAR(255),
    experience VARCHAR(50),
    skills TEXT,
    linkedin_profile VARCHAR(500),
    github_profile VARCHAR(500),
    mentorship_availability BOOLEAN DEFAULT TRUE,
    area_of_interest TEXT,
    webinars_participation BOOLEAN DEFAULT TRUE,
    current_city VARCHAR(255),
    current_country VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alumni_email ON alumni(email);
CREATE INDEX IF NOT EXISTS idx_alumni_industry ON alumni(industry);
CREATE INDEX IF NOT EXISTS idx_alumni_mentorship ON alumni(mentorship_availability);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255),
    avatar VARCHAR(500),
    date_of_birth DATE,
    contact_number VARCHAR(20),
    address TEXT,
    roll_number VARCHAR(255),
    batch VARCHAR(50),
    degree VARCHAR(255),
    department VARCHAR(255),
    current_semester INTEGER,
    cgpa VARCHAR(10),
    interests TEXT,
    skills TEXT,
    programming_languages TEXT,
    linkedin_profile VARCHAR(500),
    github_profile VARCHAR(500),
    personal_website VARCHAR(500),
    certifications TEXT,
    internships_status VARCHAR(50),
    internships_experience TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Mentorships table
CREATE TABLE IF NOT EXISTS mentorships (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    mentor_id INTEGER REFERENCES alumni(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    notes TEXT,
    UNIQUE(student_id, mentor_id)
);

CREATE INDEX IF NOT EXISTS idx_mentorships_student ON mentorships(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);

-- Job openings table
CREATE TABLE IF NOT EXISTS job_openings (
    id SERIAL PRIMARY KEY,
    posted_by_alumni_id INTEGER REFERENCES alumni(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    description TEXT,
    required_skills TEXT,
    experience_required VARCHAR(50),
    location VARCHAR(255),
    job_type VARCHAR(50),
    salary_range VARCHAR(100),
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_openings_alumni ON job_openings(posted_by_alumni_id);
CREATE INDEX IF NOT EXISTS idx_job_openings_active ON job_openings(is_active);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50),
    hosted_by_alumni_id INTEGER REFERENCES alumni(id),
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER,
    meeting_link VARCHAR(500),
    max_participants INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_alumni ON events(hosted_by_alumni_id);
CREATE INDEX IF NOT EXISTS idx_events_scheduled ON events(scheduled_at);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_type VARCHAR(20),
    caption TEXT,
    photo1 VARCHAR(500),
    photo2 VARCHAR(500),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    mentorship_id INTEGER REFERENCES mentorships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_by_alumni_id INTEGER REFERENCES alumni(id),
    assigned_to_student_id INTEGER REFERENCES students(id),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    completion_notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_mentorship ON tasks(mentorship_id);
CREATE INDEX IF NOT EXISTS idx_tasks_student ON tasks(assigned_to_student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
