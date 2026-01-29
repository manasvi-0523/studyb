# Deployment & Testing Checklist

## Pre-Deployment Setup

### 1. Environment Variables
Before deploying to Vercel, ensure you have the following environment variables configured:

#### Required Variables:
- `VITE_GROQ_API_KEY` - Get from [Groq Console](https://console.groq.com/)
- `VITE_FIREBASE_API_KEY` - From Firebase Console
- `VITE_FIREBASE_AUTH_DOMAIN` - From Firebase Console
- `VITE_FIREBASE_PROJECT_ID` - From Firebase Console
- `VITE_FIREBASE_STORAGE_BUCKET` - From Firebase Console
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
- `VITE_FIREBASE_APP_ID` - From Firebase Console

### 2. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Configure authorized domains (add your Vercel domain)
4. Copy configuration values to environment variables

### 3. Groq API Setup
1. Sign up at [Groq Console](https://console.groq.com/)
2. Generate an API key
3. Add to environment variables

## Deployment Steps

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables in project settings
   - Deploy

3. **Or Deploy via CLI**:
   ```bash
   vercel
   ```

4. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Redeploy after adding variables

## Testing Plan

### ✅ Authentication Flow
- [ ] Sign up with email/password
- [ ] Verify email verification flow
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Logout functionality
- [ ] Protected routes redirect to /auth when not logged in
- [ ] Authenticated users can access dashboard

### ✅ File Upload & Processing
- [ ] Drag and drop PDF file
- [ ] Drag and drop image file (PNG/JPG)
- [ ] Click to upload file
- [ ] File size validation
- [ ] File type validation
- [ ] OCR processing for images
- [ ] PDF text extraction
- [ ] Display extracted text preview

### ✅ Quiz Generation
- [ ] Select subject from dropdown
- [ ] Upload study material
- [ ] Click "Generate Quiz"
- [ ] Quiz questions display correctly
- [ ] Multiple choice options work
- [ ] Submit answers
- [ ] View correct/incorrect feedback
- [ ] See explanations for answers
- [ ] Retry quiz functionality

### ✅ Flashcard Generation
- [ ] Select subject from dropdown
- [ ] Upload study material
- [ ] Click "Generate Flashcards"
- [ ] Flashcards display correctly
- [ ] Flip card animation works
- [ ] Navigate between cards
- [ ] Rate difficulty (Easy/Medium/Hard)
- [ ] Spaced repetition scheduling works
- [ ] Due dates update correctly

### ✅ Mobile Responsiveness
- [ ] Test on mobile device (or Chrome DevTools mobile view)
- [ ] Bottom navigation visible on mobile
- [ ] Bottom navigation hidden on desktop
- [ ] Hamburger menu works on mobile
- [ ] Sidebar toggles correctly
- [ ] All pages are mobile-friendly
- [ ] Touch interactions work smoothly
- [ ] File upload works on mobile

### ✅ Settings Page
- [ ] Profile section displays user email
- [ ] Email verification status shows correctly
- [ ] Resend verification email works
- [ ] Notification preferences toggle
- [ ] Browser notification permission request
- [ ] Theme toggle (light/dark mode)
- [ ] Logout button works
- [ ] Settings persist after page reload

### ✅ Dashboard Features
- [ ] Priority Matrix displays tasks
- [ ] Analytical Corner shows stats
- [ ] Attendance Pulse displays calendar
- [ ] All widgets load without errors
- [ ] Data updates in real-time

### ✅ Community Features
- [ ] Study Room List displays rooms
- [ ] Opportunity Feed shows posts
- [ ] Join/leave study rooms
- [ ] Create new posts

### ✅ Timeline Page
- [ ] Calendar view displays correctly
- [ ] Add new events
- [ ] Edit existing events
- [ ] Delete events
- [ ] Events persist after reload

### ✅ Error Handling
- [ ] ErrorBoundary catches component errors
- [ ] Graceful error messages display
- [ ] App doesn't crash on errors
- [ ] Network errors handled properly
- [ ] API errors show user-friendly messages

### ✅ Performance
- [ ] Initial page load < 3 seconds
- [ ] Navigation is smooth
- [ ] No console errors
- [ ] No memory leaks
- [ ] Images load efficiently

## Browser Testing

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Post-Deployment Verification

1. **Check Deployment URL**:
   - [ ] Site loads successfully
   - [ ] No 404 errors
   - [ ] All routes work correctly

2. **Verify Environment Variables**:
   - [ ] API calls work (check Network tab)
   - [ ] Firebase authentication works
   - [ ] Groq AI generation works

3. **Monitor Logs**:
   - [ ] Check Vercel deployment logs
   - [ ] Check browser console for errors
   - [ ] Monitor Firebase usage

## Known Issues & Limitations

- PDF.js worker is bundled locally (no CDN dependency)
- Groq API has rate limits (check your plan)
- Firebase free tier has usage limits
- Browser notifications require HTTPS

## Troubleshooting

### Issue: "VITE_GROQ_API_KEY is missing"
**Solution**: Add the environment variable in Vercel project settings and redeploy

### Issue: Firebase authentication not working
**Solution**: Check that your Vercel domain is added to Firebase authorized domains

### Issue: File upload not working
**Solution**: Check browser console for CORS errors, verify file size limits

### Issue: Mobile layout broken
**Solution**: Clear browser cache, check Tailwind CSS is building correctly

## Success Criteria

Deployment is successful when:
- ✅ All authentication flows work
- ✅ File upload and processing work
- ✅ Quiz and flashcard generation work
- ✅ Mobile layout is responsive
- ✅ No critical errors in console
- ✅ All core features are functional

---

**Last Updated**: January 29, 2026
**Status**: Ready for deployment
