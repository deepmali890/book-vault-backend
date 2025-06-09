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

// CORS config (change to your frontend domain after deploy)
app.use(cors({
  origin: 'http://localhost:1200', // Replace with your frontend deployed URL on production
  credentials: true,
}));

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

// Always bind to PORT — for both dev & Render
const PORT = process.env.PORT || 1200;
app.listen(PORT, () => {
  console.log(`🚀 Server is live at: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
