package com.example.resolve1.controller;

import com.example.resolve1.entity.EmployeeRequest;
import com.example.resolve1.entity.User;
import com.example.resolve1.repository.EmployeeRequestRepository;
import com.example.resolve1.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employee-request")
@CrossOrigin(origins = "http://localhost:3001")
public class EmployeeRequestController {

    @Autowired
    private EmployeeRequestRepository employeeRequestRepository;

    @Autowired
    private UserRepository userRepository;

    // SUBMIT REQUEST
    @PostMapping("/{userId}")
    public EmployeeRequest requestEmployeeRole(
            @PathVariable Long userId,
            @RequestBody EmployeeRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        request.setUser(user);
        request.setRequestedRole("EMPLOYEE");
        request.setStatus("PENDING");

        return employeeRequestRepository.save(request);
    }

    // CHECK PENDING REQUEST
    @GetMapping("/pending/{userId}")
    public EmployeeRequest getPendingRequest(@PathVariable Long userId) {
        return employeeRequestRepository.findByUserIdAndStatus(userId, "PENDING");
    }
}
