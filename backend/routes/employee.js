const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Get employee info
router.get('/info/:employeeId', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const [employee] = await conn.query(`
      SELECT e.*, u.name, u.email 
      FROM employees e
      JOIN users u ON e.userId = u.id
      WHERE e.userId = ?
    `, [req.params.employeeId]);
    
    conn.release();
    if (!employee.length) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
