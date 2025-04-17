package com.ali.controller;

import com.ali.dto.CommentDTO;
import com.ali.service.CommentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CommentManagementController {
    private static final Logger logger = LoggerFactory.getLogger(CommentManagementController.class);

    @Autowired
    CommentService commentService;

    @PostMapping("")
    public ResponseEntity<?> createComment(@RequestBody @Valid CommentDTO commentDTO) {
        try {
            logger.info("Creating comment for article ID: {}", commentDTO.getArticleId());
            CommentDTO createdComment = commentService.createComment(commentDTO);
            return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating comment: {}", e.getMessage(), e);
            return new ResponseEntity<>(Collections.singletonMap("error", e.getMessage()), 
                                       HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByArticleId(@PathVariable("articleId") Long articleId) {
        try {
            List<CommentDTO> comments = commentService.getCommentsByArticleId(articleId);
            return new ResponseEntity<>(comments, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting comments for article ID {}: {}", articleId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable("id") Long id) {
        try {
            CommentDTO comment = commentService.getCommentById(id);
            if (comment == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(comment, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting comment by id {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable("id") Long id, @RequestBody @Valid CommentDTO commentDTO) {
        try {
            CommentDTO updatedComment = commentService.updateComment(id, commentDTO);
            if (updatedComment == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updatedComment, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error updating comment id {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteComment(@PathVariable("id") Long id) {
        try {
            commentService.deleteComment(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting comment id {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 