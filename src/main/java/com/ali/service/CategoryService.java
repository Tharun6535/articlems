package com.ali.service;

import com.ali.dto.CategoryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    CategoryDTO createCategory(CategoryDTO categoryDTO);

    List<CategoryDTO> getAllCategoryList();

    Page<CategoryDTO> getAllCategoryListPaged(Pageable pageable);

    CategoryDTO getCategoryById(Long id);

    CategoryDTO findByName(String name);

    CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO);

    void deleteCategory(Long id);
}
