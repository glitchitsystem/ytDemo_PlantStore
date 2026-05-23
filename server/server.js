const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Database connection
const db = new sqlite3.Database('./ecommerce.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Import routes
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/auth', authRoutes);
console.log('Auth routes mounted at /api/auth');

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional auth middleware (doesn't require token)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but continue without user
    }
  }
  next();
};

// Initialize database tables and sample data
function initializeDatabase() {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    }
  });

  // Create products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    category TEXT,
    image TEXT,
    stock INTEGER DEFAULT 0
  )`, (err) => {
    if (err) {
      console.error('Error creating products table:', err.message);
    } else {
      // Check if products exist, if not, insert sample data
      db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err) {
          console.error('Error checking products:', err.message);
        } else if (row.count === 0) {
          insertSampleProducts();
        }
      });
    }
  });

  // Update orders table to include userId
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    customerName TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);
}

// Insert sample products
function insertSampleProducts() {
  const sampleProducts = [
    {
      name: 'Snake Plant',
      price: 29.99,
      description: 'Low-maintenance indoor plant perfect for beginners',
      category: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400',
      stock: 15
    },
    {
      name: 'Fiddle Leaf Fig',
      price: 49.99,
      description: 'Popular indoor tree with large, glossy leaves',
      category: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1545239705-1564e58b9e4a?w=400',
      stock: 8
    },
    {
      name: 'Monstera Deliciosa',
      price: 39.99,
      description: 'Trendy plant with unique split leaves',
      category: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1585598117791-876ce25c1884?w=400',
      stock: 12
    },
    {
      name: 'Lavender Plant',
      price: 24.99,
      description: 'Fragrant outdoor plant perfect for gardens',
      category: 'Outdoor Plants',
      image: 'https://images.unsplash.com/photo-1611909023032-2d6b3134ecba?w=400',
      stock: 20
    }
  ];

  const stmt = db.prepare('INSERT INTO products (name, price, description, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)');
  
  sampleProducts.forEach(product => {
    stmt.run([product.name, product.price, product.description, product.category, product.image, product.stock]);
  });
  
  stmt.finalize();
  console.log('Sample products inserted');
}

// Routes

// Get all products
app.get('/api/products', (req, res) => {
  console.log('Fetching all products...');
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`Found ${rows.length} products`);
    res.json(rows);
  });
});

// Single product endpoint
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  console.log('Fetching product with ID:', id);
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      console.log('Product found:', row);
      res.json(row);
    } else {
      console.log('Product not found for ID:', id);
      res.status(404).json({ error: 'Product not found' });
    }
  });
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
  const { category } = req.params;
  db.all('SELECT * FROM products WHERE category = ?', [category], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});

// Authentication Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.run(
        'INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, firstName, lastName],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { 
              userId: this.lastID, 
              email: email,
              firstName: firstName,
              lastName: lastName 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
              id: this.lastID,
              email,
              firstName,
              lastName
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Get current user profile
app.get('/api/auth/me', verifyToken, (req, res) => {
  db.get('SELECT id, email, firstName, lastName, createdAt FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });
});

// Orders endpoint
app.post('/api/orders', async (req, res) => {
  console.log('Order creation request:', req.body);
  const { items, total, shipping } = req.body;
  const { name, email } = shipping;

  // Validate required fields
  if (!items || !total || !name || !email) {
    return res.status(400).json({ error: 'Missing required order information' });
  }

  // Validate and adjust stock for each item before creating order
  let adjustedItems = [];
  let stockErrors = [];
  for (const item of items) {
    await new Promise((resolve) => {
      db.get('SELECT stock, name FROM products WHERE id = ?', [item.id], (err, row) => {
        if (err || !row) {
          stockErrors.push(`Product not found (ID ${item.id})`);
        } else if (row.stock < item.quantity) {
          // Adjust quantity to max available
          adjustedItems.push({ ...item, quantity: row.stock });
          stockErrors.push(`Not enough stock for "${row.name}". Only ${row.stock} available. Your cart has been updated.`);
        } else {
          adjustedItems.push(item);
        }
        resolve();
      });
    });
  }
  if (stockErrors.length > 0) {
    return res.status(400).json({ errors: stockErrors, adjustedItems });
  }

  db.run(
    'INSERT INTO orders (customerName, customerEmail, items, total, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, JSON.stringify(adjustedItems), total, 'pending', new Date().toISOString()],
    function(err) {
      if (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ error: 'Failed to create order: ' + err.message });
        return;
      }
      
      console.log('Order created successfully with ID:', this.lastID);

      // Subtract stock for each item
      adjustedItems.forEach(item => {
        db.run(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.id, item.quantity]
        );
      });

      res.json({ 
        id: this.lastID, 
        message: 'Order placed successfully',
        orderId: this.lastID
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});