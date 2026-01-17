# Backend Implementation Guide

This guide provides complete backend setup for the Grievance Management System with complaint workflow, role hierarchy, and escalation logic.

## Database Schema

### Database: grievance_system

### Tables

#### 1. users
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('USER', 'EMPLOYEE', 'ADMIN') DEFAULT 'USER',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. employees (Hierarchical)
```sql
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT UNIQUE NOT NULL,
  level INT DEFAULT 1,
  -- Level 1: Support (handles basic complaints)
  -- Level 2: Manager (handles escalations from level 1)
  -- Level 3: Senior Manager (handles escalations from level 2)
  -- Level 4: Director (handles critical escalations)
  maxComplaints INT DEFAULT 10,
  currentComplaints INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 3. complaints
```sql
CREATE TABLE complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'PENDING',
  assignedTo INT,
  assignedBy INT,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  escalated BOOLEAN DEFAULT FALSE,
  escalationLevel INT DEFAULT 1,
  escalatedFrom INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolvedAt TIMESTAMP NULL,
  dueDate TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (assignedTo) REFERENCES employees(id),
  FOREIGN KEY (assignedBy) REFERENCES users(id),
  FOREIGN KEY (escalatedFrom) REFERENCES employees(id),
  INDEX(status),
  INDEX(userId),
  INDEX(assignedTo)
);
```

#### 4. complaint_history
```sql
CREATE TABLE complaint_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaintId INT NOT NULL,
  status VARCHAR(50),
  changedBy INT,
  note TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (changedBy) REFERENCES users(id)
);
```

#### 5. role_requests
```sql
CREATE TABLE role_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  requestedRole ENUM('EMPLOYEE') DEFAULT 'EMPLOYEE',
  level INT DEFAULT 1,
  reason TEXT,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  approvedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approvedBy) REFERENCES users(id),
  INDEX(status)
);
```

---

## Backend Setup (Node.js + Express)

### Installation
```bash
npm init -y
npm install express cors dotenv mysql2 bcrypt jsonwebtoken multer
npm install --save-dev nodemon
```

### .env file
```
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=grievance_system
JWT_SECRET=your_secret_key_here
```

### server.js
```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Store pool globally for access
app.locals.pool = pool;

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/complaints', require('./routes/complaints'));
app.use('/admin', require('./routes/admin'));
app.use('/employee', require('./routes/employee'));
app.use('/user', require('./routes/user'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticate };
```

### routes/complaints.js
```javascript
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
    res.json(complaints);
  } catch (err) {
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
    res.json(complaints);
  } catch (err) {
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
      AND c.status != 'RESOLVED'
      ORDER BY c.escalated DESC, c.createdAt DESC
    `, [req.params.employeeId]);
    
    conn.release();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create complaint
router.post('/add/:userId', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { title, description, category } = req.body;
    
    const [result] = await conn.query(`
      INSERT INTO complaints (userId, title, description, category, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `, [req.params.userId, title, description, category || 'GENERAL']);
    
    conn.release();
    res.json({ id: result.insertId, message: 'Complaint created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign complaint to employee
router.post('/:complaintId/assign', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { employeeId, adminId } = req.body;
    
    // Check if employee has capacity
    const [employee] = await conn.query(`
      SELECT * FROM employees WHERE id = ? AND currentComplaints < maxComplaints
    `, [employeeId]);
    
    if (employee.length === 0) {
      conn.release();
      return res.status(400).json({ message: 'Employee has no available capacity' });
    }
    
    // Update complaint
    await conn.query(`
      UPDATE complaints 
      SET status = 'ASSIGNED', assignedTo = ?, assignedBy = ?
      WHERE id = ?
    `, [employeeId, adminId, req.params.complaintId]);
    
    // Update employee current complaints
    await conn.query(`
      UPDATE employees SET currentComplaints = currentComplaints + 1
      WHERE id = ?
    `, [employeeId]);
    
    // Add history
    await conn.query(`
      INSERT INTO complaint_history (complaintId, status, changedBy)
      VALUES (?, 'ASSIGNED', ?)
    `, [req.params.complaintId, adminId]);
    
    conn.release();
    res.json({ message: 'Complaint assigned' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status
router.put('/:complaintId/status', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { status, note, employeeId } = req.body;
    
    const [complaint] = await conn.query(`
      SELECT * FROM complaints WHERE id = ?
    `, [req.params.complaintId]);
    
    if (complaint.length === 0) {
      conn.release();
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Update complaint
    await conn.query(`
      UPDATE complaints 
      SET status = ?, updatedAt = NOW()
      WHERE id = ?
    `, [status, req.params.complaintId]);
    
    // Add history
    await conn.query(`
      INSERT INTO complaint_history (complaintId, status, changedBy, note)
      VALUES (?, ?, ?, ?)
    `, [req.params.complaintId, status, employeeId, note]);
    
    // If resolved, update employee complaints count
    if (status === 'RESOLVED') {
      await conn.query(`
        UPDATE employees SET currentComplaints = currentComplaints - 1
        WHERE id = ?
      `, [complaint[0].assignedTo]);
    }
    
    conn.release();
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as resolved (Admin)
router.post('/:complaintId/resolve', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { adminId } = req.body;
    
    await conn.query(`
      UPDATE complaints 
      SET status = 'RESOLVED', updatedAt = NOW(), resolvedAt = NOW()
      WHERE id = ?
    `, [req.params.complaintId]);
    
    // Update employee count
    const [complaint] = await conn.query(`
      SELECT assignedTo FROM complaints WHERE id = ?
    `, [req.params.complaintId]);
    
    if (complaint[0].assignedTo) {
      await conn.query(`
        UPDATE employees SET currentComplaints = currentComplaints - 1
        WHERE id = ?
      `, [complaint[0].assignedTo]);
    }
    
    conn.release();
    res.json({ message: 'Complaint marked as resolved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

### routes/admin.js
```javascript
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
    res.json(employees);
  } catch (err) {
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
      WHERE status = 'PENDING' OR status = 'APPROVED'
      ORDER BY createdAt DESC
    `);
    
    conn.release();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve role request
router.post('/role-requests/:requestId/approve', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    const { userId } = req.body;
    
    // Update request
    await conn.query(`
      UPDATE role_requests 
      SET status = 'APPROVED', approvedBy = ?
      WHERE id = ?
    `, [req.userId, req.params.requestId]);
    
    // Get request level
    const [request] = await conn.query(`
      SELECT level FROM role_requests WHERE id = ?
    `, [req.params.requestId]);
    
    // Update user role
    await conn.query(`
      UPDATE users SET role = 'EMPLOYEE' WHERE id = ?
    `, [userId]);
    
    // Create employee record
    await conn.query(`
      INSERT INTO employees (userId, level, maxComplaints, currentComplaints)
      VALUES (?, ?, ?, 0)
    `, [userId, request[0].level, 10]);
    
    conn.release();
    res.json({ message: 'Role request approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject role request
router.post('/role-requests/:requestId/reject', authenticate, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();
    
    await conn.query(`
      UPDATE role_requests 
      SET status = 'REJECTED', approvedBy = ?
      WHERE id = ?
    `, [req.userId, req.params.requestId]);
    
    conn.release();
    res.json({ message: 'Role request rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

### routes/user.js
```javascript
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
    res.json({ message: 'Role request submitted' });
  } catch (err) {
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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

### routes/employee.js
```javascript
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
    if (employee.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

## Escalation Logic

Create a cron job to check for unresolved complaints older than 7 days and escalate them:

### utils/escalation.js
```javascript
const mysql = require('mysql2/promise');

async function checkAndEscalateComplaints(pool) {
  try {
    const conn = await pool.getConnection();
    
    // Find complaints older than 7 days and not escalated
    const [complaints] = await conn.query(`
      SELECT c.*, e.level 
      FROM complaints c
      JOIN employees e ON c.assignedTo = e.id
      WHERE c.status = 'IN_PROGRESS' 
      AND c.escalated = FALSE
      AND DATEDIFF(NOW(), c.createdAt) >= 7
    `);
    
    for (const complaint of complaints) {
      const newLevel = complaint.level + 1;
      
      // If already at max level, mark critical
      if (newLevel > 4) {
        await conn.query(`
          UPDATE complaints 
          SET priority = 'CRITICAL'
          WHERE id = ?
        `, [complaint.id]);
      } else {
        // Find employee at next level
        const [nextLevelEmployee] = await conn.query(`
          SELECT * FROM employees 
          WHERE level = ? AND currentComplaints < maxComplaints
          LIMIT 1
        `, [newLevel]);
        
        if (nextLevelEmployee.length > 0) {
          // Update current employee count
          await conn.query(`
            UPDATE employees SET currentComplaints = currentComplaints - 1
            WHERE id = ?
          `, [complaint.assignedTo]);
          
          // Escalate to new employee
          await conn.query(`
            UPDATE complaints 
            SET assignedTo = ?, escalated = TRUE, escalationLevel = ?, escalatedFrom = ?
            WHERE id = ?
          `, [nextLevelEmployee[0].id, newLevel, complaint.assignedTo, complaint.id]);
          
          // Update new employee count
          await conn.query(`
            UPDATE employees SET currentComplaints = currentComplaints + 1
            WHERE id = ?
          `, [nextLevelEmployee[0].id]);
          
          // Log escalation
          await conn.query(`
            INSERT INTO complaint_history (complaintId, status, note)
            VALUES (?, 'ESCALATED', ?)
          `, [complaint.id, `Escalated from Level ${complaint.level} to Level ${newLevel}`]);
        }
      }
    }
    
    conn.release();
    console.log(`Escalation check completed. ${complaints.length} complaints checked.`);
  } catch (err) {
    console.error('Escalation error:', err);
  }
}

// Run every hour
setInterval(checkAndEscalateComplaints, 60 * 60 * 1000);

module.exports = { checkAndEscalateComplaints };
```

## Running the Backend

```bash
npm install
node server.js
# or with nodemon
nodemon server.js
```

The backend will be running on http://localhost:8080

---

## API Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/complaints/all` | GET | ✓ | Get all complaints (Admin) |
| `/complaints/user/:userId` | GET | ✓ | Get user's complaints |
| `/complaints/assigned/:employeeId` | GET | ✓ | Get assigned complaints |
| `/complaints/add/:userId` | POST | ✓ | Create complaint |
| `/complaints/:complaintId/assign` | POST | ✓ | Assign to employee |
| `/complaints/:complaintId/status` | PUT | ✓ | Update status |
| `/complaints/:complaintId/resolve` | POST | ✓ | Mark resolved |
| `/admin/employees` | GET | ✓ | Get all employees |
| `/admin/role-requests` | GET | ✓ | Get role requests |
| `/admin/role-requests/:requestId/approve` | POST | ✓ | Approve role request |
| `/admin/role-requests/:requestId/reject` | POST | ✓ | Reject role request |
| `/user/request-role` | POST | ✓ | Request employee role |
| `/user/role-request/:userId` | GET | ✓ | Get user's role request |
| `/employee/info/:employeeId` | GET | ✓ | Get employee info |

---

## Testing with Postman/curl

### Create complaint
```bash
curl -X POST http://localhost:8080/complaints/add/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Issue with system",
    "description": "System is slow",
    "category": "TECHNICAL"
  }'
```

### Assign complaint
```bash
curl -X POST http://localhost:8080/complaints/1/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 1,
    "adminId": 2
  }'
```
