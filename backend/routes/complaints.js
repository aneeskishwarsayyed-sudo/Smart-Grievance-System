const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Get all complaints (Admin)
router.get('/all', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const [complaints] = await conn.query(`
      SELECT c.*, u.name as userId, e.name as assignedTo 
      FROM complaints c
      LEFT JOIN users u ON c.userId = u.id
      LEFT JOIN users e ON c.assignedTo = e.id
      ORDER BY c.createdAt DESC
    `);
    
    conn.release();
    res.json(complaints || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get user complaints
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const [complaints] = await conn.query(`
      SELECT c.*, e.name as assignedTo 
      FROM complaints c
      LEFT JOIN users e ON c.assignedTo = e.id
      WHERE c.userId = ?
      ORDER BY c.createdAt DESC
    `, [req.params.userId]);
    
    conn.release();
    res.json(complaints || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get assigned complaints for employee
router.get('/assigned/:employeeId', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const [complaints] = await conn.query(`
      SELECT c.*, u.name as userId 
      FROM complaints c
      JOIN users u ON c.userId = u.id
      WHERE c.assignedTo = ?
      ORDER BY c.escalated DESC, c.createdAt DESC
    `, [req.params.employeeId]);
    
    conn.release();
    res.json(complaints || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Create complaint
router.post('/add/:userId', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { title, description, category } = req.body;
    const userId = req.params.userId;
    
    const [result] = await conn.query(`
      INSERT INTO complaints (userId, title, description, category, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `, [userId, title, description, category || 'GENERAL']);
    
    conn.release();
    res.json({ id: result.insertId, message: 'Complaint created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Assign complaint to employee
router.post('/:complaintId/assign', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { employeeId, adminId } = req.body;
    const complaintId = req.params.complaintId;
    
    // Update complaint
    await conn.query(`
      UPDATE complaints 
      SET status = 'ASSIGNED', assignedTo = ?, assignedBy = ?
      WHERE id = ?
    `, [employeeId, adminId, complaintId]);
    
    conn.release();
    res.json({ message: 'Complaint assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status
router.put('/:complaintId/status', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { status, note, employeeId } = req.body;
    const complaintId = req.params.complaintId;
    
    // Update complaint
    await conn.query(`
      UPDATE complaints 
      SET status = ?, note = ?, updatedAt = NOW()
      WHERE id = ?
    `, [status, note || '', complaintId]);
    
    conn.release();
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Mark as resolved (Admin)
router.post('/:complaintId/resolve', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const complaintId = req.params.complaintId;
    
    await conn.query(`
      UPDATE complaints 
      SET status = 'RESOLVED', updatedAt = NOW(), resolvedAt = NOW()
      WHERE id = ?
    `, [complaintId]);
    
    conn.release();
    res.json({ message: 'Complaint marked as resolved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
