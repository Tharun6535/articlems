package com.ali.service.impl;

import com.ali.entity.JwtBlacklist;
import com.ali.entity.User;
import com.ali.repository.JwtBlacklistRepository;
import com.ali.service.JwtBlacklistService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class JwtBlacklistServiceImpl implements JwtBlacklistService {

    private static final Logger logger = LoggerFactory.getLogger(JwtBlacklistServiceImpl.class);

    @Autowired
    private JwtBlacklistRepository jwtBlacklistRepository;

    @Override
    @Transactional
    public JwtBlacklist blacklistToken(String token, LocalDateTime expiresAt) {
        logger.info("Blacklisting token that expires at: {}", expiresAt);
        JwtBlacklist blacklistEntry = new JwtBlacklist(token, expiresAt);
        return jwtBlacklistRepository.save(blacklistEntry);
    }

    @Override
    @Transactional
    public JwtBlacklist blacklistToken(String token, User user, String reason, LocalDateTime expiresAt) {
        logger.info("Blacklisting token for user: {} with reason: {}", user.getUsername(), reason);
        JwtBlacklist blacklistEntry = new JwtBlacklist(token, user, reason, expiresAt);
        return jwtBlacklistRepository.save(blacklistEntry);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isTokenBlacklisted(String token) {
        return jwtBlacklistRepository.existsByToken(token);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JwtBlacklist> getBlacklistedTokensForUser(Long userId) {
        return jwtBlacklistRepository.findAllByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JwtBlacklist> getBlacklistedTokensForUser(User user) {
        if (user == null || user.getId() == null) {
            return Collections.emptyList();
        }
        return getBlacklistedTokensForUser(user.getId());
    }

    @Override
    @Transactional
    public int cleanupExpiredTokens() {
        int count = jwtBlacklistRepository.deleteExpiredTokens(LocalDateTime.now());
        logger.info("Cleaned up {} expired tokens from blacklist", count);
        return count;
    }

    /**
     * Scheduled task to clean up expired tokens every day at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void scheduledCleanup() {
        logger.info("Running scheduled cleanup of expired tokens");
        int deleted = cleanupExpiredTokens();
        logger.info("Scheduled cleanup complete, removed {} expired tokens", deleted);
    }
} 