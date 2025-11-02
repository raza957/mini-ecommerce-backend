const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/category');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();


const allowedOrigins = [
  'http://localhost:3000',
  'https://venerable-torte-f9f275.netlify.app/', 
  'https://*.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or ends with netlify.app
    if (allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || origin.endsWith('.netlify.app');
    })) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Home route for API check
app.get('/api', (req, res) => {
  res.json({ message: 'Mini Ecommerce API is running!' });
});

// Health check route - ADD THIS
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible build locations
  const possibleBuildPaths = [
    path.join(__dirname, '../frontend/build'),
    path.join(__dirname, '../frontend-build'),
    path.join(__dirname, '../../frontend/build'),
    path.join(__dirname, './frontend/build')
  ];

  let buildPath = null;
  for (const buildPathOption of possibleBuildPaths) {
    if (require('fs').existsSync(buildPathOption)) {
      buildPath = buildPathOption;
      console.log(`Found frontend build at: ${buildPath}`);
      break;
    }
  }

  if (buildPath) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    console.log('Frontend build not found. Serving API only.');
    app.get('/', (req, res) => {
      res.json({ 
        message: 'API is running. Frontend build not found.',
        api_endpoints: ['/api', '/api/auth', '/api/products', '/api/categories', '/api/cart', '/api/orders']
      });
    });
  }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
});