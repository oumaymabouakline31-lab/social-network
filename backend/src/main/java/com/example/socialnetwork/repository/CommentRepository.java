package com.example.socialnetwork.repository;

import com.example.socialnetwork.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {

    // Renvoie tous les commentaires d'un post, du plus ancien au plus récent
    List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);
}