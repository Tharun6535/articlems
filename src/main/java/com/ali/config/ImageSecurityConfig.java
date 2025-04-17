package com.ali.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Special configuration to handle images completely outside of Spring Security
 */
@Configuration
public class ImageSecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(ImageSecurityConfig.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Filter that directly serves images, bypassing all Spring Security
     */
    @Bean
    public FilterRegistrationBean<Filter> imageFilter() {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
        
        registration.setFilter(new Filter() {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, 
                               FilterChain chain) throws IOException, ServletException {
                
                HttpServletRequest req = (HttpServletRequest) request;
                HttpServletResponse res = (HttpServletResponse) response;
                String requestURI = req.getRequestURI();
                
                // Only handle image paths
                if (requestURI.contains("/upload/files/images/") || 
                    requestURI.contains("/public/images/")) {
                    
                    logger.info("Image filter handling: {}", requestURI);
                    
                    // Extract filename from path
                    String filename;
                    if (requestURI.contains("/upload/files/images/")) {
                        filename = requestURI.substring(requestURI.lastIndexOf("/") + 1);
                    } else if (requestURI.contains("/public/images/")) {
                        filename = requestURI.substring(requestURI.lastIndexOf("/") + 1);
                    } else {
                        chain.doFilter(request, response);
                        return;
                    }
                    
                    // Find the image file
                    Path imagePath = Paths.get(uploadDir, "images", filename);
                    if (!Files.exists(imagePath)) {
                        // If not in images subdirectory, try directly in uploads
                        imagePath = Paths.get(uploadDir, filename);
                    }
                    
                    if (Files.exists(imagePath) && Files.isReadable(imagePath)) {
                        // Set content type
                        String contentType = "image/jpeg";
                        if (filename.endsWith(".png")) contentType = "image/png";
                        else if (filename.endsWith(".gif")) contentType = "image/gif";
                        
                        // Set response headers
                        res.setContentType(contentType);
                        res.setHeader("Cache-Control", "max-age=86400");
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
                        res.setHeader("Access-Control-Allow-Headers", "*");
                        
                        // Write image to response
                        Files.copy(imagePath, res.getOutputStream());
                        res.getOutputStream().flush();
                        logger.info("Served image directly: {}", filename);
                        return;
                    }
                    
                    logger.warn("Image not found: {}", imagePath);
                    res.sendError(HttpServletResponse.SC_NOT_FOUND);
                    return;
                }
                
                // Pass through for non-image requests
                chain.doFilter(request, response);
            }
        });
        
        // Register for image URLs
        registration.addUrlPatterns("/api/upload/files/images/*", "/public/images/*");
        
        // Run this filter before security filters
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        
        return registration;
    }
} 