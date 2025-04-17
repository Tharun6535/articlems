package com.ali.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * A completely public controller for serving images without any authentication
 */
@RestController
@CrossOrigin(origins = "*", allowCredentials = "false")
public class PublicImageController {
    private static final Logger logger = LoggerFactory.getLogger(PublicImageController.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    /**
     * Serves images from any path (including the same path stored in the database)
     * This catches all requests with "/api/upload/files/images/" in the path
     */
    @GetMapping("/api/upload/files/images/{filename:.+}")
    public ResponseEntity<Resource> serveImageByExactPath(@PathVariable String filename) {
        logger.info("Simple public image request: {}", filename);
        
        // Try to find the file in the images directory
        Path filePath = Paths.get(uploadDir, "images", filename);
        
        if (Files.exists(filePath) && Files.isReadable(filePath)) {
            try {
                Resource resource = new UrlResource(filePath.toUri());
                
                // Determine content type
                String contentType = "image/jpeg";
                if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".gif")) contentType = "image/gif";
                
                logger.info("Successfully serving image with public controller: {}", filename);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("Cache-Control", "max-age=86400")
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Headers", "*") 
                    .header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
                    .body(resource);
            } catch (Exception e) {
                logger.error("Error serving public image: {}", filename, e);
            }
        } else {
            logger.warn("Image file not found: {}", filePath.toAbsolutePath());
        }
        
        // If we get here, the image couldn't be found or served
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Alternative path to access the same images
     */
    @GetMapping("/public/images/{filename:.+}")
    public ResponseEntity<Resource> servePublicImage(@PathVariable String filename) {
        // This just uses the same implementation
        return serveImageByExactPath(filename);
    }
} 