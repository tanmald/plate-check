# PlateCheck 🍽️

> AI-powered wellness companion that analyzes meal photos against personalized nutrition plans with explainable adherence scoring

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

## Screenshots

<div align="center">
  <img src="./docs/screenshots/home-dashboard.png" width="45%" alt="Home Dashboard">
  <img src="./docs/screenshots/meal-analysis.png" width="45%" alt="Meal Analysis">
  <img src="./docs/screenshots/plan-view.png" width="45%" alt="Plan View">
  <img src="./docs/screenshots/progress-tracking.png" width="45%" alt="Progress Tracking">
</div>

## Problem & Solution

**Problem:** Users following nutrition plans struggle to know if their daily meals actually align with their prescribed guidelines. Manual tracking is tedious and prone to error.

**Solution:** PlateCheck transforms static nutrition plans into actionable guidance by:
- Parsing plans from PDFs/images using OCR + NLP
- Analyzing meal photos with AI vision models
- Providing instant adherence scores (0-100) with explainable feedback
- Tracking daily/weekly progress with confidence-aware results

## Key Features

- 📸 **Photo-Based Meal Logging** - Snap a photo, get instant analysis
- 🎯 **Adherence Scoring** - Clear 0-100 scores with explainable feedback
- 📊 **Progress Tracking** - Daily and weekly adherence visualization
- 📄 **Smart Plan Import** - OCR + NLP parsing of PDF/DOCX/image plans
- ⚡ **Real-time Feedback** - Confidence-aware results with suggested swaps
- 🔒 **Privacy-First** - Wellness support tool, not a medical device

## Tech Stack

### Frontend
- **React 18.3** + **TypeScript 5.8** + **Vite** - Modern build tooling
- **shadcn-ui** (Radix UI + Tailwind CSS) - 51 customizable components
- **TanStack Query 5.8** - Async state management
- **React Router 6.3** - Client-side routing
- **recharts** - Data visualization
- **react-hook-form** + **zod** - Form validation

### Backend & Infrastructure
- **Supabase** - PostgreSQL + Auth + Edge Functions
- **OpenAI GPT-4 Vision API** - Meal photo analysis
- **Vercel** - Deployment platform
- **Docker** - Container support

### Development
- Path aliases (`@/*`) for clean imports
- ESLint + TypeScript strict mode
- Mobile-first responsive design

## Project Highlights

### Architecture Decisions
- **Dual-mode data system** - Test user mode (mock data) + authenticated user mode (real database)
- **Confidence-aware AI** - Explicit uncertainty handling with high/medium/low confidence indicators
- **Three-tier scoring** - 0-39 (off-plan/red), 40-69 (needs attention/yellow), 70-100 (on-track/green)
- **Mobile-first PWA** - Optimized for mobile viewport with responsive design

### Code Quality
- TypeScript for type safety
- Modular component architecture
- Custom React hooks for data fetching
- Comprehensive error handling
- Clean separation of concerns

## Quick Start

```bash
# Clone repository
git clone https://github.com/tanmald/plate-check.git
cd plate-check

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and keys to .env

# Start development server
npm run dev
# Open http://localhost:8080

# Build for production
npm run build
```

### Test User Access
Use `test@platecheck.app` to explore the app with pre-loaded mock data (no password required in development mode).

## Project Structure

```
src/
├── pages/           # Route-level components (10 pages)
├── components/      # Reusable components + shadcn-ui
├── hooks/           # Custom React hooks
├── contexts/        # React contexts (AuthContext)
├── lib/             # Utilities (cn helper)
└── types/           # TypeScript type definitions

supabase/            # Database migrations and Edge Functions
docs/                # Documentation
public/              # Static assets
```

## Documentation

- [Development Guide](./docs/DEVELOPMENT.md) - Setup, architecture, code conventions
- [Deployment Guide](./docs/DEPLOYMENT.md) - Vercel + Supabase deployment
- [Changelog](./CHANGELOG.md) - Version history and releases

## Current Status

**MVP Complete (v1.0.0)** - Functional demo with:
- ✅ Photo-based meal logging flow
- ✅ AI meal analysis with adherence scoring
- ✅ Nutrition plan import workflow
- ✅ Daily and weekly progress tracking
- ✅ User authentication with Supabase
- ✅ Mobile-responsive design

**Known Limitations:**
- Camera capture simulated (not integrated with device camera)
- OCR plan parsing in development (mock implementation)
- No automated test suite yet

## Roadmap

- [ ] Real device camera integration
- [ ] Enhanced OCR plan parsing accuracy
- [ ] Macro nutrient tracking
- [ ] Multi-language support
- [ ] Automated testing (Vitest + Testing Library)
- [ ] Export progress reports (PDF/CSV)

## About This Project

PlateCheck is a personal portfolio project demonstrating:
- Modern React architecture with TypeScript
- AI/ML integration (GPT-4 Vision API)
- Full-stack development with Supabase
- Mobile-first responsive design
- Production deployment practices

Built to explore the intersection of wellness technology and AI-powered analysis.

## License

MIT © [tanmald](https://github.com/tanmald)

---

**Disclaimer:** PlateCheck is a wellness support tool, not a medical device. It does not provide medical advice, diagnosis, or treatment. Always consult healthcare professionals for medical decisions.
