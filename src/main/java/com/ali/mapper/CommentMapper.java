package com.ali.mapper;

import com.ali.dto.CommentDTO;
import com.ali.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CommentMapper {
    @Mapping(source = "article.id", target = "articleId")
    CommentDTO entityToDTO(Comment comment);

    List<CommentDTO> entityToDTOList(List<Comment> comments);
    
    @Mapping(source = "articleId", target = "article.id")
    Comment dtoToEntity(CommentDTO commentDTO);

    List<Comment> dtoToEntityList(List<CommentDTO> commentDTOs);
}