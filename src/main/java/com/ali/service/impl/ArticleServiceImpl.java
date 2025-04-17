package com.ali.service.impl;

import com.ali.dto.ArticleDTO;
import com.ali.entity.Article;
import com.ali.entity.Category;
import com.ali.enums.StatusEnum;
import com.ali.mapper.ArticleMapper;
import com.ali.repository.ArticleRepository;
import com.ali.repository.CategoryRepository;
import com.ali.repository.CommentRepository;
import com.ali.service.ArticleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ArticleServiceImpl implements ArticleService {
    private static final Logger logger = LoggerFactory.getLogger(ArticleServiceImpl.class);

    @Autowired
    ArticleRepository articleRepository;

    @Autowired
    CategoryRepository categoryRepository;
    
    @Autowired
    CommentRepository commentRepository;

    @Autowired
    ArticleMapper articleMapper;

    @Override
    public List<ArticleDTO> getAllArticles(String title) {
        List<Article> articleList = new ArrayList<>();

        if (title == null) {
            articleList.addAll(articleRepository.findAll());
        } else
            articleList.addAll(articleRepository.findByTitleContainingIgnoreCase(title));

        return articleMapper.entityToDTOList(articleList);
    }

//    @Override
//    public List<ArticleDTO> findByCategoryEnum(CategoryEnum categoryEnum) {
//
//        List<ArticleEntity> articleEntityList = articleRepository.findByCategoryEnum(categoryEnum);
//        return articleMapper.entityToDTOList(articleEntityList);
//    }

    @Override
    public ArticleDTO getArticleById(Long id) {
        Optional<Article> optionalArticle = articleRepository.findById(id);

        if (!optionalArticle.isPresent()) {
            return null;
        }

        Article article = optionalArticle.get();
        return articleMapper.entityToDTO(article);
    }

    @Override
    @Transactional
    public ArticleDTO createArticle(ArticleDTO articleDTO) {
        try {
            logger.debug("Creating article with title: {}", articleDTO.getTitle());
            logger.debug("Received image path: {}", articleDTO.getImagePath());
            
            // Validate required fields
            if (articleDTO.getTitle() == null || articleDTO.getTitle().trim().isEmpty()) {
                throw new RuntimeException("Article title cannot be empty");
            }
            
            if (articleDTO.getContent() == null || articleDTO.getContent().trim().isEmpty()) {
                throw new RuntimeException("Article content cannot be empty");
            }
            
            if (articleDTO.getCategoryId() == null) {
                throw new RuntimeException("Category ID is required");
            }
            
            // Use the mapper to convert DTO to entity
            Article article = articleMapper.dtoToEntity(articleDTO);
            
            // Set default status if not provided
            if (article.getStatusEnum() == null) {
                article.setStatusEnum(StatusEnum.PUBLISHED);
            }
            
            // Verify category exists and set it properly
            Optional<Category> categoryOpt = categoryRepository.findById(articleDTO.getCategoryId());
            if (!categoryOpt.isPresent()) {
                throw new RuntimeException("Category not found with ID: " + articleDTO.getCategoryId());
            }
            article.setCategory(categoryOpt.get());
            
            // Explicitly log the image path to verify it's set
            logger.debug("Image path before save: {}", article.getImagePath());
            
            // Save and return
            Article savedArticle = articleRepository.save(article);
            logger.debug("Created article with ID: {}", savedArticle.getId());
            logger.debug("Saved image path: {}", savedArticle.getImagePath());
            
            ArticleDTO result = articleMapper.entityToDTO(savedArticle);
            logger.debug("Returning DTO with image path: {}", result.getImagePath());
            return result;
        } catch (Exception e) {
            logger.error("Error creating article: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public ArticleDTO updateArticle(Long id, ArticleDTO articleDTO) {
        Optional<Article> optionalArticle = articleRepository.findById(id);

        if (optionalArticle.isPresent()) {
            Article existingArticle = optionalArticle.get();
            logger.debug("Updating article ID: {}, current image path: {}", id, existingArticle.getImagePath());
            logger.debug("Received image path in update: {}", articleDTO.getImagePath());
            
            // Set the ID on the DTO so it's included in the mapping
            articleDTO.setId(id);
            
            // Use the mapper to create a partially populated entity
            Article updatedArticle = articleMapper.dtoToEntity(articleDTO);
            
            // Keep existing values for fields that are not in the DTO or are null
            if (articleDTO.getTitle() == null) {
                updatedArticle.setTitle(existingArticle.getTitle());
            }
            
            if (articleDTO.getContent() == null) {
                updatedArticle.setContent(existingArticle.getContent());
            }
            
            if (articleDTO.getStatusEnum() == null) {
                updatedArticle.setStatusEnum(existingArticle.getStatusEnum());
            }
            
            // Keep existing comments (mapper ignores them)
            updatedArticle.setComments(existingArticle.getComments());
            
            // Important: Handle category properly
            if (articleDTO.getCategoryId() != null) {
                Optional<Category> categoryOpt = categoryRepository.findById(articleDTO.getCategoryId());
                if (categoryOpt.isPresent()) {
                    updatedArticle.setCategory(categoryOpt.get());
                } else {
                    // Keep existing category if new one not found
                    updatedArticle.setCategory(existingArticle.getCategory());
                }
            } else {
                // Keep existing category if not provided
                updatedArticle.setCategory(existingArticle.getCategory());
            }
            
            // Explicitly log the image path
            logger.debug("Image path before save: {}", updatedArticle.getImagePath());
            
            // Save the updated article
            Article savedArticle = articleRepository.save(updatedArticle);
            logger.debug("After save, image path: {}", savedArticle.getImagePath());
            
            // Convert back to DTO
            ArticleDTO result = articleMapper.entityToDTO(savedArticle);
            logger.debug("Returning DTO with image path: {}", result.getImagePath());
            return result;
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        try {
            logger.debug("Deleting article with ID: {}", id);
            
            // With cascade delete now configured in the entity,
            // we can simply delete the article and all related comments
            // will be automatically deleted
            articleRepository.deleteById(id);
            
            logger.debug("Successfully deleted article with ID: {}", id);
        } catch (Exception e) {
            logger.error("Error deleting article with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteAllArticles() {
        try {
            logger.debug("Deleting all articles and their comments");
            
            // With cascade delete configured in the entity,
            // we can simply delete all articles and all related comments
            // will be automatically deleted
            articleRepository.deleteAll();
            
            logger.debug("Successfully deleted all articles and their comments");
        } catch (Exception e) {
            logger.error("Error deleting all articles: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<ArticleDTO> getArticleListByCategoryId(Long categoryId) {
        List<Article> articleList = articleRepository.findAllByCategoryId(categoryId);
        return articleMapper.entityToDTOList(articleList);
    }

    @Override
    public Page<ArticleDTO> getAllArticlesPaged(String title, Pageable pageable) {
        Page<Article> articlePage;
        if (title == null)
            articlePage = articleRepository.findAll(pageable);
        else
            articlePage = articleRepository.findByTitleContainingIgnoreCase(title, pageable);
        
        return articlePage.map(articleMapper::entityToDTO);
    }

    @Override
    public Page<ArticleDTO> getAllArticlesPaged(Pageable pageable) {
        Page<Article> articlePage = articleRepository.findAll(pageable);
        return articlePage.map(articleMapper::entityToDTO);
    }

    @Override
    public Page<ArticleDTO> getArticleListByCategoryIdPaged(Long categoryId, Pageable pageable) {
        Page<Article> articlePage = articleRepository.findAllByCategoryId(categoryId, pageable);
        return articlePage.map(articleMapper::entityToDTO);
    }

    @Override
    public boolean existsById(Long id) {
        if (id == null) {
            return false;
        }
        return articleRepository.existsById(id);
    }
}
