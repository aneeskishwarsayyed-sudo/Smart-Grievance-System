# Grievance Management System - Complete Implementation

## 📋 Project Overview

A comprehensive grievance/complaint management system with role-based hierarchy, automatic escalation, and role request functionality.

**Features:**
- ✅ User can file complaints
- ✅ User can request to become an employee
- ✅ Admin reviews complaints and assigns to employees
- ✅ Employees work on assigned complaints with progress updates
- ✅ Multi-level employee hierarchy (Support → Manager → Senior Manager → Director)
- ✅ Automatic escalation if complaint not resolved within 7 days
- ✅ Admin approves/rejects employee role requests
- ✅ Real-time status tracking for all parties

---

## 🗂️ Project Structure

```
grievance-system/
├── resolve1-frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js              # Login page
│   │   │   ├── Signup.js             # Registration
│   │   │   ├── AdminDashboard.js     # Admin panel (UPDATED)
│   │   │   ├── EmployeeDashboard.js  # Employee panel (UPDATED)
│   │   │   ├── UserDashboard.js      # User panel (UPDATED)
│   │   │   ├── AddComplaint.js       # File complaint
│   │   │   └── EmployeeRequests.js   # Role requests
│   │   ├── components/
│   │   ├── api/
│   │   │   └── api.js                # Axios config
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── BACKEND_IMPLEMENTATION.md      # Backend docs (CREATED)
│   └── README.md
│
├── backend/                           # Node.js/Express backend
│   ├── routes/
│   │   ├── auth.js                   # Authentication
│   │   ├── complaints.js             # Complaint management
│   │   ├── admin.js                  # Admin operations
│   │   ├── employee.js               # Employee operations
│   │   └── user.js                   # User operations
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication
│   ├── server.js                     # Express server
│   ├── package.json
│   ├── .env                          # Environment variables
│   ├── database_schema.sql           # Database schema
│   └── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MySQL 5.7+
- npm or yarn

### Backend Setup

1. **Navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Database**
```bash
mysql -u root -p < database_schema.sql
```

4. **Configure .env**
```
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grievance_system
JWT_SECRET=your_secret_key
```

5. **Start backend server**
```bash
npm run dev
# or
node server.js
```

Backend will run on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend**
```bash
cd ../resolve1-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## 👥 User Roles & Workflow

### 1. **USER Role** (File Complaints)
- Can file new complaints
- Can request to become an employee
- Can view their complaint status
- Receives updates on complaint progress

**Dashboard Features:**
- View all complaints (Pending, In Progress, Resolved)
- File new complaint
- Track complaint status in real-time
- Request employee role with reason

### 2. **EMPLOYEE Role** (Resolve Complaints)
- Assigned complaints by admin
- Can update complaint status
- Hierarchical levels: Level 1→4
- If task not resolved in 7 days, escalates to Level 2
- If Level 2 fails in 7 days, escalates to Level 3, etc.

**Dashboard Features:**
- View assigned tasks
- Start work on complaints
- Update progress with notes
- View escalated complaints
- Track completed tasks

### 3. **ADMIN Role** (Manage Everything)
- View all complaints
- Assign complaints to employees
- Approve/Reject employee role requests
- Mark complaints as resolved
- Filter by status, priority, escalation

**Dashboard Features:**
- See all complaints with status
- Assign to employees with load balancing
- Manage role requests
- Track employee workload
- View escalation history

---

## 📊 Complaint Workflow

```
┌─────────────────────────────────────────────────────┐
│ USER FILES COMPLAINT                                │
├─────────────────────────────────────────────────────┤
│ Status: PENDING                                     │
│ Visible to: Admin, User                             │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ ADMIN ASSIGNS TO EMPLOYEE (LEVEL 1)                 │
├─────────────────────────────────────────────────────┤
│ Status: ASSIGNED                                    │
│ Visible to: Admin, Employee, User                   │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ EMPLOYEE STARTS WORK                                │
├─────────────────────────────────────────────────────┤
│ Status: IN_PROGRESS                                 │
│ Timer: 7 days to resolve                            │
└────────────┬────────────────────────────────────────┘
             │
        ┌────┴──────────────────────┐
        │                           │
        ▼ (Within 7 days)       ▼ (After 7 days)
    ┌───────────┐            ┌──────────────┐
    │ RESOLVED  │            │ AUTO-ESCALATE│
    └───────────┘            │ to Level 2   │
                             └──────────────┘
```

---

## 🔐 Authentication

### Login
- Email and password authentication
- JWT token generation
- Token stored in localStorage
- Automatic redirection based on role

### Token Structure
```json
{
  "id": 1,
  "role": "ADMIN/EMPLOYEE/USER",
  "expiresIn": "24h"
}
```

---

## 📱 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/complaints/all` | Get all complaints (Admin) |
| GET | `/complaints/user/:userId` | Get user's complaints |
| GET | `/complaints/assigned/:employeeId` | Get employee's tasks |
| POST | `/complaints/add/:userId` | Create complaint |
| POST | `/complaints/:id/assign` | Assign to employee |
| PUT | `/complaints/:id/status` | Update status |
| POST | `/complaints/:id/resolve` | Mark resolved |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/employees` | List all employees |
| GET | `/admin/role-requests` | View role requests |
| POST | `/admin/role-requests/:id/approve` | Approve request |
| POST | `/admin/role-requests/:id/reject` | Reject request |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/request-role` | Request employee role |
| GET | `/user/role-request/:userId` | Get request status |

### Employee
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employee/info/:employeeId` | Get employee info |

---

## 🗄️ Database Schema

### users
```sql
id, email, password, name, role, createdAt, updatedAt
```

### employees
```sql
id, userId, level(1-4), maxComplaints, currentComplaints, createdAt
```

### complaints
```sql
id, userId, title, description, category, status, note, 
assignedTo, assignedBy, priority, escalated, escalationLevel, 
createdAt, updatedAt, resolvedAt, dueDate
```

### complaint_history
```sql
id, complaintId, status, changedBy, note, createdAt
```

### role_requests
```sql
id, userId, requestedRole, level, reason, status, approvedBy, 
createdAt, updatedAt
```

---

## 🔄 Escalation Logic

**Automatic Escalation (Every hour check):**

1. Find complaints IN_PROGRESS for > 7 days
2. If current level < 4:
   - Find employee at next level with capacity
   - Transfer complaint
   - Increment escalationLevel
   - Send notification
3. If level = 4 (Director):
   - Mark as CRITICAL
   - Alert admin immediately

**Capacity Management:**
- Each level has max complaints
- Level 1: 10 max complaints
- Level 2: 8 max complaints
- Level 3: 5 max complaints
- Level 4: 3 max complaints

---

## 💡 Test Credentials

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`

### Employee Accounts
- Level 1: `employee1@example.com` / `emp123`
- Level 2: `employee2@example.com` / `emp123`
- Level 3: `employee3@example.com` / `emp123`

### User Accounts
- Email: `user1@example.com` / `user123`
- Email: `user2@example.com` / `user123`

---

## 🎨 UI/UX Features

### Admin Dashboard
- Filter complaints by status, priority, escalation
- Drag-assign employees
- View employee workload
- Manage role requests with approve/reject

### Employee Dashboard
- View assigned tasks with priority
- Track time spent on each task
- Add progress notes
- View escalation alerts

### User Dashboard
- File complaints easily
- Real-time status updates
- View resolution notes
- Request employee role
- Track request status

---

## 🚦 Status Flow

```
PENDING
  ↓
ASSIGNED (Employee assigned by admin)
  ↓
IN_PROGRESS (Employee starts work)
  ↓ (After 7 days if not resolved)
ESCALATED to Level 2
  ↓
RESOLVED (Admin marks resolved)
```

---

## 📧 Notifications

Future Enhancement:
- Email notifications on complaint status change
- SMS alerts for critical/escalated complaints
- In-app notifications
- Daily summary reports

---

## 🔒 Security

- JWT authentication for all API endpoints
- Password hashing with bcrypt
- CORS enabled for frontend communication
- Request validation on backend
- Role-based access control (RBAC)

---

## 📈 Performance

- Database indexes on frequently queried fields
- Connection pooling for database
- Pagination for large datasets
- Optimized queries

---

## 🐛 Troubleshooting

### Database Connection Error
```
Check .env credentials
Ensure MySQL is running
mysql -u root -p < database_schema.sql
```

### Backend not starting
```
npm install
Check port 8080 is not in use
node server.js (check console errors)
```

### Frontend can't connect to backend
```
Check api.js baseURL (http://localhost:8080)
Ensure backend is running
Check CORS is enabled
```

### Login fails
```
Verify user exists in database
Check password in database
Use test credentials provided
```

---

## 📝 File Descriptions

### Frontend Files (UPDATED)
- **AdminDashboard.js**: Manage complaints, assign tasks, approve roles
- **EmployeeDashboard.js**: View assigned tasks, update progress
- **UserDashboard.js**: File complaints, request role, track status
- **AddComplaint.js**: File new complaint form

### Backend Files (CREATED)
- **server.js**: Main Express server
- **routes/complaints.js**: Complaint CRUD operations
- **routes/admin.js**: Admin operations
- **routes/employee.js**: Employee operations
- **routes/user.js**: User operations
- **routes/auth.js**: Authentication
- **middleware/auth.js**: JWT verification
- **database_schema.sql**: Complete database setup

---

## 📚 Next Steps

1. **Setup Database**
   ```bash
   mysql -u root -p < backend/database_schema.sql
   ```

2. **Start Backend**
   ```bash
   cd backend && npm install && npm run dev
   ```

3. **Start Frontend**
   ```bash
   npm install && npm start
   ```

4. **Test with provided credentials**

5. **Customize for your needs**
   - Modify database schema
   - Add more fields to complaints
   - Implement email notifications
   - Add file attachments
   - Create reports dashboard

---

## 📞 Support

For issues or questions, check:
1. BACKEND_IMPLEMENTATION.md for detailed backend info
2. Console errors in browser and terminal
3. Database logs
4. API responses in network tab

---

## 📄 License

MIT License - Feel free to use and modify

---

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] File attachments
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Chatbot support
- [ ] AI-based complaint categorization
- [ ] SLA tracking
- [ ] Customer satisfaction survey
- [ ] Batch operations
- [ ] Export to PDF/Excel
