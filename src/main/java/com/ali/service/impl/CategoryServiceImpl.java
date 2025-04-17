package com.ali.service.impl;

import com.ali.dto.CategoryDTO;
import com.ali.entity.Category;
import com.ali.mapper.CategoryMapper;
import com.ali.repository.CategoryRepository;
import com.ali.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {
    private static final Logger logger = LoggerFactory.getLogger(CategoryServiceImpl.class);

    @Autowired
    CategoryMapper categoryMapper;

    @Autowired
    CategoryRepository categoryRepository;
    
    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryDTO.getTitle() == null || categoryDTO.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Category title cannot be empty");
        }
        
        // Create new category entity
        Category category = new Category();
        category.setTitle(categoryDTO.getTitle());
        
        // Save and return
        Category savedCategory = categoryRepository.save(category);
        logger.debug("Created category with ID: {}", savedCategory.getId());
        return categoryMapper.entityToDTO(savedCategory);
    }

    @Override
    public List<CategoryDTO> getAllCategoryList() {
        List<Category> categoryList = categoryRepository.findAll();
        return categoryMapper.entityToDTOList(categoryList);
    }

    @Override
    public CategoryDTO getCategoryById(Long id) {
        Optional<Category> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            return categoryMapper.entityToDTO(category.get());
        }
        return null;
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Optional<Category> optionalCategory = categoryRepository.findById(id);
        if (optionalCategory.isPresent()) {
            Category category = optionalCategory.get();
            category.setTitle(categoryDTO.getTitle());
            Category categoryAfterUpdate = categoryRepository.save(category);
            logger.debug("Updated category with ID: {}", categoryAfterUpdate.getId());
            return categoryMapper.entityToDTO(categoryAfterUpdate);
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
        logger.debug("Deleted category with ID: {}", id);
    }

    @Override
    public Page<CategoryDTO> getAllCategoryListPaged(Pageable pageable) {
        logger.debug("Fetching paged categories with pageable: {}", pageable);
        try {
            Page<Category> categoryPage = categoryRepository.findAll(pageable);
            logger.debug("Found {} categories on page {} of {}", 
                         categoryPage.getNumberOfElements(),
                         categoryPage.getNumber() + 1,
                         categoryPage.getTotalPages());
            
            Page<CategoryDTO> result = categoryPage.map(categoryMapper::entityToDTO);
            logger.debug("Successfully mapped to DTOs");
            return result;
        } catch (Exception e) {
            logger.error("Error fetching paged categories: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public CategoryDTO findByName(String name) {
        logger.debug("Finding category by name: {}", name);
        
        // First, try to find the category by name (case insensitive)
        List<Category> categories = categoryRepository.findAll();
        Optional<Category> existingCategory = categories.stream()
            .filter(c -> c.getTitle().trim().equalsIgnoreCase(name.trim()))
            .findFirst();
        
        if (existingCategory.isPresent()) {
            logger.debug("Found existing category with name: {}", name);
            return categoryMapper.entityToDTO(existingCategory.get());
        }
        
        // If no category exists with this name, create one
        logger.debug("Creating new category with name: {}", name);
        Category newCategory = new Category();
        newCategory.setTitle(name.trim());
        Category savedCategory = categoryRepository.save(newCategory);
        
        return categoryMapper.entityToDTO(savedCategory);
    }
}
