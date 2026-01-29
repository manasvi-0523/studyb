# Elite - Academic Manager

A modern study management application built with React, TypeScript, and Firebase. Generate AI-powered quizzes and flashcards from your study materials. Mobile-friendly with responsive design and dark mode support.

## Features

- **AI-Powered Study Tools**: Generate MCQ quizzes and flashcards from text, PDFs, or images
- **OCR Support**: Extract text from images using Groq vision models
- **Spaced Repetition**: SM-2 algorithm for optimal flashcard scheduling
- **Study Session Tracking**: Track your study time by subject
- **Community Features**: Join virtual study rooms
- **Academic Timeline**: Track deadlines and events
- **Dark Mode**: Light/dark/system theme support
- **Mobile Responsive**: Bottom navigation, slide-out sidebar, touch-friendly

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
│   ├── auth/           # Authentication components
│   ├── common/         # Shared UI components (ErrorBoundary, FileDropZone)
│   ├── community/      # Community features
│   ├── dashboard/      # Dashboard widgets
│   └── layout/         # Layout components (DashboardLayout, SplashScreen)
├── context/
│   ├── AuthContext.tsx # Firebase auth state
│   └── ThemeContext.tsx# Theme management
├── lib/
│   ├── ai/             # AI integrations (Groq, OCR)
│   ├── dataService.ts  # Firestore CRUD operations
│   ├── firebaseClient.ts # Firebase initialization
│   └── srs/            # Spaced repetition logic
├── pages/              # Route pages
├── state/              # Zustand stores
└── types.ts            # TypeScript definitions
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
