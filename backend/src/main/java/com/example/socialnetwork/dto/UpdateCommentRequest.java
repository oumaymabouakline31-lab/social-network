package com.example.socialnetwork.dto;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UpdateCommentRequest {

    private String content;

    private String imageUrl;
}