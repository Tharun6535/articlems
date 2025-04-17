package com.ali.controller;

import com.ali.dto.JwtResponse;
import com.ali.dto.LoginRequest;
import com.ali.dto.MessageResponse;
import com.ali.dto.SignupRequest;
import com.ali.entity.ERole;
import com.ali.entity.Role;
import com.ali.entity.User;
import com.ali.repository.RoleRepository;
import com.ali.repository.UserRepository;
import com.ali.security.jwt.JwtUtils;
import com.ali.security.services.UserDetailsImpl;
import com.ali.service.MFAService;
import com.ali.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ali.dto.LoginRequestDTO;
import com.ali.dto.LoginResponseDTO;
import java.util.Map;
import java.util.HashMap;
import com.ali.payload.request.Verify2FARequest;
import com.ali.payload.response.TempTokenResponse;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    private UserService userService;

    @Autowired
    private MFAService mfaService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Authentication attempt for user: {}", loginRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userService.findById(userDetails.getId());

            if (user.isMfaEnabled()) {
                String tempToken = jwtUtils.generateTempToken(userDetails);
                return ResponseEntity.ok(new TempTokenResponse(tempToken, true));
            }

            String jwt = jwtUtils.generateJwtToken(authentication);
            
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());
            
            JwtResponse response = new JwtResponse(jwt,
                                                  userDetails.getId(),
                                                  userDetails.getUsername(),
                                                  userDetails.getEmail(),
                                                  roles);
            
            logger.info("Authentication successful for user: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            logger.error("Authentication failed for user: {}", loginRequest.getUsername(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid username or password"));
        } catch (Exception e) {
            logger.error("Unexpected error during authentication for user: {}", loginRequest.getUsername(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            logger.info("Registration attempt for user: {}", signUpRequest.getUsername());
            
            if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Username is already taken!"));
            }

            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Email is already in use!"));
            }

            // Create new user's account
            User user = new User(signUpRequest.getUsername(),
                                signUpRequest.getEmail(),
                                encoder.encode(signUpRequest.getPassword()));

            Set<String> strRoles = signUpRequest.getRole();
            Set<Role> roles = new HashSet<>();

            if (strRoles == null || strRoles.isEmpty()) {
                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(userRole);
            } else {
                strRoles.forEach(role -> {
                    switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                    }
                });
            }

            user.setRoles(roles);
            userRepository.save(user);
            
            logger.info("User registered successfully: {}", signUpRequest.getUsername());
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            logger.error("Error during registration for user: {}", signUpRequest.getUsername(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Auth API is working!"));
    }
    
    @GetMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin() {
        try {
            // Check if admin already exists
            if (userRepository.existsByUsername("superadmin")) {
                return ResponseEntity.ok(new MessageResponse("Admin user already exists. Use username: superadmin, password: admin123"));
            }
            
            // Create admin user with known password
            User admin = new User("superadmin", 
                                 "superadmin@example.com", 
                                 encoder.encode("admin123"));
            
            // Assign ADMIN role
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin role not found."));
            roles.add(adminRole);
            admin.setRoles(roles);
            
            // Save to database
            userRepository.save(admin);
            
            return ResponseEntity.ok(new MessageResponse(
                "Admin user created successfully. Use username: superadmin, password: admin123"));
        } catch (Exception e) {
            logger.error("Error creating admin user: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/direct-login/{username}")
    public ResponseEntity<?> directLogin(@PathVariable String username) {
        try {
            // Find user
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            // Create UserDetails
            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            
            // Generate token manually
            String jwt = jwtUtils.generateTokenFromUsername(username);
            
            // Get roles
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());
            
            // Create response
            JwtResponse response = new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles
            );
            
            logger.info("Direct login successful for user: {}", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during direct login for user: {}", username, e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        // First, validate username and password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // If we get here, authentication was successful
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        LoginResponseDTO response = new LoginResponseDTO();
        response.setUsername(user.getUsername());
        
        // Check if MFA is enabled for this user
        if (user.isMfaEnabled()) {
            // If MFA is enabled, we need to verify the MFA code
            if (loginRequest.getMfaCode() == null || loginRequest.getMfaCode().trim().isEmpty()) {
                // No MFA code provided, but required
                response.setSuccess(false);
                response.setMfaRequired(true);
                response.setMessage("MFA verification required");
                return ResponseEntity.ok(response);
            }
            
            // Validate MFA code
            boolean isValidCode = mfaService.verifyCode(user.getMfaSecret(), loginRequest.getMfaCode());
            if (!isValidCode) {
                response.setSuccess(false);
                response.setMfaRequired(true);
                response.setMessage("Invalid MFA code");
                return ResponseEntity.ok(response);
            }
        }
        
        // If we reach here, either MFA was not required or it was successfully validated
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        response.setSuccess(true);
        response.setToken(jwt);
        response.setMessage("Login successful");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/validate-mfa")
    public ResponseEntity<Map<String, Object>> validateMfa(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String code = request.get("code");
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        boolean isValid = mfaService.verifyCode(user.getMfaSecret(), code);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        
        if (isValid) {
            // Create authentication object
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    username, null, null);
            
            // Generate JWT token
            String jwt = jwtUtils.generateJwtToken(authentication);
            response.put("token", jwt);
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FACode(@Valid @RequestBody Verify2FARequest request) {
        String username = jwtUtils.getUserNameFromTempToken(request.getSecret());
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (mfaService.verifyCode(user.getMfaSecret(), request.getCode())) {
            String jwt = jwtUtils.generateJwtTokenFromTempToken(request.getSecret());
            return ResponseEntity.ok(new JwtResponse(jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRoles().stream()
                            .map(role -> role.getName().name())
                            .collect(Collectors.toList())));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("Invalid verification code"));
    }
} 