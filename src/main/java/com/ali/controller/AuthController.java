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

import javax.servlet.http.HttpServletRequest;
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
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpStatus;

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

    // In-memory failed login tracking
    private static class FailedLoginInfo {
        int attempts = 0;
        long lockoutUntil = 0;
    }
    private static final ConcurrentHashMap<String, FailedLoginInfo> loginAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MS = TimeUnit.MINUTES.toMillis(10);

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        FailedLoginInfo info = loginAttempts.computeIfAbsent(username, k -> new FailedLoginInfo());
        long now = System.currentTimeMillis();
        if (info.lockoutUntil > now) {
            long minutesLeft = TimeUnit.MILLISECONDS.toMinutes(info.lockoutUntil - now) + 1;
            return ResponseEntity.badRequest().body(new MessageResponse("Account is locked. Try again in " + minutesLeft + " minutes."));
        }
        try {
            logger.info("Authentication attempt for user: {}", username);
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userService.findById(userDetails.getId());
            // Reset failed attempts on success
            loginAttempts.remove(username);
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
            logger.info("Authentication successful for user: {}", username);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            // Increment failed attempts
            info.attempts++;
            if (info.attempts >= MAX_ATTEMPTS) {
                info.lockoutUntil = System.currentTimeMillis() + LOCKOUT_DURATION_MS;
                info.attempts = 0; // reset attempts after lockout
                logger.warn("User {} locked out for 10 minutes due to too many failed attempts", username);
                return ResponseEntity.badRequest().body(new MessageResponse("Account is locked due to too many failed attempts. Try again in 10 minutes."));
            }
            logger.error("Authentication failed for user: {} ({} failed attempts)", username, info.attempts);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid username or password"));
        } catch (Exception e) {
            logger.error("Unexpected error during authentication for user: {}", username, e);
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
            User user = userRepository.findByUsernameWithRoles(username)
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
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest, HttpServletRequest request) {
        try {
            logger.info("Login attempt for user: {}", loginRequest.getUsername());
            
            // Get the user from the repository
            Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
            if (!userOpt.isPresent()) {
                logger.warn("Login failed - User not found: {}", loginRequest.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponseDTO(false, "Invalid username or password", null, null, null));
            }
            
            User user = userOpt.get();
            logger.debug("Found user: {} with email: {}", user.getUsername(), user.getEmail());
            
            // Check if account is active
            if (!user.isActive()) {
                logger.warn("Login attempt for inactive account: {}", loginRequest.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponseDTO(false, "Account is not active", null, null, null));
            }
            
            // Check if account is expired
            if (user.isAccountExpired()) {
                logger.warn("Login attempt for expired account: {}", loginRequest.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponseDTO(false, "Account has expired", null, null, null));
            }
            
            // Check password
            if (!encoder.matches(loginRequest.getPassword(), user.getPassword())) {
                logger.warn("Login failed - Invalid password for user: {}", loginRequest.getUsername());
                // Increment failed attempts
                user.incrementFailedLoginAttempts();
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponseDTO(false, "Invalid username or password", null, null, null));
            }
            
            // Reset failed login attempts on successful login
            if (user.getFailedLoginAttempts() > 0) {
                user.resetFailedLoginAttempts();
                userRepository.save(user);
            }
            
            // Check if MFA is enabled and MFA code is required
            if (user.isMfaEnabled()) {
                // If MFA code is provided, validate it
                if (loginRequest.getMfaCode() != null && !loginRequest.getMfaCode().isEmpty()) {
                    boolean validCode = mfaService.verifyCode(user.getMfaSecret(), loginRequest.getMfaCode());
                    if (!validCode) {
                        logger.warn("Login failed - Invalid MFA code for user: {}", loginRequest.getUsername());
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(new LoginResponseDTO(false, "Invalid verification code", null, null, null));
                    }
                    // MFA validation passed, continue with login
                    logger.info("MFA validation passed for user: {}", loginRequest.getUsername());
                } else {
                    // MFA code required but not provided
                    logger.info("MFA code required for user: {}", loginRequest.getUsername());
                    return ResponseEntity.ok(new LoginResponseDTO(true, "MFA verification required", null, user.getUsername(), true));
                }
            }
            
            // Create authentication token and set in security context
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Generate JWT
            String token = jwtUtils.generateJwtToken(authentication);
            
            // Get user details and roles
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());
            
            logger.info("Login successful for user: {}", loginRequest.getUsername());
            // Return success response with token and user details
            return ResponseEntity.ok(new LoginResponseDTO(
                    true, 
                    "Login successful", 
                    token, 
                    user.getUsername(), 
                    false, 
                    roles
            ));
        } catch (Exception e) {
            logger.error("Error during login for user: {}", loginRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LoginResponseDTO(false, "Server error: " + e.getMessage(), null, null, null));
        }
    }
    
    @PostMapping("/validate-mfa")
    public ResponseEntity<Map<String, Object>> validateMfa(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String code = request.get("code");
        
        User user = userRepository.findByUsernameWithRoles(username)
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
        User user = userRepository.findByUsernameWithRoles(username)
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

    @PostMapping("/reset-password-mfa")
    public ResponseEntity<?> resetPasswordWithMfa(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String mfaCode = request.get("mfaCode");
        String newPassword = request.get("newPassword");
        if (username == null || mfaCode == null || newPassword == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("All fields are required"));
        }
        Optional<User> userOpt = userService.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }
        User user = userOpt.get();
        if (!user.isMfaEnabled() || !mfaService.verifyCode(user.getMfaSecret(), mfaCode)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid MFA code"));
        }
        userService.updatePassword(user, encoder.encode(newPassword));
        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestHeader("Authorization") String authHeader, HttpServletRequest request) {
        try {
            logger.info("Logout requested from IP: {}", request.getRemoteAddr());
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                
                // Add the token to the blacklist
                boolean blacklisted = jwtUtils.blacklistToken(jwt, "User logout");
                
                if (blacklisted) {
                    logger.info("User {} successfully logged out", username);
                    return ResponseEntity.ok(new MessageResponse("You have been successfully logged out"));
                } else {
                    logger.warn("Failed to blacklist token during logout for user: {}", username);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new MessageResponse("Logout failed. Please try again."));
                }
            } else {
                logger.warn("Logout attempt without a valid authorization header");
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("No valid authentication token found"));
            }
        } catch (Exception e) {
            logger.error("Unexpected error during logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Logout failed due to an unexpected error"));
        }
    }
} 