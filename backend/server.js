const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grievance_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Store pool globally
app.locals.pool = pool;

// Test DB connection
pool.getConnection()
  .then(conn => {
    console.log('✓ Database connected');
    conn.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
  });

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/complaints', require('./routes/complaints'));
app.use('/admin', require('./routes/admin'));
app.use('/employee', require('./routes/employee'));
app.use('/user', require('./routes/user'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
