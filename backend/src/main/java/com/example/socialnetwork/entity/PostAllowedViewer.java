package com.example.socialnetwork.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "post_allowed_viewers")
@Getter @Setter
public class PostAllowedViewer {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(name = "post_id", nullable = false)
    private String postId;

    @Column(name = "user_id", nullable = false)
    private String userId;
}