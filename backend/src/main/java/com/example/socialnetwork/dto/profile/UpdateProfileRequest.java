package com.example.socialnetwork.dto.profile;

public record UpdateProfileRequest(
    String firstName,
    String lastName,
    String dateOfBirth,
    String avatarUrl,
    String nickname,
    String aboutMe,
    Boolean isPublic
) {}

