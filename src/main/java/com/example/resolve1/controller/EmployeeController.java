package com.example.resolve1.controller;

import com.example.resolve1.entity.Complaint;
import com.example.resolve1.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee")
public class EmployeeController {

    @Autowired
    private ComplaintRepository complaintRepository;

    // 1️⃣ VIEW COMPLAINTS ASSIGNED TO EMPLOYEE
    @GetMapping("/complaints/{employeeId}")
    public List<Complaint> getAssignedComplaints(@PathVariable Long employeeId) {
        return complaintRepository.findAll()
                .stream()
                .filter(c -> c.getEmployee() != null &&
                        c.getEmployee().getId().equals(employeeId))
                .toList();
    }

    // 2️⃣ UPDATE COMPLAINT STATUS
    @GetMapping("/update/{complaintId}")
    public String updateComplaintStatus(@PathVariable Long complaintId) {

        Complaint complaint =
                complaintRepository.findById(complaintId).orElse(null);

        if (complaint == null) {
            return "Complaint not found";
        }

        complaint.setStatus("RESOLVED");
        complaintRepository.save(complaint);

        return "Complaint resolved successfully";
    }
}
