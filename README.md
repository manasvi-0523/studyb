# StudyB - Elite Study Platform

A modern, AI-powered study platform built with React, TypeScript, and Firebase. Features intelligent quiz generation, spaced repetition flashcards, and collaborative study tools.

## Features

### 🎯 Core Features
- **AI-Powered Quiz Generation** - Generate custom quizzes from your study materials using Groq AI
- **Smart Flashcards** - Spaced repetition system (SM-2 algorithm) for optimal learning
- **File Upload** - Drag-and-drop support for PDFs and images with OCR
- **Authentication** - Secure email/password authentication with Firebase
- **Dark Mode** - Beautiful dark/light theme toggle
- **Mobile Responsive** - Optimized for all devices with bottom navigation

### 📚 Study Tools
- **Dashboard** - Priority matrix, analytics, and attendance tracking
- **Timeline** - Visual calendar for planning study sessions
- **Community** - Study rooms and opportunity feed
- **Bot Prep** - AI-assisted content generation from your materials

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: Groq SDK (Llama 3.3)
- **PDF Processing**: PDF.js
- **State Management**: Zustand
- **Routing**: React Router v6

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Groq API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manasvi-0523/studyb.git
   cd studyb
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**:
   ```env
   # Groq AI API Key
   VITE_GROQ_API_KEY=your_groq_api_key

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to `http://localhost:5173`

## Firebase Setup

1. Create a new project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** authentication
3. Create a Firestore database
4. Copy your configuration to `.env`
5. Add your deployment domain to authorized domains

## Groq API Setup

1. Sign up at [Groq Console](https://console.groq.com/)
2. Generate an API key
3. Add to your `.env` file

## Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Add environment variables
   - Deploy

3. **Configure Firebase**:
   - Add your Vercel domain to Firebase authorized domains
   - Update CORS settings if needed

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment and testing instructions.

## Project Structure

```
studyb/
├── src/
│   ├── components/       # React components
│   │   ├── auth/        # Authentication components
│   │   ├── community/   # Community features
│   │   ├── dashboard/   # Dashboard widgets
│   │   └── layout/      # Layout components
│   ├── context/         # React context providers
│   ├── lib/             # Utilities and services
│   │   ├── ai/          # AI integration (Groq, OCR)
│   │   └── srs/         # Spaced repetition system
│   ├── pages/           # Page components
│   ├── state/           # State management (Zustand)
│   └── types.ts         # TypeScript types
├── public/              # Static assets
└── dist/                # Build output
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Features in Detail

### Quiz Generation
Upload study materials (PDF/images) and generate custom multiple-choice quizzes with:
- 4 answer options per question
- Detailed explanations
- Difficulty levels
- Subject categorization

### Flashcard System
Create flashcards with spaced repetition:
- SM-2 algorithm for optimal scheduling
- Easy/Medium/Hard rating
- Due date tracking
- Progress analytics

### File Upload
Supports multiple formats:
- PDF documents (text extraction)
- Images (OCR with Tesseract.js)
- Drag-and-drop interface
- File validation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome)

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is private and proprietary.

## Support

For issues and questions:
- Create an issue on GitHub
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for troubleshooting

## Acknowledgments

- [Groq](https://groq.com/) for AI inference
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

---

Built with ❤️ by the StudyB Team
