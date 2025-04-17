package com.ali.repository;

import com.ali.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

	List<Article> findByTitleContainingIgnoreCase(String title);

	// Add pagination support
	Page<Article> findByTitleContainingIgnoreCase(String title, Pageable pageable);

	// Default findAll with pagination
	Page<Article> findAll(Pageable pageable);

	@Query("SELECT a FROM Article a WHERE a.category.id = :categoryId")
	List<Article> findAllByCategoryId(Long categoryId);

	// Add pagination support for category filtering
	@Query("SELECT a FROM Article a WHERE a.category.id = :categoryId")
	Page<Article> findAllByCategoryId(Long categoryId, Pageable pageable);

//	   @Query("SELECT * FROM ArticleEntity article Where article.categoryEnum:categoryEnum")
//	  List<ArticleEntity> findByCategoryEnum(CategoryEnum categoryEnum);

//    List <ArticleEntity> findByTitle(String title);

	List<Article> findByCategoryId(Long categoryId);
	Page<Article> findByCategoryId(Long categoryId, Pageable pageable);
}
