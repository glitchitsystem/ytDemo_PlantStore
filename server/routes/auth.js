const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable
const db = new sqlite3.Database('./ecommerce.db');

// Create users table if it doesn't exist and add missing columns
db.serialize(() => {
  // Create table with all required columns
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.log('Table creation error (might already exist):', err.message);
    }
  });

  // Check if name column exists and add it if missing
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Error checking table structure:', err);
      return;
    }
    
    const hasNameColumn = columns.some(col => col.name === 'name');
    if (!hasNameColumn) {
      db.run("ALTER TABLE users ADD COLUMN name TEXT DEFAULT 'Unknown'", (alterErr) => {
        if (alterErr) {
          console.error('Error adding name column:', alterErr);
        } else {
          console.log('Added name column to users table');
        }
      });
    }
  });
});

// Register route
router.post('/register', (req, res) => {
  console.log('Register route hit:', req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password and create user
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('Hash error:', hashErr);
        return res.status(500).json({ error: 'Server error' });
      }

      // Insert user
      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function(insertErr) {
          if (insertErr) {
            console.error('Insert error:', insertErr);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Generate token
          const token = jwt.sign({ userId: this.lastID }, JWT_SECRET, { expiresIn: '24h' });

          res.status(201).json({
            user: { id: this.lastID, name, email },
            token
          });
        }
      );
    });
  });
});

// Login route
router.post('/login', (req, res) => {
  console.log('Login route hit:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (compareErr, validPassword) => {
      if (compareErr) {
        console.error('Compare error:', compareErr);
        return res.status(500).json({ error: 'Server error' });
      }

      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token
      });
    });
  });
});

// Get current user route
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.get('SELECT id, name, email FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({ user });
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
