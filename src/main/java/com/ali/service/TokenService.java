package com.ali.service;

import com.ali.entity.UserToken;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface TokenService {
    
    /**
     * Store a new token in the database
     */
    UserToken createToken(Long userId, String username, String token, int expirationTimeInMs, HttpServletRequest request);
    
    /**
     * Find a token by its value
     */
    UserToken findByToken(String token);
    
    /**
     * Check if a token is valid (not blacklisted and not expired)
     */
    boolean isTokenValid(String token);
    
    /**
     * Get all active tokens for a user
     */
    List<UserToken> getActiveTokensForUser(String username);
    
    /**
     * Blacklist all existing tokens for a user (used when forcing single session)
     */
    void blacklistAllUserTokens(String username);
    
    /**
     * Blacklist a specific token
     */
    void blacklistToken(String token);
    
    /**
     * Update the last used timestamp for a token
     */
    void updateTokenUsage(String token);
    
    /**
     * Clean up expired tokens from the database
     */
    void cleanupExpiredTokens();
} 