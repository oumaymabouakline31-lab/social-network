package com.example.socialnetwork.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "likes")
@Getter
@Setter
public class Like {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(name = "post_id", nullable = false)
    private String postId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "created_at", updatable = false, nullable = false)
    private String createdAt = Instant.now().toString();
}
