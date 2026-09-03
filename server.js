require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const productRoutes = require('./routes/products');
const appointmentRoutes = require('./routes/appointments');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// --- Database ---
connectDB();

// --- Core middleware ---
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Static frontend (storefront + admin dashboard) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- API routes ---
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);

// health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Bon Mariage API is running' });
});

// --- Frontend page routes ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// --- 404 handler for unknown API routes ---
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌸 Bon Mariage server running on http://localhost:${PORT}`);
  console.log(`   Storefront: http://localhost:${PORT}/`);
  console.log(`   Admin dashboard: http://localhost:${PORT}/admin`);
});
