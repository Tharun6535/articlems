package com.ali.security.jwt;

import com.ali.security.services.UserDetailsImpl;
import com.ali.service.JwtBlacklistService;
import com.ali.service.TokenService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Value("${bezkoder.app.tempTokenExpirationMs}")
    private int tempTokenExpirationMs;
    
    @Autowired
    private TokenService tokenService;
    
    @Autowired
    private JwtBlacklistService jwtBlacklistService;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        // Blacklist any existing tokens for this user (enforce single session)
        tokenService.blacklistAllUserTokens(userPrincipal.getUsername());
        
        String token = Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
        
        // Store the new token
        try {
            tokenService.createToken(
                userPrincipal.getId(), 
                userPrincipal.getUsername(), 
                token, 
                jwtExpirationMs, 
                null // Request object not available here
            );
        } catch (Exception e) {
            logger.error("Error storing token: {}", e.getMessage());
        }
        
        return token;
    }

    public String generateTokenFromUsername(String username) {
        // We don't know the user's ID here, so we'll just create the token
        // without storing it in the database
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateTempToken(UserDetailsImpl userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + tempTokenExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateJwtTokenFromTempToken(String tempToken) {
        String username = getUserNameFromTempToken(tempToken);
        
        // Blacklist any existing tokens for this user
        tokenService.blacklistAllUserTokens(username);
        
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    public Date getExpirationFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }

    public String getUserNameFromTempToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    /**
     * Adds a token to the blacklist.
     * 
     * @param token The JWT token to blacklist
     * @param reason The reason for blacklisting
     * @return true if successfully blacklisted
     */
    public boolean blacklistToken(String token, String reason) {
        try {
            // Parse token to get expiration date
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String username = claims.getSubject();
            Date expiration = claims.getExpiration();
            
            // Convert to LocalDateTime
            LocalDateTime expiryDateTime = Instant.ofEpochMilli(expiration.getTime())
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
            
            // Add to blacklist
            jwtBlacklistService.blacklistToken(token, expiryDateTime);
            
            // Also invalidate in token service if it exists there
            try {
                tokenService.blacklistToken(token);
            } catch (Exception e) {
                logger.warn("Error blacklisting token in token service: {}", e.getMessage());
            }
            
            logger.info("Token for user {} has been blacklisted. Reason: {}", username, reason);
            return true;
        } catch (JwtException e) {
            logger.error("Cannot blacklist invalid token: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            // First check if token is in the blacklist
            if (jwtBlacklistService.isTokenBlacklisted(authToken)) {
                logger.warn("Token is blacklisted and cannot be used anymore");
                return false;
            }
            
            // Then check token service database
            if (!tokenService.isTokenValid(authToken)) {
                logger.warn("Token is not found in the active tokens database");
                return false;
            }
            
            // Verify JWT signature and expiration
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            
            // Update last used timestamp
            tokenService.updateTokenUsage(authToken);
            
            return true;
        } catch (JwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        }

        return false;
    }
} 