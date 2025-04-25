package com.ali.repository;

import com.ali.entity.JwtBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JwtBlacklistRepository extends JpaRepository<JwtBlacklist, Long> {

    /**
     * Check if a token is in the blacklist
     */
    boolean existsByToken(String token);

    /**
     * Find a blacklisted token by its value
     */
    Optional<JwtBlacklist> findByToken(String token);

    /**
     * Find all blacklisted tokens for a user
     */
    List<JwtBlacklist> findAllByUserId(Long userId);

    /**
     * Delete expired tokens from blacklist
     */
    @Modifying
    @Query("DELETE FROM JwtBlacklist j WHERE j.expiresAt < ?1")
    int deleteExpiredTokens(LocalDateTime now);
} 