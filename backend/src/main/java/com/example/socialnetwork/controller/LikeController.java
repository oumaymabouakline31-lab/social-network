package com.example.socialnetwork.controller;

import com.example.socialnetwork.entity.Like;
import com.example.socialnetwork.entity.User;
import com.example.socialnetwork.repository.LikeRepository;
import com.example.socialnetwork.repository.PostRepository;
import com.example.socialnetwork.security.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class LikeController {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final CurrentUserService currentUserService;

    public LikeController(LikeRepository likeRepository,
                          PostRepository postRepository,
                          CurrentUserService currentUserService) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable String postId) {
        postRepository.findById(postId).orElseThrow(() -> new NoSuchElementException("Post introuvable"));

        User currentUser = currentUserService.getCurrentUser();
        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, currentUser.getId());

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get()); // Unlike
        } else {
            Like like = new Like();
            like.setPostId(postId);
            like.setUserId(currentUser.getId());
            likeRepository.save(like); // Like
        }
        return ResponseEntity.ok().build();
    }
}
