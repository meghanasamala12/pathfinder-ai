#!/bin/bash

# PathFinder AI - Environment Setup Script
# This creates a fresh Python 3.12 virtual environment for the project

echo "🚀 Setting up PathFinder AI environment..."

# Navigate to project root
cd "$(dirname "$0")"

# Check Python version
echo "📋 Checking Python version..."
python3.12 --version || {
    echo "❌ Python 3.12 not found. Please install Python 3.12+"
    exit 1
}

# Create virtual environment with Python 3.12
echo "🔧 Creating virtual environment 'venv-pathfinder'..."
python3.12 -m venv venv-pathfinder

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv-pathfinder/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install backend dependencies
echo "📥 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Go back to root
cd ..

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "To activate this environment in the future, run:"
echo "  source venv-pathfinder/bin/activate"
echo ""
echo "Then navigate to backend and start the server:"
echo "  cd backend"
echo "  uvicorn app.main:app --reload --port 8000"
echo ""
