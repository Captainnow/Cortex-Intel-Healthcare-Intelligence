#!/bin/bash
# AHIP v2 - 100% FREE Setup Script
# No paid APIs, no subscriptions required

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     AHIP v2 - FREE Healthcare AI Setup                    ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Check Python
python3 --version || { echo "❌ Python 3 not found"; exit 1; }

# Check Node.js
node --version || { echo "❌ Node.js not found. Install from https://nodejs.org/"; exit 1; }

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend
npm install
cd ..

# Create .env file
echo ""
echo "📝 Creating .env file..."
cat > .env << EOF
# FREE AI Providers - Pick one (all are free)
# GROQ_API_KEY=your_groq_key_here  # Get free at https://console.groq.com/
# HF_TOKEN=your_huggingface_token    # Get free at https://huggingface.co/settings/tokens
# OLLAMA_URL=http://localhost:11434  # For local Ollama

# Database
DB_PATH=ahip_warehouse.db

# API
API_HOST=0.0.0.0
API_PORT=8000
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the platform:"
echo "   Terminal 1: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 Access:"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🤖 FREE AI Setup:"
echo "   1. Groq (Recommended): https://console.groq.com/ - Free, no credit card"
echo "   2. Ollama (Local): https://ollama.com/ - 100% offline"
echo "   3. HuggingFace: https://huggingface.co/join - Free tier"
