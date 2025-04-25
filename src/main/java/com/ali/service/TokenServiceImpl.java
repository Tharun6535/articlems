package com.ali.service;

import com.ali.entity.UserToken;
import com.ali.repository.UserTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TokenServiceImpl implements TokenService {

    private static final Logger logger = LoggerFactory.getLogger(TokenServiceImpl.class);
    
    @Autowired
    private UserTokenRepository tokenRepository;
    
    @Override
    @Transactional
    public UserToken createToken(Long userId, String username, String token, int expirationTimeInMs, HttpServletRequest request) {
        // Calculate expiration time
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expirationTimeInMs / 1000);
        
        UserToken userToken = new UserToken(userId, username, token, expiresAt);
        
        // Capture IP and user agent for audit purposes
        if (request != null) {
            userToken.setIpAddress(getClientIp(request));
            userToken.setUserAgent(request.getHeader("User-Agent"));
        }
        
        userToken.setLastUsedAt(LocalDateTime.now());
        
        return tokenRepository.save(userToken);
    }
    
    @Override
    public UserToken findByToken(String token) {
        return tokenRepository.findByToken(token).orElse(null);
    }
    
    @Override
    public boolean isTokenValid(String token) {
        UserToken userToken = findByToken(token);
        
        if (userToken == null) {
            return false;
        }
        
        return !userToken.isBlacklisted() && userToken.getExpiresAt().isAfter(LocalDateTime.now());
    }
    
    @Override
    public List<UserToken> getActiveTokensForUser(String username) {
        return tokenRepository.findActiveTokensByUsername(username, LocalDateTime.now());
    }
    
    @Override
    @Transactional
    public void blacklistAllUserTokens(String username) {
        logger.info("Blacklisting all tokens for user: {}", username);
        tokenRepository.blacklistAllTokensForUser(username);
    }
    
    @Override
    @Transactional
    public void blacklistToken(String token) {
        logger.info("Blacklisting token: {}", token.substring(0, 10) + "...");
        tokenRepository.blacklistToken(token);
    }
    
    @Override
    @Transactional
    public void updateTokenUsage(String token) {
        UserToken userToken = findByToken(token);
        if (userToken != null) {
            userToken.setLastUsedAt(LocalDateTime.now());
            tokenRepository.save(userToken);
        }
    }
    
    @Override
    @Transactional
    @Scheduled(cron = "0 0 1 * * ?") // Run at 1 AM every day
    public void cleanupExpiredTokens() {
        logger.info("Cleaning up expired tokens");
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = "";
        
        if (request != null) {
            remoteAddr = request.getHeader("X-FORWARDED-FOR");
            if (remoteAddr == null || remoteAddr.isEmpty()) {
                remoteAddr = request.getRemoteAddr();
            }
        }
        
        return remoteAddr;
    }
} 