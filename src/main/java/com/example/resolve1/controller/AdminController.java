package com.example.resolve1.controller;

import com.example.resolve1.entity.Complaint;
import com.example.resolve1.entity.EmployeeRequest;
import com.example.resolve1.entity.User;
import com.example.resolve1.entity.Notification;
import com.example.resolve1.repository.ComplaintRepository;
import com.example.resolve1.repository.EmployeeRequestRepository;
import com.example.resolve1.repository.UserRepository;
import com.example.resolve1.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EmployeeRequestRepository employeeRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private void sendNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    @GetMapping("/complaints/all")
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @GetMapping("/employees")
    public List<User> getAllEmployees() {
        return userRepository.findAllByRoleIn(List.of("EMPLOYEE", "MANAGER", "SENIOR_MANAGER"));
    }

    @PutMapping("/complaints/{id}/status")
    public Complaint updateStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO data) {
        Complaint c = complaintRepository.findById(id).orElse(null);
        if (c == null) return null;

        c.setStatus(data.getStatus());
        c.setNotes(data.getNote());
        c.setUpdatedAt(LocalDateTime.now());
        Complaint savedComplaint = complaintRepository.save(c);

        if ("RESOLVED".equalsIgnoreCase(data.getStatus())) {
            sendNotification(c.getUser(), "Your complaint '" + c.getTitle() + "' has been resolved!");
        } else if ("ESCALATED".equalsIgnoreCase(data.getStatus())) {
            sendNotification(c.getUser(), "Your complaint '" + c.getTitle() + "' has been escalated.");
        }

        return savedComplaint;
    }

    @PostMapping("/complaints/{complaintId}/assign/{employeeId}")
    public ResponseEntity<?> assignComplaint(@PathVariable Long complaintId, @PathVariable Long employeeId) {
        Complaint complaint = complaintRepository.findById(complaintId).orElse(null);
        User employee = userRepository.findById(employeeId).orElse(null);

        if (complaint == null || employee == null) {
            return ResponseEntity.badRequest().body("Not found");
        }

        complaint.setEmployee(employee);
        complaint.setAssignedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());

        if (!"ESCALATED".equalsIgnoreCase(complaint.getStatus())) {
            complaint.setStatus("ASSIGNED");
        }

        Complaint saved = complaintRepository.save(complaint);
        sendNotification(employee, "Task assigned: " + complaint.getTitle());

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/role-requests")
    public List<EmployeeRequest> getRoleRequests() {
        return employeeRequestRepository.findByStatus("PENDING");
    }

    @PostMapping("/role-requests/{id}/approve")
    public String approveRole(@PathVariable Long id) {
        EmployeeRequest req = employeeRequestRepository.findById(id).orElse(null);
        if (req == null) return "Not found";
        User user = req.getUser();
        user.setRole("EMPLOYEE");
        userRepository.save(user);
        req.setStatus("APPROVED");
        employeeRequestRepository.save(req);
        return "Approved";
    }
}