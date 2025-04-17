package com.ali.service.impl;

import com.ali.dto.CommentDTO;
import com.ali.entity.Article;
import com.ali.entity.Comment;
import com.ali.mapper.CommentMapper;
import com.ali.repository.ArticleRepository;
import com.ali.repository.CommentRepository;
import com.ali.service.CommentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentServiceImpl implements CommentService {
    private static final Logger logger = LoggerFactory.getLogger(CommentServiceImpl.class);

    @Autowired
    CommentMapper commentMapper;

    @Autowired
    CommentRepository commentRepository;
    
    @Autowired
    ArticleRepository articleRepository;

    @Override
    @Transactional
    public CommentDTO createComment(CommentDTO commentDTO) {
        if (commentDTO.getArticleComment() == null || commentDTO.getArticleComment().trim().isEmpty()) {
            throw new RuntimeException("Comment text cannot be empty");
        }
        
        if (commentDTO.getArticleId() == null) {
            throw new RuntimeException("Article ID is required");
        }
        
        // Find the article
        Optional<Article> articleOpt = articleRepository.findById(commentDTO.getArticleId());
        if (!articleOpt.isPresent()) {
            throw new RuntimeException("Article not found with ID: " + commentDTO.getArticleId());
        }
        
        // Create new comment entity
        Comment comment = commentMapper.dtoToEntity(commentDTO);
        comment.setArticle(articleOpt.get());
        
        // Save and return
        Comment savedComment = commentRepository.save(comment);
        logger.debug("Created comment with ID: {}", savedComment.getId());
        return commentMapper.entityToDTO(savedComment);
    }

    @Override
    public CommentDTO getCommentById(Long id) {
        Optional<Comment> commentById = commentRepository.findById(id);
        if (!commentById.isPresent()) {
            return null;
        }
        return commentMapper.entityToDTO(commentById.get());
    }

    @Override
    public List<CommentDTO> getCommentsByArticleId(Long articleId) {
        List<Comment> commentList = commentRepository.findByArticleId(articleId);
        return commentMapper.entityToDTOList(commentList);
    }

    @Override
    public List<CommentDTO> getAllComments() {
        List<Comment> commentList = commentRepository.findAll();
        return commentMapper.entityToDTOList(commentList);
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteAllComment() {
        commentRepository.deleteAll();
    }

    @Override
    @Transactional
    public CommentDTO updateComment(Long id, CommentDTO commentDTO) {
        Optional<Comment> commentOpt = commentRepository.findById(id);
        if (!commentOpt.isPresent()) {
            return null;
        }
        
        Comment comment = commentOpt.get();
        comment.setArticleComment(commentDTO.getArticleComment());
        
        // Update article reference if changed
        if (commentDTO.getArticleId() != null && 
            !commentDTO.getArticleId().equals(comment.getArticle().getId())) {
            
            Optional<Article> articleOpt = articleRepository.findById(commentDTO.getArticleId());
            if (articleOpt.isPresent()) {
                comment.setArticle(articleOpt.get());
            }
        }
        
        Comment afterUpdate = commentRepository.save(comment);
        logger.debug("Updated comment with ID: {}", afterUpdate.getId());
        return commentMapper.entityToDTO(afterUpdate);
    }
}
