package com.ali.payload.request;

import javax.validation.constraints.NotBlank;

public class Verify2FARequest {
    @NotBlank
    private String secret;

    @NotBlank
    private String code;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
} 