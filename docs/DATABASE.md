# Database Schema

SARWAK uses Supabase for backend storage. Run these SQL commands in your Supabase SQL editor.

## Tables

### study_sessions

Tracks user study sessions.

```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster user queries
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_started_at ON study_sessions(started_at);

-- RLS Policy
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = user_id);
```

### flashcards

Stores flashcards with SM-2 spaced repetition data.

```sql
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  interval INTEGER DEFAULT 1,
  repetition INTEGER DEFAULT 0,
  ef DECIMAL(4,2) DEFAULT 2.5,
  due_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_due_at ON flashcards(due_at);
CREATE INDEX idx_flashcards_subject_id ON flashcards(subject_id);

-- RLS Policy
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcards"
  ON flashcards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards"
  ON flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards"
  ON flashcards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards"
  ON flashcards FOR DELETE
  USING (auth.uid() = user_id);
```

### drill_questions

Stores generated quiz questions.

```sql
CREATE TABLE drill_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation TEXT,
  subject_id TEXT NOT NULL,
  difficulty TEXT DEFAULT 'hard',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_drill_questions_user_id ON drill_questions(user_id);
CREATE INDEX idx_drill_questions_subject_id ON drill_questions(subject_id);

-- RLS Policy
ALTER TABLE drill_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questions"
  ON drill_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions"
  ON drill_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions"
  ON drill_questions FOR DELETE
  USING (auth.uid() = user_id);
```

## Subject IDs

Valid subject IDs used throughout the app:
- `biology`
- `physics`
- `chemistry`
- `maths`
- `other`

## SM-2 Algorithm Fields

The flashcards table includes SM-2 spaced repetition fields:
- `interval`: Days until next review (starts at 1)
- `repetition`: Number of successful reviews
- `ef`: Easiness factor (2.5 default, ranges 1.3-2.5)
- `due_at`: Next scheduled review timestamp
