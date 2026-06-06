# Cortex Intel - Healthcare Intelligence Platform
## 100% FREE - No Paid APIs, No Subscriptions

### Overview
Cortex Intel is a completely free healthcare analytics platform using only open data sources and free AI services.

### Data Sources (All FREE)
| Source | API | Cost | Records |
|--------|-----|------|---------|
| FDA Recalls | openFDA | $0.00 | 100+ (Live) |
| FDA Enforcement | openFDA | $0.00 | 50+ (Live) |
| WHO Health | GHO API | $0.00 | 6 indicators |
| Patient Risk | UCI ML Repo + Kaggle | $0.00 | 6,581 |

### AI Services (All FREE)
| Provider | Tier | Cost | Limits |
|----------|------|------|--------|
| Gemini 2.5 | Free | $0.00 | Generous Free Tier |
| Groq API | Free | $0.00 | 20 req/min, 1M tokens/day |
| Ollama | Local | $0.00 | Unlimited |
| scikit-learn | Open Source | $0.00 | Unlimited |

### Quick Start
```bash
# 1. Clone and enter directory
cd ahip-v2

# 2. Start backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- API: http://localhost:8000

### Features
- ✅ Real-time FDA device recall tracking (live openFDA integration)
- ✅ WHO health indicators comparative analysis
- ✅ Patient risk prediction (Heart Disease & Diabetes)
- ✅ **Cortex Intelligence Copilot** for natural language insights
- ✅ Pristine, professional **Light Mode SaaS** dashboard design
- ✅ 100% free with open data sources
