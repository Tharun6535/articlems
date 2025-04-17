package com.ali.mapper;

import com.ali.dto.CategoryDTO;
import com.ali.entity.Category;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryDTO entityToDTO(Category category);

    List<CategoryDTO> entityToDTOList(List<Category> categoryList);

    Category dtoToEntity(CategoryDTO categoryDTO);
}
