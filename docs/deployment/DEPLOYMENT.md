# Coach AI - Deployment Guide

Complete guide for deploying Coach AI to Azure.

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
  --name coach-ai-rg \
  --location uksouth
```

#### 1.2 Create PostgreSQL Database

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --name coach-ai-db \
  --resource-group coach-ai-rg \
  --location uksouth \
  --admin-user coachdbadmin \
  --admin-password 'YourSecurePassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32

# Create database
az postgres flexible-server db create \
  --resource-group coach-ai-rg \
  --server-name coach-ai-db \
  --database-name coach_db

# Configure firewall (allow Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group coach-ai-rg \
  --name coach-ai-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Get connection string
az postgres flexible-server show-connection-string \
  --server-name coach-ai-db \
  --database-name coach_db \
  --admin-user coachdbadmin
```

#### 1.3 Create Azure OpenAI Resource

```bash
# Create Azure OpenAI
az cognitiveservices account create \
  --name coach-ai-openai \
  --resource-group coach-ai-rg \
  --location uksouth \
  --kind OpenAI \
  --sku S0

# Deploy GPT-4 model
az cognitiveservices account deployment create \
  --name coach-ai-openai \
  --resource-group coach-ai-rg \
  --deployment-name gpt-4 \
  --model-name gpt-4 \
  --model-version "0613" \
  --model-format OpenAI \
  --sku-capacity 10 \
  --sku-name "Standard"

# Get keys
az cognitiveservices account keys list \
  --name coach-ai-openai \
  --resource-group coach-ai-rg
```

#### 1.4 Create Azure Speech Services

```bash
# Create Speech service
az cognitiveservices account create \
  --name coach-ai-speech \
  --resource-group coach-ai-rg \
  --location uksouth \
  --kind SpeechServices \
  --sku S0

# Get keys
az cognitiveservices account keys list \
  --name coach-ai-speech \
  --resource-group coach-ai-rg
```

#### 1.5 Create Storage Account (for audio files)

```bash
# Create storage account
az storage account create \
  --name coachaistorage \
  --resource-group coach-ai-rg \
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
  --app coach-ai-insights \
  --location uksouth \
  --resource-group coach-ai-rg \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app coach-ai-insights \
  --resource-group coach-ai-rg \
  --query instrumentationKey
```

---

### Step 2: Backend Deployment (Azure App Service)

#### 2.1 Create App Service Plan

```bash
# Create App Service plan
az appservice plan create \
  --name coach-ai-plan \
  --resource-group coach-ai-rg \
  --location uksouth \
  --sku B2 \
  --is-linux
```

#### 2.2 Create Web App

```bash
# Create web app
az webapp create \
  --name coach-ai-backend \
  --resource-group coach-ai-rg \
  --plan coach-ai-plan \
  --runtime "PYTHON:3.11"

# Enable WebSockets
az webapp config set \
  --name coach-ai-backend \
  --resource-group coach-ai-rg \
  --web-sockets-enabled true
```

#### 2.3 Configure Environment Variables

```bash
# Set application settings
az webapp config appsettings set \
  --name coach-ai-backend \
  --resource-group coach-ai-rg \
  --settings \
    DATABASE_URL="postgresql://coachdbadmin:YourSecurePassword123!@coach-ai-db.postgres.database.azure.com/coach_db" \
    DATABASE_URL_ASYNC="postgresql+asyncpg://coachdbadmin:YourSecurePassword123!@coach-ai-db.postgres.database.azure.com/coach_db" \
    AZURE_SPEECH_KEY="your_speech_key" \
    AZURE_SPEECH_REGION="uksouth" \
    AZURE_OPENAI_KEY="your_openai_key" \
    AZURE_OPENAI_ENDPOINT="https://coach-ai-openai.openai.azure.com/" \
    AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4" \
    JWT_SECRET_KEY="your-production-secret-key" \
    ENVIRONMENT="production" \
    DEBUG="False" \
    CORS_ORIGINS='["https://coach-ai-frontend.azurestaticapps.net"]'
```

#### 2.4 Get Publish Profile

```bash
# Download publish profile for GitHub Actions
az webapp deployment list-publishing-profiles \
  --name coach-ai-backend \
  --resource-group coach-ai-rg \
  --xml
```

---

### Step 3: Frontend Deployment (Azure Static Web Apps)

#### 3.1 Create Static Web App

```bash
# Create Static Web App
az staticwebapp create \
  --name coach-ai-frontend \
  --resource-group coach-ai-rg \
  --location "West Europe" \
  --sku Standard

# Get deployment token
az staticwebapp secrets list \
  --name coach-ai-frontend \
  --resource-group coach-ai-rg \
  --query "properties.apiKey"
```

#### 3.2 Configure Custom Domain (Optional)

```bash
# Add custom domain
az staticwebapp hostname set \
  --name coach-ai-frontend \
  --resource-group coach-ai-rg \
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
psql "host=coach-ai-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require"
```

#### 4.2 Run Migrations

```bash
# Run migration script
psql "host=coach-ai-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
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
  → postgresql://coachdbadmin:YourSecurePassword123!@coach-ai-db.postgres.database.azure.com/coach_db

VITE_API_URL
  → https://coach-ai-backend.azurewebsites.net

VITE_WS_URL
  → wss://coach-ai-backend.azurewebsites.net

AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
AZURE_OPENAI_KEY
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_DEPLOYMENT_NAME
CLARE_API_KEY
CLARK_API_KEY
JWT_SECRET_KEY
```

#### 5.2 Enable GitHub Actions

The workflow file is already in `.github/workflows/azure-deploy.yml`

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
curl https://coach-ai-backend.azurewebsites.net/health

# Test API
curl https://coach-ai-backend.azurewebsites.net/api/v1/health
```

#### 6.2 Check Frontend

Open browser and navigate to:
- https://coach-ai-frontend.azurestaticapps.net
- or your custom domain

#### 6.3 Check Database

```bash
# Connect and verify tables
psql "host=coach-ai-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
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
  --name coach-ai-backend \
  --resource-group coach-ai-rg \
  --settings \
    CORS_ORIGINS='["https://coach-ai-frontend.azurestaticapps.net","https://www.your-domain.com"]'
```

### Scaling

#### Backend Scaling

```bash
# Manual scale
az appservice plan update \
  --name coach-ai-plan \
  --resource-group coach-ai-rg \
  --number-of-workers 3

# Auto-scale (requires Standard tier or higher)
az monitor autoscale create \
  --resource-group coach-ai-rg \
  --resource coach-ai-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name coach-ai-autoscale \
  --min-count 2 \
  --max-count 5 \
  --count 2
```

#### Database Scaling

```bash
# Scale up database
az postgres flexible-server update \
  --name coach-ai-db \
  --resource-group coach-ai-rg \
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
  --resource-group coach-ai-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/coach-ai-rg/providers/Microsoft.Web/sites/coach-ai-backend \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

### Logs

```bash
# Enable application logs
az webapp log config \
  --name coach-ai-backend \
  --resource-group coach-ai-rg \
  --application-logging filesystem \
  --level information

# Stream logs
az webapp log tail \
  --name coach-ai-backend \
  --resource-group coach-ai-rg
```

---

## 🔐 Security

### Enable Managed Identity

```bash
# Enable system-assigned managed identity
az webapp identity assign \
  --name coach-ai-backend \
  --resource-group coach-ai-rg
```

### Key Vault (Recommended for Production)

```bash
# Create Key Vault
az keyvault create \
  --name coach-ai-keyvault \
  --resource-group coach-ai-rg \
  --location uksouth

# Add secrets
az keyvault secret set \
  --vault-name coach-ai-keyvault \
  --name "DatabasePassword" \
  --value "YourSecurePassword123!"

# Grant App Service access
az keyvault set-policy \
  --name coach-ai-keyvault \
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
  --name coach-ai-backend \
  --resource-group coach-ai-rg \
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
psql "host=coach-ai-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
  -f database/migrations/002_add_new_feature.sql
```

### Backup Database

```bash
# Export database
pg_dump "host=coach-ai-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
  > backup_$(date +%Y%m%d).sql

# Restore database
psql "host=coach-ai-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" \
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
az webapp log tail --name coach-ai-backend --resource-group coach-ai-rg

# Restart app
az webapp restart --name coach-ai-backend --resource-group coach-ai-rg
```

**Database connection failed:**
```bash
# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group coach-ai-rg \
  --name coach-ai-db

# Test connection
psql "host=coach-ai-db.postgres.database.azure.com port=5432 dbname=coach_db user=coachdbadmin password=YourSecurePassword123! sslmode=require" -c "SELECT version();"
```

**CORS errors:**
```bash
# Update CORS settings
az webapp config appsettings set \
  --name coach-ai-backend \
  --resource-group coach-ai-rg \
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

Your Coach AI application is now live and ready for users.
