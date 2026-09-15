package com.example.socialnetwork.repository;

import com.example.socialnetwork.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {

    List<Post> findByAuthorIdOrderByCreatedAtDesc(String authorId);
}