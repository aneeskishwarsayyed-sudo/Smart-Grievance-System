package com.example.resolve1.job;

import com.example.resolve1.entity.Complaint;
import com.example.resolve1.entity.User;
import com.example.resolve1.repository.ComplaintRepository;
import com.example.resolve1.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ComplaintEscalationJob {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    // Runs once every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void escalateUnresolvedComplaints() {

        List<Complaint> complaints =
                complaintRepository.findByStatus("ASSIGNED");

        for (Complaint c : complaints) {

            if (c.getAssignedAt() == null) continue;

            if (c.getAssignedAt()
                    .isBefore(LocalDateTime.now().minusDays(7))) {

                User currentEmployee = c.getEmployee();
                if (currentEmployee == null) continue;

                // move to superior
                User superior = userRepository.findFirstByRole("MANAGER");


                if (superior != null) {
                    c.setEmployee(superior);
                    c.setStatus("ESCALATED");
                    c.setAssignedAt(LocalDateTime.now());
                    complaintRepository.save(c);
                }
            }
        }
    }
}
