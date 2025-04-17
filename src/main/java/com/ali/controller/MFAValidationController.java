package com.ali.controller;

import com.ali.entity.User;
import com.ali.payload.response.MessageResponse;
import com.ali.repository.UserRepository;
import com.ali.security.jwt.JwtUtils;
import com.ali.security.services.UserDetailsImpl;
import com.ali.service.MFAService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller specifically for MFA validation functionality
 * with improved error handling
 */
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", maxAge = 3600)
@RestController
@RequestMapping("/api/mfa")
public class MFAValidationController {

    private static final Logger logger = LoggerFactory.getLogger(MFAValidationController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MFAService mfaService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Validates an MFA code for a user
     * @param request Contains username and verification code
     * @return Response with validation result and token if valid
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateMfaCode(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String code = request.get("code");
        
        logger.info("MFA validation attempt for user: {}", username);
        
        try {
            // Validate inputs
            if (username == null || username.isEmpty()) {
                logger.error("MFA validation failed: Missing username");
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Username is required"));
            }
            
            if (code == null || code.isEmpty()) {
                logger.error("MFA validation failed: Missing verification code");
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Verification code is required"));
            }
            
            // Find user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> {
                        logger.error("MFA validation failed: User not found - {}", username);
                        return new IllegalArgumentException("User not found");
                    });
            
            // Check if user has MFA enabled
            if (!user.isMfaEnabled()) {
                logger.error("MFA validation failed: User does not have MFA enabled - {}", username);
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("MFA is not enabled for this user"));
            }
            
            // Clean code
            String cleanCode = code.replaceAll("[^0-9]", "");
            logger.debug("MFA validation: cleaned code length - {}", cleanCode.length());
            
            // Verify code
            boolean isValid = mfaService.verifyCode(user.getMfaSecret(), cleanCode);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            
            if (isValid) {
                logger.info("MFA validation successful for user: {}", username);
                
                // Create authorities from user roles
                List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                    .collect(Collectors.toList());
                
                // Create UserDetailsImpl object for the user
                UserDetailsImpl userDetails = UserDetailsImpl.build(user);
                
                // Create authentication object with UserDetailsImpl as the principal
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);
                
                // Generate JWT token
                String jwt = jwtUtils.generateJwtToken(authentication);
                response.put("token", jwt);
                response.put("username", user.getUsername());
                response.put("roles", user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toList()));
            } else {
                logger.warn("MFA validation failed: Invalid code for user - {}", username);
                response.put("message", "Invalid verification code");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("MFA validation error for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new MessageResponse("Error during MFA validation: " + e.getMessage()));
        }
    }
} 