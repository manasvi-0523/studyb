# Elite - Academic Manager

A modern study management application built with React, TypeScript, and Supabase. Generate AI-powered quizzes and flashcards from your study materials. Mobile-friendly with responsive design.

## Features

- **AI-Powered Study Tools**: Generate MCQ quizzes and flashcards from text, PDFs, or images
- **Spaced Repetition**: SM-2 algorithm for optimal flashcard scheduling
- **Study Session Tracking**: Track your study time by subject
- **Community Features**: Join virtual study rooms
- **Academic Timeline**: Track deadlines and events

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (Auth + Database)
- **AI**: Groq LLM API
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (optional, app works without it)
- Groq API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/studyb.git
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
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

5. Start development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | No | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `VITE_GROQ_API_KEY` | Yes* | Groq API key for AI features |

*Required for quiz/flashcard generation

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Shared UI components
│   ├── community/      # Community features
│   ├── dashboard/      # Dashboard widgets
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/
│   ├── ai/             # AI integrations (Groq, OCR)
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

## Database Setup

See [docs/DATABASE.md](docs/DATABASE.md) for schema setup.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
