package com.ali.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Configuration class that handles environment-specific settings
 * and provides beans and utilities for detecting the current environment.
 */
@Configuration
public class EnvironmentConfig {

    private static final Logger logger = LoggerFactory.getLogger(EnvironmentConfig.class);
    
    private final Environment environment;
    
    @Value("${app.environment:unknown}")
    private String appEnvironment;
    
    @Value("${app.debug-mode:false}")
    private boolean debugMode;
    
    public EnvironmentConfig(Environment environment) {
        this.environment = environment;
    }
    
    @Bean
    public void logEnvironmentInfo() {
        String[] activeProfiles = environment.getActiveProfiles();
        StringBuilder profiles = new StringBuilder();
        
        for (String profile : activeProfiles) {
            profiles.append(profile).append(", ");
        }
        
        if (profiles.length() > 0) {
            profiles.delete(profiles.length() - 2, profiles.length());
        }
        
        logger.info("----------------------------------------------------------");
        logger.info("Application is running with the following active profiles: [{}]", profiles);
        logger.info("Application environment: {}", appEnvironment);
        logger.info("Debug mode: {}", debugMode);
        logger.info("----------------------------------------------------------");
    }
    
    /**
     * Checks if the application is running in development mode
     * @return true if running in dev environment
     */
    @Bean
    public boolean isDevelopment() {
        return environment.acceptsProfiles("dev") || "development".equalsIgnoreCase(appEnvironment);
    }
    
    /**
     * Checks if the application is running in test mode
     * @return true if running in test environment
     */
    @Bean
    public boolean isTest() {
        return environment.acceptsProfiles("test") || "test".equalsIgnoreCase(appEnvironment);
    }
    
    /**
     * Checks if the application is running in production mode
     * @return true if running in production environment
     */
    @Bean
    public boolean isProduction() {
        return environment.acceptsProfiles("prod") || "production".equalsIgnoreCase(appEnvironment);
    }
} 