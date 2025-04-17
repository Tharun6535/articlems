package com.ali.payload.response;

public class TempTokenResponse {
    private String tempToken;
    private boolean requires2FA;

    public TempTokenResponse(String tempToken, boolean requires2FA) {
        this.tempToken = tempToken;
        this.requires2FA = requires2FA;
    }

    public String getTempToken() {
        return tempToken;
    }

    public void setTempToken(String tempToken) {
        this.tempToken = tempToken;
    }

    public boolean isRequires2FA() {
        return requires2FA;
    }

    public void setRequires2FA(boolean requires2FA) {
        this.requires2FA = requires2FA;
    }
} 