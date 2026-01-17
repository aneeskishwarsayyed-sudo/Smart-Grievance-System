package com.example.resolve1.repository;

import com.example.resolve1.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);
    List<User> findAllByRoleIn(List<String> roles);

    User findFirstByRole(String role);
}
