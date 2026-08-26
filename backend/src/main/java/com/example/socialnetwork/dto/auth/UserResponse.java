package com.example.socialnetwork.dto.auth;

import com.example.socialnetwork.entity.User;

public record UserResponse(
    String id,
    String email,
    String firstName,
    String lastName,
    String dateOfBirth,
    String avatarUrl,
    String nickname,
    String aboutMe,
    boolean isPublic,
    String createdAt
) {
    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getDateOfBirth(),
            user.getAvatarUrl(),
            user.getNickname(),
            user.getAboutMe(),
            user.isPublic(),
            user.getCreatedAt()
        );
    }
}

