const sqlite3 = require('sqlite3').verbose();

// Create database and tables
const db = new sqlite3.Database('./ecommerce.db');

db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    stock INTEGER DEFAULT 0
  )`);

  // Create orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample plant products
  const products = [
    {
      name: 'Monstera Deliciosa',
      description: 'A beautiful tropical plant with large, split leaves. Perfect for indoor decoration.',
      price: 35.99,
      category: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1585598117791-876ce25c1884?w=400&h=400&fit=crop',
      stock: 15
    },
    {
      name: 'Snake Plant',
      description: 'Low-maintenance succulent that thrives in low light conditions.',
      price: 24.99,
      category: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=400&h=400&fit=crop',
      stock: 20
    },
    {
      name: 'Fiddle Leaf Fig',
      description: 'A popular houseplant with large, violin-shaped leaves.',
      price: 45.99,
      category: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1545239705-1564e58b9e4a?w=400&h=400&fit=crop',
      stock: 12
    },
    {
      name: 'Peace Lily',
      description: 'Elegant flowering plant that purifies the air.',
      price: 28.99,
      category: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1616694547693-b0f829a6cf30?w=400&h=400&fit=crop',
      stock: 18
    },
    {
      name: 'Rubber Plant',
      description: 'Glossy-leaved indoor plant that\'s easy to care for.',
      price: 32.99,
      category: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1669392597221-bbfd4b6e13ff?w=400&h=400&fit=crop',
      stock: 16
    },
    {
      name: 'Lavender',
      description: 'Fragrant herb perfect for gardens and aromatherapy.',
      price: 15.99,
      category: 'Outdoor Plants',
      image: 'https://images.unsplash.com/photo-1611909023032-2d6b3134ecba?w=400&h=400&fit=crop',
      stock: 25
    },
    {
      name: 'Rose Bush',
      description: 'Beautiful flowering bush perfect for outdoor gardens.',
      price: 38.99,
      category: 'Outdoor Plants',
      image: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400&h=400&fit=crop',
      stock: 14
    },
    {
      name: 'Sunflower',
      description: 'Bright and cheerful annual flower for your garden.',
      price: 9.99,
      category: 'Outdoor Plants',
      image: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&h=400&fit=crop',
      stock: 35
    },
    {
      name: 'Marigold',
      description: 'Colorful annual flowers that repel garden pests.',
      price: 7.99,
      category: 'Outdoor Plants',
      image: 'https://images.unsplash.com/photo-1620005807545-2e08850d6591?w=400&h=400&fit=crop',
      stock: 40
    },
    {
      name: 'Rosemary',
      description: 'Aromatic herb great for cooking and landscaping.',
      price: 12.99,
      category: 'Herbs',
      image: 'https://images.unsplash.com/photo-1582745741856-1a5d68158ba3?w=400&h=400&fit=crop',
      stock: 30
    },
    {
      name: 'Basil',
      description: 'Fresh basil for your kitchen garden.',
      price: 8.99,
      category: 'Herbs',
      image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=400&fit=crop',
      stock: 40
    },
    {
      name: 'Mint',
      description: 'Refreshing herb perfect for teas and cooking.',
      price: 10.99,
      category: 'Herbs',
      image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&h=400&fit=crop',
      stock: 32
    },
    {
      name: 'Thyme',
      description: 'Versatile culinary herb with a delightful fragrance.',
      price: 11.99,
      category: 'Herbs',
      image: 'https://images.unsplash.com/photo-1606072104299-cdaab62c0a07?w=400&h=400&fit=crop',
      stock: 26
    },
    {
      name: 'Oregano',
      description: 'Essential Mediterranean herb for Italian dishes.',
      price: 9.99,
      category: 'Herbs',
      image: 'https://images.unsplash.com/photo-1690877468013-f5c174498a53?w=400&h=400&fit=crop',
      stock: 28
    },
    {
      name: 'Succulent Mix',
      description: 'A variety of small succulents perfect for beginners.',
      price: 19.99,
      category: 'Succulents',
      image: 'https://images.unsplash.com/photo-1692052191004-73d930963a2f?w=400&h=400&fit=crop',
      stock: 22
    },
    {
      name: 'Aloe Vera',
      description: 'Healing succulent with medicinal properties.',
      price: 16.99,
      category: 'Succulents',
      image: 'https://images.unsplash.com/photo-1570295835271-04c05b4ed943?w=400&h=400&fit=crop',
      stock: 28
    },
    {
      name: 'Jade Plant',
      description: 'Lucky succulent with thick, glossy leaves.',
      price: 21.99,
      category: 'Succulents',
      image: 'https://images.unsplash.com/photo-1616189596748-20a7a4687a62?w=400&h=400&fit=crop',
      stock: 24
    },
    {
      name: 'Echeveria',
      description: 'Rosette-shaped succulent with beautiful colors.',
      price: 14.99,
      category: 'Succulents',
      image: 'https://images.unsplash.com/photo-1668508380767-a13f204bde1c?w=400&h=400&fit=crop',
      stock: 30
    },
    {
      name: 'Ceramic Plant Pot',
      description: 'Beautiful ceramic pot for your favorite plants.',
      price: 22.99,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop',
      stock: 35
    },
    {
      name: 'Plant Care Kit',
      description: 'Complete kit with fertilizer, pruning shears, and watering can.',
      price: 34.99,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      stock: 15
    },
    {
      name: 'Organic Potting Soil',
      description: 'Premium organic soil mix for healthy plant growth.',
      price: 14.99,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      stock: 50
    },
    {
      name: 'Watering Can',
      description: 'Elegant copper watering can for your garden.',
      price: 18.99,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1667992714862-df8713baf8c6?w=400&h=400&fit=crop',
      stock: 20
    },
    {
      name: 'Plant Fertilizer',
      description: 'Organic fertilizer for healthy plant growth.',
      price: 12.99,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1710666184386-9f42d0227237?w=400&h=400&fit=crop',
      stock: 45
    }
  ];

  const stmt = db.prepare('INSERT INTO products (name, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)');
  
  products.forEach(product => {
    stmt.run(product.name, product.description, product.price, product.category, product.image, product.stock);
  });
  
  stmt.finalize();

  console.log('Database initialized with sample data!');
});

db.close();