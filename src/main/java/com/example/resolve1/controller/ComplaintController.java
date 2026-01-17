package com.example.resolve1.controller;

import com.example.resolve1.entity.Complaint;
import com.example.resolve1.entity.User;
import com.example.resolve1.repository.ComplaintRepository;
import com.example.resolve1.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ ADD COMPLAINT API - FIXED FOR FILE UPLOADS
    @PostMapping("/add/{userId}")
    public Complaint addComplaint(
            @PathVariable Long userId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) MultipartFile file) {

        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                throw new Exception("User not found");
            }

            Complaint complaint = new Complaint();
            complaint.setTitle(title);
            complaint.setDescription(description);
            complaint.setUser(user);
            complaint.setStatus("OPEN");
            complaint.setCreatedAt(LocalDateTime.now());

            // Handle file upload if present
            if (file != null && !file.isEmpty()) {
                complaint.setFileName(file.getOriginalFilename());
                complaint.setFileSize(file.getSize());
            }

            return complaintRepository.save(complaint);
        } catch (Exception e) {
            throw new RuntimeException("Error saving complaint: " + e.getMessage());
        }
    }

    // ✅ GET ALL COMPLAINTS FOR A USER
    @GetMapping("/user/{userId}")
    public java.util.List<Complaint> getUserComplaints(@PathVariable Long userId) {
        return complaintRepository.findByUserId(userId);
    }
}