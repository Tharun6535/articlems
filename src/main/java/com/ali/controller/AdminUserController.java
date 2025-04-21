package com.ali.controller;

import com.ali.entity.User;
import com.ali.entity.Role;
import com.ali.repository.UserRepository;
import com.ali.repository.RoleRepository;
import com.ali.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 