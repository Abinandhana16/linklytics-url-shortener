require('dotenv').config();
const express = require('express');
const cors = require('cors');
const useragent = require('express-useragent');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');
const analyticsRoutes = require('./routes/analytics');
const { handleRedirect } = require('./controllers/redirect');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(useragent.express());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root Short-URL Redirect Endpoint
app.get('/:shortCode', handleRedirect);

// Simple Health Check / Test Route
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Linklytics Server is running successfully' });
});

// Default Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
