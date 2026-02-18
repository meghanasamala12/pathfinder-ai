# PathFinder AI - Complete Startup Guide

This guide will walk you through setting up and running PathFinder AI from scratch.

## Step-by-Step Setup

### Step 1: Install Prerequisites

#### Install Python 3.11+
```bash
# Check Python version
python --version  # Should be 3.11 or higher

# If not installed, download from python.org
```

#### Install Node.js 18+
```bash
# Check Node version
node --version  # Should be 18 or higher

# If not installed, download from nodejs.org
```

#### Install PostgreSQL
```bash
# macOS (using Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows: Download from postgresql.org
```

#### Install Redis (Optional, for caching)
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

### Step 2: Clone/Setup Project

```bash
# Navigate to project directory
cd pathfinder-ai
```

### Step 3: Backend Setup

#### 3.1 Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

#### 3.2 Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Note**: If you encounter errors with some packages:
- `opencv-python` and `pytesseract` are optional (for OCR)
- You can comment them out if not needed
- For OCR, you may also need to install Tesseract:
  ```bash
  # macOS
  brew install tesseract
  
  # Ubuntu
  sudo apt-get install tesseract-ocr
  ```

#### 3.3 Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

**Minimum required configuration**:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/pathfinder_ai
GROQ_API_KEY=your-groq-api-key-here
SECRET_KEY=your-secret-key-minimum-32-characters-long
```

**Get Groq API Key** (Free):
1. Go to https://console.groq.com/
2. Sign up/login
3. Go to API Keys section
4. Create a new API key
5. Copy and paste into `.env`

#### 3.4 Set Up Database
```bash
# Create database
createdb pathfinder_ai

# Or using psql:
psql -U postgres
CREATE DATABASE pathfinder_ai;
\q

# Run migrations
psql -U postgres -d pathfinder_ai -f database/migrations/001_initial_schema.sql
```

#### 3.5 Create Required Directories
```bash
# Create uploads directory
mkdir -p uploads

# Create chroma_db directory (will be created automatically, but you can pre-create)
mkdir -p chroma_db

# Create data directory for job CSV (optional)
mkdir -p data
```

### Step 4: Frontend Setup

#### 4.1 Install Node Dependencies
```bash
# From project root
cd frontend
npm install
```

#### 4.2 Configure Frontend (if needed)
The frontend is pre-configured to connect to `http://localhost:8000`. 
If your backend runs on a different port, update `frontend/src/services/api/resume.ts`

### Step 5: Start the Application

#### Terminal 1: Start Backend
```bash
cd backend
source venv/bin/activate  # If not already activated
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

#### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 6: Verify Installation

#### 6.1 Check Backend Health
Open browser or use curl:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

#### 6.2 Check API Documentation
Open in browser: `http://localhost:8000/docs`

You should see the Swagger UI with all available endpoints.

#### 6.3 Check Frontend
Open in browser: `http://localhost:5173`

You should see the PathFinder AI dashboard.

### Step 7: Test Resume Upload

1. **Prepare a PDF resume** (or use any PDF file for testing)

2. **Using the Frontend**:
   - Go to `http://localhost:5173/resume`
   - Click "Upload Resume"
   - Select a PDF file
   - Click "Analyze Resume"

3. **Using curl** (alternative):
   ```bash
   curl -X POST "http://localhost:8000/api/v1/resume/upload" \
     -F "file=@/path/to/your/resume.pdf"
   ```

### Step 8: (Optional) Add Job Data for RAG

To enable job search and career insights:

1. **Get job data CSV**:
   - You can use the jobs.csv from AI-Resume-Summarizer repo
   - Or create your own with columns: Job Title, Key Skills, Job Experience Required, Role Category, Industry, Job Salary

2. **Place CSV file**:
   ```bash
   # Option 1: Place in backend/data/jobs.csv
   cp /path/to/jobs.csv backend/data/jobs.csv
   
   # Option 2: Update .env with custom path
   # JOBS_CSV_PATH=/path/to/jobs.csv
   ```

3. **Restart backend** - The RAG engine will automatically create the vector database on first use.

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: 
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Database connection error
**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in .env
3. Ensure database exists: `psql -l | grep pathfinder_ai`

### Issue: "GROQ_API_KEY not found"
**Solution**:
1. Get free API key from https://console.groq.com/
2. Add to `.env` file: `GROQ_API_KEY=your-key-here`
3. Restart backend server

### Issue: Port already in use
**Solution**:
```bash
# Change port in backend
uvicorn app.main:app --reload --port 8001

# Update frontend API URL accordingly
```

### Issue: CORS errors in browser
**Solution**:
- Check `CORS_ORIGINS` in backend `.env`
- Ensure frontend URL is included: `http://localhost:5173`

### Issue: File upload fails
**Solution**:
- Check file size (max 10MB)
- Ensure file is PDF format
- Check `uploads/` directory exists and is writable

## Next Steps

1. **Explore API Documentation**: Visit `http://localhost:8000/docs`
2. **Try Different Endpoints**: Test career insights, alumni matching, etc.
3. **Customize Configuration**: Adjust settings in `.env`
4. **Add Job Data**: Import job listings for better RAG results
5. **Develop Features**: Start building on top of the foundation

## Development Tips

- **Backend Hot Reload**: Already enabled with `--reload` flag
- **Frontend Hot Reload**: Vite automatically reloads on file changes
- **Database Changes**: Update models in `app/database/models/` and create new migrations
- **API Changes**: Add endpoints in `app/api/v1/`
- **Frontend Changes**: Add pages in `frontend/src/pages/`

## Production Deployment

For production deployment:

1. **Set DEBUG=False** in `.env`
2. **Use proper SECRET_KEY** (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
3. **Set up proper CORS_ORIGINS**
4. **Use production database** (not localhost)
5. **Set up SSL/HTTPS**
6. **Use process manager** (PM2, systemd, etc.)
7. **Set up reverse proxy** (Nginx)

## Support

If you encounter issues:
1. Check logs in terminal
2. Verify all prerequisites are installed
3. Ensure environment variables are set correctly
4. Check database connection
5. Verify API keys are valid

## Success Indicators

✅ Backend runs without errors on port 8000  
✅ Frontend loads on port 5173  
✅ Health check returns `{"status": "healthy"}`  
✅ API docs accessible at `/docs`  
✅ Resume upload works  
✅ No CORS errors in browser console  

You're all set! 🎉
