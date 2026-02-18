-- PathFinder Profile & Jobs schema
-- Run: psql -U postgres -d pathfinder_ai -f database/migrations/002_pathfinder_profile.sql

-- Users (linked to auth by email)
CREATE TABLE IF NOT EXISTS pathfinder_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pathfinder_users_email ON pathfinder_users(email);

-- User profiles (name, title, skills from resume)
CREATE TABLE IF NOT EXISTS pathfinder_user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES pathfinder_users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    academic_title VARCHAR(500),
    resume_text TEXT,
    technical_skills JSONB DEFAULT '[]',
    soft_skills JSONB DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_pathfinder_user_profiles_user ON pathfinder_user_profiles(user_id);

-- Uploaded documents metadata
CREATE TABLE IF NOT EXISTS pathfinder_user_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES pathfinder_users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000),
    extracted_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pathfinder_user_documents_user ON pathfinder_user_documents(user_id);

-- Coursework
CREATE TABLE IF NOT EXISTS pathfinder_user_coursework (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES pathfinder_users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    term VARCHAR(100),
    grade VARCHAR(50),
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pathfinder_user_coursework_user ON pathfinder_user_coursework(user_id);

-- Projects
CREATE TABLE IF NOT EXISTS pathfinder_user_projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES pathfinder_users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    technologies JSONB DEFAULT '[]',
    date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pathfinder_user_projects_user ON pathfinder_user_projects(user_id);

-- Career interests
CREATE TABLE IF NOT EXISTS pathfinder_user_career_interests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES pathfinder_users(id) ON DELETE CASCADE,
    interest VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pathfinder_user_career_interests_user ON pathfinder_user_career_interests(user_id);

-- Jobs for matching
CREATE TABLE IF NOT EXISTS pathfinder_jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    company VARCHAR(255),
    description TEXT,
    required_skills TEXT,
    location VARCHAR(255),
    job_type VARCHAR(100),
    industry VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pathfinder_jobs_title ON pathfinder_jobs(title);
CREATE INDEX IF NOT EXISTS idx_pathfinder_jobs_skills ON pathfinder_jobs USING gin(to_tsvector('english', coalesce(required_skills, '') || ' ' || coalesce(title, '') || ' ' || coalesce(description, '')));

-- Seed sample jobs (run once; skip if table has data)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pathfinder_jobs LIMIT 1) THEN
    INSERT INTO pathfinder_jobs (title, company, description, required_skills, location, job_type, industry)
    VALUES
    ('Data Engineer', 'Tech Corp', 'Build and maintain data pipelines for analytics.', 'Python, SQL, Apache Spark, ETL, Airflow', 'Remote', 'Full-time', 'Technology'),
    ('Machine Learning Engineer', 'AI Solutions', 'Develop ML models for product recommendations.', 'Python, TensorFlow, scikit-learn, NLP', 'San Francisco', 'Full-time', 'Technology'),
    ('Software Developer', 'StartupXYZ', 'Full-stack development for web applications.', 'JavaScript, React, Node.js, Python', 'New York', 'Full-time', 'Technology'),
    ('Data Analyst', 'Finance Inc', 'Analyze data and create reports for business insights.', 'SQL, Python, Pandas, Excel, Tableau', 'Chicago', 'Full-time', 'Finance'),
    ('Backend Engineer', 'Cloud Services', 'Design and implement scalable backend services.', 'Java, Python, AWS, Kafka, PostgreSQL', 'Seattle', 'Full-time', 'Technology'),
    ('Product Manager', 'E-commerce Co', 'Own product roadmap and work with engineering teams.', 'Product management, SQL, Agile, JIRA', 'Boston', 'Full-time', 'Technology'),
    ('Data Scientist', 'Healthcare Co', 'Build predictive models for patient outcomes.', 'Python, R, scikit-learn, Statistics, SQL', 'Austin', 'Full-time', 'Healthcare'),
    ('Frontend Developer', 'Media Corp', 'Build responsive and accessible web interfaces.', 'React, TypeScript, CSS, JavaScript', 'Los Angeles', 'Full-time', 'Technology'),
    ('Database Administrator', 'Enterprise Inc', 'Manage and optimize database systems.', 'MySQL, PostgreSQL, Database Design, Snowflake', 'Denver', 'Full-time', 'Technology'),
    ('Analytics Engineer', 'Retail Co', 'Create data models and transform raw data.', 'dbt, SQL, Python, Airflow, Redshift', 'Atlanta', 'Full-time', 'Retail');
  END IF;
END $$;
