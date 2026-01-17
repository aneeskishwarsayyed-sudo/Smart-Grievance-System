package com.example.resolve1.controller;
import com.example.resolve1.entity.Complaint;
import com.example.resolve1.entity.EmployeeRequest;
import com.example.resolve1.entity.User;
import com.example.resolve1.entity.Notification; // You'll need this entity
import com.example.resolve1.repository.ComplaintRepository;
import com.example.resolve1.repository.EmployeeRequestRepository;
import com.example.resolve1.repository.UserRepository;
import com.example.resolve1.repository.NotificationRepository; // You'll need this repo
import org.springframework.beans.factory.annotation.Autowired;
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

    // Helper method to send notifications
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

    @GetMapping("/complaints/assigned/{employeeId}")
    public List<Complaint> getAssignedComplaints(@PathVariable Long employeeId) {
        return complaintRepository.findByEmployeeId(employeeId);
    }

    @PutMapping("/complaints/{id}/status")
    public Complaint updateStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO data) {
        Complaint c = complaintRepository.findById(id).orElse(null);
        if (c == null) return null;

        c.setStatus(data.getStatus());
        c.setNotes(data.getNote());
        c.setUpdatedAt(LocalDateTime.now());
        Complaint savedComplaint = complaintRepository.save(c);

        // NOTIFICATION: Notify the Citizen when the status changes to RESOLVED
        if ("RESOLVED".equalsIgnoreCase(data.getStatus())) {
            sendNotification(c.getUser(), "Your complaint '" + c.getTitle() + "' has been resolved!");
        }
        // NOTIFICATION: Notify the Citizen if the issue is ESCALATED
        else if ("ESCALATED".equalsIgnoreCase(data.getStatus())) {
            sendNotification(c.getUser(), "Your complaint '" + c.getTitle() + "' has been escalated to a senior manager.");
        }

        return savedComplaint;
    }

    @GetMapping("/employees")
    public List<User> getAllEmployees() {
        return userRepository.findAllByRoleIn(List.of("EMPLOYEE", "MANAGER", "SENIOR_MANAGER"));
    }

    @PostMapping("/complaints/{complaintId}/assign/{employeeId}")
    public Complaint assignComplaint(@PathVariable Long complaintId, @PathVariable Long employeeId) {
        Complaint complaint = complaintRepository.findById(complaintId).orElse(null);
        User employee = userRepository.findById(employeeId).orElse(null);

        if (complaint == null || employee == null) return null;

        complaint.setEmployee(employee);
        complaint.setStatus("ASSIGNED");
        complaint.setUpdatedAt(LocalDateTime.now());

        // NOTIFICATION: Notify the Employee they have a new task
        sendNotification(employee, "A new task has been assigned to you: " + complaint.getTitle());

        return complaintRepository.save(complaint);
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

        // NOTIFICATION: Notify the User their role is approved
        sendNotification(user, "Your request to join as an Employee has been approved! Welcome aboard.");

        return "Approved";
    }
}

class StatusUpdateDTO {
    private String status;
    private String note;
    private Long employeeId;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
}