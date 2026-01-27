# Changelog

All notable changes to PlateCheck will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-26

### Added
- Photo-based meal logging with 3-step flow (select → capture → analyzing)
- AI-powered meal analysis with GPT-4 Vision API
- Adherence scoring system (0-100) with three-tier classification
- Nutrition plan import workflow (upload → parsing → review → active)
- OCR + NLP plan parsing (mock implementation for MVP)
- Daily progress dashboard with meal cards
- Weekly progress tracking with adherence chart
- Multi-step onboarding flow (welcome → signup → upload → review)
- User authentication with Supabase
- Dual-mode data system (test user with mock data + real database)
- Mobile-responsive design with shadcn-ui components
- Explainable AI feedback with confidence indicators (high/medium/low)
- Suggested food swaps for non-matching items
- Edit profile functionality
- Settings page with notification toggles

### Technical
- React 18.3.1 + TypeScript 5.8.3 + Vite build system
- shadcn-ui component library (51 components)
- TanStack Query 5.8 for state management
- React Router 6.3 for client-side routing
- Supabase for backend (PostgreSQL + Auth + Edge Functions)
- OpenAI GPT-4 Vision API integration
- Vercel deployment with automatic CI/CD
- Docker multi-stage build support
- Path aliases (@/*) for clean imports
- ESLint + TypeScript configuration
- Tailwind CSS for styling

### Known Limitations (MVP)
- Camera capture simulated (not integrated with device camera API)
- OCR plan parsing uses mock implementation
- No automated testing suite configured
- Test user authentication bypass for demo purposes
- localStorage session storage (XSS consideration)
- Date navigation not functional (prev/next buttons)
- No macro nutrient tracking yet

## [Unreleased]

### Planned
- Real device camera integration
- Production OCR plan parsing with OpenAI
- Automated test suite (Vitest + Testing Library)
- Macro nutrient tracking and visualization
- Multi-language support (i18n)
- Export progress reports (PDF/CSV)
- Performance optimizations
- Enhanced error handling and retry logic
