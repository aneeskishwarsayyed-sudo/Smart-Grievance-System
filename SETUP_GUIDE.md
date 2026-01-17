# SETUP & INSTALLATION GUIDE

Complete step-by-step guide to get the Grievance Management System running.

## 🔧 System Requirements

- **Node.js**: v14+ (Download from nodejs.org)
- **MySQL**: 5.7+ (Download from mysql.com)
- **npm**: Usually comes with Node.js
- **Git**: For cloning/version control (optional)

---

## 📥 Installation Steps

### Step 1: MySQL Database Setup

#### Windows:

1. **Download & Install MySQL**
   - Go to https://dev.mysql.com/downloads/mysql/
   - Download MySQL Community Server
   - Run installer and follow prompts
   - Set root password (remember it!)
   - Run MySQL Service

2. **Create Database**
   ```bash
   mysql -u root -p
   # Enter your MySQL root password when prompted
   
   # Paste the database_schema.sql contents or run:
   # source c:\path\to\backend\database_schema.sql
   ```

3. **Verify Database Created**
   ```sql
   SHOW DATABASES;
   USE grievance_system;
   SHOW TABLES;
   ```

#### Mac/Linux:

1. **Install MySQL (Homebrew)**
   ```bash
   brew install mysql
   brew services start mysql
   mysql_secure_installation  # Follow prompts
   ```

2. **Create Database**
   ```bash
   mysql -u root -p < backend/database_schema.sql
   ```

---

### Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables (.env)**
   ```
   PORT=8080
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_root_password
   DB_NAME=grievance_system
   JWT_SECRET=my_super_secret_jwt_key_12345
   ```

   **How to edit .env:**
   - Open backend/.env in any text editor
   - Update the values
   - Save file

4. **Test database connection**
   ```bash
   node server.js
   ```
   
   You should see:
   ```
   ✓ Database connected
   🚀 Server running on http://localhost:8080
   ```

5. **Start backend in development mode**
   ```bash
   npm run dev
   # or
   npm start
   ```

   Leave this terminal running!

---

### Step 3: Frontend Setup

1. **Open new terminal window/tab**

2. **Navigate to frontend directory**
   ```bash
   cd resolve1-frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Verify API configuration**
   - Open `src/api/api.js`
   - Confirm baseURL is `http://localhost:8080`

5. **Start frontend development server**
   ```bash
   npm start
   ```

   Frontend will automatically open in browser at `http://localhost:3000`

---

## 🧪 Testing the System

### Login Flow

1. **Admin Login**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Should see: Admin Dashboard with complaint management

2. **Employee Login**
   - Email: `employee1@example.com`
   - Password: `emp123`
   - Should see: Employee Dashboard with assigned tasks

3. **User Login**
   - Email: `user1@example.com`
   - Password: `user123`
   - Should see: User Dashboard to file complaints

### Test Workflow

#### As User:
1. Login with `user1@example.com`
2. Click "+ File New Complaint"
3. Fill in title and description
4. Submit complaint
5. Go back to dashboard - see complaint in "Pending"

#### As Admin:
1. Login with `admin@example.com`
2. See pending complaints
3. Click "Assign" on a complaint
4. Select employee from dropdown
5. Click "Assign"
6. See status change to "ASSIGNED"

#### As Employee:
1. Login with `employee1@example.com`
2. See assigned complaints
3. Click "Start Work" button
4. Add update notes
5. Click "Start Work"
6. See status change to "IN_PROGRESS"

#### Back as Admin:
1. Click complaint in "In Progress"
2. Click "Mark Resolved"
3. See status change to "RESOLVED"

#### As User:
1. See complaint status updated to "RESOLVED"

### Request Employee Role

1. **As User**: Click "Request Employee Role" button
2. **Fill form:**
   - Reason: "I have support experience"
   - Level: "Level 1 (Support)"
   - Submit

3. **As Admin**: 
   - Click "Show Role Requests"
   - See the request
   - Click "Approve" or "Reject"

4. **As User**: 
   - Refresh page
   - See request status

---

## 📋 Troubleshooting

### Database Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solution:**
```bash
# Check MySQL is running
# Windows:
Get-Service mysql

# Mac/Linux:
brew services list

# Start MySQL if not running
# Windows: Start service in Services app
# Mac/Linux:
brew services start mysql

# Verify .env credentials are correct
# Restart backend
npm run dev
```

### Port Already in Use

**Error:** `listen EADDRINUSE: address already in use :::8080`

**Solution:**
```bash
# Find and kill process on port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :8080
kill -9 <PID>
```

### npm install fails

**Error:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

### Frontend can't connect to backend

**Error:** Network error, can't reach http://localhost:8080

**Solution:**
1. Verify backend is running (check terminal)
2. Check `src/api/api.js` has correct URL
3. Open http://localhost:8080/health in browser
4. Verify backend console shows request

### Login not working

**Error:** Invalid credentials

**Verify:**
1. User exists in database:
   ```bash
   mysql -u root -p
   USE grievance_system;
   SELECT * FROM users;
   ```

2. Use correct password from database_schema.sql demo data

3. Check network tab for actual error response

### Tables don't exist

**Error:** `Table 'grievance_system.complaints' doesn't exist`

**Solution:**
```bash
# Re-run database schema
mysql -u root -p < backend/database_schema.sql

# Or manually:
mysql -u root -p
source /path/to/database_schema.sql
```

---

## 🔄 Common Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd resolve1-frontend && npm start

# Install dependencies
npm install

# Run database setup
mysql -u root -p < backend/database_schema.sql

# Check MySQL status
# Windows: Get-Service mysql
# Mac/Linux: brew services list

# Stop backend
Ctrl + C (in terminal)

# Stop frontend
Ctrl + C (in terminal)
```

---

## 📊 Database Operations

### View all users:
```bash
mysql -u root -p
USE grievance_system;
SELECT * FROM users;
```

### View all complaints:
```sql
SELECT * FROM complaints;
```

### View employees:
```sql
SELECT e.id, u.name, e.level, e.currentComplaints 
FROM employees e 
JOIN users u ON e.userId = u.id;
```

### View role requests:
```sql
SELECT * FROM role_requests;
```

---

## 🎯 Next Steps After Setup

1. **Verify all three dashboards work**
   - Admin, Employee, User

2. **Test complete workflow**
   - File complaint → Assign → Work → Resolve

3. **Test role requests**
   - Request role → Admin review → Approve/Reject

4. **Customize for your needs**
   - Add more complaint categories
   - Adjust employee levels
   - Modify forms and UI

5. **Deploy to production** (later)
   - Set up proper database
   - Use environment variables
   - Enable HTTPS
   - Implement proper error handling

---

## 📞 Support Resources

- **Node.js Docs**: https://nodejs.org/docs/
- **Express Docs**: https://expressjs.com/
- **MySQL Docs**: https://dev.mysql.com/doc/
- **React Docs**: https://react.dev/
- **JWT Info**: https://jwt.io/

---

## ✅ Verification Checklist

- [ ] MySQL installed and running
- [ ] Database created with schema
- [ ] Backend dependencies installed
- [ ] Backend .env configured correctly
- [ ] Backend running on localhost:8080
- [ ] Frontend dependencies installed
- [ ] Frontend running on localhost:3000
- [ ] Can login with test credentials
- [ ] Can file complaint
- [ ] Can assign complaint
- [ ] Can track complaint status
- [ ] Can request employee role

---

**You're all set!** 🎉

Start using the system to manage complaints and track resolutions.
