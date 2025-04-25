package com.ali.service;

import com.ali.converter.EmailConverter;
import com.ali.entity.User;
import com.ali.repository.UserRepository;
import com.ali.util.EncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;

/**
 * Service to handle email encryption and migration of existing emails
 */
@Service
public class EmailEncryptionService {
    private static final Logger logger = LoggerFactory.getLogger(EmailEncryptionService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EncryptionUtil encryptionUtil;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Value("${app.encryption.enabled:true}")
    private boolean encryptionEnabled;
    
    /**
     * Encrypts all existing unencrypted emails in the database
     * This method runs once when the application starts
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void encryptExistingEmails() {
        // Check if encryption is enabled
        if (!encryptionEnabled) {
            logger.info("Email encryption is disabled. Skipping migration.");
            return;
        }
        
        logger.info("Starting encryption of existing emails in the database");
        
        try {
            // Check if we need to migrate data
            boolean needsMigration = checkIfMigrationNeeded();
            
            if (needsMigration) {
                logger.info("Email encryption migration is needed, processing...");
                
                // Use the repository to get all users
                List<User> allUsers = userRepository.findAll();
                int count = 0;
                
                for (User user : allUsers) {
                    // Get the current email (will be decrypted by JPA)
                    String email = user.getEmail();
                    
                    // Check if it's already encrypted (unlikely but a safety check)
                    if (!isEncrypted(email)) {
                        // We need to use direct SQL to bypass the JPA converter
                        // which would automatically encrypt during save
                        String encryptedEmail = encryptionUtil.encrypt(email);
                        
                        // Update directly in the database
                        jdbcTemplate.update(
                            "UPDATE users SET email = ? WHERE id = ?",
                            encryptedEmail, user.getId()
                        );
                        
                        count++;
                    }
                }
                
                // Clear the JPA cache to ensure entities are reloaded with encrypted values
                entityManager.clear();
                
                logger.info("Successfully encrypted {} email(s) in the database", count);
            } else {
                logger.info("No email encryption migration needed, emails are already encrypted");
            }
        } catch (Exception e) {
            logger.error("Error during email encryption migration", e);
        }
    }
    
    /**
     * Checks if the email migration is needed by looking at a sample record
     * 
     * @return true if migration is needed, false otherwise
     */
    private boolean checkIfMigrationNeeded() {
        try {
            // Get a count of users
            Long count = userRepository.count();
            
            if (count == 0) {
                logger.info("No users in the database, no migration needed");
                return false;
            }
            
            // Get the first user's email directly from the database
            // Use H2-compatible syntax (LIMIT 1 -> FETCH FIRST 1 ROWS ONLY)
            String sampleEmail = jdbcTemplate.queryForObject(
                "SELECT email FROM users FETCH FIRST 1 ROWS ONLY", 
                String.class
            );
            
            if (sampleEmail == null) {
                return false;
            }
            
            // Check if sample email looks like an unencrypted email (contains @)
            boolean needsMigration = sampleEmail.contains("@");
            logger.info("Sample email checked: {} - Migration needed: {}", 
                sampleEmail.contains("@") ? "[appears to be unencrypted]" : "[appears to be encrypted]", 
                needsMigration);
                
            return needsMigration;
            
        } catch (Exception e) {
            logger.error("Error checking if migration is needed: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Checks if an email string appears to be encrypted
     * 
     * @param email the email to check
     * @return true if the email appears to be encrypted, false otherwise
     */
    private boolean isEncrypted(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        
        // Check if it looks like a Base64 encoded string (likely encrypted)
        // This is a simple heuristic and not foolproof
        try {
            // Regular email should contain @ and not end with padding =
            boolean looksLikeNormalEmail = email.contains("@") && !email.endsWith("=");
            
            // If it looks like a normal email, it's not encrypted
            return !looksLikeNormalEmail;
        } catch (Exception e) {
            logger.error("Error checking if email is encrypted", e);
            return false;
        }
    }
} 