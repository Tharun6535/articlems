package com.ali.config;

import com.ali.entity.ERole;
import com.ali.entity.Role;
import com.ali.entity.User;
import com.ali.repository.RoleRepository;
import com.ali.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // First ensure all roles exist
        for (ERole role : ERole.values()) {
            if (!roleRepository.existsByName(role)) {
                Role newRole = new Role();
                newRole.setName(role);
                roleRepository.save(newRole);
            }
        }

        // Check if admin already exists
        if (!userRepository.existsByUsername("superadmin")) {
            // Create admin user with known password
            User admin = new User();
            admin.setUsername("superadmin");
            admin.setEmail("superadmin@example.com");
            admin.setPassword(encoder.encode("admin123"));
            
            // Set timestamps
            LocalDateTime now = LocalDateTime.now();
            admin.setCreateDateTime(now);
            admin.setUpdateDateTime(now);
            
            // Assign ADMIN role
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin role not found."));
            roles.add(adminRole);
            admin.setRoles(roles);
            
            // Save to database
            try {
                userRepository.save(admin);
                System.out.println("Superadmin user created successfully");
            } catch (Exception e) {
                System.err.println("Error creating superadmin user: " + e.getMessage());
                throw e;
            }
        }
    }
} 