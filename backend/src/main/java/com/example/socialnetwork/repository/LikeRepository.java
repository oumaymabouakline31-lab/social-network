package com.example.socialnetwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.socialnetwork.entity.Like;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, String> {
    // Utilisé par le mécanisme de bascule (Toggle) à la Instagram
    Optional<Like> findByPostIdAndUserId(String postId, String userId);

    // Utilisé pour remplir la case 'likesCount' du DTO envoyé à Next.js
    long countByPostId(String postId);
}
