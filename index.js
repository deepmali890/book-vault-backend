const express = require('express');
require('dotenv').config()
require('./src/db/config')
const cors = require('cors')
const authRoutes = require('./src/routes/auth.routes')
const bokkCategoryRoutes = require('./src/routes/bookCategory.routes')
const subCategoryRoutes = require('./src/routes/subCategory.routes')
const bookRoutes = require('./src/routes/book.routes')
const episodeRoutes = require('./src/routes/episode.routes')
const sliderRoutes = require('./src/routes/slider.routes')
const cartRoutes = require('./src/routes/cart.routes')
const cookieParser = require('cookie-parser');


const app = express();

app.use(cors({
  origin: 'http://localhost:1200',  // your frontend URL
  credentials: true,                // cookies need this ON
}));


app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes)
app.use('/api/bookCategory',bokkCategoryRoutes)
app.use('/api/subCategory',subCategoryRoutes)
app.use('/api/book',bookRoutes)
app.use('/api/episode',episodeRoutes)
app.use('/api/slider', sliderRoutes)
app.use('/api/cart', cartRoutes)


app.use((error, req, res, next) => {
  const message = error.message || 'server error'
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ message: message });

})
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 1200;
  app.listen(PORT, () => {
    console.log(`🚀 Server is live at: http://localhost:${PORT}
    🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

