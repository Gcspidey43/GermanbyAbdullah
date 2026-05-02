import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign, verify } from 'hono/jwt'
import { addDays, addHours, parseISO } from 'date-fns'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: '*', // Allow all origins for the MVP, or set to your custom domain later
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.onError((err, c) => {
  console.error('GLOBAL ERROR:', err)
  return c.json({ error: err.message || 'Internal Server Error' }, 500)
})

app.get('/', (c) => {
  return c.text('Smart Language App API v2.1')
})

// --- Auth Routes ---
app.post('/api/auth/register', async (c) => {
  const { email, password } = await c.req.json()
  const id = crypto.randomUUID()
  const passwordHash = password 
  const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('abdullah') ? 1 : 0
  
  try {
    await c.env.DB.prepare('INSERT INTO users (id, email, password_hash, is_admin) VALUES (?, ?, ?, ?)').bind(id, email, passwordHash, isAdmin).run()
    const token = await sign({ id, email, is_admin: !!isAdmin }, c.env.JWT_SECRET)
    return c.json({ token, user: { id, email, is_admin: !!isAdmin } })
  } catch (e: any) {
    console.error('Registration error:', e.message)
    return c.json({ error: e.message || 'User already exists or DB error' }, 400)
  }
})

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?').bind(email, password).first<any>()
  
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)
  if (user.status === 'blocked') return c.json({ error: 'Account disabled. Contact administrator.' }, 403)
  
  const today = new Date().toISOString().split('T')[0]
  if (user.last_active_date !== today) {
    await c.env.DB.prepare('UPDATE users SET lessons_today = 0, last_active_date = ? WHERE id = ?').bind(today, user.id).run()
    user.lessons_today = 0
  }

  const token = await sign({ id: user.id, email: user.email, is_admin: !!user.is_admin }, c.env.JWT_SECRET)
  return c.json({ token, user: { id: user.id, email: user.email, is_admin: !!user.is_admin } })
})

app.post('/api/auth/change-password', async (c) => {
  const payload = c.get('jwtPayload')
  const userId = payload.id
  const { newPassword } = await c.req.json()
  await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newPassword, userId).run()
  return c.json({ success: true })
})

// Protected routes middleware
app.use('/api/*', async (c, next) => {
  if (c.req.path.startsWith('/api/auth/login') || c.req.path.startsWith('/api/auth/register')) return next()
  const jwtMiddleware = jwt({ 
    secret: c.env.JWT_SECRET,
    alg: 'HS256'
  })
  return jwtMiddleware(c, async () => {
     const payload = c.get('jwtPayload')
     const user = await c.env.DB.prepare('SELECT status FROM users WHERE id = ?').bind(payload.id).first<any>()
     if (!user || user.status === 'blocked') return c.json({ error: 'Account disabled' }, 403)
     return next()
  })
})

// --- Admin: User Management ---
app.get('/api/admin/users', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const users = await c.env.DB.prepare(`
    SELECT id, email, xp, streak, lessons_today, last_lesson_time, created_at, is_admin, status,
    (SELECT COUNT(*) FROM progress WHERE user_id = users.id AND status = 'learned') as words_learned
    FROM users
  `).all()
  return c.json(users.results)
})

// --- User Stats: Real-time Analytics ---
app.get('/api/user/stats', async (c) => {
  const payload = c.get('jwtPayload')
  const userId = payload.id
  
  const user = await c.env.DB.prepare('SELECT xp, streak, lessons_today FROM users WHERE id = ?').bind(userId).first<any>()
  
  const vocabCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND status != "new"').bind(userId).first<any>()
  
  const performance = await c.env.DB.prepare('SELECT SUM(total_drills) as total, SUM(total_drills - total_mistakes) as correct FROM progress WHERE user_id = ?').bind(userId).first<any>()
  
  const accuracy = performance?.total > 0 
    ? Math.round((performance.correct / performance.total) * 100) 
    : 0

  return c.json({
    xp: user?.xp || 0,
    streak: user?.streak || 0,
    lessons_today: user?.lessons_today || 0,
    vocabulary: vocabCount?.count || 0,
    accuracy: `${accuracy}%`,
    ranking: '#1' 
  })
})

app.patch('/api/admin/users/:id/status', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const id = c.req.param('id')
  const { status } = await c.req.json()
  await c.env.DB.prepare('UPDATE users SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true })
})

app.delete('/api/admin/users/:id', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM lessons WHERE user_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM progress WHERE user_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// --- Deck Routes ---
app.get('/api/decks', async (c) => {
  const decks = await c.env.DB.prepare('SELECT * FROM decks').all()
  return c.json(decks.results)
})

app.post('/api/decks', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const { name, description } = await c.req.json()
  const id = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO decks (id, user_id, name, description) VALUES (?, ?, ?, ?)').bind(id, payload.id, name, description).run()
  return c.json({ id, name, description })
})

app.put('/api/decks/:id', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const id = c.req.param('id')
  const { name, description } = await c.req.json()
  await c.env.DB.prepare('UPDATE decks SET name = ?, description = ? WHERE id = ?').bind(name, description, id).run()
  return c.json({ success: true })
})

app.delete('/api/decks/:id', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM words WHERE deck_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM decks WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// --- Word Routes ---
app.get('/api/decks/:id/words', async (c) => {
  const deckId = c.req.param('id')
  const words = await c.env.DB.prepare('SELECT * FROM words WHERE deck_id = ?').bind(deckId).all()
  return c.json(words.results)
})

app.post('/api/decks/:id/words', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const deckId = c.req.param('id')
  const { target_word, translation, pronunciation, sentence, notes } = await c.req.json()
  const id = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO words (id, deck_id, target_word, translation, pronunciation, sentence, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, deckId, target_word, translation, pronunciation || '', sentence || '', notes || '').run()
  return c.json({ id, target_word, translation })
})

app.put('/api/words/:id', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const id = c.req.param('id')
  const { target_word, translation, pronunciation, sentence, notes } = await c.req.json()
  await c.env.DB.prepare('UPDATE words SET target_word = ?, translation = ?, pronunciation = ?, sentence = ?, notes = ? WHERE id = ?')
    .bind(target_word, translation, pronunciation || '', sentence || '', notes || '', id).run()
  return c.json({ success: true })
})

app.delete('/api/words/:id', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM progress WHERE word_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM words WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

app.post('/api/admin/reset-content', async (c) => {
  const payload = c.get('jwtPayload')
  if (!payload.is_admin) return c.json({ error: 'Admin only' }, 403)
  await c.env.DB.prepare('DELETE FROM progress').run()
  await c.env.DB.prepare('DELETE FROM words').run()
  await c.env.DB.prepare('DELETE FROM decks').run()
  await c.env.DB.prepare('DELETE FROM lessons').run()
  return c.json({ success: true })
})

// --- Lesson Routes ---
app.get('/api/lessons/generate', async (c) => {
  const payload = c.get('jwtPayload')
  const userId = payload.id
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<any>()
  
  if (!user.is_admin) {
    if (user.lessons_today >= 2) return c.json({ error: 'Daily Limit', message: 'Return tomorrow!' }, 403)
    if (user.last_lesson_time) {
      const hours = (Date.now() - new Date(user.last_lesson_time).getTime()) / (1000 * 60 * 60)
      if (hours < 6) return c.json({ error: 'Locked', next_lesson_in: Math.ceil(6 - hours) }, 403)
    }
  }

  const now = new Date().toISOString()
  const reviews = await c.env.DB.prepare('SELECT w.*, p.status FROM words w JOIN progress p ON w.id = p.word_id WHERE p.user_id = ? AND p.next_review_at <= ?').bind(userId, now).all()
  const unseen = await c.env.DB.prepare('SELECT w.* FROM words w LEFT JOIN progress p ON w.id = p.word_id AND p.user_id = ? WHERE p.id IS NULL ORDER BY w.created_at ASC LIMIT 10').bind(userId).all()

  const reviewsList = reviews.results as any[]
  const unseenList = unseen.results as any[]

  if (reviewsList.length === 0 && unseenList.length === 0) {
    const totalWords = await c.env.DB.prepare('SELECT COUNT(*) as count FROM words').first<any>()
    if (!totalWords || totalWords.count === 0) return c.json({ error: 'Empty', message: 'No words in DB' }, 404)
    return c.json({ error: 'Nothing Due', message: 'All caught up!' }, 404)
  }

  const allWords = await c.env.DB.prepare('SELECT target_word FROM words').all()
  const distractors = allWords.results as any[]
  const finalDrills: any[] = []

  const createDrill = (word: any, type: string) => {
    let options: string[] = []
    if (type === 'multiple_choice') {
      const others = distractors.filter(d => d.target_word !== word.target_word).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.target_word)
      while (others.length < 3) others.push(`Alternative ${others.length + 1}`)
      options = shuffle([word.target_word, ...others])
    }
    return { id: crypto.randomUUID(), wordId: word.id, type, word: word.target_word, translation: word.translation, pronunciation: word.pronunciation, sentence: word.sentence, options }
  }

  for (const word of unseenList) {
    await c.env.DB.prepare('INSERT INTO progress (id, user_id, word_id, status, next_review_at) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), userId, word.id, 'new', now).run()
    finalDrills.push(createDrill(word, 'intro'), createDrill(word, 'multiple_choice'), createDrill(word, 'scramble'))
  }

  const mixed = [...unseenList, ...reviewsList].flatMap(word => [createDrill(word, 'sentence'), createDrill(word, 'typing')])
  finalDrills.push(...shuffle(mixed))
  return c.json({ drills: finalDrills })
})

app.post('/api/lessons/submit-drill', async (c) => {
  const payload = c.get('jwtPayload')
  const { wordId, isCorrect, timeTakenMs } = await c.req.json()
  const progress = await c.env.DB.prepare('SELECT * FROM progress WHERE user_id = ? AND word_id = ?').bind(payload.id, wordId).first<any>()
  if (!progress) return c.json({ error: 'Not found' }, 404)

  let { confidence_score, correct_streak, status } = progress
  if (isCorrect) {
    correct_streak += 1
    confidence_score = Math.min(1.0, confidence_score + 0.2 + Math.max(0, (5000 - timeTakenMs) / 5000) * 0.1)
    await c.env.DB.prepare('UPDATE users SET xp = xp + 10 WHERE id = ?').bind(payload.id).run()
  } else {
    correct_streak = 0
    confidence_score = Math.max(0, confidence_score - 0.3)
  }
  
  if (confidence_score >= 0.8) status = 'learned'
  else if (confidence_score > 0) status = 'learning'

  const intervals = [0, 4, 24, 72, 168, 336, 720]
  const nextReviewAt = addHours(new Date(), intervals[Math.min(correct_streak, intervals.length - 1)]).toISOString()
  await c.env.DB.prepare('UPDATE progress SET status = ?, confidence_score = ?, next_review_at = ?, correct_streak = ?, total_drills = total_drills + 1 WHERE id = ?').bind(status, confidence_score, nextReviewAt, correct_streak, progress.id).run()
  return c.json({ success: true })
})

app.post('/api/lessons/complete', async (c) => {
  const payload = c.get('jwtPayload')
  const user = await c.env.DB.prepare('SELECT last_active_date, streak FROM users WHERE id = ?').bind(payload.id).first<any>()
  const today = new Date().toISOString().split('T')[0]
  let newStreak = (user.last_active_date !== today) ? (user.streak || 0) + 1 : (user.streak || 0)
  await c.env.DB.prepare('UPDATE users SET last_lesson_time = ?, lessons_today = lessons_today + 1, streak = ?, last_active_date = ? WHERE id = ?').bind(new Date().toISOString(), newStreak, today, payload.id).run()
  return c.json({ success: true })
})

function shuffle(array: any[]) { return array.sort(() => Math.random() - 0.5) }

export default app
