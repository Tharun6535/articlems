package com.ali.util;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.util.Base64;
import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Component
public class FileUtils {
    private static final Logger logger = LoggerFactory.getLogger(FileUtils.class);
    
    /**
     * Generates a public URL for an image file
     * 
     * @param fileName The name of the file
     * @param subdir Optional subdirectory within uploads
     * @return The public URL for accessing the file
     */
    public String getPublicFileUrl(String fileName, String subdir) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return null;
        }
        
        String path = (subdir != null && !subdir.isEmpty()) 
            ? "direct-files/" + subdir + "/" + fileName
            : "direct-files/" + fileName;
            
        return ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/upload/")
            .path(path)
            .toUriString();
    }
    
    /**
     * Converts a small image file to a Base64 data URI for inline embedding
     * 
     * @param filePath The path to the image file
     * @return A data URI containing the Base64-encoded image
     */
    public String getImageAsBase64DataUri(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path) || !Files.isReadable(path)) {
                logger.error("File doesn't exist or isn't readable: {}", filePath);
                return null;
            }
            
            byte[] fileBytes = Files.readAllBytes(path);
            String base64 = Base64.getEncoder().encodeToString(fileBytes);
            
            // Determine MIME type
            String mimeType = "application/octet-stream";
            if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
                mimeType = "image/jpeg";
            } else if (filePath.endsWith(".png")) {
                mimeType = "image/png";
            } else if (filePath.endsWith(".gif")) {
                mimeType = "image/gif";
            }
            
            return "data:" + mimeType + ";base64," + base64;
        } catch (IOException e) {
            logger.error("Error creating data URI from file: {}", filePath, e);
            return null;
        }
    }
} 