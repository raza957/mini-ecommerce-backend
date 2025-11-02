const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ Simple CORS - ALL origins allow karein
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware
app.use(express.json());

// ✅ Simple health route - ye add karein
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// ✅ Basic routes - temporarily without MongoDB
app.get('/api', (req, res) => {
  res.json({ message: 'Ecommerce API is running!' });
});

// ✅ Mock auth routes for testing
app.post('/api/auth/login', (req, res) => {
  res.json({
    token: 'mock-jwt-token-for-testing',
    user: {
      id: 1,
      name: 'Test User',
      email: req.body.email
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    token: 'mock-jwt-token-for-testing',
    user: {
      id: 1,
      name: req.body.name,
      email: req.body.email
    }
  });
});

// ✅ Mock products route
app.get('/api/products', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Sample Product 1',
      price: 99.99,
      description: 'This is a sample product for testing'
    },
    {
      id: 2, 
      name: 'Sample Product 2',
      price: 149.99,
      description: 'Another sample product for testing'
    }
  ]);
});

// Serve static files (if any)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check available at: /api/health`);
  console.log(`✅ API available at: /api`);
});