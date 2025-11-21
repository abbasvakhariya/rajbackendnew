import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import rateRoutes from './routes/rate.routes.js';
import toolSettingsRoutes from './routes/toolSettings.routes.js';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import quotationRoutes from './routes/quotation.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import windowRoutes from './routes/window.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://windowsmangement.vercel.app';
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://windowsmangement.vercel.app',
    'http://windowsmangement.vercel.app',
    FRONTEND_URL,
    FRONTEND_URL.replace('https://', 'http://'),
    FRONTEND_URL.replace('http://', 'https://')
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.set('bufferCommands', false); // Disable mongoose buffering

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abbas:abbas123@abbas.tdhnt9r.mongodb.net/windows-management-system?retryWrites=true&w=majority&appName=abbas';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Timeout after 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 30000, // Connection timeout
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Maintain at least 1 socket connection
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
})
.catch((error) => {
  console.error('❌ MongoDB Connection Error:', error.message);
  console.log('⚠️  Server will continue running, but database operations will fail');
  console.log('⚠️  Please check:');
  console.log('   1. Your MongoDB Atlas IP whitelist (Network Access)');
  console.log('   2. Your network/firewall settings');
  console.log('   3. MongoDB connection string in .env file');
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Windows Management System API', 
    version: '1.0.0',
    health: '/api/health',
    status: 'running'
  });
});

// Health check (before other routes to ensure it's always available)
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: mongoStates[mongoStatus] || 'unknown',
      connected: mongoStatus === 1
    }
  });
});

// Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/rates', rateRoutes);
  app.use('/api/tool-settings', toolSettingsRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/quotations', quotationRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/windows', windowRoutes);
  app.use('/api/admin', adminRoutes);
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

