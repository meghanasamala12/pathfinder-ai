# PathFinder AI - Quick Start Guide

## 🚀 Fastest Way to Get Started

### Prerequisites Check
```bash
python --version  # Need 3.11+
node --version    # Need 18+
psql --version    # Need PostgreSQL
```

### 1. Backend Setup (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY (get free key from https://console.groq.com/)

# Create database
createdb pathfinder_ai
psql -U postgres -d pathfinder_ai -f database/migrations/001_initial_schema.sql

# Start backend
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup (2 minutes)

```bash
cd frontend
npm install
npm run dev
```

### 3. Verify It Works

1. **Backend**: Open http://localhost:8000/docs
2. **Frontend**: Open http://localhost:5173
3. **Test Upload**: Go to http://localhost:5173/resume and upload a PDF

## ✅ Success Checklist

- [ ] Backend runs on port 8000
- [ ] Frontend runs on port 5173
- [ ] API docs accessible at /docs
- [ ] Can upload resume successfully
- [ ] No errors in terminal

## 🆘 Quick Troubleshooting

**"Module not found"**: `pip install -r requirements.txt`  
**"Database error"**: Check PostgreSQL is running  
**"API key error"**: Add GROQ_API_KEY to .env  
**"Port in use"**: Change port in command  

## 📖 Full Documentation

See `STARTUP_GUIDE.md` for detailed instructions.
