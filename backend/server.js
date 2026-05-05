const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

const getDatabaseConfig = () => {
  if (!DATABASE_URL) return null;

  const databaseUrl = new URL(DATABASE_URL);
  const isLocalDatabase = ['localhost', '127.0.0.1'].includes(databaseUrl.hostname);

  // Hosted providers often include sslmode=require, which can override pg's SSL
  // object and reject managed-provider certificates. We control SSL explicitly.
  databaseUrl.searchParams.delete('sslmode');

  return {
    connectionString: databaseUrl.toString(),
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
  };
};

const pool = DATABASE_URL
  ? new Pool(getDatabaseConfig())
  : null;

app.use(cors({
  origin: process.env.CLIENT_URL || '*'
}));
app.use(express.json());

const users = [
  { username: 'SHAHKAR', role: 'Manager' },
  { username: 'ABRAR', role: 'Trading' },
  { username: 'ANSAR', role: 'YouTube' }
];

const initDatabase = async () => {
  if (!pool) {
    throw new Error('DATABASE_URL is required. Add it to your hosting environment variables.');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS youtube_updates (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      videos_created INTEGER DEFAULT 0,
      videos_scheduled JSONB DEFAULT '[]'::jsonb,
      videos_next_week INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS trading_updates (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      positions_open INTEGER DEFAULT 0,
      positions_closed INTEGER DEFAULT 0,
      pnl NUMERIC DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS discussions (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      user_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      details TEXT,
      category TEXT DEFAULT 'General',
      assigned_to TEXT DEFAULT 'Team',
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'Medium',
      due_date DATE,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const user of users) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [user.username, hashedPassword, user.role]
    );
  }

  console.log('PostgreSQL database ready');
};

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

let databaseReady;

const ensureDatabase = () => {
  if (!databaseReady) {
    databaseReady = initDatabase();
  }
  return databaseReady;
};

const authenticateToken = (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET is missing from backend environment variables' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const toYoutubeUpdate = (row) => ({
  id: row.id,
  userId: row.user_id,
  videosCreated: row.videos_created,
  videosScheduled: row.videos_scheduled || [],
  videosNextWeek: row.videos_next_week,
  notes: row.notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const toTradingUpdate = (row) => ({
  id: row.id,
  userId: row.user_id,
  positionsOpen: row.positions_open,
  positionsClosed: row.positions_closed,
  pnl: Number(row.pnl || 0),
  notes: row.notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const toDiscussion = (row) => ({
  id: row.id,
  category: row.category,
  userId: row.user_id,
  userName: row.user_name,
  message: row.message,
  createdAt: row.created_at
});

const toTask = (row) => ({
  id: row.id,
  title: row.title,
  details: row.details || '',
  category: row.category,
  assignedTo: row.assigned_to,
  status: row.status,
  priority: row.priority,
  dueDate: row.due_date ? row.due_date.toISOString().slice(0, 10) : '',
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'worksync-pro-backend',
    database: 'postgresql',
    config: {
      databaseUrlSet: Boolean(DATABASE_URL),
      jwtSecretSet: Boolean(JWT_SECRET),
      clientUrl: process.env.CLIENT_URL || '*'
    }
  });
});

app.use(asyncRoute(async (req, res, next) => {
  await ensureDatabase();
  next();
}));

app.post('/api/login', asyncRoute(async (req, res) => {
  const username = String(req.body.username || '').trim().toUpperCase();
  const { password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid username' });

  const passwordValid = bcrypt.compareSync(password, user.password);
  if (!passwordValid) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
}));

app.get('/api/youtube/updates', authenticateToken, asyncRoute(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM youtube_updates WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
    [req.user.id]
  );

  if (!result.rows[0]) {
    return res.json({ videosCreated: 0, videosScheduled: [], videosNextWeek: 0, notes: '' });
  }

  res.json(toYoutubeUpdate(result.rows[0]));
}));

app.post('/api/youtube/updates', authenticateToken, asyncRoute(async (req, res) => {
  const { videosCreated, videosScheduled, videosNextWeek, notes } = req.body;

  const result = await pool.query(
    `INSERT INTO youtube_updates (user_id, videos_created, videos_scheduled, videos_next_week, notes, updated_at)
     VALUES ($1, $2, $3::jsonb, $4, $5, NOW())
     RETURNING id`,
    [req.user.id, videosCreated || 0, JSON.stringify(videosScheduled || []), videosNextWeek || 0, notes || '']
  );

  res.json({ id: result.rows[0].id, success: true });
}));

app.get('/api/trading/updates', authenticateToken, asyncRoute(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM trading_updates WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
    [req.user.id]
  );

  if (!result.rows[0]) {
    return res.json({ positionsOpen: 0, positionsClosed: 0, pnl: 0, notes: '' });
  }

  res.json(toTradingUpdate(result.rows[0]));
}));

app.post('/api/trading/updates', authenticateToken, asyncRoute(async (req, res) => {
  const { positionsOpen, positionsClosed, pnl, notes } = req.body;

  const result = await pool.query(
    `INSERT INTO trading_updates (user_id, positions_open, positions_closed, pnl, notes, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id`,
    [req.user.id, positionsOpen || 0, positionsClosed || 0, pnl || 0, notes || '']
  );

  res.json({ id: result.rows[0].id, success: true });
}));

app.get('/api/discussions/:category', authenticateToken, asyncRoute(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM discussions WHERE category = $1 ORDER BY created_at DESC LIMIT 50',
    [req.params.category]
  );

  res.json(result.rows.map(toDiscussion));
}));

app.post('/api/discussions', authenticateToken, asyncRoute(async (req, res) => {
  const { category, message } = req.body;

  const result = await pool.query(
    `INSERT INTO discussions (category, user_id, user_name, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [category, req.user.id, req.user.username, String(message || '').trim()]
  );

  res.json(toDiscussion(result.rows[0]));
}));

app.get('/api/tasks', authenticateToken, asyncRoute(async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM tasks
    ORDER BY
      CASE status
        WHEN 'todo' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'done' THEN 3
        ELSE 4
      END,
      CASE priority
        WHEN 'High' THEN 1
        WHEN 'Medium' THEN 2
        WHEN 'Low' THEN 3
        ELSE 4
      END,
      COALESCE(due_date, DATE '9999-12-31') ASC,
      updated_at DESC
  `);

  res.json(result.rows.map(toTask));
}));

app.post('/api/tasks', authenticateToken, asyncRoute(async (req, res) => {
  if (req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Only managers can create tasks' });
  }

  const { title, details, category, assignedTo, priority, dueDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const result = await pool.query(
    `INSERT INTO tasks (title, details, category, assigned_to, priority, due_date, created_by)
     VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, $7)
     RETURNING id`,
    [
      title.trim(),
      details || '',
      category || 'General',
      assignedTo || 'Team',
      priority || 'Medium',
      dueDate || '',
      req.user.username
    ]
  );

  res.json({ id: result.rows[0].id, success: true });
}));

app.patch('/api/tasks/:id', authenticateToken, asyncRoute(async (req, res) => {
  const allowedStatuses = ['todo', 'in_progress', 'done'];
  if (req.body.status && !allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ error: 'Invalid task status' });
  }

  const fieldMap = {
    status: 'status',
    priority: 'priority',
    assignedTo: 'assigned_to',
    title: 'title',
    details: 'details',
    category: 'category',
    dueDate: 'due_date'
  };

  const sets = [];
  const values = [];

  Object.entries(fieldMap).forEach(([bodyField, dbField]) => {
    if (req.body[bodyField] !== undefined) {
      values.push(req.body[bodyField]);
      if (bodyField === 'dueDate') {
        sets.push(`${dbField} = NULLIF($${values.length}, '')::date`);
      } else {
        sets.push(`${dbField} = $${values.length}`);
      }
    }
  });

  if (sets.length === 0) {
    return res.status(400).json({ error: 'No task updates provided' });
  }

  values.push(req.params.id);
  const result = await pool.query(
    `UPDATE tasks SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`,
    values
  );

  if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
}));

app.delete('/api/tasks/:id', authenticateToken, asyncRoute(async (req, res) => {
  if (req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Only managers can delete tasks' });
  }

  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
}));

app.get('/api/dashboard/team', authenticateToken, asyncRoute(async (req, res) => {
  if (req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Only managers can view team data' });
  }

  const usersResult = await pool.query('SELECT id, username, role FROM users ORDER BY id ASC');
  const teamData = {};

  for (const user of usersResult.rows) {
    const youtubeResult = await pool.query(
      'SELECT * FROM youtube_updates WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [user.id]
    );
    const tradingResult = await pool.query(
      'SELECT * FROM trading_updates WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [user.id]
    );

    teamData[user.username] = {
      role: user.role,
      youtube: youtubeResult.rows[0]
        ? toYoutubeUpdate(youtubeResult.rows[0])
        : { videosCreated: 0, videosScheduled: [], videosNextWeek: 0, notes: '' },
      trading: tradingResult.rows[0]
        ? toTradingUpdate(tradingResult.rows[0])
        : { positionsOpen: 0, positionsClosed: 0, pnl: 0, notes: '' }
    };
  }

  res.json(teamData);
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

if (require.main === module) {
  ensureDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`WorkSync Pro Backend running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

module.exports = app;
