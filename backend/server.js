const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const schedulerService = require('./services/schedulerService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://fitmind-cloud.onrender.com',
    'https://fitmind-cloud.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitmind', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/email', require('./routes/email'));

// Root route for deployment health check
app.get('/', (req, res) => {
  res.send('FitMind Cloud Backend is Running');
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'FitMind API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize scheduler service
  schedulerService.startScheduler();
  
  // Auto-start daily reminders if in production or if EMAIL_USER is configured
  if (process.env.NODE_ENV === 'production' || process.env.EMAIL_USER) {
    console.log('🚀 Auto-starting daily reminder scheduler...');
    schedulerService.startDailyReminders();
  } else {
    console.log('📧 Email not configured. Use /api/email/scheduler/start to enable daily reminders.');
  }
});
