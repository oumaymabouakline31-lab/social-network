package com.example.socialnetwork.dto;

import lombok.Getter;
import lombok.Setter;

// Ce qu'on renvoie au frontend pour un commentaire
@Getter
@Setter
public class CommentResponse {

    private String id;

    private String postId;

    private String content;

    private String imageUrl;

    private String authorId;

    private String authorFirstName;

    private String authorLastName;

    private String authorAvatarUrl;

    private String createdAt;
}