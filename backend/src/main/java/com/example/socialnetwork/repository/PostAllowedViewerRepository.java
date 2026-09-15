package com.example.socialnetwork.repository;

import com.example.socialnetwork.entity.PostAllowedViewer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostAllowedViewerRepository extends JpaRepository<PostAllowedViewer, String> {

    boolean existsByPostIdAndUserId(String postId, String userId);

    // Supprime directement en base tous les viewers autorisés d'un post donné
    void deleteByPostId(String postId);
}