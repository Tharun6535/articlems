package com.ali.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Fallback controller for when direct image access fails
 * Provides Base64 embedded images that can be used inline without authentication
 */
@RestController
@RequestMapping("/api/fallback")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class FallbackController {
    private static final Logger logger = LoggerFactory.getLogger(FallbackController.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    /**
     * Get an image as a Base64 data URI that can be embedded directly in HTML/CSS
     */
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Map<String, String>> getImageAsDataUri(@PathVariable String filename) {
        logger.info("Fallback image request for: {}", filename);
        
        try {
            // First try in uploads/images
            Path filePath = Paths.get(uploadDir, "images", filename);
            
            // If not found, try directly in uploads
            if (!Files.exists(filePath)) {
                filePath = Paths.get(uploadDir, filename);
            }
            
            // If the file exists and is readable
            if (Files.exists(filePath) && Files.isReadable(filePath)) {
                // Read file bytes
                byte[] fileData = Files.readAllBytes(filePath);
                
                // Encode as Base64
                String base64 = Base64.getEncoder().encodeToString(fileData);
                
                // Determine content type
                String contentType = "image/jpeg";
                if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".gif")) contentType = "image/gif";
                
                // Create data URI
                String dataUri = "data:" + contentType + ";base64," + base64;
                
                // Return in JSON response
                Map<String, String> response = new HashMap<>();
                response.put("dataUri", dataUri);
                response.put("originalPath", "/api/upload/files/images/" + filename);
                response.put("filename", filename);
                
                logger.info("Successfully created data URI for: {}", filename);
                return ResponseEntity.ok(response);
            }
            
            logger.warn("File not found for fallback: {}", filePath.toAbsolutePath());
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            logger.error("Error creating fallback for image: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Find an image by original path and return as data URI
     */
    @GetMapping("/by-path")
    public ResponseEntity<Map<String, String>> getImageByPath(
            @RequestParam String path) {
        
        logger.info("Fallback by path request: {}", path);
        
        // Extract filename from path
        String filename = path;
        if (path.contains("/")) {
            filename = path.substring(path.lastIndexOf('/') + 1);
        }
        
        // Use the existing method to get the image
        return getImageAsDataUri(filename);
    }
} 