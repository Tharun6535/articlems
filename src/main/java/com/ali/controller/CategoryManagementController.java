package com.ali.controller;

import com.ali.dto.CategoryDTO;
import com.ali.service.CategoryService;
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

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CategoryManagementController {
    private static final Logger logger = LoggerFactory.getLogger(CategoryManagementController.class);

    @Autowired
    CategoryService categoryService;

    @PostMapping("")
    public ResponseEntity<?> createCategory(@RequestBody @Valid CategoryDTO categoryDTO) {
        try {
            logger.info("Creating category with title: {}", categoryDTO.getTitle());
            CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
            return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating category: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                       HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("")
    public ResponseEntity<List<CategoryDTO>> getAllCategoryList() {
        try {
            List<CategoryDTO> categoryDTOList = categoryService.getAllCategoryList();
            return new ResponseEntity<>(categoryDTOList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting all categories: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable("id") Long id) {
        try {
            CategoryDTO categoryDTO = categoryService.getCategoryById(id);
            if (categoryDTO == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(categoryDTO, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting category by id {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable("id") Long id, @RequestBody @Valid CategoryDTO categoryDTO) {
        try {
            CategoryDTO categoryDTOAfterUpdate = categoryService.updateCategory(id, categoryDTO);
            if (categoryDTOAfterUpdate == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(categoryDTOAfterUpdate, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error updating category id {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCategory(@PathVariable("id") Long id) {
        try {
            categoryService.deleteCategory(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting category id {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/paged")
    public ResponseEntity<?> getPagedCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        
        try {
            logger.info("Getting paged categories: page={}, size={}, sort={}", page, size, sort);
            
            // Parse sort parameter
            String[] sortParams = sort.split(",");
            String sortField = sortParams[0];
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? 
                                     Sort.Direction.ASC : Sort.Direction.DESC;
            
            Sort sortOrder = Sort.by(direction, sortField);
            
            Pageable pageable = PageRequest.of(page, size, sortOrder);
            Page<CategoryDTO> categories = categoryService.getAllCategoryListPaged(pageable);
            
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Error getting paged categories: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                      HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}