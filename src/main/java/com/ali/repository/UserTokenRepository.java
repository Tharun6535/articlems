package com.ali.repository;

import com.ali.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserTokenRepository extends JpaRepository<UserToken, Long> {
    
    Optional<UserToken> findByToken(String token);
    
    List<UserToken> findByUserId(Long userId);
    
    List<UserToken> findByUsername(String username);
    
    @Query("SELECT t FROM UserToken t WHERE t.username = :username AND t.blacklisted = false AND t.expiresAt > :now")
    List<UserToken> findActiveTokensByUsername(@Param("username") String username, @Param("now") LocalDateTime now);
    
    @Modifying
    @Query("UPDATE UserToken t SET t.blacklisted = true WHERE t.username = :username AND t.blacklisted = false")
    void blacklistAllTokensForUser(@Param("username") String username);
    
    @Modifying
    @Query("UPDATE UserToken t SET t.blacklisted = true WHERE t.token = :token")
    void blacklistToken(@Param("token") String token);
    
    @Modifying
    @Query("DELETE FROM UserToken t WHERE t.expiresAt < :before")
    void deleteExpiredTokens(@Param("before") LocalDateTime before);
} 