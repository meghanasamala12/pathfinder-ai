-- Add salary column to pathfinder_jobs
ALTER TABLE pathfinder_jobs ADD COLUMN IF NOT EXISTS salary VARCHAR(255);

-- Add sample internship jobs with salary (skip if Google intern already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pathfinder_jobs WHERE company = 'Google' AND title LIKE '%Intern%') THEN
    INSERT INTO pathfinder_jobs (title, company, description, required_skills, location, job_type, industry, salary)
    VALUES
    ('Software Engineering Intern', 'Google', 'Work on cutting-edge projects with world-class engineers. Focus on full-stack development and scalable systems.', 'JavaScript, Python, Data Structures, System Design, React', 'Mountain View, CA', 'Internship', 'Technology', '$7,000 - $9,000/month'),
    ('Full-Stack Developer Intern', 'Microsoft', 'Build cloud-native applications using Azure services. Collaborate on enterprise-scale projects.', 'TypeScript, C#, Azure, React, SQL', 'Redmond, WA', 'Internship', 'Technology', '$6,500 - $8,500/month'),
    ('Data Science Intern', 'Meta', 'Analyze large-scale data and build ML models for product insights.', 'Python, SQL, Machine Learning, Statistics, PyTorch', 'Menlo Park, CA', 'Internship', 'Technology', '$7,500 - $9,500/month'),
    ('Backend Engineer Intern', 'Amazon', 'Develop scalable backend services for e-commerce and AWS.', 'Java, Python, AWS, Distributed Systems', 'Seattle, WA', 'Internship', 'Technology', '$6,800 - $8,800/month'),
    ('Frontend Engineer Intern', 'Netflix', 'Build responsive UIs for streaming experiences.', 'React, TypeScript, CSS, JavaScript', 'Los Gatos, CA', 'Internship', 'Technology', '$7,200 - $9,200/month'),
    ('ML Engineer Intern', 'NVIDIA', 'Work on GPU-accelerated ML pipelines and AI inference.', 'Python, PyTorch, CUDA, Deep Learning', 'Santa Clara, CA', 'Internship', 'Technology', '$8,000 - $10,000/month');
  END IF;
END $$;
