# Coach - Deployment Guide

Complete guide for deploying Coach to Azure.

---

## 🎯 Prerequisites

### Required Azure Resources

1. **Azure Account** with active subscription
2. **Azure CLI** installed locally
3. **GitHub Account** for CI/CD
4. **Domain Name** (optional, for custom domain)

### Azure Services Needed

- Azure App Service (Backend)
- Azure Static Web Apps (Frontend)
- Azure Database for PostgreSQL
- Azure OpenAI Service
- Azure Speech Services
- Azure Storage Account (for audio files)
- Azure Application Insights (monitoring)

---

## 🔗 Deploying Alongside Clare & Clark

Coach is designed to integrate with the existing Clare (clinical guidelines) and Clark (consultation transcription) ecosystem. This section covers the specific requirements for deploying Coach alongside these applications.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Azure Resource Group                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │  Clare   │    │  Clark   │    │  Coach   │                  │
│  │  (API)   │    │  (API)   │    │  (API)   │                  │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘                  │
│       │               │               │                         │
│       └───────────────┼───────────────┘                         │
│                       │                                          │
│              ┌────────┴────────┐                                │
│              │  Shared Azure   │                                │
│              │  AI Services    │                                │
│              │  (OpenAI/Speech)│                                │
│              └─────────────────┘                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Required Azure Resources for Coach

| Service | Purpose | Tier Recommendation |
|---------|---------|---------------------|
| **Azure App Service** | Backend API (FastAPI) | B2 or P1v2 |
| **Azure Static Web Apps** | Frontend (React) | Standard |
| **Azure Database for PostgreSQL** | Coach-specific database | Flexible Server, Basic/GP |

### Shared vs. Dedicated Resources

| Resource | Recommendation | Notes |
|----------|----------------|-------|
| **Azure OpenAI** | Share with Clare/Clark | Same GPT-4 deployment, reduces cost |
| **Azure Speech Services** | Share with Clare/Clark | Same TTS/STT service |
| **Azure AD B2C** | Share with Clare/Clark | Single sign-on across ecosystem |
| **Resource Group** | Same or separate | Same RG simplifies management |
| **Database** | Dedicated for Coach | Separate PostgreSQL instance |

### Clare & Clark Integration Requirements

#### API Keys Required

Coach requires API keys to communicate with Clare and Clark services:

```bash
# Clare Guidelines API
CLARE_API_URL=https://www.clareai.app/api
CLARE_API_KEY=<internal-api-key-from-clare>

# Clark Consultation API
CLARK_API_URL=https://www.clarkai.app/api
CLARK_API_KEY=<internal-api-key-from-clark>
```

**To obtain API keys:**
1. Contact the Clare/Clark team administrator
2. Request internal API keys for Coach integration
3. Keys should have permissions for:
   - Clare: `GET /search` (guidelines search)
   - Clark: `GET /consultations`, `GET /consultations/{id}`

#### Network Connectivity

Coach backend must be able to reach Clare and Clark APIs:

- **Clare API**: `https://www.clareai.app/api`
- **Clark API**: `https://www.clarkai.app/api`

If Clare/Clark are in the same Azure subscription, consider:
- VNet integration for private communication
- Service endpoints for enhanced security
- Private DNS zones if using private endpoints

#### Authentication Integration (Azure AD B2C)

For seamless user experience across Clare, Clark, and Coach:

```bash
# Shared Azure AD B2C tenant
AZURE_AD_TENANT_ID=<shared-tenant-id>
AZURE_AD_CLIENT_ID=<coach-client-id>
AZURE_AD_CLIENT_SECRET=<coach-client-secret>

# Frontend
VITE_AZURE_AD_CLIENT_ID=<coach-client-id>
VITE_AZURE_AD_TENANT=<shared-tenant>
VITE_AZURE_AD_AUTHORITY=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com
```

**Setup steps:**
1. Register Coach as new application in existing Azure AD B2C tenant
2. Configure redirect URIs for Coach frontend
3. Add API permissions for Coach backend
4. Share user flow policies with Clare/Clark

### Cost Optimization When Sharing Resources

If sharing Azure AI services with Clare/Clark:

| Resource | Dedicated Cost | Shared Cost (Coach portion) |
|----------|---------------|----------------------------|
| Azure OpenAI | ~$200-500/mo | Incremental usage only |
| Azure Speech | ~$100-200/mo | Incremental usage only |
| Azure AD B2C | ~$50/mo | $0 (shared) |

**Estimated Coach-specific costs:**
- App Service (B2): ~$50-100/month
- Static Web Apps: ~$0-10/month
- PostgreSQL (Basic): ~$30-50/month
- AI Services (shared): Incremental based on usage

**Total when sharing**: ~$80-160/month additional

### Pre-Deployment Checklist for Clare/Clark Integration

- [ ] Obtain Clare API key with search permissions
- [ ] Obtain Clark API key with consultation read permissions
- [ ] Verify network connectivity to Clare/Clark APIs
- [ ] Register Coach in shared Azure AD B2C tenant (if using SSO)
- [ ] Confirm shared Azure OpenAI has sufficient quota
- [ ] Confirm shared Azure Speech Services has sufficient quota
- [ ] Test Clare integration endpoint: `GET /api/v1/guidelines/search`
- [ ] Test Clark integration endpoint: `GET /api/v1/clark/consultations`

### Fallback Behavior

Coach includes mock data fallback when Clare/Clark APIs are unavailable:

- **Guidelines search**: Returns sample clinical guidelines
- **Consultation list**: Returns sample consultations
- **Consultation import**: Returns preview with mock data

This allows development and testing without active Clare/Clark connections.

---

## 📋 Pre-Deployment Checklist

- [ ] Azure subscription created
- [ ] Azure CLI installed and logged in
- [ ] GitHub repository created
- [ ] Environment variables prepared
- [ ] Domain DNS configured (if using custom domain)
- [ ] SSL certificate ready (if needed)

---

## 🚀 Step-by-Step Deployment

### Step 1: Azure Resource Setup

#### 1.1 Login to Azure

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "Your Subscription Name"

# Create resource group
az group create \
  --name coach-rg \
  --location uksouth
```

#### 1.2 Create PostgreSQL Database

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --name coach-db \
  --resource-group coach-rg \
  --location uksouth \
  --admin-user coachdbadmin \
  --admin-password 'YourSecurePassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32

# Create database
az postgres flexible-server db create \
  --resource-group coach-rg \
  --server-name coach-db \
  --database-name coach_db

# Configure firewall (allow Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group coach-rg \
  --name coach-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Get connection string
az postgres flexible-server show-connection-string \
  --server-name coach-db \
  --database-name coach_db \
  --admin-user coachdbadmin
```

#### 1.3 Create Azure OpenAI Resource

```bash
# Create Azure OpenAI
az cognitiveservices account create \
  --name coach-openai \
  --resource-group coach-rg \
  --location uksouth \
  --kind OpenAI \
  --sku S0

# Deploy GPT-4 model
az cognitiveservices account deployment create \
  --name coach-openai \
  --resource-group coach-rg \
  --deployment-name gpt-4 \
  --model-name gpt-4 \
  --model-version "0613" \
  --model-format OpenAI \
  --sku-capacity 10 \
  --sku-name "Standard"

# Get keys
az cognitiveservices account keys list \
  --name coach-openai \
  --resource-group coach-rg
```

#### 1.4 Create Azure Speech Services

```bash
# Create Speech service
az cognitiveservices account create \
  --name coach-speech \
  --resource-group coach-rg \
  --location uksouth \
  --kind SpeechServices \
  --sku S0

# Get keys
az cognitiveservices account keys list \
  --name coach-speech \
  --resource-group coach-rg
```

#### 1.5 Create Storage Account (for audio files)

```bash
# Create storage account
az storage account create \
  --name coachaistorage \
  --resource-group coach-rg \
  --location uksouth \
  --sku Standard_LRS

# Create blob container
az storage container create \
  --name audio-files \
  --account-name coachaistorage \
  --public-access blob
```

#### 1.6 Create Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app coach-insights \
  --location uksouth \
  --resource-group coach-rg \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app coach-insights \
  --resource-group coach-rg \
  --query instrumentationKey
```

---

### Step 2: Backend Deployment (Azure App Service)

#### 2.1 Create App Service Plan

```bash
# Create App Service plan
az appservice plan create \
  --name coach-plan \
  --resource-group coach-rg \
  --location uksouth \
  --sku B2 \
  --is-linux
```

#### 2.2 Create Web App

```bash
# Create web app
az webapp create \
  --name coach-backend \
  --resource-group coach-rg \
  --plan coach-plan \
  --runtime "PYTHON:3.11"

# Enable WebSockets
az webapp config set \
  --name coach-backend \
  --resource-group coach-rg \
  --web-sockets-enabled true
```

#### 2.3 Configure Environment Variables

```bash
# Set application settings
az webapp config appsettings set \
  --name coach-backend \
  --resource-group coach-rg \
  --settings \
    DATABASE_URL="postgresql://coachdbadmin:YourSecurePassword123!@coach-db.postgres.database.azure.com/coach_db" \
    DATABASE_URL_ASYNC="postgresql+asyncpg://coachdbadmin:YourSecurePassword123!@coach-db.postgres.database.azure.com/coach_db" \
    AZURE_SPEECH_KEY="your_speech_key" \
    AZURE_SPEECH_REGION="uksouth" \
    AZURE_OPENAI_KEY="your_openai_key" \
    AZURE_OPENAI_ENDPOINT="https://coach-openai.openai.azure.com/" \
    AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4" \
    JWT_SECRET_KEY="your-production-secret-key" \
    ENVIRONMENT="production" \
    DEBUG="False" \
    CORS_ORIGINS='["https://coach-frontend.azurestaticapps.net"]'
```

#### 2.4 Get Publish Profile

```bash
# Download publish profile for GitHub Actions
az webapp deployment list-publishing-profiles \
  --name coach-backend \
  --resource-group coach-rg \
  --xml
```

---

### Step 3: Frontend Deployment (Azure Static Web Apps)

#### 3.1 Create Static Web App

```bash
# Create Static Web App
az staticwebapp create \
  --name coach-frontend \
  --resource-group coach-rg \
  --location "West Europe" \
  --sku Standard

# Get deployment token
az staticwebapp secrets list \
  --name coach-frontend \
  --resource-group coach-rg \
  --query "properties.apiKey"
```

#### 3.2 Configure Custom Domain (Optional)

```bash
# Add custom domain
az staticwebapp hostname set \
  --name coach-frontend \
  --resource-group coach-rg \
  --hostname www.your-domain.com
```

---

### Step 4: Database Migration

#### 4.1 Connect to Database

```bash
# Install psql if not already installed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Connect to database
psql "host=coach-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require"
```

#### 4.2 Run Migrations

```bash
# Run migration script
psql "host=coach-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
  -f database/migrations/001_initial_schema.sql
```

---

### Step 5: GitHub Actions Setup

#### 5.1 Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

```
AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND
  → Content from: az webapp deployment list-publishing-profiles

AZURE_STATIC_WEB_APPS_API_TOKEN
  → Content from: az staticwebapp secrets list

DATABASE_URL
  → postgresql://coachdbadmin:YourSecurePassword123!@coach-db.postgres.database.azure.com/coach_db

VITE_API_URL
  → https://coach-backend.azurewebsites.net

VITE_WS_URL
  → wss://coach-backend.azurewebsites.net

AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
AZURE_OPENAI_KEY
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_DEPLOYMENT_NAME
CLARE_API_KEY
CLARK_API_KEY
JWT_SECRET_KEY
```

#### 5.2 Create GitHub Actions Workflow

> **Note:** The GitHub Actions workflow file (`.github/workflows/azure-deploy.yml`) needs to be created. See the workflow template below.

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: coach-backend
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND }}
          package: ./backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install and build
        run: |
          cd frontend
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_WS_URL: ${{ secrets.VITE_WS_URL }}

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: frontend/dist
          skip_app_build: true

  run-migrations:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4

      - name: Run database migrations
        run: |
          PGPASSWORD=${{ secrets.DB_PASSWORD }} psql \
            -h ${{ secrets.DB_HOST }} \
            -U ${{ secrets.DB_USER }} \
            -d coach_db \
            -f database/migrations/001_initial_schema.sql
```

Push to main branch to trigger deployment:

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

---

### Step 6: Verify Deployment

#### 6.1 Check Backend Health

```bash
# Test health endpoint
curl https://coach-backend.azurewebsites.net/health

# Test API
curl https://coach-backend.azurewebsites.net/api/v1/health
```

#### 6.2 Check Frontend

Open browser and navigate to:
- https://coach-frontend.azurestaticapps.net
- or your custom domain

#### 6.3 Check Database

```bash
# Connect and verify tables
psql "host=coach-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
  -c "\dt"
```

---

## 🔧 Configuration

### SSL/HTTPS

Azure automatically provides SSL certificates for:
- `*.azurewebsites.net` (App Service)
- `*.azurestaticapps.net` (Static Web Apps)

For custom domains:
- Azure App Service: Auto-managed SSL certificates
- Static Web Apps: Free SSL via Let's Encrypt

### CORS Configuration

Update backend CORS settings:

```bash
az webapp config appsettings set \
  --name coach-backend \
  --resource-group coach-rg \
  --settings \
    CORS_ORIGINS='["https://coach-frontend.azurestaticapps.net","https://www.your-domain.com"]'
```

### Scaling

#### Backend Scaling

```bash
# Manual scale
az appservice plan update \
  --name coach-plan \
  --resource-group coach-rg \
  --number-of-workers 3

# Auto-scale (requires Standard tier or higher)
az monitor autoscale create \
  --resource-group coach-rg \
  --resource coach-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name coach-autoscale \
  --min-count 2 \
  --max-count 5 \
  --count 2
```

#### Database Scaling

```bash
# Scale up database
az postgres flexible-server update \
  --name coach-db \
  --resource-group coach-rg \
  --sku-name Standard_D2s_v3 \
  --tier GeneralPurpose
```

---

## 📊 Monitoring

### Application Insights

View metrics in Azure Portal:
- Response times
- Request rates
- Failure rates
- Dependencies
- Custom events

### Set Up Alerts

```bash
# CPU alert
az monitor metrics alert create \
  --name high-cpu \
  --resource-group coach-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/coach-rg/providers/Microsoft.Web/sites/coach-backend \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

### Logs

```bash
# Enable application logs
az webapp log config \
  --name coach-backend \
  --resource-group coach-rg \
  --application-logging filesystem \
  --level information

# Stream logs
az webapp log tail \
  --name coach-backend \
  --resource-group coach-rg
```

---

## 🔐 Security

### Enable Managed Identity

```bash
# Enable system-assigned managed identity
az webapp identity assign \
  --name coach-backend \
  --resource-group coach-rg
```

### Key Vault (Recommended for Production)

```bash
# Create Key Vault
az keyvault create \
  --name coach-keyvault \
  --resource-group coach-rg \
  --location uksouth

# Add secrets
az keyvault secret set \
  --vault-name coach-keyvault \
  --name "DatabasePassword" \
  --value "YourSecurePassword123!"

# Grant App Service access
az keyvault set-policy \
  --name coach-keyvault \
  --object-id <app-service-principal-id> \
  --secret-permissions get list
```

---

## 🔄 Updates & Maintenance

### Update Backend

Push changes to GitHub, and GitHub Actions will auto-deploy.

Manual deployment:

```bash
cd backend
zip -r deploy.zip .
az webapp deploy \
  --name coach-backend \
  --resource-group coach-rg \
  --src-path deploy.zip \
  --type zip
```

### Update Frontend

Push changes to GitHub for auto-deployment.

### Database Migrations

```bash
# Create new migration file
# database/migrations/002_add_new_feature.sql

# Run migration
psql "host=coach-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
  -f database/migrations/002_add_new_feature.sql
```

### Backup Database

```bash
# Export database
pg_dump "host=coach-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
  > backup_$(date +%Y%m%d).sql

# Restore database
psql "host=coach-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
  < backup_20250115.sql
```

---

## 💰 Cost Optimization

### Recommendations

1. **Use Reserved Instances** for predictable workloads (up to 40% savings)
2. **Auto-shutdown** development resources during off-hours
3. **Monitor usage** with Azure Cost Management
4. **Cache speech synthesis** to reduce API calls
5. **Use CDN** for static assets
6. **Database connection pooling** to reduce connections

### Estimated Monthly Costs

- **Development:** ~$100-200/month
- **Production (1000 students):** ~$500-1000/month
- **Production (10000 students):** ~$2000-4000/month

---

## 🐛 Troubleshooting

### Common Issues

**Backend not starting:**
```bash
# Check logs
az webapp log tail --name coach-backend --resource-group coach-rg

# Restart app
az webapp restart --name coach-backend --resource-group coach-rg
```

**Database connection failed:**
```bash
# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group coach-rg \
  --name coach-db

# Test connection
psql "host=coach-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" -c "SELECT version();"
```

**CORS errors:**
```bash
# Update CORS settings
az webapp config appsettings set \
  --name coach-backend \
  --resource-group coach-rg \
  --settings CORS_ORIGINS='["https://your-frontend-url.com"]'
```

---

## 📞 Support

For deployment issues:
- Check Azure Portal for service health
- Review Application Insights logs
- Consult Azure documentation
- Open GitHub issue

---

## ✅ Post-Deployment Checklist

- [ ] Backend health endpoint responding
- [ ] Frontend loading correctly
- [ ] Database migrations completed
- [ ] Azure Speech Services working
- [ ] Azure OpenAI responding
- [ ] WebSocket connections working
- [ ] Authentication functioning
- [ ] Monitoring and alerts configured
- [ ] Backups scheduled
- [ ] SSL certificates valid
- [ ] Custom domain configured (if applicable)
- [ ] Cost alerts configured

---

**Deployment complete!** 🎉

Your Coach application is now live and ready for users.
