package com.ali.controller;

import com.ali.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ImageController {
    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @Autowired
    private FileUtils fileUtils;
    
    /**
     * Primary endpoint for serving images with multiple fallback options
     */
    @GetMapping("/{subdir}/{filename:.+}")
    public ResponseEntity<?> getImage(
            @PathVariable String subdir,
            @PathVariable String filename,
            @RequestParam(required = false, defaultValue = "false") boolean asBase64) {
        
        logger.info("Image requested: {}/{} (as base64: {})", subdir, filename, asBase64);
        
        // Construct the file path
        Path filepath = Paths.get(uploadDir, subdir, filename);
        logger.info("Looking for image at: {}", filepath.toAbsolutePath());
        
        // Check if file exists
        if (!Files.exists(filepath)) {
            logger.warn("Image not found: {}", filepath);
            return ResponseEntity.notFound().build();
        }
        
        try {
            // If base64 requested or the file is small (< 100KB), return as data URI
            if (asBase64 || Files.size(filepath) < 100 * 1024) {
                String dataUri = fileUtils.getImageAsBase64DataUri(filepath.toString());
                Map<String, String> response = new HashMap<>();
                response.put("dataUri", dataUri);
                return ResponseEntity.ok(response);
            }
            
            // Otherwise serve as a file
            Resource resource = new UrlResource(filepath.toUri());
            String contentType = "image/jpeg";
            if (filename.endsWith(".png")) contentType = "image/png";
            else if (filename.endsWith(".gif")) contentType = "image/gif";
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header("Cache-Control", "max-age=86400")
                .body(resource);
                
        } catch (IOException e) {
            logger.error("Error serving image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Fallback endpoint for direct image access
     */
    @GetMapping("/file/{filename:.+}")
    public ResponseEntity<?> getImageByFilename(@PathVariable String filename) {
        logger.info("Direct image access requested: {}", filename);
        
        // Look in multiple locations
        Path[] possiblePaths = {
            Paths.get(uploadDir, filename),
            Paths.get(uploadDir, "images", filename)
        };
        
        // Try each possible location
        for (Path filepath : possiblePaths) {
            logger.info("Checking for image at: {}", filepath.toAbsolutePath());
            if (Files.exists(filepath)) {
                try {
                    Resource resource = new UrlResource(filepath.toUri());
                    String contentType = "image/jpeg";
                    if (filename.endsWith(".png")) contentType = "image/png";
                    else if (filename.endsWith(".gif")) contentType = "image/gif";
                    
                    return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header("Cache-Control", "max-age=86400")
                        .body(resource);
                } catch (IOException e) {
                    logger.error("Error serving image from " + filepath, e);
                }
            }
        }
        
        // If we couldn't find the image anywhere, return not found
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Provides public URL for an image that will work without authentication
     */
    @GetMapping("/url/{subdir}/{filename:.+}")
    public ResponseEntity<Map<String, String>> getImageUrl(
            @PathVariable String subdir,
            @PathVariable String filename) {
        
        logger.info("Image URL requested for: {}/{}", subdir, filename);
        Map<String, String> response = new HashMap<>();
        
        // Generate public URL
        String publicUrl = fileUtils.getPublicFileUrl(filename, subdir);
        response.put("url", publicUrl);
        
        // Also include a direct URL that bypasses security
        response.put("directUrl", "/api/images/file/" + filename);
        
        return ResponseEntity.ok(response);
    }
} 