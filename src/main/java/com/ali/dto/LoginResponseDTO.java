package com.ali.dto;

import java.util.List;

public class LoginResponseDTO {
    private String token;
    private boolean success;
    private String message;
    private boolean mfaRequired;
    private String username;
    private List<String> roles;

    // Default no-args constructor
    public LoginResponseDTO() {
    }

    // Constructor for error responses (5 args with nulls)
    public LoginResponseDTO(boolean success, String message, String token, String username, Boolean mfaRequired) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.username = username;
        this.mfaRequired = mfaRequired != null ? mfaRequired : false;
    }

    // Constructor for successful login responses (6 args with roles)
    public LoginResponseDTO(boolean success, String message, String token, String username, boolean mfaRequired, List<String> roles) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.username = username;
        this.mfaRequired = mfaRequired;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isMfaRequired() {
        return mfaRequired;
    }

    public void setMfaRequired(boolean mfaRequired) {
        this.mfaRequired = mfaRequired;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
} 