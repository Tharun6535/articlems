package com.ali.service;

import com.ali.dto.CommentDTO;

import java.util.List;

public interface CommentService {

    CommentDTO createComment(CommentDTO commentDTO);

    List<CommentDTO> getCommentsByArticleId(Long articleId);

    CommentDTO getCommentById(Long id);

    List<CommentDTO> getAllComments();

    void deleteComment(Long id);

    void deleteAllComment();

    CommentDTO updateComment(Long id, CommentDTO commentDTO);
}

