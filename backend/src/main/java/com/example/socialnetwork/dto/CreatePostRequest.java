package com.example.socialnetwork.dto;

import com.example.socialnetwork.entity.PostPrivacy;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CreatePostRequest {

    private String content;

    private String imageUrl;

    private PostPrivacy privacy;

    // Rempli uniquement si privacy == PRIVATE :
    private List<String> allowedViewerIds;
}