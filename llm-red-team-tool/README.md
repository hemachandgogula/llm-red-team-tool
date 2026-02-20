# LLM Red Team Tool

A comprehensive AI/ML Model Security Testing Platform for Large Language Models with a Python/FastAPI backend and React+TypeScript dashboard.

## Features

### Vulnerability Detection

| Vulnerability Type | Description |
|---|---|
| **Prompt Injection** | Detects attempts to override model instructions via user input |
| **Jailbreaking** | Identifies roleplay/DAN/override techniques that bypass safety |
| **Data Poisoning** | Probes for backdoor triggers and training-time attacks |
| **Model Inversion** | Tests for training data and system prompt leakage |
| **Membership Inference** | Detects differential confidence signals exposing training data |
| **Adversarial Examples** | Tests robustness against Unicode homoglyphs and text perturbations |
| **Bias & Fairness** | Measures demographic sentiment disparities across groups |

### Platform Capabilities

- 🔑 **Multi-provider support**: OpenAI, Anthropic, Hugging Face, custom OpenAI-compatible endpoints
- 📊 **Risk scoring**: CVSS-inspired 0–10 risk score per test run
- 📋 **Export reports**: CSV and JSON export for each test run
- 🔄 **Background testing**: Long-running tests execute asynchronously
- 🎯 **Interactive testing**: Single-prompt security analysis in real-time
- 🏗️ **Project organisation**: Group test runs by project
- ✅ **False positive marking**: Mark results as false positives

## Architecture

```
llm-red-team-tool/
├── backend/           # Python FastAPI + SQLAlchemy 2.0 + async
│   ├── app/
│   │   ├── api/           # REST API routers
│   │   ├── core/          # Config, security, cache
│   │   ├── db/            # Async database session
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── detectors/         # 7 vulnerability detector modules
│   │   │   └── model_providers/   # OpenAI, Anthropic, HuggingFace, Custom
│   │   └── lib/           # Attack pattern databases
│   ├── alembic/       # Database migrations
│   └── tests/         # pytest test suite
└── frontend/          # React 18 + TypeScript + Vite
    └── src/
        ├── api/       # Axios API clients
        ├── app/       # Router + App providers
        ├── components/ # Reusable UI components
        ├── hooks/     # Custom React hooks
        ├── pages/     # Page components
        ├── store/     # Zustand state management
        ├── types/     # TypeScript types
        └── utils/     # Formatters and helpers
```

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Backend Setup

```bash
cd backend

# Install dependencies
pip install poetry
poetry install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start dev server
npm run dev
```

### Docker Compose (All Services)

```bash
# Copy and edit environment files
cp backend/.env.example backend/.env

# Start all services
docker compose up -d

# Run migrations
docker compose exec backend alembic upgrade head
```

The API will be at `http://localhost:8000` and the frontend at `http://localhost:5173`.

## API Documentation

When the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Usage

1. **Register** an account at `/register`
2. **Add a model config** — provide an API key and model ID for OpenAI, Anthropic, Hugging Face, or a custom endpoint
3. **Create a project** to organise your test campaigns
4. **Run a batch test** — select which vulnerability categories to test
5. **Review findings** — see severity, confidence, evidence, and mitigation for each vulnerability
6. **Interactive test** — paste any prompt and get instant security analysis
7. **Export reports** — download results as CSV or JSON

## Running Tests

```bash
# Backend tests
cd backend
poetry run pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm test
```

## Environment Variables

### Backend (`.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT signing secret | _(required)_ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiry | `30` |
| `OPENAI_API_KEY` | OpenAI API key | _(optional)_ |
| `ANTHROPIC_API_KEY` | Anthropic API key | _(optional)_ |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:5173` |

### Frontend (`.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `/api/v1` |

## Vulnerability Detector Implementation

Each detector in `app/services/detectors/` follows the `BaseDetector` interface:

```python
class BaseDetector(ABC):
    vulnerability_type: str

    async def detect(self, provider, context=None) -> list[DetectionResult]:
        ...
```

Detectors use a combination of:
- **Heuristic pattern matching** — known attack patterns and indicator phrases
- **Black-box probing** — sending crafted prompts and analysing responses
- **Differential analysis** — comparing responses across demographic groups or text variants
- **Consistency testing** — verifying stable safety behaviour across repeated queries

## Adding a New Detector

1. Create `app/services/detectors/my_detector.py` implementing `BaseDetector`
2. Add it to `DETECTOR_MAP` in `app/services/test_orchestrator.py`
3. Add its `VulnerabilityType` entry in `frontend/src/types/index.ts`

## License

MIT
