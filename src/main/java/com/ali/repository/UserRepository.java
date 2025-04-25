package com.ali.repository;

import com.ali.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);
    Optional<User> findByEmail(String email);
    @Query("SELECT CAST(u.createDateTime as java.sql.Date), COUNT(u) FROM User u GROUP BY CAST(u.createDateTime as java.sql.Date) ORDER BY CAST(u.createDateTime as java.sql.Date)")
    List<Object[]> countRegistrationsPerDay();
} 