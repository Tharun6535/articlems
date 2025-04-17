package com.ali.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security with enhanced image access rules");
        
        http
            .csrf().disable()
            .authorizeRequests()
                // Allow all file and image endpoints with extremely specific patterns
                .antMatchers("/api/upload/files/**").permitAll()
                .antMatchers("/api/upload/files/images/**").permitAll() // Explicit pattern
                .antMatchers("/api/upload/direct-files/**").permitAll() // Direct file access
                .antMatchers("/api/images/**").permitAll()
                .antMatchers("/uploads/**").permitAll()
                .antMatchers("/files/**").permitAll()
                .antMatchers("/media/**").permitAll() // New public media endpoints
                // Add other permission rules as needed
                .anyRequest().authenticated()
            .and()
            .httpBasic();
            
        logger.info("Security configuration complete with enhanced image paths");
        
        return http.build();
    }
} 