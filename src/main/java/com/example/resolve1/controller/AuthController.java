package com.example.resolve1.controller;

import com.example.resolve1.entity.User;
import com.example.resolve1.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // ✅ LOGIN
    @PostMapping("/login")
    public User login(@RequestBody User loginUser) {
        User user = userRepository.findByEmail(loginUser.getEmail());

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (!user.getPassword().equals(loginUser.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user; // frontend will read role
    }

    // ✅ SIGNUP
    @PostMapping("/signup")
    public User signup(@RequestBody User user) {
        user.setRole("USER");
        return userRepository.save(user);
    }

    // ✅ CREATE ADMIN ENDPOINT
    @PostMapping("/admin/create")
    public User createAdmin(@RequestBody User user) {
        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null) {
            throw new RuntimeException("Email already exists");
        }

        user.setRole("ADMIN");
        return userRepository.save(user);
    }

    // ✅ GET USER BY ID
    @GetMapping("/user/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id).orElse(null);
    }
}