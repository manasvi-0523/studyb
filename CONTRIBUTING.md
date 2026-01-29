# Contributing to Elite

Thank you for your interest in contributing to Elite!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure (Firebase optional for dev)
4. Start dev server: `npm run dev`

## Code Style

- Use TypeScript for all new files
- Follow existing code patterns
- Use functional components with hooks
- Keep components small and focused
- Use Tailwind CSS for styling
- Support both light and dark themes

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React contexts (Auth, Theme)
├── lib/            # Utilities and services
├── pages/          # Route pages
├── state/          # Zustand stores
└── types.ts        # TypeScript definitions
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly (including mobile view)
4. Run `npm run build` to ensure no errors
5. Submit PR with clear description

## Commit Messages

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code refactoring
- `style:` styling changes
- `test:` adding tests

## Testing Checklist

- [ ] Works on desktop (1024px+)
- [ ] Works on mobile (<1024px)
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Works without Firebase (dev mode)

## Questions?

Open an issue for any questions or concerns.
