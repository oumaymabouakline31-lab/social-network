package com.example.socialnetwork.controller;

import com.example.socialnetwork.dto.CommentResponse;
import com.example.socialnetwork.dto.CreateCommentRequest;
import com.example.socialnetwork.dto.UpdateCommentRequest;
import com.example.socialnetwork.security.CurrentUserService;
import com.example.socialnetwork.service.CommentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;
    private final CurrentUserService currentUserService;

    public CommentController(CommentService commentService, CurrentUserService currentUserService) {
        this.commentService = commentService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> getComments(@PathVariable String postId) {
        return commentService.getCommentsForPost(postId, currentUserService.getCurrentUser());
    }

    @PostMapping("/posts/{postId}/comments")
    public CommentResponse createComment(
            @PathVariable String postId,
            @RequestBody CreateCommentRequest req
    ) {
        return commentService.createComment(postId, currentUserService.getCurrentUser(), req);
    }

    @PutMapping("/comments/{commentId}")
    public CommentResponse updateComment(
            @PathVariable String commentId,
            @RequestBody UpdateCommentRequest req
    ) {
        return commentService.updateComment(commentId, currentUserService.getCurrentUser(), req);
    }

    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(@PathVariable String commentId) {
        commentService.deleteComment(commentId, currentUserService.getCurrentUser());
    }
}
