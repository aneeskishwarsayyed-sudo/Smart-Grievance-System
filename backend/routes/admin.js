const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Get all employees
router.get('/employees', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const [employees] = await conn.query(`
      SELECT e.*, u.name, u.email 
      FROM employees e
      JOIN users u ON e.userId = u.id
      ORDER BY e.level ASC
    `);
    
    conn.release();
    res.json(employees || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get role requests
router.get('/role-requests', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const [requests] = await conn.query(`
      SELECT * FROM role_requests
      ORDER BY createdAt DESC
    `);
    
    conn.release();
    res.json(requests || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Approve role request
router.post('/role-requests/:requestId/approve', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { userId } = req.body;
    const requestId = req.params.requestId;
    
    // Get request level
    const [request] = await conn.query(`
      SELECT level FROM role_requests WHERE id = ?
    `, [requestId]);
    
    if (!request.length) {
      conn.release();
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Update request
    await conn.query(`
      UPDATE role_requests 
      SET status = 'APPROVED', approvedBy = ?
      WHERE id = ?
    `, [req.userId, requestId]);
    
    // Update user role
    await conn.query(`
      UPDATE users SET role = 'EMPLOYEE' WHERE id = ?
    `, [userId]);
    
    // Create employee record
    const [existingEmployee] = await conn.query(`
      SELECT * FROM employees WHERE userId = ?
    `, [userId]);
    
    if (!existingEmployee.length) {
      await conn.query(`
        INSERT INTO employees (userId, level, maxComplaints, currentComplaints)
        VALUES (?, ?, 10, 0)
      `, [userId, request[0].level]);
    }
    
    conn.release();
    res.json({ message: 'Role request approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Reject role request
router.post('/role-requests/:requestId/reject', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const requestId = req.params.requestId;
    
    await conn.query(`
      UPDATE role_requests 
      SET status = 'REJECTED', approvedBy = ?
      WHERE id = ?
    `, [req.userId, requestId]);
    
    conn.release();
    res.json({ message: 'Role request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
