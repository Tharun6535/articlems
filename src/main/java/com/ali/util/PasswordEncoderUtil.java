package com.ali.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoderUtil {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123";
        
        // Generate a new hash
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Generated hash for 'admin123': " + encodedPassword);
        
        // Verify it works
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        System.out.println("Verification test passed: " + matches);
        
        // Test with a simple hash (strength 4 instead of default 10 for faster hashing)
        BCryptPasswordEncoder simpleEncoder = new BCryptPasswordEncoder(4);
        String simpleHash = simpleEncoder.encode(rawPassword);
        System.out.println("Simple hash for 'admin123': " + simpleHash);
        System.out.println("Simple hash verification: " + simpleEncoder.matches(rawPassword, simpleHash));
    }
} 