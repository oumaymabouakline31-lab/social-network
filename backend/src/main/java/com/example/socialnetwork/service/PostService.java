package com.example.socialnetwork.service;

import com.example.socialnetwork.dto.CreatePostRequest;
import com.example.socialnetwork.dto.PostResponse;
import com.example.socialnetwork.dto.UpdatePostRequest;
import com.example.socialnetwork.entity.Post;
import com.example.socialnetwork.entity.PostAllowedViewer;
import com.example.socialnetwork.entity.PostPrivacy;
import com.example.socialnetwork.entity.User;
import com.example.socialnetwork.repository.FollowRepository;
import com.example.socialnetwork.repository.LikeRepository;
import com.example.socialnetwork.repository.PostAllowedViewerRepository;
import com.example.socialnetwork.repository.PostRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final PostAllowedViewerRepository allowedViewerRepository;
    private final LikeRepository likeRepository;

    public PostService(PostRepository postRepository,
            FollowRepository followRepository,
            PostAllowedViewerRepository allowedViewerRepository, LikeRepository likeRepository) {
        this.postRepository = postRepository;
        this.followRepository = followRepository;
        this.allowedViewerRepository = allowedViewerRepository;
        this.likeRepository = likeRepository;
    }

    public List<PostResponse> getUserPosts(String userId, User currentUser) {

        List<Post> allPosts = postRepository.findByAuthorIdOrderByCreatedAtDesc(userId);
        List<PostResponse> visiblePosts = new ArrayList<>();

        for (Post post : allPosts) {
            if (canViewPost(post, currentUser)) {
                visiblePosts.add(toResponse(post, currentUser));
            }
        }

        return visiblePosts;
    }

    public boolean canViewPost(Post post, User currentUser) {

        String authorId = post.getAuthor().getId();

        if (currentUser != null && currentUser.getId().equals(authorId)) {
            return true;
        }

        if (currentUser == null) {
            return post.getPrivacy() == PostPrivacy.PUBLIC;
        }

        if (post.getPrivacy() == PostPrivacy.PUBLIC) {
            return true;
        }

        if (post.getPrivacy() == PostPrivacy.FOLLOWERS) {
            return followRepository.existsByFollowerIdAndFolloweeIdAndStatus(
                    currentUser.getId(), authorId, "accepted");
        }

        if (post.getPrivacy() == PostPrivacy.PRIVATE) {
            return allowedViewerRepository.existsByPostIdAndUserId(
                    post.getId(), currentUser.getId());
        }

        return false;
    }

    public PostResponse createPost(User currentUser, CreatePostRequest req) {

        Post post = new Post();
        post.setAuthor(currentUser);
        post.setContent(req.getContent());
        post.setImageUrl(req.getImageUrl());

        if (req.getPrivacy() != null) {
            post.setPrivacy(req.getPrivacy());
        } else {
            post.setPrivacy(PostPrivacy.PUBLIC);
        }

        post = postRepository.save(post);

        saveAllowedViewers(post, req.getPrivacy(), req.getAllowedViewerIds());

        Post savedPost = postRepository.findById(post.getId()).orElseThrow();
        return toResponse(savedPost, currentUser);
    }

    // Modifie un post existant. Seul l'auteur du post a le droit de le faire.
    public PostResponse updatePost(String postId, User currentUser, UpdatePostRequest req) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post introuvable"));

        // Vérification importante : on ne laisse modifier que son propre post
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Tu ne peux modifier que tes propres posts");
        }

        if (req.getContent() != null) {
            post.setContent(req.getContent());
        }

        if (req.getImageUrl() != null) {
            post.setImageUrl(req.getImageUrl());
        }

        if (req.getPrivacy() != null && req.getPrivacy() != PostPrivacy.PRIVATE) {
            allowedViewerRepository.deleteByPostId(post.getId());
        }

        if (req.getPrivacy() != null) {
            post.setPrivacy(req.getPrivacy());
        }

        post = postRepository.save(post);

        // Si la confidentialité devient PRIVATE (ou change de liste d'autorisés),
        // on remet à jour la liste des viewers autorisés depuis zéro
        if (post.getPrivacy() == PostPrivacy.PRIVATE) {
            allowedViewerRepository.deleteByPostId(post.getId());
            saveAllowedViewers(post, req.getPrivacy(), req.getAllowedViewerIds());
        }

        return toResponse(post, currentUser);
    }

    // Supprime un post. Seul l'auteur du post a le droit de le faire.
    public void deletePost(String postId, User currentUser) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post introuvable"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Tu ne peux supprimer que tes propres posts");
        }

        postRepository.delete(post);
        // Grâce à "ON DELETE CASCADE" dans la migration SQL,
        // les lignes liées dans post_allowed_viewers et comments
        // seront supprimées automatiquement par la base de données.
    }

    // Petite méthode utilitaire réutilisée par createPost et updatePost
    private void saveAllowedViewers(Post post, PostPrivacy privacy, List<String> allowedViewerIds) {

        if (privacy != PostPrivacy.PRIVATE || allowedViewerIds == null) {
            return;
        }

        for (String viewerId : allowedViewerIds) {
            PostAllowedViewer viewer = new PostAllowedViewer();
            viewer.setPostId(post.getId());
            viewer.setUserId(viewerId);
            allowedViewerRepository.save(viewer);
        }
    }

    private PostResponse toResponse(Post post, User currentUser) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setImageUrl(post.getImageUrl());
        response.setPrivacy(post.getPrivacy());
        response.setCreatedAt(post.getCreatedAt());
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorFirstName(post.getAuthor().getFirstName());
        response.setAuthorLastName(post.getAuthor().getLastName());
        response.setAuthorAvatarUrl(post.getAuthor().getAvatarUrl());
        response.setLikesCount(likeRepository.countByPostId(post.getId()));
        response.setLikedByMe(likeRepository.findByPostIdAndUserId(post.getId(), currentUser.getId()).isPresent());

        return response;
    }
}