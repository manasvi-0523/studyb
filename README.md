# Elite - Academic Manager

[![Vercel](https://img.shields.io/badge/Vercel-deployed-brightgreen?logo=vercel&logoColor=white)](https://studyb.vercel.app)
[![CI](https://github.com/manasvi-0523/studyb/actions/workflows/ci.yml/badge.svg)](https://github.com/manasvi-0523/studyb/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern study management application built with React, TypeScript, and Firebase. Generate AI-powered quizzes and flashcards from your study materials. Mobile-friendly with responsive design and dark mode support.

**[Live Demo](https://studyb.vercel.app)** · **[Report Bug](https://github.com/manasvi-0523/studyb/issues)** · **[Request Feature](https://github.com/manasvi-0523/studyb/issues)**

## Features

| Feature | Description |
|---------|-------------|
| **AI Quiz Generation** | Generate MCQ quizzes from text, PDFs, or images using Groq LLM |
| **Flashcard Creator** | Create and study flashcards with AI assistance |
| **OCR Support** | Extract text from images using vision models |
| **Spaced Repetition** | SM-2 algorithm for optimal flashcard scheduling |
| **Study Sessions** | Track study time by subject with real-time timer |
| **Assessment Tracker** | Manage assignments, projects, and exams with due dates |
| **Academic Calendar** | Visual timeline for all academic events |
| **Web Notifications** | Get reminded about due dates and events |
| **Community Rooms** | Join virtual study rooms with peers |
| **Dark Mode** | Light/dark/system theme with full support |
| **Mobile First** | Responsive design with bottom navigation |
| **Real-time Sync** | Firebase-powered data sync across devices |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Firebase (Auth + Firestore)
- **AI**: Groq LLM API (llama-3.3-70b-versatile, llama-4-maverick)
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (optional, app works in dev mode without it)
- Groq API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/manasvi-0523/studyb.git
cd studyb
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Groq API
VITE_GROQ_API_KEY=your_groq_api_key
```

5. Start development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | No | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | No | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | No | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | No | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | No | Firebase app ID |
| `VITE_GROQ_API_KEY` | Yes* | Groq API key for AI features |

*Required for quiz/flashcard generation and OCR

**Note**: The app works in "Development Mode" without Firebase configured, allowing you to test the UI without backend services.

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── common/            # Shared UI (Modal, EmptyState, ErrorBoundary)
│   ├── community/         # Community features
│   ├── dashboard/         # Dashboard widgets
│   ├── forms/             # Form components (AssessmentForm)
│   └── layout/            # Layout (DashboardLayout, SplashScreen)
├── context/
│   ├── AuthContext.tsx    # Firebase auth state
│   └── ThemeContext.tsx   # Theme management
├── hooks/
│   ├── useUserData.ts     # User data fetching & mutations
│   └── useNotifications.ts # Web notifications
├── lib/
│   ├── ai/                # AI integrations (Groq, OCR)
│   ├── dataService.ts     # Firestore CRUD operations
│   ├── firebaseClient.ts  # Firebase initialization
│   ├── notificationService.ts # Web push notifications
│   └── srs/               # Spaced repetition logic
├── pages/                 # Route pages
├── state/                 # Zustand stores (sessionStore)
└── types.ts               # TypeScript definitions
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Firebase Setup

See [docs/DATABASE.md](docs/DATABASE.md) for Firestore structure and security rules.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The `vercel.json` is pre-configured for SPA routing.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
