package com.ali.converter;

import com.ali.util.EncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

/**
 * JPA Attribute Converter for encrypting email addresses in the database
 */
@Converter
@Component
public class EmailConverter implements AttributeConverter<String, String> {
    private static final Logger logger = LoggerFactory.getLogger(EmailConverter.class);
    
    @Autowired
    private EncryptionUtil encryptionUtil;
    
    @Value("${app.encryption.enabled:true}")
    private boolean encryptionEnabled;
    
    /**
     * Converts the entity attribute value (email) to the database column value.
     * This method is called when persisting entity data to the database.
     *
     * @param email the email value to be encrypted
     * @return the encrypted email value for database storage
     */
    @Override
    public String convertToDatabaseColumn(String email) {
        if (email == null || !encryptionEnabled) {
            logger.debug("Email is null or encryption disabled. Skipping encryption.");
            return email;
        }
        
        try {
            // Check if the email is already encrypted
            if (isEncrypted(email)) {
                logger.debug("Email appears to be already encrypted. Returning as is.");
                return email; // Already encrypted, return as is
            }
            
            // Encrypt the email
            String encryptedEmail = encryptionUtil.encrypt(email);
            logger.debug("Email successfully encrypted: {} -> [encrypted]", email);
            return encryptedEmail;
        } catch (Exception e) {
            logger.error("Error encrypting email for database storage: {}", e.getMessage(), e);
            // Return original in case of error to prevent data loss
            return email;
        }
    }
    
    /**
     * Converts the database column value to the entity attribute value (email).
     * This method is called when reading entity data from the database.
     *
     * @param encryptedEmail the encrypted email from the database
     * @return the decrypted email value for entity
     */
    @Override
    public String convertToEntityAttribute(String encryptedEmail) {
        if (encryptedEmail == null || !encryptionEnabled) {
            logger.debug("Encrypted email is null or encryption disabled. Skipping decryption.");
            return encryptedEmail;
        }
        
        try {
            // Check if the value looks like an unencrypted email (contains @)
            if (encryptedEmail.contains("@")) {
                logger.debug("Value contains @ symbol - likely not encrypted. Returning as is: {}", encryptedEmail);
                return encryptedEmail; // It's not encrypted, return as is
            }
            
            // Try to decrypt
            String decryptedEmail = encryptionUtil.decrypt(encryptedEmail);
            
            // Verify the result is a valid email (contains @)
            if (decryptedEmail != null && decryptedEmail.contains("@")) {
                logger.debug("Successfully decrypted email: [encrypted] -> {}", decryptedEmail);
                return decryptedEmail;
            } else {
                logger.warn("Decryption result doesn't look like a valid email. Result: {}", decryptedEmail);
                // If decryption didn't produce a valid email, return the original
                return encryptedEmail;
            }
        } catch (Exception e) {
            logger.error("Error decrypting email from database: {}", e.getMessage(), e);
            // Return original in case of error to prevent data loss
            return encryptedEmail;
        }
    }
    
    /**
     * Checks if an email appears to be already encrypted
     * 
     * @param email the email to check
     * @return true if it appears to be encrypted, false otherwise
     */
    private boolean isEncrypted(String email) {
        // Simple heuristic: encrypted emails won't contain @ and will likely be Base64
        return email != null && !email.contains("@") && email.matches("^[A-Za-z0-9+/=]+$");
    }
} 