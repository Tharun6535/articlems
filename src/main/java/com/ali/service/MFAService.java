package com.ali.service;

import com.ali.entity.User;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

@Service
public class MFAService {
    private final DefaultSecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final QrGenerator qrGenerator;
    private final CodeVerifier codeVerifier;

    public MFAService() {
        this.qrGenerator = new ZxingPngQrGenerator();
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    }

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public String generateQrCodeImageUri(String secret, String email) {
        // Create proper Google Authenticator compatible QR code data
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("Blog Application")
                .algorithm(HashingAlgorithm.SHA1) // Google Authenticator uses SHA1
                .digits(6)                        // 6 digits is standard
                .period(30)                       // 30 second period is standard
                .build();

        try {
            // Generate the QR code image as a data URI
            byte[] imageData = qrGenerator.generate(data);
            String mimeType = qrGenerator.getImageMimeType();
            
            // Convert to data URI format that can be displayed in an <img> tag
            return getDataUriForImage(imageData, mimeType);
        } catch (QrGenerationException e) {
            throw new RuntimeException("Error generating QR code", e);
        }
    }

    public boolean verifyCode(String secret, String code) {
        if (code == null || code.trim().isEmpty()) {
            return false;
        }
        
        // Remove any spaces or non-numeric characters that might have been entered
        code = code.replaceAll("[^0-9]", "");
        
        return codeVerifier.isValidCode(secret, code);
    }

    public boolean isMFAEnabled(User user) {
        return user.isMfaEnabled();
    }

    public void enableMFA(User user, String secret) {
        user.setMfaEnabled(true);
        user.setMfaSecret(secret);
    }

    public void disableMFA(User user) {
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
    }
} 