# PathFinder AI - Environment Setup Instructions

## 🎯 Quick Setup for Capstone Project

Since you're using Python 3.12 for your capstone, let's create a dedicated environment for this project.

### Option 1: Using the Setup Script (Recommended)

```bash
# Navigate to project directory
cd /Users/vamshikrishnanalla/Downloads/pathfinder-ai

# Make script executable
chmod +x setup_environment.sh

# Run setup script
./setup_environment.sh
```

### Option 2: Manual Setup

```bash
# 1. Navigate to project root
cd /Users/vamshikrishnanalla/Downloads/pathfinder-ai

# 2. Create virtual environment with Python 3.12
python3.12 -m venv venv-pathfinder

# 3. Activate the environment
source venv-pathfinder/bin/activate

# 4. Upgrade pip
pip install --upgrade pip

# 5. Navigate to backend and install dependencies
cd backend
pip install -r requirements.txt

# 6. Go back to root
cd ..
```

## ✅ Verify Installation

After setup, verify everything works:

```bash
# Activate environment
source venv-pathfinder/bin/activate

# Check Python version (should show 3.12)
python --version

# Check pip version
pip --version

# Verify key packages are installed
pip list | grep -E "(fastapi|uvicorn|sqlalchemy)"
```

## 🚀 Starting the Application

### Terminal 1: Backend
```bash
cd /Users/vamshikrishnanalla/Downloads/pathfinder-ai
source venv-pathfinder/bin/activate
cd backend

# Configure environment (if not done already)
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start backend
uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd /Users/vamshikrishnanalla/Downloads/pathfinder-ai/frontend
npm install
npm run dev
```

## 📝 Important Notes

1. **Environment Name**: The virtual environment is named `venv-pathfinder` to avoid conflicts with your other projects.

2. **Python Version**: This uses Python 3.12 specifically, which is perfect for your capstone.

3. **Activation**: Always activate the environment before working on the project:
   ```bash
   source venv-pathfinder/bin/activate
   ```

4. **Deactivation**: When done, deactivate:
   ```bash
   deactivate
   ```

5. **Requirements File Location**: The `requirements.txt` is in the `backend/` directory, not the root.

## 🔧 Troubleshooting

### "requirements.txt not found"
**Solution**: Make sure you're in the `backend/` directory:
```bash
cd backend
pip install -r requirements.txt
```

### "Python 3.12 not found"
**Solution**: Install Python 3.12 or use your system Python:
```bash
python3 -m venv venv-pathfinder
```

### "Permission denied" errors
**Solution**: The old venv might be locked. Just create a new one with a different name:
```bash
python3.12 -m venv venv-pathfinder-new
```

## 🎓 For Your Capstone

This setup gives you:
- ✅ Isolated environment (won't affect other projects)
- ✅ Python 3.12 (latest version)
- ✅ All dependencies installed
- ✅ Ready to develop and demo

## 📚 Next Steps

1. ✅ Set up environment (you're here!)
2. ⏭️ Configure `.env` file with API keys
3. ⏭️ Set up PostgreSQL database
4. ⏭️ Start backend and frontend
5. ⏭️ Test the application

See `QUICK_START.md` for the next steps!
