-- Grievance Management System Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS grievance_system;
USE grievance_system;

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('USER', 'EMPLOYEE', 'ADMIN') DEFAULT 'USER',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(email)
);

-- Employees Table (Hierarchical levels)
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT UNIQUE NOT NULL,
  level INT DEFAULT 1 COMMENT 'Level 1: Support, Level 2: Manager, Level 3: Senior Manager, Level 4: Director',
  maxComplaints INT DEFAULT 10,
  currentComplaints INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX(level)
);

-- Complaints Table
CREATE TABLE complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'PENDING',
  note TEXT,
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
  FOREIGN KEY (assignedTo) REFERENCES users(id),
  FOREIGN KEY (assignedBy) REFERENCES users(id),
  FOREIGN KEY (escalatedFrom) REFERENCES users(id),
  INDEX(status),
  INDEX(userId),
  INDEX(assignedTo),
  INDEX(createdAt)
);

-- Complaint History Table
CREATE TABLE complaint_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaintId INT NOT NULL,
  status VARCHAR(50),
  changedBy INT,
  note TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (changedBy) REFERENCES users(id),
  INDEX(complaintId)
);

-- Role Requests Table
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
  INDEX(status),
  INDEX(userId)
);

-- Insert Demo Admin User
INSERT INTO users (email, password, name, role) 
VALUES ('admin@example.com', 'admin123', 'Administrator', 'ADMIN');

-- Insert Demo Employees with Different Levels
INSERT INTO users (email, password, name, role) 
VALUES 
  ('employee1@example.com', 'emp123', 'John Support', 'EMPLOYEE'),
  ('employee2@example.com', 'emp123', 'Sarah Manager', 'EMPLOYEE'),
  ('employee3@example.com', 'emp123', 'Mike Senior', 'EMPLOYEE');

INSERT INTO employees (userId, level, maxComplaints, currentComplaints)
VALUES 
  (2, 1, 10, 0),
  (3, 2, 8, 0),
  (4, 3, 5, 0);

-- Insert Demo Users
INSERT INTO users (email, password, name, role)
VALUES
  ('user1@example.com', 'user123', 'Alice Johnson', 'USER'),
  ('user2@example.com', 'user123', 'Bob Smith', 'USER');

-- Insert Demo Complaints
INSERT INTO complaints (userId, title, description, category, status, priority)
VALUES
  (5, 'System Slow Performance', 'The application is running very slowly', 'TECHNICAL', 'PENDING', 'HIGH'),
  (5, 'Login Issue', 'Cannot login to the system', 'TECHNICAL', 'PENDING', 'CRITICAL'),
  (6, 'Missing Invoice', 'Invoice for order #123 is missing', 'BILLING', 'PENDING', 'MEDIUM');
