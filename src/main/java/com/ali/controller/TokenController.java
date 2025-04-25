package com.ali.controller;

import com.ali.entity.UserToken;
import com.ali.service.TokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tokens")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", maxAge = 3600)
public class TokenController {

    private static final Logger logger = LoggerFactory.getLogger(TokenController.class);
    
    @Autowired
    private TokenService tokenService;
    
    /**
     * Get active sessions for the current user
     */
    @GetMapping("/my-sessions")
    public ResponseEntity<?> getMyActiveSessions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        List<UserToken> tokens = tokenService.getActiveTokensForUser(username);
        
        // Remove actual token values for security
        tokens.forEach(token -> token.setToken("[REDACTED]"));
        
        return ResponseEntity.ok(tokens);
    }
    
    /**
     * Invalidate all other sessions for current user
     */
    @PostMapping("/invalidate-other-sessions")
    public ResponseEntity<?> invalidateOtherSessions(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Invalid authorization header");
        }
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        // Get current token
        String currentToken = authHeader.substring(7);
        
        // Blacklist all other tokens for this user
        List<UserToken> activeTokens = tokenService.getActiveTokensForUser(username);
        for (UserToken token : activeTokens) {
            if (!token.getToken().equals(currentToken)) {
                tokenService.blacklistToken(token.getToken());
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "All other sessions have been invalidated");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Admin endpoint to view all active sessions
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllActiveSessions() {
        // This would need implementation to get all active tokens across users
        // For now, return a message
        return ResponseEntity.ok("Not implemented - would return all active sessions");
    }
    
    /**
     * Admin endpoint to invalidate sessions for a specific user
     */
    @PostMapping("/invalidate/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> invalidateSessionsForUser(@PathVariable String username) {
        tokenService.blacklistAllUserTokens(username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "All sessions for user " + username + " have been invalidated");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Run token cleanup manually
     */
    @PostMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> runTokenCleanup() {
        tokenService.cleanupExpiredTokens();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Token cleanup completed");
        
        return ResponseEntity.ok(response);
    }
} 