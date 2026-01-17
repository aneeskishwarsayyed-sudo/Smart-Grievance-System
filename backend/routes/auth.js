const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login endpoint (basic implementation)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    // Find user
    const [users] = await conn.query(`
      SELECT * FROM users WHERE email = ?
    `, [email]);
    
    conn.release();
    
    if (!users.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // For demo: check plain password (in production, use bcrypt)
    if (password !== user.password && !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    // Check if user exists
    const [existing] = await conn.query(`
      SELECT * FROM users WHERE email = ?
    `, [email]);
    
    if (existing.length) {
      conn.release();
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await conn.query(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, 'USER')
    `, [email, hashedPassword, name]);
    
    conn.release();
    
    // Create JWT token
    const token = jwt.sign(
      { id: result.insertId, role: 'USER' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      id: result.insertId,
      email,
      name,
      role: 'USER',
      token,
      message: 'Registration successful'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
