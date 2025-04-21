package com.ali.controller;

import com.ali.entity.User;
import com.ali.payload.request.UpdateProfileRequest;
import com.ali.payload.response.MessageResponse;
import com.ali.repository.UserRepository;
import com.ali.security.services.UserDetailsImpl;
import com.ali.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import javax.validation.Valid;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.findById(userDetails.getId());
        
        // Don't send the password or sensitive information
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/update-profile")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserProfile(
            @Valid @RequestBody UpdateProfileRequest updateRequest,
            Authentication authentication) {
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userService.findById(userDetails.getId());
        
        // Check if username is changed and already exists
        if (!currentUser.getUsername().equals(updateRequest.getUsername()) && 
                userRepository.existsByUsername(updateRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }
        
        // Check if email is changed and already exists
        if (!currentUser.getEmail().equals(updateRequest.getEmail()) && 
                userRepository.existsByEmail(updateRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }
        
        // Update user information
        currentUser.setUsername(updateRequest.getUsername());
        currentUser.setEmail(updateRequest.getEmail());
        
        userService.save(currentUser);
        
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
    }
} 