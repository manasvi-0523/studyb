# Firebase / Firestore Structure

Elite uses Firebase for authentication and Firestore for data storage.

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password sign-in method
3. Create a **Firestore Database** in production mode
4. Copy your Firebase config to `.env`

## Firestore Collections

### Collection: `users/{userId}`

User profile document.

```typescript
{
  displayName: string,
  email: string,
  createdAt: Timestamp,
  lastActive: Timestamp,
  preferences: {
    notifications: boolean,
    emailNotifications: boolean,
    theme: "light" | "dark" | "system"
  }
}
```

### Subcollection: `users/{userId}/sessions`

Study session records.

```typescript
{
  id: string,
  subjectId: "biology" | "physics" | "chemistry" | "maths" | "other",
  startedAt: string (ISO),
  endedAt: string (ISO),
  durationMinutes: number,
  createdAt: Timestamp
}
```

### Subcollection: `users/{userId}/flashcards`

Flashcards with SM-2 spaced repetition data.

```typescript
{
  id: string,
  front: string,
  back: string,
  subjectId: string,
  interval: number,      // Days until next review (default: 1)
  repetition: number,    // Successful review count (default: 0)
  ef: number,            // Easiness factor (default: 2.5, range: 1.3-2.5)
  dueAt: string (ISO),   // Next review timestamp
  updatedAt: Timestamp
}
```

### Subcollection: `users/{userId}/questions`

Generated quiz questions.

```typescript
{
  id: string,
  question: string,
  options: [
    { id: "a", text: string },
    { id: "b", text: string },
    { id: "c", text: string },
    { id: "d", text: string }
  ],
  correctOptionId: "a" | "b" | "c" | "d",
  explanation: string,
  subjectId: string,
  difficulty: "easy" | "medium" | "hard",
  createdAt: Timestamp
}
```

### Subcollection: `users/{userId}/notifications`

Push notifications for the user.

```typescript
{
  title: string,
  message: string,
  createdAt: Timestamp,
  read: boolean
}
```

## Security Rules

Add these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Subcollections inherit the same rule
      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /flashcards/{flashcardId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /questions/{questionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /notifications/{notificationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Subject IDs

Valid subject IDs used throughout the app:

| ID | Display Name |
|----|--------------|
| `biology` | Biology |
| `physics` | Physics |
| `chemistry` | Chemistry |
| `maths` | Mathematics |
| `other` | Other |

## SM-2 Algorithm Fields

The flashcards use the SM-2 spaced repetition algorithm:

| Field | Description | Default |
|-------|-------------|---------|
| `interval` | Days until next review | 1 |
| `repetition` | Number of successful reviews | 0 |
| `ef` | Easiness factor (1.3 - 2.5) | 2.5 |
| `dueAt` | Next scheduled review timestamp | now |

## Indexes

Create these composite indexes in Firebase Console → Firestore → Indexes:

1. **flashcards** - `subjectId` ASC, `dueAt` ASC
2. **questions** - `subjectId` ASC, `createdAt` DESC
3. **sessions** - `startedAt` DESC
4. **notifications** - `createdAt` DESC
