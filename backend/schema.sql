-- Schema for Smart Language Learning App

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_admin BOOLEAN DEFAULT FALSE,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active_date DATE,
  last_lesson_time DATETIME,
  lessons_today INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL,
  target_word TEXT NOT NULL,
  translation TEXT NOT NULL,
  pronunciation TEXT,
  sentence TEXT,
  notes TEXT,
  tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES decks(id)
);

CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'learning', 'learned'
  confidence_score REAL DEFAULT 0.0, -- 0.0 to 1.0
  next_review_at DATETIME,
  last_reviewed_at DATETIME,
  correct_streak INTEGER DEFAULT 0,
  total_drills INTEGER DEFAULT 0,
  total_mistakes INTEGER DEFAULT 0,
  avg_time_ms REAL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (word_id) REFERENCES words(id)
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
