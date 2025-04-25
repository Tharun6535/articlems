package com.ali.controller;

import com.ali.dto.ArticleDTO;
import com.ali.service.ArticleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import javax.persistence.OptimisticLockException;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ArticleManagementController {
    private static final Logger logger = LoggerFactory.getLogger(ArticleManagementController.class);

    @Autowired
    ArticleService articleService;

    @PostMapping("")
    public ResponseEntity<?> createArticle(@RequestBody @Valid ArticleDTO articleDTO) {
        try {
            logger.info("Creating article with title: {}", articleDTO.getTitle());
            logger.info("Received article data: {}", articleDTO);
            
            // Validate required fields
            if (articleDTO.getTitle() == null || articleDTO.getTitle().trim().isEmpty()) {
                logger.error("Title is empty or null");
                return new ResponseEntity<>(Collections.singletonMap("error", "Title cannot be empty"), 
                                          HttpStatus.BAD_REQUEST);
            }
            
            if (articleDTO.getContent() == null || articleDTO.getContent().trim().isEmpty()) {
                logger.error("Content is empty or null");
                return new ResponseEntity<>(Collections.singletonMap("error", "Content cannot be empty"), 
                                          HttpStatus.BAD_REQUEST);
            }
            
            if (articleDTO.getCategoryId() == null) {
                logger.error("Category ID is null");
                return new ResponseEntity<>(Collections.singletonMap("error", "Category ID is required"), 
                                          HttpStatus.BAD_REQUEST);
            }
            
            // Ensure the image path is properly processed
            if (articleDTO.getImagePath() != null && !articleDTO.getImagePath().isEmpty()) {
                logger.info("Article has image path: {}", articleDTO.getImagePath());
            }
            
            ArticleDTO createdArticleDTO = articleService.createArticle(articleDTO);
            logger.info("Created article with id: {} and image path: {}", 
                       createdArticleDTO.getId(), createdArticleDTO.getImagePath());
            return new ResponseEntity<>(createdArticleDTO, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating article: {}", e.getMessage(), e);
            logger.error("Stack trace:", e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                      HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getAllArticles(@RequestParam(required = false) String title) {
        try {
            List<ArticleDTO> articleDTOList = articleService.getAllArticles(title);
            return new ResponseEntity<>(articleDTOList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting articles: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    @GetMapping("/articles/category")
//    public ResponseEntity<List<ArticleDTO>> findByCategoryEnum(CategoryEnum categoryEnum) {
//
//        List<ArticleDTO> articleDTOList = articleService.findByCategoryEnum(categoryEnum);
//        if (articleDTOList.isEmpty()) {
//            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
//        }
//        return new ResponseEntity<>(articleDTOList, HttpStatus.OK);
//    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable("id") Long id) {
        try {
            logger.info("Fetching article with id: {}", id);
            
            // First check if the article exists
            boolean exists = articleService.existsById(id);
            if (!exists) {
                logger.warn("Article with id {} not found", id);
                return new ResponseEntity<>(
                    Collections.singletonMap("error", "Article not found with id: " + id), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            ArticleDTO articleDTO = articleService.getArticleById(id);
            if (articleDTO == null) {
                logger.warn("Article with id {} returned null from service", id);
                return new ResponseEntity<>(
                    Collections.singletonMap("error", "Article not found with id: " + id), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            logger.info("Successfully retrieved article with id: {}, title: {}", id, articleDTO.getTitle());
            return new ResponseEntity<>(articleDTO, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting article by id {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(
                Collections.singletonMap("error", e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getArticleListByCategoryId(@PathVariable("categoryId") Long categoryId) {
        try {
            List<ArticleDTO> articleDTOList = articleService.getArticleListByCategoryId(categoryId);
            return new ResponseEntity<>(articleDTOList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting articles by category id {}: {}", categoryId, e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable("id") Long id, @RequestBody ArticleDTO articleDTO) {
        try {
            logger.info("Updating article with id: {}", id);
            
            // Check if we received the version
            if (articleDTO.getVersion() == null) {
                logger.error("Version is missing in update request");
                return new ResponseEntity<>(
                    Collections.singletonMap("error", "Version is required for updates to prevent conflicts"), 
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Set the ID to ensure correct update
            articleDTO.setId(id);
            
            try {
                ArticleDTO updatedArticleDTO = articleService.updateArticle(id, articleDTO);
                return new ResponseEntity<>(updatedArticleDTO, HttpStatus.OK);
            } catch (OptimisticLockException e) {
                // This is a version conflict
                logger.warn("Optimistic lock exception detected: {}", e.getMessage());
                
                // Get the current version from the database
                ArticleDTO currentArticle = articleService.getArticleById(id);
                
                // Return a special response with both conflict status code and the current article data
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Version conflict detected. Another user has modified this article.");
                response.put("currentVersion", currentArticle.getVersion());
                response.put("currentArticle", currentArticle);
                
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }
        } catch (Exception e) {
            if (e instanceof OptimisticLockException) {
                // Handled above
                throw e;
            }
            logger.error("Error updating article: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable("id") Long id) {
        try {
            articleService.deleteArticle(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting article id {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("")
    public ResponseEntity<?> deleteAllArticles() {
        try {
            articleService.deleteAllArticles();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting all articles: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/paged")
    public ResponseEntity<?> getPagedArticles(
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        
        try {
            logger.info("Fetching paged articles: title='{}', page={}, size={}, sort={}", title, page, size, sort);
            
            // Parse sort parameter
            String[] sortParams = sort.split(",");
            String sortField = sortParams[0];
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? 
                                      Sort.Direction.ASC : Sort.Direction.DESC;
            
            Sort sortOrder = Sort.by(direction, sortField);
            
            Pageable pageable = PageRequest.of(page, size, sortOrder);
            Page<ArticleDTO> articles = articleService.getAllArticlesPaged(title, pageable);
            
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            logger.error("Error fetching paged articles: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/category/{categoryId}/paged")
    public ResponseEntity<?> getPagedArticlesByCategory(
            @PathVariable("categoryId") Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        
        try {
             logger.info("Fetching paged articles for category {}: page={}, size={}, sort={}", categoryId, page, size, sort);
            
            // Parse sort parameter
            String[] sortParams = sort.split(",");
            String sortField = sortParams[0];
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? 
                                      Sort.Direction.ASC : Sort.Direction.DESC;
            
            Sort sortOrder = Sort.by(direction, sortField);
            
            Pageable pageable = PageRequest.of(page, size, sortOrder);
            Page<ArticleDTO> articles = articleService.getArticleListByCategoryIdPaged(categoryId, pageable);
            
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            logger.error("Error fetching paged articles for category {}: {}", categoryId, e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/debug/{id}")
    public ResponseEntity<?> debugArticle(@PathVariable("id") Long id) {
        try {
            // Get the article using the service
            ArticleDTO articleDTO = articleService.getArticleById(id);
            
            if (articleDTO == null) {
                return new ResponseEntity<>(Collections.singletonMap("error", "Article not found"), HttpStatus.NOT_FOUND);
            }
            
            // Create a debug map with all fields from the DTO
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("id", articleDTO.getId());
            debugInfo.put("title", articleDTO.getTitle());
            debugInfo.put("content", articleDTO.getContent());
            debugInfo.put("imagePath", articleDTO.getImagePath());
            debugInfo.put("imagePath_length", articleDTO.getImagePath() != null ? articleDTO.getImagePath().length() : 0);
            debugInfo.put("imagePathClass", articleDTO.getImagePath() != null ? articleDTO.getImagePath().getClass().getName() : "null");
            debugInfo.put("statusEnum", articleDTO.getStatusEnum());
            debugInfo.put("categoryId", articleDTO.getCategoryId());
            debugInfo.put("createDateTime", articleDTO.getCreateDateTime());
            debugInfo.put("updateDateTime", articleDTO.getUpdateDateTime());
            
            return new ResponseEntity<>(debugInfo, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error debugging article {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/image")
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
    public ResponseEntity<?> updateArticleWithImage(
            @PathVariable("id") Long id,
            @RequestParam(value = "imagePath", required = false) String imagePath) {
        try {
            logger.info("Updating article {} with image path: {}", id, imagePath);
            
            // Get the current article
            ArticleDTO article = articleService.getArticleById(id);
            if (article == null) {
                return new ResponseEntity<>("Article not found", HttpStatus.NOT_FOUND); 
            }
            
            // Update only the imagePath
            article.setImagePath(imagePath);
            
            // Save the updated article
            ArticleDTO updatedArticle = articleService.updateArticle(id, article);
            
            // Create a response with just the relevant info
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedArticle.getId());
            response.put("title", updatedArticle.getTitle());
            response.put("imagePath", updatedArticle.getImagePath());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error updating article image: {}", e.getMessage(), e);
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
