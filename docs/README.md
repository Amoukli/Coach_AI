# Coach AI Documentation

Welcome to the Coach AI documentation! This directory contains all technical documentation organized by category.

## 📁 Documentation Structure

```
docs/
├── README.md                    # This file - documentation index
├── setup/                       # Setup and configuration guides
│   ├── QUICKSTART.md           # 5-minute quick start guide
│   └── TEMPLATE_SETUP.md       # FastAPI template configuration
├── development/                 # Development guides and architecture
│   ├── ARCHITECTURE.md         # System architecture overview
│   └── DEVELOPMENT.md          # Development workflow and guidelines
├── api/                        # API documentation
│   └── API_REFERENCE.md        # Complete API endpoint reference
├── deployment/                 # Deployment guides
│   └── DEPLOYMENT.md           # Production deployment instructions
└── design/                     # Design system and UI documentation
    ├── DESIGN_COMPARISON.md    # Design system comparison (Clare/Clark/Coach)
    └── LANDING_PAGE_README.md  # Landing page customization guide
```

## 🚀 Getting Started

New to Coach AI? Start here:

1. **[Quickstart Guide](setup/QUICKSTART.md)** - Get Coach AI running in 5 minutes
2. **[Architecture Overview](development/ARCHITECTURE.md)** - Understand the system design
3. **[Development Guide](development/DEVELOPMENT.md)** - Set up your development environment

## 📚 Documentation by Category

### Setup & Configuration
- **[Quickstart Guide](setup/QUICKSTART.md)** - Fast setup for local development
- **[Template Setup](setup/TEMPLATE_SETUP.md)** - Configure FastAPI templates and static files

### Development
- **[Architecture](development/ARCHITECTURE.md)** - Full system architecture documentation
  - Technology stack
  - Database schema
  - Component relationships
  - Design decisions
- **[Development Guide](development/DEVELOPMENT.md)** - Development workflow
  - Local setup
  - Code standards
  - Testing guidelines
  - Contributing

### API Documentation
- **[API Reference](api/API_REFERENCE.md)** - Complete API documentation
  - All endpoints (scenarios, sessions, assessments, voice, analytics)
  - Request/response schemas
  - Authentication
  - Error handling

### Deployment
- **[Deployment Guide](deployment/DEPLOYMENT.md)** - Production deployment
  - Azure deployment (App Service + Static Web Apps)
  - Docker configuration
  - CI/CD pipeline
  - Environment variables
  - Database migrations

### Design System
- **[Design Comparison](design/DESIGN_COMPARISON.md)** - Ecosystem design system
  - Clare, Clark, and Coach design patterns
  - Color palettes and typography
  - Component breakdowns
  - Brand consistency guidelines
- **[Landing Page Guide](design/LANDING_PAGE_README.md)** - Landing page customization
  - Logo replacement
  - Deployment options
  - Cross-linking with ecosystem

## 🔍 Quick Links

### Common Tasks
- **Running locally**: See [Quickstart Guide](setup/QUICKSTART.md)
- **API endpoints**: See [API Reference](api/API_REFERENCE.md)
- **Deploy to Azure**: See [Deployment Guide](deployment/DEPLOYMENT.md)
- **Understanding the codebase**: See [Architecture](development/ARCHITECTURE.md)
- **Customizing design**: See [Design Comparison](design/DESIGN_COMPARISON.md)

### External Resources
- **Main README**: [../README.md](../README.md)
- **Project Status**: [../CLAUDE.md](../CLAUDE.md)
- **GitHub Repository**: (Add your repo URL)
- **Live Demo**: (Add demo URL when available)

## 🤝 Contributing to Documentation

When adding new documentation:

1. **Choose the right category**:
   - `setup/` - Installation, configuration, getting started
   - `development/` - Architecture, coding guidelines, workflows
   - `api/` - API endpoints, schemas, authentication
   - `deployment/` - Production deployment, CI/CD
   - `design/` - UI/UX, design system, branding

2. **Follow naming conventions**:
   - Use UPPERCASE for major docs (e.g., `ARCHITECTURE.md`)
   - Use descriptive names (e.g., `database-migrations.md`)
   - Keep filenames concise but clear

3. **Include in this README**:
   - Add your new doc to the appropriate section
   - Provide a brief description
   - Update the file tree if needed

4. **Use consistent formatting**:
   - Start with a clear title (# Title)
   - Include a table of contents for long docs
   - Use code blocks with language tags
   - Add diagrams where helpful

## 📋 Documentation Standards

All documentation should:
- ✅ Be written in clear, concise English
- ✅ Include practical examples
- ✅ Be kept up-to-date with code changes
- ✅ Include links to related docs
- ✅ Use proper markdown formatting
- ✅ Include code snippets where relevant

## 🐛 Found an Issue?

If you find errors or outdated information in the documentation:
1. Check if the issue is already reported
2. Create a detailed issue with the doc name and section
3. Or submit a PR with corrections

## 📖 Additional Resources

### Ecosystem Documentation
- **Clare** (Clinical Guidelines): [clareai.app](https://www.clareai.app)
- **Clark** (Medical Documentation): [clarkai.app](https://www.clarkai.app)
- **Contempo Studios**: [contempostudios.ai](https://contempostudios.ai)

### Technologies Used
- **Backend**: FastAPI, Python 3.11, PostgreSQL, SQLAlchemy
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **AI Services**: Azure OpenAI (GPT-4), Azure Speech Services
- **Infrastructure**: Docker, Azure App Service, Azure Static Web Apps

---

**Last Updated**: January 2025
**Documentation Version**: 1.0.0
**Project**: Coach AI - Clinical Training Platform
