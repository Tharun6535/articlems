package com.ali.service;

import com.ali.entity.JwtBlacklist;
import com.ali.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public interface JwtBlacklistService {

    /**
     * Add a token to the blacklist
     */
    JwtBlacklist blacklistToken(String token, LocalDateTime expiresAt);

    /**
     * Add a token to the blacklist with user information
     */
    JwtBlacklist blacklistToken(String token, User user, String reason, LocalDateTime expiresAt);

    /**
     * Check if a token is blacklisted
     */
    boolean isTokenBlacklisted(String token);

    /**
     * Get all blacklisted tokens for a user
     */
    List<JwtBlacklist> getBlacklistedTokensForUser(Long userId);

    /**
     * Get all blacklisted tokens for a user
     */
    List<JwtBlacklist> getBlacklistedTokensForUser(User user);
    
    /**
     * Clean up expired tokens
     */
    int cleanupExpiredTokens();
} 