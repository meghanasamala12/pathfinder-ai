# Database Migrations

Run migrations in order to set up the database schema.

## Prerequisites

- PostgreSQL 14+ running
- Database `pathfinder_ai` created: `createdb pathfinder_ai`

## Run migrations

```bash
# From project root
psql -U postgres -d pathfinder_ai -f backend/database/migrations/001_initial_schema.sql
psql -U postgres -d pathfinder_ai -f backend/database/migrations/002_pathfinder_profile.sql
psql -U postgres -d pathfinder_ai -f backend/database/migrations/003_add_job_salary.sql
```

The second migration (`002_pathfinder_profile.sql`) creates:
- `pathfinder_users` - users linked by email
- `pathfinder_user_profiles` - name, skills from resume
- `pathfinder_user_documents` - uploaded file metadata
- `pathfinder_user_coursework` - courses
- `pathfinder_user_projects` - projects
- `pathfinder_user_career_interests` - career interests
- `pathfinder_jobs` - job listings (with sample data)

The third migration (`003_add_job_salary.sql`) adds:
- `salary` column to `pathfinder_jobs`
- Sample internship jobs (Google, Microsoft, Meta, Amazon, Netflix, NVIDIA) with salary ranges

After running migrations, the backend will persist profile data and serve related jobs with match scores and salary on the Career Matches page.
