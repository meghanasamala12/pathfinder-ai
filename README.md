# PathFinder AI - Career Navigation Platform

A comprehensive AI-powered career navigation platform that combines resume analysis, gap analysis, career pathing, and alumni networking.

## 🚀 Quick Start Guide

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)
- Groq API key (or OpenAI/VertexAI)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb pathfinder_ai
   
   # Run migrations
   psql -U postgres -d pathfinder_ai -f database/migrations/001_initial_schema.sql
   ```

6. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
pathfinder-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── database/         # Database models and migrations
│   │   ├── services/         # Business logic services
│   │   │   ├── resume/       # Resume parsing and analysis
│   │   │   ├── career/       # Career analytics and RAG
│   │   │   ├── embeddings/   # Embedding generation
│   │   │   └── llm/          # LLM interactions
│   │   ├── config.py        # Configuration
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/            # React pages
    │   ├── services/         # API services
    │   └── App.tsx
    └── package.json
```

## 🔑 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/pathfinder_ai

# AI APIs (at least one required)
GROQ_API_KEY=your-groq-api-key
# OR
OPENAI_API_KEY=your-openai-api-key
# OR
GOOGLE_API_KEY=your-google-api-key

# JWT
SECRET_KEY=your-secret-key-min-32-chars
```

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Upload Resume
```bash
curl -X POST "http://localhost:8000/api/v1/resume/upload" \
  -F "file=@your_resume.pdf"
```

### 3. Get Career Insights
```bash
curl -X POST "http://localhost:8000/api/v1/career/insights" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Your resume text here...",
    "user_query": "What career paths suit me?"
  }'
```

## 📚 API Endpoints

### Resume Analysis
- `POST /api/v1/resume/upload` - Upload and analyze resume
- `POST /api/v1/resume/gap-analysis` - Analyze gap between resume and JD
- `GET /api/v1/resume/{resume_id}` - Get resume analysis

### Career Analytics
- `POST /api/v1/career/insights` - Get career insights
- `POST /api/v1/career/skill-demand` - Analyze skill demand
- `POST /api/v1/career/salary-insights` - Get salary insights
- `POST /api/v1/career/roadmap` - Generate career roadmap
- `GET /api/v1/career/jobs/search` - Search jobs

### Alumni Network
- `GET /api/v1/alumni` - List alumni
- `GET /api/v1/alumni/{alumni_id}` - Get alumni details
- `POST /api/v1/alumni/match` - Match students with alumni
- `GET /api/v1/alumni/job-openings` - List job openings

### Students
- `GET /api/v1/students/{student_id}` - Get student profile
- `POST /api/v1/students/mentorship/request` - Request mentorship

## 🛠️ Development

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

## 📝 Notes

- The RAG engine requires job data CSV file. Place it in `backend/data/jobs.csv` or set `JOBS_CSV_PATH` in `.env`
- ChromaDB will be created automatically in `backend/chroma_db/` directory
- Uploaded resumes are stored in `backend/uploads/` directory

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb pathfinder_ai`

### API Key Issues
- Ensure at least one AI API key is configured (Groq, OpenAI, or Google)
- Groq API is free and recommended for development

### Import Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version: `python --version` (should be 3.11+)

## 📄 License

MIT License
