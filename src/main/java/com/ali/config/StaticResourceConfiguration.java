package com.ali.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfiguration implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map URL path /api/upload/files/** to the physical location where files are stored
        registry.addResourceHandler("/api/upload/files/**")
                .addResourceLocations("file:./" + uploadDir + "/") // Use the same directory as FileUploadController
                .setCachePeriod(3600) // Cache for 1 hour
                .resourceChain(true);
        
        // Add other resource handlers if needed
    }
} 