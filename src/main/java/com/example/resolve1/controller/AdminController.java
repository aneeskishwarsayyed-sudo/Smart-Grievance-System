package com.example.resolve1.controller;

import com.example.resolve1.entity.Complaint;
import com.example.resolve1.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminController {

    @Autowired
    private ComplaintRepository complaintRepository;

    // GET ALL COMPLAINTS (ADMIN)
    @GetMapping("/complaints")
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // UPDATE STATUS
    @PutMapping("/complaints/{id}/status")
    public Complaint updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        Complaint c = complaintRepository.findById(id).orElse(null);
        if (c != null) {
            c.setStatus(status);
            return complaintRepository.save(c);
        }
        return null;
    }
}
