package com.ali.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Create the uploads directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        File directory = uploadPath.toFile();
        if (!directory.exists()) {
            directory.mkdirs();
        }
        
        // Map the uploads directory to a URL path
        registry.addResourceHandler("/api/upload/files/**")
                .addResourceLocations("file:" + directory.getAbsolutePath() + "/");
    }
} 