const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Request employee role
router.post('/request-role', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { userId, requestedRole, reason, level } = req.body;
    
    // Check if already has request pending
    const [existing] = await conn.query(`
      SELECT * FROM role_requests 
      WHERE userId = ? AND status = 'PENDING'
    `, [userId]);
    
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ message: 'You already have a pending request' });
    }
    
    // Create request
    await conn.query(`
      INSERT INTO role_requests (userId, requestedRole, reason, level)
      VALUES (?, ?, ?, ?)
    `, [userId, requestedRole, reason, level]);
    
    conn.release();
    res.json({ message: 'Role request submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get user's role request
router.get('/role-request/:userId', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const [request] = await conn.query(`
      SELECT * FROM role_requests 
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT 1
    `, [req.params.userId]);
    
    conn.release();
    res.json(request[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
