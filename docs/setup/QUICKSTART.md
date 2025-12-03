# Quick Start Guide - Coach

Get Coach up and running in 5 minutes!

## Prerequisites

- Docker Desktop installed and running
- Azure Speech Services key (for voice generation)
- Azure OpenAI key (for patient responses)

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd Coach
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your Azure credentials
# At minimum, you need:
# - AZURE_SPEECH_KEY
# - AZURE_SPEECH_REGION
# - AZURE_OPENAI_KEY
# - AZURE_OPENAI_ENDPOINT
# - AZURE_OPENAI_DEPLOYMENT_NAME
```

### 3. Start the Application

```bash
# Start all services with Docker Compose
docker-compose up -d

# Wait about 30 seconds for services to initialize
# Check status with:
docker-compose ps
```

### 4. Access the Application

Open your browser and navigate to:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/v1/docs

### 5. Login (Development Mode)

The application will automatically log you in as a demo student in development mode.

## Testing the Application

### 1. View the Dashboard
- Navigate to http://localhost
- You'll see the student dashboard (may be empty initially)

### 2. Browse Scenarios
- Click "Scenarios" in the navigation
- Filter by specialty or difficulty

### 3. Start a Scenario
- Click "Start Scenario" on any scenario card
- Begin the interactive consultation
- Ask questions using the text interface
- The patient will respond with both text and voice

### 4. Complete and Review
- Click "Complete Scenario" when done
- Review your detailed assessment
- View your skills breakdown and feedback

## Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v
```

## Troubleshooting

### Services not starting?

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Database connection issues?

```bash
# Recreate the database
docker-compose down -v
docker-compose up -d
```

### Azure services not working?

1. Verify your Azure keys in `.env`
2. Check Azure resource quotas
3. Ensure resources are in the correct region

### Port already in use?

Edit `docker-compose.yml` to change ports:
```yaml
ports:
  - "3000:80"     # Change 80 to another port for frontend
  - "8001:8000"   # Change 8000 to another port for backend
```

## Next Steps

1. **Create Custom Scenarios**: Use the API docs to create your own scenarios
2. **Integrate with Clare/Clark**: Add your API keys to enable guideline integration
3. **Deploy to Azure**: Follow the README for production deployment instructions
4. **Customize Styling**: Match your institution's branding in `frontend/src/styles/globals.css`

## Development Mode

To run in development mode with hot-reload:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Need Help?

- Check the main README.md for detailed documentation
- Review API documentation at http://localhost:8000/api/v1/docs
- Open an issue on GitHub

---

Happy training! 🎓
