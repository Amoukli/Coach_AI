# Coach AI - Clinical Training Platform

Coach AI is an interactive clinical training platform that helps undergraduate medical students and newly qualified physicians practice their clinical skills through realistic patient simulations.

## 🎯 Features

- **Interactive Patient Simulations**: Practice clinical consultations with AI-powered virtual patients
- **Real-time Voice Interaction**: Natural conversations using Azure Speech Services
- **Comprehensive Assessment**: Detailed feedback on history-taking, clinical reasoning, management, communication, and efficiency
- **Progress Tracking**: Monitor your improvement over time with skills radar charts and progress graphs
- **Scenario Library**: Wide range of clinical scenarios across multiple specialties and difficulty levels
- **Integration with Medical Ecosystem**:
  - **Clare** (www.clareai.app): Clinical guidelines and decision support
  - **Clark** (www.clarkai.app): Real anonymized consultation cases

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Recharts for data visualization
- WebSocket for real-time communication

**Backend:**
- Python 3.11
- FastAPI for REST API
- SQLAlchemy for ORM
- PostgreSQL for database
- Azure OpenAI for scenario adaptation
- Azure Speech Services for voice generation

**Infrastructure:**
- Docker & Docker Compose
- Azure App Service
- Azure Database for PostgreSQL
- Azure AD B2C for authentication
- GitHub Actions for CI/CD

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Azure account with:
  - Azure Speech Services key
  - Azure OpenAI deployment
  - Azure AD B2C tenant (optional for production)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Coach_AI.git
   cd Coach_AI
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure credentials
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/v1/docs

5. **Initialize the database**
   The database schema is automatically created on first run.

### Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API URLs

# Run the development server
npm run dev
```

## 📚 Project Structure

```
coach/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core configuration
│   │   ├── models/           # Database models
│   │   └── services/         # Business logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API clients
│   │   ├── store/            # State management
│   │   └── styles/           # CSS and styling
│   ├── package.json
│   └── Dockerfile
├── database/
│   └── migrations/           # Database migrations
├── .github/
│   └── workflows/            # CI/CD pipelines
├── docker-compose.yml
└── README.md
```

## 🎮 Usage

### For Students

1. **Browse Scenarios**: Explore the scenario library and filter by specialty or difficulty
2. **Start a Consultation**: Select a scenario and begin the interactive consultation
3. **Practice Clinical Skills**: Take a history, ask relevant questions, and make a diagnosis
4. **Receive Feedback**: Get detailed assessment on your performance
5. **Track Progress**: Monitor your improvement over time on the dashboard

### For Educators

1. **Create Scenarios**: Design new clinical scenarios based on real cases
2. **Review and Approve**: Quality-check scenarios before publishing
3. **Import from Clark**: Convert anonymized consultations into training scenarios
4. **Link Guidelines**: Associate relevant Clare guidelines with scenarios

## 🔧 Configuration

### Azure Services Setup

1. **Azure Speech Services**
   - Create a Speech Service resource in Azure Portal
   - Copy the key and region to your `.env` file

2. **Azure OpenAI**
   - Deploy a GPT-4 model in your Azure OpenAI resource
   - Copy the endpoint, key, and deployment name

3. **Azure AD B2C** (Optional, for production)
   - Create a B2C tenant
   - Register the application
   - Configure user flows

### Database Migration

To run database migrations:

```bash
# Using Docker
docker-compose exec postgres psql -U coach_user -d coach_db -f /docker-entrypoint-initdb.d/001_initial_schema.sql

# Or locally
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Deploy to Azure

1. **Set up GitHub Secrets**:
   - `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND`
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `DATABASE_URL`
   - All environment variables from `.env.example`

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **GitHub Actions will automatically**:
   - Build and test the application
   - Deploy backend to Azure App Service
   - Deploy frontend to Azure Static Web Apps
   - Run database migrations

## 🤝 Integration with Medical Ecosystem

### Clare Integration
Coach scenarios are enriched with clinical guidelines from Clare, providing students with evidence-based recommendations during and after consultations.

### Clark Integration
Real anonymized consultation data from Clark is used to create authentic clinical scenarios, ensuring students practice with realistic cases.

## 🔒 Security

- All patient data is anonymized
- Azure AD B2C for secure authentication
- JWT tokens for API authentication
- HTTPS enforced in production
- CORS properly configured
- Input validation and sanitization

## 📈 Monitoring

- Application Insights for performance monitoring
- Health check endpoints: `/health` and `/api/v1/health`
- Structured logging throughout the application

## 🐛 Troubleshooting

### Common Issues

**Database connection failed:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

**Azure Speech not working:**
- Verify AZURE_SPEECH_KEY and AZURE_SPEECH_REGION
- Check Azure resource is active
- Ensure you have quota remaining

**WebSocket connection failed:**
- Check CORS settings
- Verify WebSocket URL configuration
- Ensure backend is running

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running in 5 minutes
- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Azure deployment instructions
- **[Development Guide](docs/DEVELOPMENT.md)** - Developer workflow and best practices
- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture details

For technical implementation details, see [CLAUDE.md](CLAUDE.md).

## 📝 License

Copyright © 2025 Coach AI. All rights reserved.

## 🙏 Acknowledgments

- Part of the Medical AI Ecosystem (Clare, Clark, Coach)
- Built with Azure AI Services
- Designed for medical education

## 📞 Support

For issues, questions, or contributions:
- GitHub Issues: [https://github.com/yourusername/Coach_AI/issues](https://github.com/yourusername/Coach_AI/issues)
- Documentation: See `/docs` directory for detailed guides
- Quick Start: See [docs/QUICKSTART.md](docs/QUICKSTART.md)

---

**Made with ❤️ for medical education**
