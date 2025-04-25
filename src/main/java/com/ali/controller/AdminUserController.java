package com.ali.controller;

import com.ali.entity.User;
import com.ali.entity.Role;
import com.ali.payload.response.MessageResponse;
import com.ali.repository.UserRepository;
import com.ali.repository.RoleRepository;
import com.ali.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserService userService;

    // List all users
    @GetMapping("")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(null)); // Don't expose passwords
        return ResponseEntity.ok(users);
    }

    // Edit user details
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        user.setUsername(updatedUser.getUsername());
        user.setEmail(updatedUser.getEmail());
        // Defensive role mapping using helper method
        Set<Role> newRoles = updatedUser.getRoles().stream()
            .map(r -> roleRepository.findByName(extractRoleName(r))
                .orElseThrow(() -> new RuntimeException("Role not found: " + r)))
            .collect(Collectors.toSet());
        user.setRoles(newRoles);
        user.setMfaEnabled(updatedUser.isMfaEnabled());
        user.setActive(updatedUser.isActive());
        userRepository.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    private com.ali.entity.ERole extractRoleName(Object r) {
        if (r instanceof Role) {
            return ((Role) r).getName();
        } else if (r instanceof String) {
            return com.ali.entity.ERole.valueOf((String) r);
        } else {
            throw new RuntimeException("Invalid role format: " + r);
        }
    }

    // Reactivate user account
    @PostMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        // Log before changes
        System.out.println("Before reactivation - User ID: " + id + ", Active: " + user.isActive() + ", CreateDateTime: " + user.getCreateDateTime());
        
        // Set account to active
        user.setActive(true);
        // Reset account creation time to extend expiry by 1 year from now
        user.setCreateDateTime(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        // Log after save
        System.out.println("After reactivation - User ID: " + id + ", Active: " + savedUser.isActive() + ", CreateDateTime: " + savedUser.getCreateDateTime());
        
        // Return updated user info, without password
        savedUser.setPassword(null);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User account reactivated successfully");
        response.put("user", savedUser);
        return ResponseEntity.ok(response);
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Instead of actually deleting, just set user to inactive
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(false);
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User deactivated successfully"));
        }
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/registrations-per-day")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRegistrationsPerDay() {
        try {
            // Try using the repository method first
            List<Object[]> results = userRepository.countRegistrationsPerDay();
            List<Map<String, Object>> data = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("date", row[0].toString());
                entry.put("count", row[1]);
                data.add(entry);
            }
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            // If the repository method fails, calculate manually
            List<User> allUsers = userRepository.findAll();
            Map<String, Long> countByDate = new HashMap<>();
            
            // Group users by registration date
            for (User user : allUsers) {
                if (user.getCreateDateTime() != null) {
                    // Format the date to year-month-day only
                    String dateStr = user.getCreateDateTime().toLocalDate().toString();
                    countByDate.put(dateStr, countByDate.getOrDefault(dateStr, 0L) + 1);
                }
            }
            
            // Convert to the expected format
            List<Map<String, Object>> data = new ArrayList<>();
            for (Map.Entry<String, Long> entry : countByDate.entrySet()) {
                Map<String, Object> dataEntry = new HashMap<>();
                dataEntry.put("date", entry.getKey());
                dataEntry.put("count", entry.getValue());
                data.add(dataEntry);
            }
            
            // Sort by date
            data.sort((a, b) -> ((String) a.get("date")).compareTo((String) b.get("date")));
            
            return ResponseEntity.ok(data);
        }
    }
} 