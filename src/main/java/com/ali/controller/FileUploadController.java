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
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;

import com.ali.dto.ArticleDTO;
import com.ali.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import com.ali.service.CategoryService;
import com.ali.dto.CategoryDTO;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS},
             allowedHeaders = "*")
public class FileUploadController {
    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @Autowired
    private ArticleService articleService;
    
    @Autowired
    private CategoryService categoryService;

    @PostMapping("/csv")
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", 
                 allowedHeaders = "*")
    public ResponseEntity<Map<String, Object>> uploadCsv(@RequestParam("file") MultipartFile file) {
        logger.info("CSV upload request received for file: {}", file.getOriginalFilename());
        Map<String, Object> response = new HashMap<>();
        
        if (file.isEmpty()) {
            logger.error("Empty file uploaded");
            response.put("error", "Please select a file to upload");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        if (!file.getOriginalFilename().endsWith(".csv")) {
            logger.error("Non-CSV file uploaded: {}", file.getOriginalFilename());
            response.put("error", "Only CSV files are allowed");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        try {
            // Store the file for reference
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Created upload directory: {}", uploadPath.toAbsolutePath());
            }
            
            String newFilename = UUID.randomUUID().toString() + ".csv";
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);
            logger.info("Saved CSV file to: {}", filePath.toAbsolutePath());
            
            // Process the CSV file
            List<ArticleDTO> importedArticles = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            int successCount = 0;
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
                // Skip the header line
                String headerLine = reader.readLine();
                logger.info("CSV header: {}", headerLine);
                
                String line;
                int lineNumber = 1;
                
                while ((line = reader.readLine()) != null) {
                    lineNumber++;
                    try {
                        logger.info("Processing line {}: {}", lineNumber, line);
                        
                        // Simple split for simple CSV format
                        String[] values = line.split(",");
                        
                        if (values.length < 4) {
                            String errorMsg = "Line " + lineNumber + ": Not enough columns. Expected at least 4, got " + values.length;
                            logger.error(errorMsg);
                            errors.add(errorMsg);
                            continue;
                        }
                        
                        ArticleDTO article = new ArticleDTO();
                        
                        // Clean and extract values - simply trim and remove any quotes
                        String title = values[1].replace("\"", "").trim();
                        String status = values[2].replace("\"", "").trim(); 
                        String categoryName = values[3].replace("\"", "").trim();
                        
                        logger.info("Extracted values - Title: '{}', Status: '{}', Category: '{}'", 
                            title, status, categoryName);
                        
                        if (title.isEmpty()) {
                            String errorMsg = "Line " + lineNumber + ": Title cannot be empty";
                            logger.error(errorMsg);
                            errors.add(errorMsg);
                            continue;
                        }
                        
                        article.setTitle(title);
                        
                        // For content, use a placeholder with the title since it's required
                        article.setContent("Content for " + title + " imported via CSV");
                        
                        // Try to fetch category ID by name or create a new category
                        try {
                            // First, check if category name is valid
                            if (categoryName.isEmpty()) {
                                throw new Exception("Category name cannot be empty");
                            }
                            
                            // Create a new category directly to avoid any lookup issues
                            CategoryDTO newCategory = new CategoryDTO();
                            newCategory.setTitle(categoryName);
                            CategoryDTO categoryDTO = categoryService.createCategory(newCategory);
                            Long categoryId = categoryDTO.getId();
                            
                            article.setCategoryId(categoryId);
                            logger.info("Created and mapped category '{}' to ID: {}", categoryName, categoryId);
                        } catch (Exception e) {
                            String errorMsg = "Line " + lineNumber + ": Could not create category '" + categoryName + "': " + e.getMessage();
                            logger.error(errorMsg, e);
                            errors.add(errorMsg);
                            continue;
                        }
                        
                        // Set status if available
                        try {
                            // Convert the string to StatusEnum - ensure uppercase
                            status = status.toUpperCase();
                            com.ali.enums.StatusEnum statusEnum = com.ali.enums.StatusEnum.valueOf(status);
                            article.setStatusEnum(statusEnum);
                            logger.info("Set status to {}", status);
                        } catch (IllegalArgumentException e) {
                            String errorMsg = "Line " + lineNumber + ": Invalid status value '" + status + 
                                "'. Valid values are: " + String.join(", ", getValidStatusValues());
                            logger.error(errorMsg);
                            errors.add(errorMsg);
                            // Continue with default status
                            logger.info("Using default status instead");
                        }
                        
                        // Create the article in the database
                        ArticleDTO createdArticle = articleService.createArticle(article);
                        importedArticles.add(createdArticle);
                        successCount++;
                        logger.info("Created article: {}", createdArticle.getTitle());
                    } catch (Exception e) {
                        String errorMsg = "Line " + lineNumber + ": " + e.getMessage();
                        logger.error(errorMsg, e);
                        errors.add(errorMsg);
                    }
                }
            }
            
            // Prepare response
            response.put("success", true);
            response.put("filename", newFilename);
            response.put("successCount", successCount);
            response.put("totalCount", successCount + errors.size());
            response.put("errors", errors);
            
            logger.info("CSV file processed: {} articles imported successfully", successCount);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IOException e) {
            logger.error("Failed to process CSV file", e);
            response.put("error", "Failed to process CSV file: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Helper method to get all valid status values for user guidance
    private String[] getValidStatusValues() {
        return java.util.Arrays.stream(com.ali.enums.StatusEnum.values())
            .map(Enum::name)
            .toArray(String[]::new);
    }
    
    // Add a test endpoint for CSV parsing that doesn't require file upload
    @GetMapping("/csv-test")
    public ResponseEntity<Map<String, Object>> testCsvParsing() {
        Map<String, Object> response = new HashMap<>();
        
        // Sample CSV data that should work
        String csvData = 
            "ID,Title,Status,Category,Created Date,Likes\n" +
            "1,Test Article,PUBLISHED,Technology,2023-01-01,0";
            
        logger.info("Testing CSV parsing with: {}", csvData);
        
        String[] lines = csvData.split("\n");
        logger.info("Header: {}", lines[0]);
        logger.info("Data line: {}", lines[1]);
        
        String[] values = lines[1].split(",");
        logger.info("Split values ({}): {}", values.length, String.join(" | ", values));
        
        if (values.length >= 4) {
            response.put("success", true);
            response.put("title", values[1]);
            response.put("status", values[2]);
            response.put("category", values[3]);
            
            // Test enum parsing
            try {
                com.ali.enums.StatusEnum statusEnum = com.ali.enums.StatusEnum.valueOf(values[2].toUpperCase());
                response.put("validStatus", true);
                response.put("statusEnum", statusEnum.name());
            } catch (Exception e) {
                response.put("validStatus", false);
                response.put("error", "Invalid status: " + e.getMessage());
            }
            
            // List all valid status values
            response.put("validStatusValues", getValidStatusValues());
        } else {
            response.put("success", false);
            response.put("error", "Not enough columns");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/test")
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
    public ResponseEntity<Map<String, Object>> testUploads() {
        Map<String, Object> response = new HashMap<>();
        try {
            Path uploadsPath = Paths.get(uploadDir);
            response.put("uploadsDirectory", uploadsPath.toAbsolutePath().toString());
            response.put("exists", Files.exists(uploadsPath));
            response.put("isReadable", Files.isReadable(uploadsPath));
            
            if (Files.exists(uploadsPath)) {
                List<String> files = Files.list(uploadsPath)
                    .map(path -> path.getFileName().toString())
                    .limit(10)  // Limit to 10 files to avoid too much output
                    .collect(Collectors.toList());
                response.put("files", files);
            }
            
            logger.info("Upload directory test: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error testing upload directory", e);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/image")
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", 
                 allowedHeaders = "*")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) {
        logger.info("Image upload request received for file: {}", file.getOriginalFilename());
        Map<String, Object> response = new HashMap<>();
        
        if (file.isEmpty()) {
            logger.error("Empty file uploaded");
            response.put("error", "Please select a file to upload");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            logger.error("Non-image file uploaded: {}", contentType);
            response.put("error", "Only image files are allowed");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir, "images");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Created image upload directory: {}", uploadPath.toAbsolutePath());
            }
            
            // Generate a unique filename to prevent overwriting
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
                
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(newFilename);
            
            // Copy file to destination
            Files.copy(file.getInputStream(), filePath);
            logger.info("Saved image to: {}", filePath.toAbsolutePath());
            
            // Create URL for accessing the image
            String fileUrl = "/api/upload/files/images/" + newFilename;
            
            response.put("success", true);
            response.put("filename", newFilename);
            response.put("url", fileUrl);
            response.put("contentType", contentType);
            response.put("size", file.getSize());
            
            logger.info("Image successfully uploaded: {}", fileUrl);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IOException e) {
            logger.error("Failed to process image file", e);
            response.put("error", "Failed to process image file: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Add endpoint to serve uploaded files
    @GetMapping("/files/**")
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", 
                 methods = {RequestMethod.GET, RequestMethod.HEAD, RequestMethod.OPTIONS},
                 allowedHeaders = "*")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        try {
            // Extract the file path from the URL
            String requestPath = request.getRequestURI();
            String filePath = requestPath.substring(requestPath.indexOf("/files/") + "/files/".length());
            
            logger.info("Serving file with path: {}", filePath);
            logger.info("Full request URI: {}", requestPath);
            logger.info("Request headers: {}", request.getHeaderNames());
            
            // Resolve the file path within the upload directory
            Path file = Paths.get(uploadDir).resolve(filePath);
            
            logger.info("Looking for file at: {}", file.toAbsolutePath());
            
            // Check if file exists and is readable
            if (!Files.exists(file)) {
                logger.error("File not found: {}", file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            
            if (!Files.isReadable(file)) {
                logger.error("File not readable: {}", file.toAbsolutePath());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Determine content type
            String contentType = determineContentType(file.toString());
            
            // Return the file
            Resource resource = new UrlResource(file.toUri());
            
            // Log success
            logger.info("Successfully serving file: {} with content type: {}", filePath, contentType);
            
            // Allow caching of image files for better performance
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header("Cache-Control", "max-age=86400") // Cache for 24 hours
                .header("Access-Control-Allow-Origin", "http://localhost:3000") // FIXED: Use specific origin, not wildcard
                .header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .header("Access-Control-Allow-Credentials", "true") // Explicitly allow credentials
                .body(resource);
                
        } catch (IOException e) {
            logger.error("Error serving file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Helper method to determine content type
    private String determineContentType(String filename) {
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".gif")) {
            return "image/gif";
        } else if (filename.endsWith(".pdf")) {
            return "application/pdf";
        } else if (filename.endsWith(".csv")) {
            return "text/csv";
        }
        // Default content type
        return "application/octet-stream";
    }

    // Add a direct file access endpoint that doesn't go through security
    @GetMapping("/direct-files/**")
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 
    public ResponseEntity<Resource> directFileAccess(HttpServletRequest request) {
        try {
            String requestPath = request.getRequestURI();
            String filePath = requestPath.substring(requestPath.indexOf("/direct-files/") + "/direct-files/".length());
            
            logger.info("Direct file access requested for: {}", filePath);
            
            // Resolve the file path within the upload directory
            Path file = Paths.get(uploadDir).resolve(filePath);
            logger.info("Looking for file at absolute path: {}", file.toAbsolutePath());
            
            // Validate the path is within the uploads directory (security check)
            if (!file.toAbsolutePath().normalize().startsWith(Paths.get(uploadDir).toAbsolutePath().normalize())) {
                logger.error("Security violation - attempted access outside uploads directory: {}", filePath);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Check if file exists and is readable
            if (!Files.exists(file)) {
                logger.error("File not found at: {}", file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            
            // Determine content type
            String contentType = determineContentType(file.toString());
            
            // Create the resource
            Resource resource = new UrlResource(file.toUri());
            
            // Return with permissive headers
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header("Cache-Control", "max-age=86400")
                .header("Access-Control-Allow-Origin", "http://localhost:3000")
                .header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .header("Access-Control-Allow-Credentials", "true")
                .body(resource);
                
        } catch (IOException e) {
            logger.error("Error accessing file directly", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 