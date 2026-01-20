# ResolveIT – Smart Grievance Management System

## Project Overview

**ResolveIT** is a full-stack smart grievance redressal system designed to streamline complaint registration, assignment, and resolution through a structured, role-based workflow.

The system improves transparency and efficiency by enabling users to track grievance status while allowing administrators to manage assignments and escalations effectively.

---

## System Architecture

* **Frontend**: React-based user interface developed using JavaScript
* **Backend**: Spring Boot application with a clean, layered architecture
* **Communication**: RESTful APIs
* **Database**: MySQL
* **Tools**: IntelliJ IDEA (Backend), VS Code (Frontend)

---

## Key Features

* User registration and authentication
* Complaint submission and tracking
* Role-based access (User / Admin / Employee)
* Complaint assignment and status updates
* Hierarchical employee handling and escalation support
* Centralized grievance management dashboard

---

## Project Structure

```
Smart-Grievance-System/
│
├── backend/                # Spring Boot backend
│   ├── src/main/java/      # Controllers, Services, Repositories
│   └── src/main/resources/ # application.properties
│
├── src/                    # React frontend source code
│   ├── pages/
│   ├── services/
│   ├── App.js
│   └── index.js
│
├── README.md
├── package.json
└── pom.xml / gradle files
```

---

## How to Run the Project

### Backend (Spring Boot)

1. Open the backend folder in **IntelliJ IDEA**
2. Configure MySQL database in `application.properties`
3. Run the Spring Boot application
4. Backend runs on:

```
http://localhost:8080
```

---

### Frontend (React)

1. Navigate to the project root
2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm start
```

4. Frontend runs on:

```
http://localhost:3000
```

---

## Database

* MySQL is used for persistent storage
* Tables include users, employees, complaints, and related mappings
* Database schema is documented in `BACKEND_IMPLEMENTATION.md`

---

## Documentation

* `BACKEND_IMPLEMENTATION.md` – Backend design and database schema
* `SYSTEM_ARCHITECTURE.md` – Overall system architecture
* `SETUP_GUIDE.md` – Setup instructions
* `IMPLEMENTATION_SUMMARY.md` – Development summary

---

## Author

**Sayyed Anees Kishwar**
GitHub: [https://github.com/aneeskishwarsayyed-sudo](https://github.com/aneeskishwarsayyed-sudo)

---

## Notes

This project was developed as part of the **Infosys Springboard Virtual Internship 6.0**, focusing on real-world backend development, system design, and full-stack integration.
