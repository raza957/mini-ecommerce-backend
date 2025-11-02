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

// Middleware
app.use(cors());
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
});
