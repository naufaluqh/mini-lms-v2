const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Serve static assets from public folder
app.use(express.static('public'));

// Import route files
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Mount route handlers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/reports', reportRoutes);

// Import middleware for the mock route
const { protect, restrictTo } = require('./middleware/authMiddleware');

// Mock protected route for testing roles (Admin only)
app.get('/api/admin-only', protect, restrictTo('admin'), (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Access granted: Welcome to the Admin panel!',
    user: req.user,
  });
});

// Default status endpoint
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to the Mini LMS V2.0 API backend!',
    status: 'healthy',
  });
});

// 404 Route handler for undefined endpoints
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API resource or endpoint not found.',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Mini LMS V2.0] Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
