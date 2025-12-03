# Coach - Development Guide

Guide for developers working on Coach.

---

## 🛠️ Development Setup

### Prerequisites

- **Docker Desktop** (recommended) OR
- **Node.js 18+** and **Python 3.11+**
- **Git**
- **VS Code** (recommended) with extensions:
  - Python
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense

### Quick Start (Docker)

```bash
# Clone repository
git clone https://github.com/AMoukli/Coach.git
cd Coach

# Copy environment file
cp .env.example .env
# Edit .env with your Azure credentials

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Local Development (Without Docker)

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run database (Docker)
docker run -d \
  --name coach-postgres \
  -e POSTGRES_USER=coach_user \
  -e POSTGRES_PASSWORD=coach_password \
  -e POSTGRES_DB=coach_db \
  -p 5432:5432 \
  postgres:15-alpine

# Run migrations
psql $DATABASE_URL -f ../database/migrations/001_initial_schema.sql

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at http://localhost:8000

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

---

## 📁 Project Structure

```
Coach/
├── backend/
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   │   ├── scenarios.py
│   │   │   ├── sessions.py
│   │   │   ├── assessments.py
│   │   │   ├── voice.py
│   │   │   └── analytics.py
│   │   ├── core/             # Core configuration
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── azure_services.py
│   │   ├── models/           # Database models
│   │   │   ├── student.py
│   │   │   ├── scenario.py
│   │   │   ├── session.py
│   │   │   └── assessment.py
│   │   ├── services/         # Business logic
│   │   │   ├── scenario_engine.py
│   │   │   ├── assessment_engine.py
│   │   │   ├── clark_integration.py
│   │   │   └── clare_integration.py
│   │   └── main.py           # FastAPI app
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard/
│   │   │   ├── ScenarioLibrary/
│   │   │   ├── ScenarioPlayer/
│   │   │   ├── Assessment/
│   │   │   └── Layout/
│   │   ├── services/         # API clients
│   │   │   ├── api.ts
│   │   │   ├── websocket.ts
│   │   │   ├── audio.ts
│   │   │   └── auth.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
│
├── database/
│   └── migrations/           # SQL migration files
│
└── docs/                     # Documentation
```

---

## 🔄 Development Workflow

### 1. Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

Follow coding standards (see below)

### 3. Test Changes

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test

# Linting
npm run lint
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add scenario filtering by difficulty"

# Follow conventional commits:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
# chore: maintenance
```

### 5. Push and Create PR

```bash
# Push branch
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 📝 Coding Standards

### Python (Backend)

**Style Guide:** PEP 8

```python
# Good
def calculate_assessment_score(
    session_data: Dict[str, Any],
    rubric: Dict[str, Any]
) -> int:
    """
    Calculate overall assessment score.

    Args:
        session_data: Student session data
        rubric: Assessment rubric

    Returns:
        Overall score (0-100)
    """
    # Implementation
    pass

# Use type hints
# Docstrings for all functions
# Max line length: 100 characters
# Use f-strings for formatting
```

**Tools:**
```bash
# Format code
black backend/app

# Lint code
flake8 backend/app

# Type checking
mypy backend/app
```

### TypeScript (Frontend)

**Style Guide:** Airbnb + TypeScript

```typescript
// Good
interface ScenarioProps {
  scenarioId: string
  onComplete: (score: number) => void
}

const ScenarioPlayer: React.FC<ScenarioProps> = ({ scenarioId, onComplete }) => {
  // Use functional components
  // TypeScript interfaces for props
  // Descriptive variable names
  // Arrow functions
}

// Use TypeScript strict mode
// Prefer const over let
// Avoid any type
// Use async/await over promises
```

**Tools:**
```bash
# Format code
npm run format

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Database

**Naming Conventions:**
- Tables: lowercase with underscores (`student_progress`)
- Columns: lowercase with underscores (`created_at`)
- Foreign keys: `{table}_id` (`student_id`)
- Indexes: `idx_{table}_{column}` (`idx_students_email`)

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
```
feat(scenarios): add difficulty filtering
fix(auth): resolve token expiration issue
docs(api): update API reference for voice endpoints
```

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_scenarios.py

# Run specific test
pytest tests/test_scenarios.py::test_create_scenario
```

**Test Structure:**
```python
# tests/test_scenarios.py
import pytest
from app.services.scenario_engine import ScenarioEngine

def test_scenario_engine_initialization():
    """Test ScenarioEngine initializes correctly"""
    scenario = {
        "dialogue_tree": {"root": {"id": "node_001"}}
    }
    engine = ScenarioEngine(scenario)
    assert engine.current_node_id == "root"

@pytest.fixture
def sample_scenario():
    """Fixture for sample scenario"""
    return {
        "scenario_id": "test_001",
        "title": "Test Scenario"
    }
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

**Test Structure:**
```typescript
// src/components/Dashboard/Dashboard.test.tsx
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  it('renders welcome message', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
  })
})
```

### Integration Testing

```bash
# Test API endpoints
cd backend
pytest tests/integration/

# Test full user flows
cd frontend
npm run test:e2e
```

---

## 🐛 Debugging

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--port",
        "8000"
      ],
      "jinja": true,
      "justMyCode": true,
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

### Frontend Debugging

Use browser DevTools:
- React DevTools extension
- Network tab for API calls
- Console for logs
- Application tab for localStorage

### Database Debugging

```bash
# Connect to database
docker exec -it coach-postgres psql -U coach_user -d coach_db

# Useful queries
\dt                          # List tables
\d+ students                 # Describe table
SELECT * FROM students;      # View data
EXPLAIN ANALYZE SELECT ...;  # Query performance
```

---

## 📊 Performance Optimization

### Backend

1. **Use async/await:**
```python
# Good
async def get_scenarios():
    scenarios = await db.execute(query)
    return scenarios

# Avoid blocking operations
```

2. **Database queries:**
```python
# Use eager loading
scenarios = db.query(Scenario).options(
    joinedload(Scenario.sessions)
).all()

# Add indexes for frequent queries
```

3. **Caching:**
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_voice_profile(accent: str, gender: str):
    # Expensive operation
    return voice_profile
```

### Frontend

1. **Code splitting:**
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./components/Dashboard'))
const ScenarioPlayer = lazy(() => import('./components/ScenarioPlayer'))
```

2. **Memoization:**
```typescript
import { useMemo, useCallback } from 'react'

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

const handleClick = useCallback(() => {
  doSomething()
}, [dependency])
```

3. **Optimize images:**
```typescript
// Use appropriate image formats
// Lazy load images
// Use CDN for static assets
```

---

## 🔐 Security Best Practices

### Backend

1. **Never log sensitive data:**
```python
# Bad
logger.info(f"Password: {password}")

# Good
logger.info("User authenticated successfully")
```

2. **Validate all inputs:**
```python
from pydantic import BaseModel, validator

class ScenarioCreate(BaseModel):
    title: str

    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v
```

3. **Use parameterized queries:**
```python
# SQLAlchemy ORM handles this automatically
# Never use string concatenation for queries
```

### Frontend

1. **Sanitize user input:**
```typescript
// React automatically escapes HTML
// Be careful with dangerouslySetInnerHTML
```

2. **Secure storage:**
```typescript
// Don't store sensitive data in localStorage
// Use httpOnly cookies for tokens (if possible)
```

3. **HTTPS only:**
```typescript
// Always use HTTPS in production
// Check window.location.protocol
```

---

## 📦 Adding New Features

### Adding a New API Endpoint

1. **Create Pydantic models:**
```python
# backend/app/api/new_feature.py
from pydantic import BaseModel

class NewFeatureRequest(BaseModel):
    field1: str
    field2: int

class NewFeatureResponse(BaseModel):
    result: str
```

2. **Create route handler:**
```python
from fastapi import APIRouter, Depends

router = APIRouter()

@router.post("/", response_model=NewFeatureResponse)
async def create_new_feature(
    request: NewFeatureRequest,
    current_user: dict = Depends(get_current_user)
):
    # Implementation
    return {"result": "success"}
```

3. **Register router:**
```python
# backend/app/main.py
from app.api import new_feature

app.include_router(
    new_feature.router,
    prefix=f"{settings.API_V1_STR}/new-feature",
    tags=["new-feature"]
)
```

### Adding a New React Component

1. **Create component:**
```typescript
// frontend/src/components/NewFeature/index.tsx
import React from 'react'

interface NewFeatureProps {
  data: string
}

const NewFeature: React.FC<NewFeatureProps> = ({ data }) => {
  return (
    <div className="card">
      <h2>{data}</h2>
    </div>
  )
}

export default NewFeature
```

2. **Add route:**
```typescript
// frontend/src/App.tsx
import NewFeature from './components/NewFeature'

<Route path="/new-feature" element={<NewFeature />} />
```

3. **Add API client method:**
```typescript
// frontend/src/services/api.ts
async getNewFeature(): Promise<any> {
  const response = await this.client.get('/new-feature')
  return response.data
}
```

---

## 🔄 Database Migrations

### Creating a Migration

1. **Create migration file:**
```sql
-- database/migrations/002_add_new_feature.sql

-- Add new table
CREATE TABLE IF NOT EXISTS new_feature (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_new_feature_name ON new_feature(name);
```

2. **Update models:**
```python
# backend/app/models/new_feature.py
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base

class NewFeature(Base):
    __tablename__ = "new_feature"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

3. **Run migration:**
```bash
psql $DATABASE_URL -f database/migrations/002_add_new_feature.sql
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 💬 Getting Help

- Check existing documentation in `/docs`
- Review code comments
- Search GitHub issues
- Ask in team chat/Slack
- Create new GitHub issue

---

## ✅ Pre-commit Checklist

Before committing code:

- [ ] Code follows style guide
- [ ] Tests pass locally
- [ ] No console.log statements (frontend)
- [ ] No commented-out code
- [ ] Environment variables documented
- [ ] API changes documented
- [ ] Type hints added (Python)
- [ ] TypeScript types defined
- [ ] No security vulnerabilities
- [ ] Performance tested

---

Happy coding! 🚀
