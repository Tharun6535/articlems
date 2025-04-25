package com.ali.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jwt_blacklist")
public class JwtBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "reason", length = 100)
    private String reason;

    @Column(name = "blacklisted_at")
    private LocalDateTime blacklistedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Default constructor
    public JwtBlacklist() {
        this.blacklistedAt = LocalDateTime.now();
    }

    // Constructor with token and expiry
    public JwtBlacklist(String token, LocalDateTime expiresAt) {
        this();
        this.token = token;
        this.expiresAt = expiresAt;
    }

    // Constructor with all fields
    public JwtBlacklist(String token, User user, String reason, LocalDateTime expiresAt) {
        this();
        this.token = token;
        this.user = user;
        this.reason = reason;
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getBlacklistedAt() {
        return blacklistedAt;
    }

    public void setBlacklistedAt(LocalDateTime blacklistedAt) {
        this.blacklistedAt = blacklistedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    @Override
    public String toString() {
        return "JwtBlacklist{" +
                "id=" + id +
                ", token='" + token.substring(0, Math.min(token.length(), 10)) + "..." + '\'' +
                ", userId=" + (user != null ? user.getId() : null) +
                ", reason='" + reason + '\'' +
                ", blacklistedAt=" + blacklistedAt +
                ", expiresAt=" + expiresAt +
                '}';
    }
} 