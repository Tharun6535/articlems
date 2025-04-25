package com.ali.mapper;

import com.ali.dto.ArticleDTO;
import com.ali.entity.Article;
import com.ali.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ArticleMapper {
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "imagePath", target = "imagePath")
    @Mapping(source = "version", target = "version")
    ArticleDTO entityToDTO(Article article);

    List<ArticleDTO> entityToDTOList(List<Article> articleList);
    
    @Mapping(source = "categoryId", target = "category.id")
    @Mapping(source = "imagePath", target = "imagePath")
    @Mapping(source = "version", target = "version")
    @Mapping(target = "comments", ignore = true)
    Article dtoToEntity(ArticleDTO articleDTO);

    List<Article> dtoToEntityList(List<ArticleDTO> articleDTOList);
}
