package com.ali.service;

import com.ali.dto.ArticleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ArticleService {

    List<ArticleDTO> getAllArticles(String title);
    
    // Add paginated methods
    Page<ArticleDTO> getAllArticlesPaged(String title, Pageable pageable);
    
    Page<ArticleDTO> getAllArticlesPaged(Pageable pageable);

//    List<ArticleDTO> findByCategoryEnum(CategoryEnum categoryEnum);

    ArticleDTO getArticleById(Long id);
    
    // Check if article exists by ID
    boolean existsById(Long id);

    ArticleDTO createArticle(ArticleDTO articleDTO);

    ArticleDTO updateArticle(Long id, ArticleDTO articleDTO);

    void deleteArticle(Long id);

    void deleteAllArticles();

    List<ArticleDTO> getArticleListByCategoryId(Long categoryId);
    
    // Add paginated category filter
    Page<ArticleDTO> getArticleListByCategoryIdPaged(Long categoryId, Pageable pageable);
}
