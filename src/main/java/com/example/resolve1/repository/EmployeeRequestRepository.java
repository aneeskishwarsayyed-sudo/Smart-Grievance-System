package com.example.resolve1.repository;

import com.example.resolve1.entity.EmployeeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRequestRepository extends JpaRepository<EmployeeRequest, Long> {

    List<EmployeeRequest> findByStatus(String status);
}
