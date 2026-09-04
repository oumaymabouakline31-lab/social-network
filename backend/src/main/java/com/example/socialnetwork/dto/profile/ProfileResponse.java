package com.example.socialnetwork.dto.profile;

public record ProfileResponse(
    String id,
    String email,
    String firstName,
    String lastName,
    String dateOfBirth,
    String avatarUrl,
    String nickname,
    String aboutMe,
    boolean isPublic,
    String createdAt,
    long followersCount,
    long followingCount,
    String followStatus,     // "SELF", "NONE", "PENDING", "ACCEPTED"
    boolean canViewContent   // true si le profil est public, ou follow accepté, ou propre profil
) {}

