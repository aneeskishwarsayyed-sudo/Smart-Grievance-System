package com.example.resolve1.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String status;

    // ✅ ADDED FOR EMPLOYEE TASK UPDATES
    @Column(columnDefinition = "TEXT")
    private String notes;

    // FILE DETAILS
    private String fileName;
    private Long fileSize;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ✅ REQUIRED FOR ASSIGNMENT & ESCALATION
    private LocalDateTime assignedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private User employee;

    // ================= GETTERS & SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // ✅ NEW GETTER AND SETTER FOR NOTES
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getEmployee() { return employee; }
    public void setEmployee(User employee) { this.employee = employee; }
}