package com.example.resolve1.repository;

import com.example.resolve1.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserId(Long userId);

    List<Complaint> findByEmployeeId(Long employeeId);

    List<Complaint> findByStatus(String status);
}