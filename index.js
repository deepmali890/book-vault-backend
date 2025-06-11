const express = require('express');
require('dotenv').config();
require('./src/db/config');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const bookCategoryRoutes = require('./src/routes/bookCategory.routes');
const subCategoryRoutes = require('./src/routes/subCategory.routes');
const bookRoutes = require('./src/routes/book.routes');
const episodeRoutes = require('./src/routes/episode.routes');
const sliderRoutes = require('./src/routes/slider.routes');
const cartRoutes = require('./src/routes/cart.routes');

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'https://your-nextjs-app-domain.com'], // Yahan apne frontend ke actual domains dalen
  credentials: true, // Cookies ko cross-origin bhejane/receive karne ki permission deta hai
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookCategory', bookCategoryRoutes);
app.use('/api/subCategory', subCategoryRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/episode', episodeRoutes);
app.use('/api/slider', sliderRoutes);
app.use('/api/cart', cartRoutes);

// Global error handler
app.use((error, req, res, next) => {
  const message = error.message || 'Server Error';
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ message });
});

app.get('/', (req, res) => {
  res.send('Welcome to the Book Store API!');
});

// Always bind to PORT — for both dev & Render
const PORT = process.env.PORT || 1200;
app.listen(PORT, () => {
  console.log(`🚀 Server is live at: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
