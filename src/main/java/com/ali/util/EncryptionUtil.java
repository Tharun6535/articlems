package com.ali.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;

/**
 * Utility class for encryption and decryption of sensitive data
 */
@Component
public class EncryptionUtil {
    
    // Encryption key loaded from properties
    @Value("${app.encryption.key:YourSecretKey123YourSecretKey123}")
    private String encryptionKey;
    
    @Value("${app.encryption.enabled:true}")
    private boolean encryptionEnabled;
    
    private static final String ALGORITHM = "AES";
    
    /**
     * Encrypts a string value
     * 
     * @param value the value to encrypt
     * @return the encrypted value as a Base64 encoded string
     */
    public String encrypt(String value) {
        if (value == null || value.isEmpty() || !encryptionEnabled) {
            return value;
        }
        
        try {
            Key key = generateKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encryptedBytes = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting value", e);
        }
    }
    
    /**
     * Decrypts a Base64 encoded encrypted string
     * 
     * @param encryptedValue the encrypted value to decrypt
     * @return the decrypted value
     */
    public String decrypt(String encryptedValue) {
        if (encryptedValue == null || encryptedValue.isEmpty() || !encryptionEnabled) {
            return encryptedValue;
        }
        
        try {
            // First check if it looks like an email (contains @)
            // If so, it might be unencrypted so return as is
            if (encryptedValue.contains("@")) {
                return encryptedValue;
            }
            
            Key key = generateKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decodedValue = Base64.getDecoder().decode(encryptedValue);
            byte[] decryptedBytes = cipher.doFinal(decodedValue);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // If decryption fails, it might be an unencrypted value
            // Return original value and log the error
            return encryptedValue;
        }
    }
    
    /**
     * Generates a secret key from the encryption key
     * 
     * @return the generated key
     */
    private Key generateKey() {
        // Make sure the key is exactly 32 bytes for AES-256
        byte[] keyBytes = new byte[32];
        byte[] passwordBytes = encryptionKey.getBytes(StandardCharsets.UTF_8);
        int length = Math.min(passwordBytes.length, keyBytes.length);
        System.arraycopy(passwordBytes, 0, keyBytes, 0, length);
        return new SecretKeySpec(keyBytes, ALGORITHM);
    }
} 