package com.ali.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

/**
 * Controller for serving media files publicly without authentication
 * This is a simplified controller intended specifically for public image access
 */
@RestController
@RequestMapping("/media")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class MediaController {
    private static final Logger logger = LoggerFactory.getLogger(MediaController.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Serves any image within the uploads directory, with no authentication required
     * Example: /media/image/[filename] or /media/image/images/[filename]
     */
    @GetMapping("/image/**")
    public ResponseEntity<Resource> serveImage(
            @RequestParam(required = false) String path) {
        
        String imagePath = path;
        if (imagePath == null || imagePath.isEmpty()) {
            // Extract the path from the URL after /media/image/
            imagePath = "";
        }
        
        logger.info("Public image access requested: {}", imagePath);
        
        // Try different paths to find the image
        Path[] possiblePaths = {
            Paths.get(uploadDir, imagePath),
            Paths.get(uploadDir, "images", imagePath)
        };
        
        // Also try paths that match the format in the database
        if (imagePath.contains("api/upload/files/")) {
            // Extract just the filename or subdirectory/filename portion
            String[] parts = imagePath.split("api/upload/files/");
            if (parts.length > 1) {
                possiblePaths = new Path[]{
                    Paths.get(uploadDir, parts[1]),
                    Paths.get(uploadDir, parts[1]),
                };
            }
        } else if (imagePath.startsWith("/")) {
            // Handle paths that start with slash
            possiblePaths = new Path[]{
                Paths.get(uploadDir, imagePath.substring(1)),
                Paths.get(uploadDir, "images", imagePath.substring(1))
            };
        }
        
        // Try to find file at any of the possible locations
        for (Path filePath : possiblePaths) {
            logger.info("Checking for image at: {}", filePath.toAbsolutePath());
            
            if (Files.exists(filePath) && Files.isReadable(filePath)) {
                try {
                    String contentType = "image/jpeg";
                    if (filePath.toString().endsWith(".png")) contentType = "image/png";
                    else if (filePath.toString().endsWith(".gif")) contentType = "image/gif";
                    
                    Resource resource = new UrlResource(filePath.toUri());
                    logger.info("Successfully serving public image from: {}", filePath);
                    
                    return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header("Cache-Control", "max-age=86400")
                        .body(resource);
                } catch (IOException e) {
                    logger.error("Error serving image from {}", filePath, e);
                }
            }
        }
        
        // If we get here, we couldn't find the image
        logger.warn("Image not found at any location: {}", imagePath);
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Direct access to a specific file by full filename including subdirectory
     */
    @GetMapping("/file/{filename:.+}")
    public ResponseEntity<Resource> serveFileByName(@PathVariable String filename) {
        // First try directly in uploads dir
        Path filePath = Paths.get(uploadDir, filename);
        
        // If not there, check uploads/images/
        if (!Files.exists(filePath)) {
            filePath = Paths.get(uploadDir, "images", filename);
        }
        
        if (Files.exists(filePath) && Files.isReadable(filePath)) {
            try {
                String contentType = "image/jpeg";
                if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".gif")) contentType = "image/gif";
                
                Resource resource = new UrlResource(filePath.toUri());
                logger.info("Successfully serving file by name: {}", filename);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("Cache-Control", "max-age=86400")
                    .body(resource);
            } catch (IOException e) {
                logger.error("Error serving file by name: {}", filename, e);
            }
        }
        
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Serves image as base64 data URI, useful for embedding directly in HTML/CSS
     */
    @GetMapping("/base64/{filename:.+}")
    public ResponseEntity<String> getImageAsBase64(@PathVariable String filename) {
        // First try directly in uploads dir
        Path filePath = Paths.get(uploadDir, filename);
        
        // If not there, check uploads/images/
        if (!Files.exists(filePath)) {
            filePath = Paths.get(uploadDir, "images", filename);
        }
        
        if (Files.exists(filePath) && Files.isReadable(filePath)) {
            try {
                byte[] fileData = Files.readAllBytes(filePath);
                String base64 = Base64.getEncoder().encodeToString(fileData);
                
                String contentType = "image/jpeg";
                if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".gif")) contentType = "image/gif";
                
                String dataUri = "data:" + contentType + ";base64," + base64;
                logger.info("Successfully served base64 image: {}", filename);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(dataUri);
            } catch (IOException e) {
                logger.error("Error creating base64 data URI: {}", filename, e);
            }
        }
        
        return ResponseEntity.notFound().build();
    }
} 